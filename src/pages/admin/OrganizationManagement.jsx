import { Link } from 'react-router-dom';
import Pagination from '../../components/Pagination.jsx';
import { chip } from '../../components/chips.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useApp } from '../../context/AppContext.jsx';

export default function OrganizationManagement() {
  const { organizations } = useApp();
  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(organizations);

  return (
    <div className="card tblcard">
      {organizations.length ? (
        <>
          <div className="tblwrap">
            <table className="tbl">
              <thead><tr><th>Name</th><th>Type</th><th>Members</th><th>Applications</th><th>Created</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {pageItems.map(o => (
                  <tr key={o.id}>
                    <td className="lead" data-label="Name">{o.name}</td>
                    <td data-label="Type">{o.type}</td>
                    <td data-label="Members">{o.memberCount}</td>
                    <td data-label="Applications">{o.applicationCount}</td>
                    <td data-label="Created">{o.createdDate}</td>
                    <td data-label="Status">{chip(o.status, o.status === 'Active' ? 'ok' : 'danger')}</td>
                    <td data-label="Actions">
                      <Link className="btn btn--sm btn--dark-outline" to={`/admin/organizations/${o.id}`}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onChange={setPage} />
        </>
      ) : <p className="empty">No organizations yet.</p>}
    </div>
  );
}
