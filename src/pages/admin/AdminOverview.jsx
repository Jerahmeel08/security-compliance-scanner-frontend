import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import CategoryBars from '../../components/CategoryBars.jsx';
import IconBadge from '../../components/IconBadge.jsx';

const APP_STATUSES = [
  { label: 'Authorized', varName: '--ok' },
  { label: 'Pending', varName: '--warn' },
  { label: 'Rejected', varName: '--danger' },
  { label: 'Revoked', varName: '--info' }
];

export default function AdminOverview() {
  const { organizations, users, adminApps: apps } = useApp();
  const pendingApps = apps.filter(a => a.status === 'Pending');
  const statusData = APP_STATUSES.map(s => ({ ...s, value: apps.filter(a => a.status === s.label).length }));

  return (
    <>
      <div className="card hero-kpi">
        <div>
          <h2>Total Pending Authorizations</h2>
          <p className="muted">Applications registered by organizations, awaiting your review before they can be scanned.</p>
        </div>
        <p className="hero-kpi__num">{pendingApps.length}</p>
        <Link className="btn" to="/admin/applications">Review Authorizations →</Link>
      </div>

      <div className="stats" style={{ marginTop: 24 }}>
        <div className="card stat">
          <IconBadge name="building" size={40} />
          <h2>Total organizations</h2>
          <p>{organizations.length}</p>
        </div>
        <div className="card stat">
          <IconBadge name="members" size={40} />
          <h2>Total users</h2>
          <p>{users.length}</p>
        </div>
        <div className="card stat">
          <IconBadge name="apps" size={40} />
          <h2>Total applications</h2>
          <p>{apps.length}</p>
        </div>
        <div className="card stat">
          <IconBadge name="check" size={40} tintVar="--ok" />
          <h2>Authorized applications</h2>
          <p className="stat__value--ok">{apps.filter(a => a.status === 'Authorized').length}</p>
        </div>
      </div>

      <div className="lower lower--admin">
        <section className="card" aria-labelledby="h-appstatus">
          <h2 id="h-appstatus">Applications by Status</h2>
          <div style={{ marginTop: 16 }}>
            <CategoryBars data={statusData} />
          </div>
        </section>
      </div>
    </>
  );
}
