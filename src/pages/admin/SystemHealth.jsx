import { chip } from '../../components/chips.jsx';
import { useApp } from '../../context/AppContext.jsx';

const STATUS_TONE = { Healthy: 'ok', Degraded: 'warn', Down: 'danger' };

export default function SystemHealth() {
  const { systemHealth } = useApp();

  return (
    <>
      <div className="card hero-kpi hero-kpi--health">
        <div>
          <h2>Service status</h2>
          <p className="muted">Healthy means every signal below is nominal. Degraded means an assessment is stuck, a category is erroring, or the failure rate is elevated.</p>
        </div>
        <p className={`hero-kpi__num hero-kpi__num--${STATUS_TONE[systemHealth.serviceStatus]}`}>{systemHealth.serviceStatus}</p>
      </div>

      <div className="stats" style={{ marginTop: 24 }}>
        <div className="card stat"><h2>Queue depth</h2><p>{systemHealth.queueDepth}</p></div>
        <div className="card stat"><h2>Avg. scan duration</h2><p>{systemHealth.avgScanDurationMinutes}m</p></div>
        <div className="card stat"><h2>Failure rate (24h)</h2><p>{systemHealth.failureRate24h}%</p></div>
        <div className="card stat"><h2>Modules degraded</h2><p>{systemHealth.modules.filter(m => m.status !== 'Healthy').length}</p></div>
      </div>

      <section className="card" style={{ marginTop: 24 }}>
        <h2>Per-module status</h2>
        {systemHealth.modules.length ? (
          <ul className="mini" style={{ marginTop: 16 }}>
            {systemHealth.modules.map(m => (
              <li key={m.name}>
                <b>{m.name}</b>
                {chip(m.status, STATUS_TONE[m.status])}
              </li>
            ))}
          </ul>
        ) : <p className="muted" style={{ marginTop: 12 }}>No module activity recorded in the last 24 hours.</p>}
      </section>
    </>
  );
}
