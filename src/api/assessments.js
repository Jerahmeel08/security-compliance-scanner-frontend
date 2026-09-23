import { apiFetch, get, post } from './client.js';

// profile: 'QUICK' | 'STANDARD' | 'FULL' | 'CUSTOM'. config.checks required (non-empty) for CUSTOM.
export const createAssessment = (applicationId, profile, config) =>
  post(`/applications/${applicationId}/assessments`, config ? { profile, config } : { profile });

export const listAssessmentsForApplication = applicationId =>
  get(`/applications/${applicationId}/assessments`);

// Poll this until status is COMPLETED / FAILED / CANCELLED.
export const getAssessment = id => get(`/assessments/${id}`);

export const getAssessmentResults = id => get(`/assessments/${id}/results`);

// PDF, not JSON — fetch as a blob and hand the browser a real download rather
// than a plain <a href> (the endpoint needs the Authorization header, which a
// plain link click can't attach).
export async function downloadAssessmentReport(id, filename) {
  const res = await apiFetch(`/assessments/${id}/report`, { raw: true });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${id}-report.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
