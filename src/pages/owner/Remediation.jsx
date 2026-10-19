import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import Pagination from '../../components/Pagination.jsx';
import { chip, sevKey, statusChip } from '../../components/chips.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  FINDING_STATUS_BACKEND,
  FINDING_STATUS_REQUIRES_REASON,
  SETTABLE_FINDING_STATUSES
} from '../../api/mappers.js';
import './RemediationWorkspace.css';

const SEVERITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];
const SEVERITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const STATUS_CHOICES = {
  'In progress': 'In progress — working on a fix',
  'Accepted risk': 'Accepted risk — acknowledge without fixing',
  'False positive': 'False positive — not a real issue'
};
const EXCEPTION_STATUSES = new Set(['Accepted risk', 'False positive']);

export default function Remediation() {
  const { findings: allFindings, apps, org, updateFindingStatus } = useApp();
  const toast = useToast();
  const [scope, setScope] = useState('work');
  const [severity, setSeverity] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const statusLabelId = 'remediation-status-select';
  const detailRef = useRef(null);

  // Only show findings belonging to the current organization (not another org's data).
  const orgAppIds = new Set(apps.filter(a => a.org === org).map(a => a.id));
  const findings = allFindings.filter(f => orgAppIds.has(f.appId));

  const openCount = findings.filter(f => f.status === 'Open').length;
  const inProgressCount = findings.filter(f => f.status === 'In progress').length;
  const resolvedCount = findings.filter(f => f.status === 'Resolved').length;
  const reviewedCount = findings.filter(f => EXCEPTION_STATUSES.has(f.status)).length;

  const normalizedQuery = query.trim().toLowerCase();
  const visible = findings
    .filter(f => {
      const matchesScope = scope === 'all'
        || (scope === 'resolved' ? f.status === 'Resolved' : f.status === 'Open' || f.status === 'In progress');
      const matchesSeverity = severity === 'All' || f.sev === severity;
      const matchesQuery = !normalizedQuery || [f.title, f.app, f.id, f.category]
        .some(value => String(value || '').toLowerCase().includes(normalizedQuery));
      return matchesScope && matchesSeverity && matchesQuery;
    })
    .sort((a, b) => (SEVERITY_ORDER[a.sev] ?? 9) - (SEVERITY_ORDER[b.sev] ?? 9));

  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(visible, 8);
  const selected = pageItems.find(f => f.id === selectedId) || pageItems[0] || null;
  const requiresReason = FINDING_STATUS_REQUIRES_REASON.has(nextStatus);
  const isException = selected && EXCEPTION_STATUSES.has(selected.status);
  const canSave = Boolean(selected && nextStatus && nextStatus !== selected.status && !saving && (!requiresReason || reason.trim()));

  useEffect(() => {
    setNextStatus('');
    setReason('');
    setError('');
  }, [selected?.id]);

  function updateFilters(update) {
    update();
    setPage(1);
    setSelectedId(null);
  }

  async function saveStatus(event) {
    event.preventDefault();
    if (!selected || !nextStatus || nextStatus === selected.status || saving) return;
    if (!SETTABLE_FINDING_STATUSES.includes(nextStatus)) return;
    if (requiresReason && !reason.trim()) {
      setError('Please explain why you chose this status. Your reason will be saved in the audit trail.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateFindingStatus(selected.id, FINDING_STATUS_BACKEND[nextStatus], reason.trim() || undefined);
      toast(`${selected.title} was updated to ${nextStatus.toLowerCase()}.`);
      setNextStatus('');
      setReason('');
    } catch (err) {
      setError(err.message || 'Could not save this status. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="remedy-workspace">
      <header className="remedy-heading">
        <div>
          <h2>Remediation workspace</h2>
          <p>Review recommended fixes, track progress, and verify issues with a new assessment.</p>
        </div>
        <Link className="btn btn--sm btn--dark-outline remedy-findings-link" to="/app/findings">
          View findings <Icon name="right" size={16} />
        </Link>
      </header>

      <div className="remedy-summary" aria-label="Remediation status summary">
        <div className="remedy-summary__stat remedy-summary__stat--open">
          <span>Needs action</span>
          <strong>{openCount}</strong>
        </div>
        <div className="remedy-summary__stat remedy-summary__stat--progress">
          <span>In progress</span>
          <strong>{inProgressCount}</strong>
        </div>
        <div className="remedy-summary__stat remedy-summary__stat--resolved">
          <span>Resolved</span>
          <strong>{resolvedCount}</strong>
        </div>
      </div>
      {reviewedCount > 0 && (
        <p className="remedy-reviewed">{reviewedCount} reviewed {reviewedCount === 1 ? 'exception' : 'exceptions'} (accepted risk or false positive). <button type="button" onClick={() => updateFilters(() => setScope('all'))}>Show all findings</button></p>
      )}

      <div className="remedy-filters">
        <div className="remedy-filters__tabs" role="group" aria-label="Filter remediation items">
          <button type="button" className="remedy-filter" aria-pressed={scope === 'work'} onClick={() => updateFilters(() => setScope('work'))}>Needs work</button>
          <button type="button" className="remedy-filter" aria-pressed={scope === 'resolved'} onClick={() => updateFilters(() => setScope('resolved'))}>Resolved</button>
          <button type="button" className="remedy-filter" aria-pressed={scope === 'all'} onClick={() => updateFilters(() => setScope('all'))}>All</button>
        </div>
        <div className="remedy-filters__fields">
          <label className="remedy-search">
            <Icon name="search" size={17} />
            <span className="sr">Search remediation items</span>
            <input type="search" value={query} placeholder="Search issues or applications" onChange={event => updateFilters(() => setQuery(event.target.value))} />
          </label>
          <label className="sr" htmlFor="remedy-severity">Filter by severity</label>
          <select className="sel remedy-severity" id="remedy-severity" value={severity} onChange={event => updateFilters(() => setSeverity(event.target.value))}>
            {SEVERITIES.map(s => <option key={s} value={s}>{s === 'All' ? 'All severities' : s}</option>)}
          </select>
        </div>
      </div>

      {visible.length ? (
        <div className="remedy-layout">
          <section className="remedy-queue card" aria-label="Remediation issues">
            <div className="remedy-queue__heading">
              <h3>Issues</h3>
              <span>{total} {total === 1 ? 'issue' : 'issues'}</span>
            </div>
            <div className="remedy-queue__list">
              {pageItems.map(f => (
                <button
                  key={f.id}
                  type="button"
                  className={`remedy-issue${selected?.id === f.id ? ' remedy-issue--selected' : ''}`}
                  aria-pressed={selected?.id === f.id}
                  onClick={() => {
                    setSelectedId(f.id);
                    if (window.matchMedia?.('(max-width: 920px)').matches) {
                      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <span className="remedy-issue__name">
                    <strong>{f.title}</strong>
                    {chip(f.sev, sevKey(f.sev))}
                  </span>
                  <span className="remedy-issue__meta">
                    <span className="remedy-issue__app">{f.app || 'Unknown application'}</span>
                    <span className="remedy-issue__status">{f.status}</span>
                  </span>
                </button>
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onChange={p => { setPage(p); setSelectedId(null); }} />
            )}
          </section>

          {selected && (
            <section className="remedy-detail card" aria-labelledby="remedy-detail-title" ref={detailRef}>
              <div className="remedy-detail__header">
                <div className="remedy-detail__badges">{chip(selected.sev, sevKey(selected.sev))}{statusChip(selected.status)}</div>
                <h3 id="remedy-detail-title">{selected.title}</h3>
                <p className="remedy-detail__meta">{selected.app || 'Unknown application'}{selected.category ? ` · ${selected.category}` : ''}</p>
              </div>

              <div className="remedy-detail__block">
                <h4>What was found</h4>
                <p>{selected.description || 'See the finding details for detection information.'}</p>
                {selected.endpoint && <p className="remedy-endpoint">Endpoint: <code>{selected.endpoint}</code></p>}
              </div>

              <div className="remedy-detail__block remedy-detail__block--guidance">
                <h4>Recommended fix</h4>
                {selected.remediation?.length
                  ? selected.remediation.map((text, i) => <p key={i} className="remedy-guidance">{text}</p>)
                  : <p className="remedy-guidance remedy-guidance--missing">No check-specific remediation guidance is available. Review the finding details before changing its status.</p>}
                <Link to={`/app/findings/${selected.id}`} className="remedy-link">Full finding details <Icon name="right" size={15} /></Link>
              </div>

              <div className="remedy-verify">
                <div>
                  <h4>Verify with a new scan</h4>
                  <p>Apply the fix, then re-scan. Only a clean assessment can mark an eligible finding <strong>Resolved</strong>.</p>
                  {isException && <p className="remedy-verify__note">This finding is currently recorded as an exception. Set it to <strong>In progress</strong> when you begin work on a fix.</p>}
                </div>
                {selected.appId && <Link className="btn btn--sm btn--dark-outline remedy-verify__link" to={`/app/applications/${selected.appId}/scan`}>Set up re-scan <Icon name="right" size={16} /></Link>}
              </div>

              <div className="remedy-status-area">
                <h4>Track progress</h4>
                {selected.status === 'Resolved' ? (
                  <p className="remedy-status-area__readonly"><Icon name="check" size={18} /> This issue was resolved by the system after a clean assessment. Manual changes are unavailable.</p>
                ) : (
                  <form onSubmit={saveStatus} noValidate>
                    <p>Select a status. Accepted risk and false positive require a written reason.</p>
                    <label htmlFor={statusLabelId}>Update status</label>
                    <div className="remedy-status-area__controls">
                      <select id={statusLabelId} value={nextStatus} onChange={event => { setNextStatus(event.target.value); setError(''); }} disabled={saving}>
                        <option value="">Choose a status</option>
                        {SETTABLE_FINDING_STATUSES.filter(status => status !== selected.status).map(status => (
                          <option key={status} value={status}>{STATUS_CHOICES[status] || status}</option>
                        ))}
                      </select>
                      <button type="submit" className="btn btn--sm remedy-save" disabled={!canSave}>{saving ? 'Saving…' : 'Save status'}</button>
                    </div>
                    {requiresReason && (
                      <div className="remedy-reason">
                        <label htmlFor="remedy-reason">Reason <span aria-hidden="true">*</span></label>
                        <textarea id="remedy-reason" rows={3} value={reason} onChange={event => { setReason(event.target.value); setError(''); }} placeholder="Explain why this is an accepted risk or false positive" disabled={saving} aria-required="true" />
                      </div>
                    )}
                    {error && <p role="alert" className="remedy-error">{error}</p>}
                  </form>
                )}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="card remedy-empty">
          <Icon name="check" size={26} />
          <h3>{findings.length ? 'No issues match your filters' : 'No remediation items yet'}</h3>
          <p>{findings.length ? 'Try another status, severity, or search term.' : 'When an assessment detects a security issue, its recommended fix will appear here.'}</p>
          {findings.length > 0 && <button type="button" className="btn btn--sm btn--dark-outline" onClick={() => updateFilters(() => { setScope('all'); setSeverity('All'); setQuery(''); })}>Clear filters</button>}
        </div>
      )}
    </div>
  );
}
