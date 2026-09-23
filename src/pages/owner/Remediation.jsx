import { useRef } from 'react';
import Pagination from '../../components/Pagination.jsx';
import { chip, sevKey } from '../../components/chips.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { FINDING_STATUS_BACKEND, FINDING_STATUS_REQUIRES_REASON, SETTABLE_FINDING_STATUSES } from '../../api/mappers.js';

export default function Remediation() {
  const { findings: allFindings, apps, org, updateFindingStatus } = useApp();
  const orgAppIds = new Set(apps.filter(a => a.org === org).map(a => a.id));
  const findings = allFindings.filter(f => orgAppIds.has(f.appId));
  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(findings);
  const toast = useToast();
  const reasonRef = useRef(null);

  async function apply(id, status, reason) {
    try {
      await updateFindingStatus(id, FINDING_STATUS_BACKEND[status], reason);
      toast(`${id} marked ${status.toLowerCase()}`);
    } catch (err) {
      toast(err.message || 'Could not update the status.');
    }
  }

  function handleChange(f, status) {
    if (!SETTABLE_FINDING_STATUSES.includes(status) || status === f.status) return;
    if (FINDING_STATUS_REQUIRES_REASON.has(status)) {
      reasonRef.current?.open({ id: f.id, status });
    } else {
      apply(f.id, status);
    }
  }

  return (
    <>
      <div className="card tblcard">
        {findings.length ? (
          <>
            <div className="tblwrap">
              <table className="tbl">
                <thead>
                  <tr><th>Finding</th><th>Severity</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {pageItems.map(f => {
                    const options = SETTABLE_FINDING_STATUSES.includes(f.status) ? SETTABLE_FINDING_STATUSES : [f.status, ...SETTABLE_FINDING_STATUSES];
                    return (
                      <tr key={f.id}>
                        <td className="lead" data-label="Finding">
                          {f.title}<br />
                          <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>{f.id} · {f.app}</span>
                        </td>
                        <td data-label="Severity">{chip(f.sev, sevKey(f.sev))}</td>
                        <td data-label="Status">
                          {f.status === 'Resolved' ? (
                            <span className="muted">Resolved (system)</span>
                          ) : (
                            <select className="sel sel--sm" aria-label={`Status for ${f.id}`} value={f.status} onChange={e => handleChange(f, e.target.value)}>
                              {options.map(s => <option key={s} value={s} disabled={!SETTABLE_FINDING_STATUSES.includes(s)}>{s}</option>)}
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onChange={setPage} />
          </>
        ) : <p className="empty">No findings yet.</p>}
      </div>

      <ConfirmDialog
        ref={reasonRef}
        title="Reason required"
        message={p => `Explain why ${p?.id} should be marked "${p?.status?.toLowerCase()}". This is recorded with the finding.`}
        confirmLabel="Save status"
        requireReason
        reasonLabel="Reason"
        onConfirm={(payload, reason) => apply(payload.id, payload.status, reason)}
      />
    </>
  );
}
