// Translates real backend shapes (UPPER_SNAKE enums, raw field names) into the
// display-ready shapes the existing UI components were written against, so as
// much of the page-level code as possible can stay unchanged. Anything that
// truly has no backend equivalent (owner/due on findings, a cached score on
// the application itself, etc.) is called out below rather than faked.

export function titleCase(s) {
  if (!s) return s;
  return s
    .toString()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

// Time-of-day companion to formatDate — kept as its own field (rather than
// baked into one combined string) so callers can show the two on separate
// lines: a bold/plain date plus a smaller, muted time underneath.
export function formatTime(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return null;
  }
}

// --- Applications ---------------------------------------------------------
const APP_STATUS = {
  PENDING_AUTHORIZATION: 'Pending',
  AUTHORIZED: 'Authorized',
  REJECTED: 'Rejected',
  REVOKED: 'Revoked'
};

// `summary` is an optional { score, assessed } derived from that app's newest
// COMPLETED assessment — the application object itself carries no such fields.
export function mapApplication(app, orgName, summary) {
  return {
    id: app.id,
    org: orgName ?? app.orgName ?? null,
    name: app.name,
    url: app.targetUrl,
    type: app.appType,
    description: app.description || '',
    status: APP_STATUS[app.authorizationStatus] || app.authorizationStatus,
    rejectionReason: app.rejectionReason || null,
    registeredBy: app.registeredBy,
    registeredDate: formatDate(app.createdAt),
    // Raw sortable timestamp — registeredDate above is a display string
    // ("Sep 23, 2026") and, like assessments' `date`, breaks under a plain
    // string sort once entries span different months.
    registeredAtRaw: app.createdAt ? new Date(app.createdAt).getTime() : 0,
    ownershipVerificationMethod: app.ownershipVerificationMethod,
    ownershipVerificationToken: app.ownershipVerificationToken,
    ownershipVerifiedAt: app.ownershipVerifiedAt,
    ownershipVerificationLastError: app.ownershipVerificationLastError,
    checkConfig: app.checkConfig || null,
    score: summary?.score ?? null,
    assessed: summary?.assessed ?? null,
    // No backend equivalent for a "framework/standard" label — kept as the
    // app type so ApplicationDetails' "Standard" row still shows something
    // meaningful instead of a stale mock value.
    framework: app.appType
  };
}

// --- Assessments ------------------------------------------------------------
const ASSESSMENT_STATUS = {
  PENDING: 'Running',
  RUNNING: 'Running',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled'
};

const PROFILE_NAME = {
  QUICK: 'Quick Scan',
  STANDARD: 'Standard Scan',
  FULL: 'Full Assessment',
  CUSTOM: 'Custom Scan'
};

export function mapAssessment(a) {
  const rawTimestamp = a.completedAt || a.startedAt || a.createdAt;
  return {
    id: a.id,
    appId: a.applicationId,
    profile: PROFILE_NAME[a.profile] || a.profile,
    rawStatus: a.status,
    status: ASSESSMENT_STATUS[a.status] || a.status,
    date: formatDate(rawTimestamp),
    // Time of execution, kept separate from `date` so it renders on its own
    // (smaller, muted) line rather than run together in one long string.
    time: formatTime(rawTimestamp),
    // `date` above is a display string ("Sep 23, 2026") — sorting by it with
    // a plain string compare silently breaks across month boundaries (e.g.
    // "Apr" < "Jan" alphabetically, which is backwards chronologically).
    // Every "newest first" sort in this app should use this numeric field
    // instead of comparing `.date` strings.
    sortDate: rawTimestamp ? new Date(rawTimestamp).getTime() : 0,
    checksExecuted: a.checksCompleted ?? 0,
    totalChecks: a.totalChecks ?? null,
    currentCheck: a.currentCheck || null,
    score: a.status === 'COMPLETED' ? a.securityScore : null,
    failureReason: a.failureReason || null,
    elapsedMs: a.elapsedMs
  };
}

