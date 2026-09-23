import { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import Pagination from '../../components/Pagination.jsx';
import { chip } from '../../components/chips.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useApp } from '../../context/AppContext.jsx';

export default function SystemActivity() {
  const { auditLog } = useApp();
  const [query, setQuery] = useState('');
  const [action, setAction] = useState('All');

  const actions = ['All', ...new Set(auditLog.map(l => l.action))];
  const q = query.toLowerCase();
  const list = auditLog.filter(l =>
    (action === 'All' || l.action === action) &&
    (!q || l.actor.toLowerCase().includes(q) || l.target.toLowerCase().includes(q))
  );
  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(list);

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <label className="sr" htmlFor="logq">Search by actor or target</label>
          <Icon name="search" size={20} />
          <input id="logq" type="search" placeholder="Search by actor or target" value={query} onChange={e => setQuery(e.target.value)} autoComplete="off" />
        </div>
        <label className="sr" htmlFor="logaction">Filter by action</label>
        <select id="logaction" className="sel" value={action} onChange={e => setAction(e.target.value)}>
          {actions.map(a => <option key={a} value={a}>{a === 'All' ? 'All actions' : a}</option>)}
        </select>
      </div>
      <div className="card tblcard">
        {list.length ? (
          <>
            <div className="tblwrap">
              <table className="tbl">
                <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Target</th><th>Details</th></tr></thead>
                <tbody>
                  {pageItems.map(l => (
                    <tr key={l.id}>
                      <td className="log-ts" data-label="Timestamp">{l.timestamp}</td>
                      <td className="lead" data-label="Actor">{l.actor}</td>
                      <td data-label="Action">{chip(l.action, l.actor === 'System' ? 'info' : 'ok')}</td>
                      <td data-label="Target">{l.target}</td>
                      <td data-label="Details">{l.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onChange={setPage} />
          </>
        ) : <p className="empty">No activity matches these filters.</p>}
      </div>
    </>
  );
}
