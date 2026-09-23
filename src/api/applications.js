import { get, patch, post } from './client.js';

// { name, targetUrl, appType, description?, ownershipVerificationMethod? }
export const createApplication = data => post('/applications', data);

export const listApplications = () => get('/applications');
export const getApplication = id => get(`/applications/${id}`);

// Always resolves (even on a failed verification attempt — it's retriable, not an error):
// { ...application, verified, error? }
export const verifyOwnership = id => post(`/applications/${id}/verify-ownership`);

// { protectedUrls?, ac02?, rateLimitProbe? }
export const updateCheckConfig = (id, config) => patch(`/applications/${id}/check-config`, config);
