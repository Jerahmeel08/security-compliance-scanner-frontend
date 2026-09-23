import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import Pagination from '../../components/Pagination.jsx';
import { chip } from '../../components/chips.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useApp } from '../../context/AppContext.jsx';

export default function UserManagement() {
  const { users, organizations } = useApp();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All');
  const [organization, setOrganization] = useState('All');

  const roles = ['All', ...new Set(users.map(u => u.role).filter(Boolean))];
  const q = query.toLowerCase();
  const list = users.filter(u =>
    (role === 'All' || u.role === role) &&
    (organization === 'All' || u.organization === organization) &&
    (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  );
  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(list);

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <label className="sr" htmlFor="userq">Search by name or email</label>
          <Icon name="search" size={20} />
          <input id="userq" type="search" placeholder="Search by name or email" value={query} onChange={e => setQuery(e.target.value)} autoComplete="off" />
        </div>
        <label className="sr" htmlFor="userrole">Filter by role</label>
        <select id="userrole" className="sel" value={role} onChange={e => setRole(e.target.value)}>
          {roles.map(r => <option key={r} value={r}>{r === 'All' ? 'All roles' : r}</option>)}
        </select>
        <label className="sr" htmlFor="userorg">Filter by organization</label>
        <select id="userorg" className="sel" value={organization} onChange={e => setOrganization(e.target.value)}>
          <option value="All">All organizations</option>
          {organizations.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
        </select>
      </div>
      <div className="card tblcard">
        {list.length ? (
          <>
            <div className="tblwrap">
              <table className="tbl">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Organization</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {pageItems.map(u => (
                    <tr key={u.id}>
                      <td className="lead" data-label="Name">{u.name}</td>
                      <td data-label="Email">{u.email}</td>
                      <td data-label="Role">{u.role || 'No role yet (join request pending/denied)'}</td>
                      <td data-label="Organization">{u.organization}</td>
                      <td data-label="Joined">{u.joined}</td>
                      <td data-label="Status">{chip(u.status, u.status === 'Active' ? 'ok' : 'danger')}</td>
                      <td data-label="Actions">
                        <Link className="btn btn--sm btn--dark-outline" to={`/admin/users/${u.id}`}>View details</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onChange={setPage} />
          </>
        ) : <p className="empty">No users match these filters.</p>}
      </div>
    </>
  );
}
