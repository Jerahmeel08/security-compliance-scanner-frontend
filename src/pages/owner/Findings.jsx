import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Pagination from '../../components/Pagination.jsx';
import { chip, sevKey, statusChip } from '../../components/chips.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useApp } from '../../context/AppContext.jsx';

const STATUS_FILTERS = ['Open', 'Resolved', 'All'];
const SEV_FILTERS = ['All', 'Critical', 'High', 'Medium', 'Low'];

export default function Findings() {
  const { findings: allFindings, apps, org } = useApp();
  const orgAppIds = new Set(apps.filter(a => a.org === org).map(a => a.id));
  const findings = allFindings.filter(f => orgAppIds.has(f.appId));
  const [searchParams, setSearchParams] = useSearchParams();
  // Filtered by application ID, not name — two applications can share the
  // same display name (e.g. re-registering the same target URL under a new
  // app), so matching by name could silently show the wrong app's findings
  // or, as happened here, no findings at all if the name wasn't resolved yet.
  const appIdFilter = searchParams.get('appId');
  const filteredApp = appIdFilter ? apps.find(a => a.id === appIdFilter) : null;
  const [status, setStatus] = useState('Open');
  const [sev, setSev] = useState('All');

  const list = findings.filter(f =>
    (status === 'All' || (status === 'Open' ? f.status !== 'Resolved' : f.status === 'Resolved')) &&
    (sev === 'All' || f.sev === sev) &&
    (!appIdFilter || f.appId === appIdFilter)
  );
  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(list);

  return (
    <>
      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map(s => (
            <button key={s} type="button" className="fchip" aria-pressed={status === s} onClick={() => setStatus(s)}>{s}</button>
          ))}
        </div>
        <label className="sr" htmlFor="fsev">Filter by severity</label>
        <select id="fsev" className="sel" value={sev} onChange={e => setSev(e.target.value)}>
          {SEV_FILTERS.map(s => <option key={s} value={s}>{s === 'All' ? 'All severities' : s}</option>)}
        </select>
      </div>
      {appIdFilter && (
        <p className="muted" style={{ marginBottom: 12 }}>
          Filtered to <strong>{filteredApp?.name || appIdFilter}</strong> · <button type="button" className="link" onClick={() => setSearchParams({})}>Clear</button>
        </p>
      )}
      <div className="card tblcard">
        {list.length ? (
          <>
            <div className="tblwrap">
              <table className="tbl">
                <thead>
                  <tr><th>ID</th><th>Finding</th><th>Application</th><th>Severity</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {pageItems.map(f => (
                    <tr key={f.id}>
                      <td data-label="ID">{f.id}</td>
                      <td className="lead" data-label="Finding"><Link to={`/app/findings/${f.id}`}>{f.title}</Link></td>
                      <td data-label="Application">{f.app}</td>
                      <td data-label="Severity">{chip(f.sev, sevKey(f.sev))}</td>
                      <td data-label="Status">{statusChip(f.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onChange={setPage} />
          </>
        ) : <p className="empty">No findings match these filters. Change the filters to see more.</p>}
      </div>
    </>
  );
}
