import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import Pagination from '../../components/Pagination.jsx';
import { statusChip } from '../../components/chips.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useApp } from '../../context/AppContext.jsx';
import { useOpenAddAppDialog } from './AppShell.jsx';

const STATUSES = ['All', 'Authorized', 'Pending', 'Rejected', 'Revoked'];
const STATUS_ACCENT = { Authorized: '--ok', Pending: '--warn', Rejected: '--danger', Revoked: '--info' };
const scoreVar = score => (score >= 90 ? '--ok' : score >= 70 ? '--warn' : '--danger');

export default function Applications() {
  const { apps, org } = useApp();
  const openAddApp = useOpenAddAppDialog();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');

  const q = query.toLowerCase();
  const list = apps.filter(x =>
    x.org === org &&
    (status === 'All' || x.status === status) &&
    (!q || x.name.toLowerCase().includes(q) || x.type.toLowerCase().includes(q))
  );
  // "Add application" is a standing action, not a data row — it's appended
  // after the current page rather than counted toward it, so it's always
  // reachable no matter how many applications pile up or which page/filter
  // is active.
  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(list);

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <label className="sr" htmlFor="appq">Search applications</label>
          <Icon name="search" size={20} />
          <input id="appq" type="search" placeholder="Search applications" value={query} onChange={e => setQuery(e.target.value)} autoComplete="off" />
        </div>
        <label className="sr" htmlFor="appst">Filter by status</label>
        <select id="appst" className="sel" value={status} onChange={e => setStatus(e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All statuses' : s}</option>)}
        </select>
      </div>
      <div className="grid-apps">
        {pageItems.map(x => (
          <Link
            className="card app app--link"
            to={`/app/applications/${x.id}`}
            key={x.id}
            style={{ borderLeft: `4px solid var(${STATUS_ACCENT[x.status]})` }}
          >
            <div className="app__top"><h3>{x.name}</h3>{statusChip(x.status)}</div>
            <p className="muted">{x.type}</p>
            {x.score != null ? (
              <>
                <div className="score">
                  <div><span>Security score</span><b>{x.score}/100</b></div>
                  <div className="bar" role="img" aria-label={`Score ${x.score} out of 100`}>
                    <i style={{ width: `${x.score}%`, background: `var(${scoreVar(x.score)})` }} />
                  </div>
                </div>
                <p className="meta">Last assessed {x.assessed}</p>
              </>
            ) : (
              <p className="meta" style={{ marginTop: 'auto' }}>
                {x.status === 'Pending' ? 'Not assessed yet. Waiting for authorization.' : x.status === 'Rejected' ? 'Registration rejected.' : 'Authorization revoked.'}
              </p>
            )}
          </Link>
        ))}
        <button type="button" className="card app add" onClick={openAddApp}>
          <Icon name="plus" size={36} />
          <span>Add application</span>
        </button>
      </div>
      <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onChange={setPage} />
    </>
  );
}
