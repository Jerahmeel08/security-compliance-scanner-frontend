import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chip, sevKey, statusChip } from '../../components/chips.jsx';
import Icon from '../../components/Icon.jsx';
import IconBadge from '../../components/IconBadge.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { FINDING_STATUS_BACKEND, FINDING_STATUS_REQUIRES_REASON, SETTABLE_FINDING_STATUSES } from '../../api/mappers.js';

// Friendlier wording for the status dropdown than the bare backend labels —
// the <option value> stays the same internal status string either way, this
// only changes what the person reads.
const STATUS_OPTION_LABEL = {
  Open: 'Open (needs action)',
  'In progress': 'In progress',
  'Accepted risk': 'Accept the risk (won\u2019t be fixed)',
  'False positive': 'False positive (not a real issue)'
};

export default function FindingDetails() {
  const { findingId } = useParams();
  const navigate = useNavigate();
  const { findings, updateFindingStatus } = useApp();
  const toast = useToast();
  const finding = findings.find(f => f.id === findingId);
  const [nextStatus, setNextStatus] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!finding) return <p className="empty">Finding not found.</p>;

  const isTerminal = finding.status === 'Resolved';
  const options = SETTABLE_FINDING_STATUSES.includes(finding.status)
    ? SETTABLE_FINDING_STATUSES
    : [finding.status, ...SETTABLE_FINDING_STATUSES];

  async function save() {
    const target = nextStatus || finding.status;
    if (!SETTABLE_FINDING_STATUSES.includes(target)) return;
    if (FINDING_STATUS_REQUIRES_REASON.has(target) && !reason.trim()) {
      setError('A reason is required for this status.');
      return;
    }
    setSaving(true);
    try {
      await updateFindingStatus(finding.id, FINDING_STATUS_BACKEND[target], reason.trim() || undefined);
      toast(`${finding.id} marked ${target.toLowerCase()}`);
      setNextStatus(''); setReason(''); setError('');
    } catch (err) {
      setError(err.message || 'Could not update the status. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button type="button" className="link back-link" onClick={() => navigate(-1)}><Icon name="right" size={16} className="back-link__icon" /> Back</button>
      <div className="card app-detail">
        <div className="app-detail__head">
          <div className="app-detail__title">
            <IconBadge name="findings" tintVar={`--${sevKey(finding.sev)}`} />
            <div>
              <h2>{finding.title}</h2>
              <p className="muted">{finding.id} · {finding.app} · {finding.category}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {chip(finding.sev, sevKey(finding.sev))}
            {statusChip(finding.status)}
          </div>
        </div>

        <h3 className="sect">Description</h3>
        <p>{finding.description}</p>

        <h3 className="sect">Evidence</h3>
        <p className="evidence">{finding.evidence || 'No evidence recorded.'}</p>
        {finding.occurrenceCount > 1 && (
          <p className="muted">Seen in {finding.occurrenceCount} assessments · first detected {finding.firstDetectedAt}, last detected {finding.lastDetectedAt}.</p>
        )}

        <h3 className="sect">Remediation</h3>
        {finding.remediation.length ? (
          <p>{finding.remediation[0]}</p>
        ) : <p className="muted">No remediation guidance recorded for this check.</p>}

        {isTerminal ? (
          <p className="muted" style={{ marginTop: 24 }}>This finding was resolved automatically by a later clean scan.</p>
        ) : (
          <div style={{ maxWidth: 320, marginTop: 24 }}>
            <div className="field">
              <label htmlFor="finding-status">Update status</label>
              <select id="finding-status" value={nextStatus || finding.status} onChange={e => { setNextStatus(e.target.value); setError(''); }}>
                {options.map(s => <option key={s} value={s} disabled={!SETTABLE_FINDING_STATUSES.includes(s)}>{STATUS_OPTION_LABEL[s] || s}</option>)}
              </select>
            </div>
            {FINDING_STATUS_REQUIRES_REASON.has(nextStatus) && (
              <div className="field">
                <label htmlFor="finding-reason">Reason</label>
                <textarea id="finding-reason" value={reason} onChange={e => { setReason(e.target.value); setError(''); }} />
              </div>
            )}
            <p className="err" role="alert">{error}</p>
            <button type="button" className="btn" disabled={saving || !nextStatus || nextStatus === finding.status} onClick={save}>
              {saving ? 'Saving…' : 'Save status'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
