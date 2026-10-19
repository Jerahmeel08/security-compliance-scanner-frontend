import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import Pagination from '../../components/Pagination.jsx';
import { chip, sevKey, statusChip } from '../../components/chips.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useApp } from '../../context/AppContext.jsx';
import './FindingsUI.css';

// “Active” is the existing non-Resolved filter, renamed to clarify that it
// also includes findings that are In progress or in other non-Resolved states.
const STATUS_FILTERS = ['Active', 'Resolved', 'All'];
const SEV_FILTERS = ['All', 'Critical', 'High', 'Medium', 'Low'];

// Only shorten the visual label. Keep the complete ID for routing, search,
// accessibility and the finding detail page.
const shortFindingId = id => id.length > 12 ? `${id.slice(0, 8)}…` : id;

export default function Findings() {
  const { findings: allFindings, apps, org } = useApp();
  const orgAppIds = new Set(apps.filter(a => a.org === org).map(a => a.id));
  const findings = allFindings.filter(f => orgAppIds.has(f.appId));
  const [searchParams, setSearchParams] = useSearchParams();
  // Filter by application ID, not name: distinct applications can share a name.
  const appIdFilter = searchParams.get('appId');
  const filteredApp = appIdFilter ? apps.find(a => a.id === appIdFilter) : null;
  const [status, setStatus] = useState('Active');
  const [sev, setSev] = useState('All');
  const [query, setQuery] = useState('');
  const search = query.trim().toLowerCase();

  const list = findings.filter(f =>
    (status === 'All' || (status === 'Active' ? f.status !== 'Resolved' : f.status === 'Resolved')) &&
    (sev === 'All' || f.sev === sev) &&
    (!appIdFilter || f.appId === appIdFilter) &&
    (!search || [f.id, f.title, f.app].some(value => String(value ?? '').toLowerCase().includes(search)))
  );
  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(list);

  return (
    <>
      <div className="toolbar findings-toolbar">
        <div className="chips" role="group" aria-label="Filter findings by status">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              type="button"
              className="fchip"
              aria-pressed={status === s}
              onClick={() => { setStatus(s); setPage(1); }}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="search findings-toolbar__search">
          <label className="sr" htmlFor="finding-search">Search findings, applications, or IDs</label>
          <Icon name="search" size={20} />
          <input
            id="finding-search"
            type="search"
            placeholder="Search findings or applications…"
            autoComplete="off"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
          />
        </div>
        <label className="sr" htmlFor="fsev">Filter by severity</label>
        <select id="fsev" className="sel" value={sev} onChange={e => { setSev(e.target.value); setPage(1); }}>
          {SEV_FILTERS.map(s => <option key={s} value={s}>{s === 'All' ? 'All severities' : s}</option>)}
        </select>
      </div>
      {appIdFilter && (
        <p className="muted" style={{ marginBottom: 12 }}>
          Filtered to <strong>{filteredApp?.name || appIdFilter}</strong> · <button type="button" className="link" onClick={() => { setSearchParams({}); setPage(1); }}>Clear</button>
        </p>
      )}
      <div className="card tblcard">
        {list.length ? (
          <>
            <div className="tblwrap">
              <table className="tbl findings-table">
                <thead>
                  <tr><th>ID</th><th>Finding</th><th>Application</th><th>Severity</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {pageItems.map(f => (
                    <tr key={f.id}>
                      <td data-label="ID">
                        <span className="findings-table__short-id" title={f.id} aria-label={`Finding ID: ${f.id}`}>
                          {shortFindingId(f.id)}
                        </span>
                      </td>
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
        ) : <p className="empty">No findings match your search or filters. Try another keyword or adjust the filters.</p>}
      </div>
    </>
  );
}
