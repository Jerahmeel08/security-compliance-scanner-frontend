import { get, post } from './client.js';

// --- Directories ------------------------------------------------------
export const listUsers = (filters = {}) => get('/admin/users', { query: filters });
export const getUser = id => get(`/admin/users/${id}`);

export const listOrganizations = (filters = {}) => get('/admin/organizations', { query: filters });
export const getOrganizationDetail = id => get(`/admin/organizations/${id}`);

// --- Applications & authorization -------------------------------------
export const listAuthorizationQueue = () => get('/admin/applications/authorization-queue');
export const listAdminApplications = (filters = {}) => get('/admin/applications', { query: filters });
export const getAdminApplicationDetail = id => get(`/admin/applications/${id}`);

export const authorizeApplication = id => post(`/admin/applications/${id}/authorize`);
export const rejectApplication = (id, reason) => post(`/admin/applications/${id}/reject`, { reason });
export const revokeApplication = id => post(`/admin/applications/${id}/revoke`);

// --- Suspend / reactivate ------------------------------------------------
export const suspendUser = id => post(`/admin/users/${id}/suspend`);
export const reactivateUser = id => post(`/admin/users/${id}/reactivate`);
export const suspendOrganization = id => post(`/admin/organizations/${id}/suspend`);
export const reactivateOrganization = id => post(`/admin/organizations/${id}/reactivate`);

// --- Assessment monitoring & scanner health -------------------------------
export const listRunningAssessments = () => get('/admin/assessments/running');
export const listRecentAssessments = () => get('/admin/assessments/recent');
export const cancelAssessment = id => post(`/admin/assessments/${id}/cancel`);
export const getScannerHealth = () => get('/admin/scanner-health');

// --- Audit log -----------------------------------------------------------
export const getAuditLogs = (filters = {}) => get('/admin/audit-logs', { query: filters });
