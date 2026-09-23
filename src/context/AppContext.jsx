import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.js';
import * as orgsApi from '../api/organizations.js';
import * as appsApi from '../api/applications.js';
import * as assessmentsApi from '../api/assessments.js';
import * as findingsApi from '../api/findings.js';
import * as adminApi from '../api/admin.js';
import { tokenStore } from '../api/client.js';
import {
  mapApplication, mapAssessment, mapFinding, mapUser, mapOrganization,
  mapAuditLogEntry, mapScannerHealth, scanProfileToBackend, formatDate
} from '../api/mappers.js';

const AppContext = createContext(null);

const ROLE_LABEL = { OWNER: 'Owner', DEVELOPER_PENTESTER: 'Developer', SYSTEM_ADMIN: 'Admin' };

function normalizeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: ROLE_LABEL[u.role] || u.role,
    rawRole: u.role,
    orgId: u.orgId,
    status: u.status
  };
}

export function AppProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [org, setOrgState] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [joinCode, setJoinCode] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  // Owner / developer data (scoped to the signed-in user's own org).
  const [apps, setApps] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [findings, setFindings] = useState([]);
  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);

  // System-admin data (platform-wide).
  const [adminApps, setAdminApps] = useState([]);
  const [authorizationQueue, setAuthorizationQueue] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminAssessments, setAdminAssessments] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    serviceStatus: 'Healthy', queueDepth: 0, avgScanDurationMinutes: 0, failureRate24h: 0, modules: []
  });

  const isAdmin = user?.role === 'Admin';
  const orgs = org ? [org] : [];

  const setUser = useCallback(nextUser => {
    setUserState(nextUser);
  }, []);

  const signOut = useCallback(() => {
    tokenStore.clear();
    setUserState(null);
    setOrgState(null);
    setOrgId(null);
    setApps([]); setAssessments([]); setFindings([]); setMembers([]); setPending([]);
    setAdminApps([]); setAuthorizationQueue([]); setOrganizations([]); setUsers([]);
    setAdminAssessments([]); setAuditLog([]);
  }, []);

  // --- Owner/developer data loading -----------------------------------
  const refreshApps = useCallback(async orgNameOverride => {
    const rawApps = await appsApi.listApplications();
    const perApp = await Promise.all(rawApps.map(async raw => {
      try {
        const list = await assessmentsApi.listAssessmentsForApplication(raw.id);
        return { raw, list };
      } catch {
        return { raw, list: [] };
      }
    }));
    const allAssessments = [];
    const mappedApps = perApp.map(({ raw, list }) => {
      const mappedList = list.map(mapAssessment);
      allAssessments.push(...mappedList);
      const completed = mappedList.find(a => a.rawStatus === 'COMPLETED');
      return mapApplication(raw, orgNameOverride ?? org, completed ? { score: completed.score, assessed: completed.date } : undefined);
    });
    setApps(mappedApps);
    setAssessments(allAssessments.sort((a, b) => b.sortDate - a.sortDate));
    return mappedApps;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org]);

  const refreshFindings = useCallback(async (appsOverride) => {
    const raw = await findingsApi.listFindings();
    // Accepts an explicit apps list so a caller that just refreshed
    // applications (e.g. the bootstrap effect below) can pass the freshly
    // computed list directly — reading `apps` state right after setApps()
    // here would still see the pre-update value until the next render,
    // which was leaving every finding's `app` (name) field null on first
    // load and breaking the Findings page's app-name filter.
    const list = appsOverride ?? apps;
    const nameOf = id => list.find(a => a.id === id)?.name;
    setFindings(raw.map(f => mapFinding(f, nameOf(f.applicationId))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps]);

  const refreshMembers = useCallback(async () => {
    const [rawMembers, rawPending] = await Promise.all([
      orgsApi.listMembers(),
      orgsApi.listJoinRequests()
    ]);
    setMembers(rawMembers.map(m => ({
      id: m.id, name: `${m.firstName} ${m.lastName}`, email: m.email,
      role: ROLE_LABEL[m.role] || m.role, joined: formatDate(m.joinedAt)
    })));
    setPending(rawPending.map(p => ({
      id: p.id, name: `${p.firstName} ${p.lastName}`, email: p.email, requested: formatDate(p.requestedAt)
    })));
  }, []);

  const refreshAssessment = useCallback(async id => {
    const raw = await assessmentsApi.getAssessment(id);
    const mapped = mapAssessment(raw);
    setAssessments(prev => {
      const exists = prev.some(a => a.id === id);
      return exists ? prev.map(a => (a.id === id ? mapped : a)) : [mapped, ...prev];
    });
    return mapped;
  }, []);

  // --- Admin data loading -----------------------------------------------
  const refreshAdminApps = useCallback(async (status) => {
    const [raw, queue] = await Promise.all([
      adminApi.listAdminApplications(status ? { status } : {}),
      adminApi.listAuthorizationQueue()
    ]);
    setAdminApps(raw.map(a => mapApplication(a, a.orgName)));
    setAuthorizationQueue(queue.map(a => mapApplication(a, a.orgName)));
  }, []);

  const refreshOrganizations = useCallback(async () => {
    const raw = await adminApi.listOrganizations();
    setOrganizations(raw.map(mapOrganization));
  }, []);

  const refreshUsers = useCallback(async () => {
    const raw = await adminApi.listUsers();
    setUsers(raw.map(mapUser));
  }, []);

  const refreshAdminAssessments = useCallback(async () => {
    const [running, recent] = await Promise.all([
      adminApi.listRunningAssessments(),
      adminApi.listRecentAssessments()
    ]);
    const mappedRunning = running.map(mapAssessment);
    const mappedRecent = recent.map(mapAssessment).sort((a, b) => b.sortDate - a.sortDate);
    setAdminAssessments([...mappedRunning, ...mappedRecent]);
  }, []);

  const refreshAuditLog = useCallback(async () => {
    const raw = await adminApi.getAuditLogs();
    setAuditLog(raw.map(mapAuditLogEntry));
  }, []);

  const refreshSystemHealth = useCallback(async () => {
    const raw = await adminApi.getScannerHealth();
    setSystemHealth(mapScannerHealth(raw));
  }, []);

  // --- Bootstrap: restore a session from a stored token, then load the
  // data set that role actually needs. ---------------------------------
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const tokens = tokenStore.get();
      if (!tokens?.accessToken) { setBootstrapped(true); return; }
      try {
        const { user: rawUser, organization } = await authApi.me();
        if (cancelled) return;
        const nu = normalizeUser(rawUser);
        setUserState(nu);
        setOrgState(organization?.name || null);
        setOrgId(organization?.id || null);
        setJoinCode(organization?.joinCode || null);
      } catch {
        tokenStore.clear();
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    }
    boot();
    return () => { cancelled = true; };
  }, []);

  // Load each role's own data set once we know who's signed in.
  useEffect(() => {
    if (!user) return;
    if (user.role === 'Admin') {
      refreshAdminApps().catch(() => {});
      refreshOrganizations().catch(() => {});
      refreshUsers().catch(() => {});
      refreshAdminAssessments().catch(() => {});
      refreshAuditLog().catch(() => {});
      refreshSystemHealth().catch(() => {});
    } else if (org) {
      refreshApps(org).then(freshApps => refreshFindings(freshApps).catch(() => {})).catch(() => {});
      if (user.role === 'Owner') refreshMembers().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role, org]);

  // --- Auth ---------------------------------------------------------------
  const login = useCallback(async (email, password) => {
    const { user: rawUser, organization, accessToken, refreshToken, joinRequestStatus } = await authApi.login(email, password);
    tokenStore.set({ accessToken, refreshToken });
    const nu = normalizeUser(rawUser);
    setUserState(nu);
    setOrgState(organization?.name || null);
    setOrgId(organization?.id || null);
    setJoinCode(organization?.joinCode || null);
    // Only meaningful when nu.role is still null (join request pending or
    // denied) — see Signin.jsx, which picks the right message from this.
    return { ...nu, joinRequestStatus };
  }, []);

  const signupCreateOrg = useCallback(async fields => {
    const { user: rawUser, organization, accessToken, refreshToken } = await authApi.signupCreateOrg(fields);
    tokenStore.set({ accessToken, refreshToken });
    const nu = normalizeUser(rawUser);
    setUserState(nu);
    setOrgState(organization?.name || null);
    setOrgId(organization?.id || null);
    setJoinCode(organization?.joinCode || null);
    return { user: nu, organization, code: organization?.joinCode };
  }, []);

  // Does NOT sign the caller in — their account has no role/org until an
  // Owner approves the join request (matches the "request sent" screen).
  const signupJoinOrg = useCallback(async fields => {
    const result = await authApi.signupJoinOrg(fields);
    tokenStore.clear();
    return result;
  }, []);

  const requestPasswordReset = useCallback(email => authApi.requestPasswordReset(email), []);

  // --- Applications ---------------------------------------------------------
  const addApp = useCallback(async app => {
    const created = await appsApi.createApplication({
      name: app.name,
      targetUrl: app.url,
      appType: app.type
    });
    await refreshApps();
    return mapApplication(created, org);
  }, [refreshApps, org]);

  const verifyOwnership = useCallback(async id => {
    const result = await appsApi.verifyOwnership(id);
    await refreshApps();
    return result;
  }, [refreshApps]);

  // --- Admin: application authorization -----------------------------------
  const approveApplication = useCallback(async id => {
    await adminApi.authorizeApplication(id);
    await refreshAdminApps();
  }, [refreshAdminApps]);

  const rejectApplication = useCallback(async (id, reason) => {
    await adminApi.rejectApplication(id, reason);
    await refreshAdminApps();
  }, [refreshAdminApps]);

  const revokeAuthorization = useCallback(async id => {
    await adminApi.revokeApplication(id);
    await refreshAdminApps();
  }, [refreshAdminApps]);

  // --- Assessments / scanning ---------------------------------------------
  const startScan = useCallback(async (appId, profileId, customCheckIds) => {
    const backendProfile = scanProfileToBackend(profileId);
    const config = profileId === 'custom' ? { checks: customCheckIds || [] } : undefined;
    const raw = await assessmentsApi.createAssessment(appId, backendProfile, config);
    const mapped = mapAssessment(raw);
    setAssessments(prev => [mapped, ...prev]);
    return mapped;
  }, []);

  // --- Findings -------------------------------------------------------------
  const updateFindingStatus = useCallback(async (id, backendStatus, reason) => {
    await findingsApi.updateFindingStatus(id, backendStatus, reason);
    await refreshFindings();
  }, [refreshFindings]);

  // --- Org members ------------------------------------------------------
  const approveMember = useCallback(async id => {
    const m = pending.find(p => p.id === id);
    await orgsApi.approveJoinRequest(id);
    await refreshMembers();
    return m;
  }, [pending, refreshMembers]);

  const declineMember = useCallback(async id => {
    const m = pending.find(p => p.id === id);
    await orgsApi.denyJoinRequest(id);
    await refreshMembers();
    return m;
  }, [pending, refreshMembers]);

  const removeMember = useCallback(async userId => {
    const m = members.find(mem => mem.id === userId);
    await orgsApi.removeMember(userId);
    await refreshMembers();
    return m;
  }, [members, refreshMembers]);

  // --- Admin: organizations -------------------------------------------
  const suspendOrganization = useCallback(async id => {
    await adminApi.suspendOrganization(id);
    await refreshOrganizations();
  }, [refreshOrganizations]);
  const reactivateOrganization = useCallback(async id => {
    await adminApi.reactivateOrganization(id);
    await refreshOrganizations();
  }, [refreshOrganizations]);

  // --- Admin: users -----------------------------------------------------
  const suspendUserAccount = useCallback(async id => {
    await adminApi.suspendUser(id);
    await refreshUsers();
  }, [refreshUsers]);
  const reactivateUserAccount = useCallback(async id => {
    await adminApi.reactivateUser(id);
    await refreshUsers();
  }, [refreshUsers]);

  // --- Admin: assessment monitoring ---------------------------------------
  const cancelAssessment = useCallback(async id => {
    await adminApi.cancelAssessment(id);
    await refreshAdminAssessments();
  }, [refreshAdminAssessments]);

  const value = useMemo(() => ({
    user, setUser, signOut, isAdmin, bootstrapped,
    login, signupCreateOrg, signupJoinOrg, requestPasswordReset,
    orgs, org, orgId, joinCode,
    apps, addApp, verifyOwnership, approveApplication, rejectApplication, revokeAuthorization,
    assessments, startScan, refreshAssessment,
    findings, updateFindingStatus, refreshFindings,
    members, pending, approveMember, declineMember, removeMember,
    adminApps, authorizationQueue, refreshAdminApps,
    organizations, users, adminAssessments, auditLog, systemHealth,
    refreshOrganizations, refreshUsers, refreshAdminAssessments, refreshAuditLog, refreshSystemHealth,
    suspendOrganization, reactivateOrganization, suspendUserAccount, reactivateUserAccount,
    cancelAssessment
  }), [
    user, isAdmin, bootstrapped, orgs, org, orgId, joinCode,
    apps, assessments, findings, members, pending,
    adminApps, authorizationQueue, organizations, users, adminAssessments, auditLog, systemHealth,
    login, signupCreateOrg, signupJoinOrg, requestPasswordReset, addApp, verifyOwnership,
    approveApplication, rejectApplication, revokeAuthorization, startScan, refreshAssessment,
    updateFindingStatus, refreshFindings, approveMember, declineMember, removeMember,
    refreshAdminApps, refreshOrganizations, refreshUsers, refreshAdminAssessments, refreshAuditLog,
    refreshSystemHealth, suspendOrganization, reactivateOrganization, suspendUserAccount,
    reactivateUserAccount, cancelAssessment, setUser, signOut
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
