import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import Pagination from '../../components/Pagination.jsx';
import { chip } from '../../components/chips.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useApp } from '../../context/AppContext.jsx';

const STATUS_TONE = { Completed: 'ok', Running: 'warn', Failed: 'danger', Cancelled: 'info' };

export default function AssessmentHistory() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { apps, assessments } = useApp();
  const app = apps.find(a => a.id === appId);
  const history = assessments.filter(a => a.appId === appId).sort((a, b) => b.sortDate - a.sortDate);
  // The raw assessment id (a UUID) is meaningless at a glance and reads as
  // noise in a table meant to be scanned quickly — "Run #1", "Run #2" etc.
  // is what a person actually wants to see. Numbered oldest-first (Run #1
  // is this application's very first scan) even though the table itself
  // lists newest-first; the real id stays underneath, muted, for anyone
  // who needs to reference or search for it exactly.
  const runNumber = new Map([...history].sort((a, b) => a.sortDate - b.sortDate).map((a, i) => [a.id, i + 1]));
  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(history);

  if (!app) return <p className="empty">Application not found.</p>;

  return (
    <>
      <button type="button" className="link back-link" onClick={() => navigate(`/app/applications/${app.id}`)}><Icon name="right" size={16} className="back-link__icon" /> Back to {app.name}</button>
      <div className="card tblcard">
        {history.length ? (
          <>
            <div className="tblwrap">
              <table className="tbl">
                <thead><tr><th>Assessment</th><th>Profile</th><th>Date</th><th>Status</th><th>Score</th></tr></thead>
                <tbody>
                  {pageItems.map(a => (
                    <tr key={a.id}>
                      <td className="lead" data-label="Assessment">
                        <Link to={`/app/assessments/${a.id}`}>Run #{runNumber.get(a.id)}</Link><br />
                        <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>{a.id}</span>
                      </td>
                      <td data-label="Profile">{a.profile}</td>
                      <td data-label="Date">
                        {a.date}<br />
                        <span className="muted" style={{ fontSize: 13 }}>{a.time}</span>
                      </td>
                      <td data-label="Status">{chip(a.status, STATUS_TONE[a.status])}</td>
                      <td data-label="Score">{a.score != null ? `${a.score}/100` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onChange={setPage} />
          </>
        ) : <p className="empty">No assessments yet for this application.</p>}
      </div>
    </>
  );
}
