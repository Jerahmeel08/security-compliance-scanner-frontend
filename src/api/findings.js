import { get, patch } from './client.js';

// filters: { applicationId?, status?, severity?, category? }
export const listFindings = (filters = {}) => get('/findings', { query: filters });

export const getFinding = id => get(`/findings/${id}`);

// status must be one of IN_PROGRESS | ACCEPTED_RISK | FALSE_POSITIVE (RESOLVED is
// system-only; OPEN is the initial state and can't be set back manually).
// reason is required for ACCEPTED_RISK / FALSE_POSITIVE.
export const updateFindingStatus = (id, status, reason) =>
  patch(`/findings/${id}/status`, reason ? { status, reason } : { status });
