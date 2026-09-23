import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../../components/Pagination.jsx';
import { chip } from '../../components/chips.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const STATUS_TONE = { Completed: 'ok', Running: 'warn', Failed: 'danger', Cancelled: 'info' };
// Platform-wide, mixing applications/orgs, so there's no natural "Run #N"
// sequence like the owner-side per-app history has (the loaded list is a
// capped "recent" window, not each app's full history, so a per-app count
// would often be wrong). Lead with what an admin actually scans for first —
// which application — and keep the raw id as a muted reference underneath
// instead of leading with it.

export default function AssessmentMonitoring() {
  const { adminAssessments: assessments, adminApps: apps, cancelAssessment: cancelScan } = useApp();
  const toast = useToast();
  const cancelRef = useRef(null);
  const appName = id => apps.find(a => a.id === id)?.name || id;

  const running = assessments.filter(a => a.status === 'Running');
  const finished = assessments.filter(a => a.status !== 'Running').sort((a, b) => b.sortDate - a.sortDate);
  // "Running now" is naturally small and transient — only the
  // completed/cancelled/failed history actually grows without bound.
  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(finished);

  async function confirmCancel(assessmentId) {
    try {
      await cancelScan(assessmentId);
      toast(`${assessmentId} was cancelled`);
    } catch (err) {
      toast(err.message || 'Could not cancel that assessment.');
    }
  }

  return (
    <>
      <h2 className="sect">Running now</h2>
      {running.length ? (
        <div className="card tblcard" style={{ marginBottom: 24 }}>
          <div className="tblwrap">
            <table className="tbl">
              <thead><tr><th>Application</th><th>Profile</th><th>Actions</th></tr></thead>
              <tbody>
                {running.map(a => (
                  <tr key={a.id}>
                    <td className="lead" data-label="Application">
                      {appName(a.appId)}<br />
                      <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>{a.id}</span>
                    </td>
                    <td data-label="Profile">{a.profile}</td>
                    <td data-label="Actions"><button type="button" className="btn btn--sm btn--danger" onClick={() => cancelRef.current?.open(a.id)}>Cancel</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : <p className="empty" style={{ marginBottom: 24 }}>No scans are running right now.</p>}

      <h2 className="sect">Completed, cancelled &amp; failed</h2>
      <div className="card tblcard">
        {finished.length ? (
          <>
            <div className="tblwrap">
              <table className="tbl">
                <thead><tr><th>Application</th><th>Profile</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {pageItems.map(a => (
                    <tr key={a.id}>
                      <td className="lead" data-label="Application">
                        {appName(a.appId)}<br />
                        <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>{a.id}</span>
                      </td>
                      <td data-label="Profile">{a.profile}</td>
                      <td data-label="Date">
                        {a.date}<br />
                        <span className="muted" style={{ fontSize: 13 }}>{a.time}</span>
                      </td>
                      <td data-label="Status">{chip(a.status, STATUS_TONE[a.status])}</td>
                      <td data-label="Actions"><Link className="btn btn--sm btn--dark-outline" to={`/admin/assessments/${a.id}`}>View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onChange={setPage} />
          </>
        ) : <p className="empty">No assessment history yet.</p>}
      </div>

      <ConfirmDialog
        ref={cancelRef}
        title="Cancel this scan?"
        message={id => `Stop ${id} while it is running? Partial results will not be saved.`}
        confirmLabel="Cancel scan"
        danger
        onConfirm={confirmCancel}
      />
    </>
  );
}
