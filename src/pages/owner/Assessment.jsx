import { Link } from 'react-router-dom';
import { chip } from '../../components/chips.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function Assessment() {
  const { apps, org, assessments } = useApp();
  const list = apps.filter(x => x.org === org);
  const runCount = id => assessments.filter(a => a.appId === id).length;

  return (
    <div className="card tblcard">
      <div className="tblwrap">
        <table className="tbl">
          <thead>
            <tr><th>Application</th><th>Standard</th><th>Status</th><th>Score</th><th>Last assessed</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {list.map(x => (
              <tr key={x.id}>
                <td className="lead" data-label="Application"><Link to={`/app/applications/${x.id}`}>{x.name}</Link></td>
                <td data-label="Standard">{x.framework}</td>
                <td data-label="Status">{x.score != null ? chip('Completed', 'ok') : chip('Not started', 'info')}</td>
                <td data-label="Score">{x.score != null ? `${x.score}/100` : '—'}</td>
                <td data-label="Last assessed">{x.assessed || '—'}</td>
                <td data-label="Actions">
                  <Link className="btn btn--sm btn--dark-outline" to={`/app/applications/${x.id}/assessments`}>
                    View runs{runCount(x.id) ? ` (${runCount(x.id)})` : ''}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