export function scanProfileToBackend(profileId) {
  return { quick: 'QUICK', standard: 'STANDARD', full: 'FULL', custom: 'CUSTOM' }[profileId] || profileId.toUpperCase();
}

// --- Findings ----------------------------------------------------------------
const FINDING_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  ACCEPTED_RISK: 'Accepted risk',
  FALSE_POSITIVE: 'False positive'
};

// Settable via PATCH /findings/:id/status — OPEN is the initial-only state and
// RESOLVED is set only by the system on a clean re-scan, so neither belongs in
// a manual status dropdown.
export const FINDING_STATUS_BACKEND = { 'In progress': 'IN_PROGRESS', 'Accepted risk': 'ACCEPTED_RISK', 'False positive': 'FALSE_POSITIVE' };
export const SETTABLE_FINDING_STATUSES = Object.keys(FINDING_STATUS_BACKEND);
export const FINDING_STATUS_REQUIRES_REASON = new Set(['Accepted risk', 'False positive']);

export function mapFinding(f, appName) {
  return {
    id: f.id,
    appId: f.applicationId,
    app: appName ?? null,
    title: f.name,
    category: titleCase(f.category),
    sev: titleCase(f.severity),
    status: FINDING_STATUS[f.status] || f.status,
    description: f.description,
    endpoint: f.endpoint,
    // No dedicated "evidence" field on the finding itself — it lives on each
    // occurrence (GET /findings/:id -> occurrences[]). Callers that only have
    // the list view show a generic line; FindingDetails fetches occurrences.
    evidence: f.endpoint ? `Detected at ${f.endpoint}` : '',
    // Backend gives one ready-to-display remediation string, not a step list.
    remediation: f.remediation ? [f.remediation] : [],
    occurrenceCount: f.occurrenceCount,
    firstDetectedAt: formatDate(f.firstDetectedAt),
    lastDetectedAt: formatDate(f.lastDetectedAt),
    statusReason: f.statusReason || null
  };
}

// --- Admin: users / organizations --------------------------------------------
const ACCOUNT_STATUS = { ACTIVE: 'Active', SUSPENDED: 'Suspended' };
const ROLE_LABEL = { OWNER: 'Owner', DEVELOPER_PENTESTER: 'Developer', SYSTEM_ADMIN: 'Admin' };

export function mapUser(u) {
  return {
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: ROLE_LABEL[u.role] || u.role,
    organization: u.orgName || null,
    joined: formatDate(u.createdAt),
    status: ACCOUNT_STATUS[u.status] || u.status
  };
}

export function mapOrganization(o) {
  return {
    id: o.id,
    name: o.name,
    type: o.orgType,
    memberCount: o.memberCount ?? 0,
    applicationCount: o.applicationCount ?? 0,
    createdDate: formatDate(o.createdAt),
    status: ACCOUNT_STATUS[o.status] || o.status,
    joinCode: o.joinCode
  };
}

export function mapAuditLogEntry(l) {
  return {
    id: l.id,
    timestamp: formatDate(l.createdAt) || l.createdAt,
    actor: l.actorName || l.actorUserId || 'System',
    action: titleCase(l.action),
    target: l.targetName || l.targetId || '',
    details: l.details ? JSON.stringify(l.details) : ''
  };
}

const HEALTH_STATUS = { HEALTHY: 'Healthy', DEGRADED: 'Degraded', DOWN: 'Down' };

export function mapScannerHealth(h) {
  return {
    serviceStatus: HEALTH_STATUS[h.serviceStatus] || h.serviceStatus,
    queueDepth: h.queueDepth,
    avgScanDurationMinutes: h.averageScanDurationMs != null ? Math.round(h.averageScanDurationMs / 60000) : 0,
    failureRate24h: h.failureRate24h != null ? Math.round(h.failureRate24h * 100) : 0,
    modules: (h.perModule || []).map(m => ({ name: titleCase(m.category), status: HEALTH_STATUS[m.status] || m.status }))
  };
}
