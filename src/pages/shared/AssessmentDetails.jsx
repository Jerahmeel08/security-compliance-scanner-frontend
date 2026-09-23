import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chip } from '../../components/chips.jsx';
import Icon from '../../components/Icon.jsx';
import IconBadge from '../../components/IconBadge.jsx';
import { useApp } from '../../context/AppContext.jsx';
import * as assessmentsApi from '../../api/assessments.js';
import { titleCase } from '../../api/mappers.js';

const STATUS_TONE = { Completed: 'ok', Running: 'warn', Failed: 'danger', Cancelled: 'info' };
const RESULT_TONE = { PASS: 'ok', FAIL: 'danger', WARN: 'warn', NOT_APPLICABLE: 'info', ERROR: 'danger' };
const RESULT_KEYS = ['PASS', 'FAIL', 'WARN', 'NOT_APPLICABLE', 'ERROR'];

// The backend stores `evidence` per check result as an ARRAY of
// { endpoint, outcome, evidence } items (one per endpoint/case the check
// inspected) — the inner `evidence` object's own keys vary per check
// (e.g. { reason }, { status, bodyLength }, { cookie, secure }, ...).
// This flattens that into plain display strings so nothing here ever
// tries to render a raw object as a React child (which crashes the whole
// tree, since this app has no error boundary).
function formatEvidenceLines(evidence) {
  if (!evidence) return [];
  const items = Array.isArray(evidence) ? evidence : [evidence];
  return items
    .map(item => {
      if (item == null) return null;
      if (typeof item === 'string') return item;
      const { endpoint, outcome, evidence: detail } = item;
      const detailText = detail && typeof detail === 'object'
        ? Object.entries(detail)
            .map(([k, v]) => `${k}: ${v && typeof v === 'object' ? JSON.stringify(v) : v}`)
            .join(', ')
        : (detail != null ? String(detail) : '');
      return [endpoint, outcome, detailText].filter(Boolean).join(' — ');
    })
    .filter(Boolean);
}

// Note: this shows per-check RESULTS (PASS/FAIL/WARN/NOT_APPLICABLE/ERROR for
// every check the assessment ran) — not the persistent "findings" resource,
// which only tracks FAIL-derived issues that survive across scans with their
// own remediation workflow (see Findings.jsx / FindingDetails.jsx). A finding
// doesn't carry an assessmentId, so results here come straight from
// GET /assessments/:id/results instead of filtering the findings list.
export default function AssessmentDetails() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { assessments: ownAssessments, apps: ownApps, adminAssessments, adminApps, isAdmin } = useApp();
  const assessments = isAdmin ? adminAssessments : ownAssessments;
  const apps = isAdmin ? adminApps : ownApps;
  const assessment = assessments.find(a => a.id === assessmentId);
  const app = assessment && apps.find(a => a.id === assessment.appId);
  const backPath = isAdmin ? '/admin/assessments' : (app ? `/app/applications/${app.id}/assessments` : '/app/applications');

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    assessmentsApi.getAssessmentResults(assessmentId)
      .then(raw => { if (!cancelled) setResults(raw); })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [assessmentId]);

  if (!assessment) return <p className="empty">Assessment not found.</p>;

  async function downloadReport() {
    setDownloading(true);
    try {
      await assessmentsApi.downloadAssessmentReport(assessment.id, `${assessment.id}-report.pdf`);
    } catch {
      // the button stays available to retry
    } finally {
      setDownloading(false);
    }
  }

  const counts = RESULT_KEYS.map(k => ({ key: k, count: (results || []).filter(r => r.result === k).length }));

  return (
    <>
      <button type="button" className="link back-link" onClick={() => navigate(backPath)}><Icon name="right" size={16} className="back-link__icon" /> Back</button>
      <div className="card app-detail">
        <div className="app-detail__head">
          <div className="app-detail__title">
            <IconBadge name="assess" />
            <div>
              <h2>{assessment.id}</h2>
              <p className="muted">{app?.name} · {app?.url}</p>
            </div>
          </div>
          {chip(assessment.status, STATUS_TONE[assessment.status])}
        </div>
        <dl className="detail-grid">
          <div><dt>Application</dt><dd>{app?.name || '—'}</dd></div>
          <div><dt>Target URL</dt><dd>{app?.url || '—'}</dd></div>
          <div><dt>Assessment profile</dt><dd>{assessment.profile}</dd></div>
          <div><dt>Assessment date</dt><dd>{assessment.date}<br /><span className="muted" style={{ fontSize: 13 }}>{assessment.time}</span></dd></div>
          <div><dt>Checks executed</dt><dd>{assessment.checksExecuted}</dd></div>
          <div><dt>Security score</dt><dd>{assessment.score != null ? `${assessment.score}/100` : '—'}</dd></div>
        </dl>
      </div>

      <section className="card" style={{ marginTop: 24 }}>
        <h2>Check results</h2>
        {loading ? (
          <p className="muted" style={{ marginTop: 12 }}>Loading results…</p>
        ) : results && results.length ? (
          <>
            <div className="stats" style={{ marginTop: 16 }}>
              {counts.map(c => (
                <div className="card stat" key={c.key}><h2>{titleCase(c.key)}</h2><p>{c.count}</p></div>
              ))}
            </div>
            <ul className="mini" style={{ marginTop: 16 }}>
              {results.map(r => {
                const evidenceLines = formatEvidenceLines(r.evidence);
                return (
                  <li key={r.checkId}>
                    <div>
                      <b>{r.checkId} — {titleCase(r.category)}</b>
                      <span className="muted">{titleCase(r.severity)}</span>
                      {evidenceLines.length ? (
                        <ul style={{ marginTop: 4, paddingLeft: 16 }}>
                          {evidenceLines.map((line, i) => (
                            <li key={i} className="muted" style={{ fontSize: '0.9em' }}>{line}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="muted"> · No evidence recorded</span>
                      )}
                    </div>
                    {chip(titleCase(r.result), RESULT_TONE[r.result] || 'info')}
                  </li>
                );
              })}
            </ul>
          </>
        ) : <p className="muted" style={{ marginTop: 12 }}>No results recorded for this assessment yet.</p>}
        <button type="button" className="btn btn--block" style={{ marginTop: 24 }} disabled={downloading} onClick={downloadReport}>
          {downloading ? 'Preparing report…' : 'Download Assessment Report'}
        </button>
      </section>
    </>
  );
}
