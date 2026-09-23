import { del, get, post } from './client.js';

// Owner-only. Acting user's own org is always implied (no :orgId param).
export const listJoinRequests = () => get('/organizations/me/join-requests');
export const approveJoinRequest = id => post(`/organizations/me/join-requests/${id}/approve`);
export const denyJoinRequest = id => post(`/organizations/me/join-requests/${id}/deny`);

export const listMembers = () => get('/organizations/me/members');
export const removeMember = userId => del(`/organizations/me/members/${userId}`);

export const regenerateJoinCode = () => post('/organizations/me/regenerate-code');
