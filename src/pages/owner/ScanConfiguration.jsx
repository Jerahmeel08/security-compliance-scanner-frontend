import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SCAN_PROFILES, ALL_CHECKS } from '../../data/scanProfiles.js';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Icon from '../../components/Icon.jsx';
import IconBadge from '../../components/IconBadge.jsx';
import { chip } from '../../components/chips.jsx';

const PROFILE_ICON = { quick: 'search', standard: 'assess', full: 'health', custom: 'remediation' };

export default function ScanConfiguration() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { apps, startScan } = useApp();
  const toast = useToast();
  const app = apps.find(a => a.id === appId);
  const [profileId, setProfileId] = useState(null);
  const [customChecks, setCustomChecks] = useState([]);
  const [confirming, setConfirming] = useState(null);
  const [launching, setLaunching] = useState(false);

  if (!app) return <p className="empty">Application not found.</p>;

  const profile = SCAN_PROFILES.find(p => p.id === profileId);

  function choose(id) {
    setProfileId(id);
    if (id !== 'custom') setConfirming(id);
  }

  function toggleCheck(checkId) {
    setCustomChecks(prev => prev.includes(checkId) ? prev.filter(c => c !== checkId) : [...prev, checkId]);
  }

  async function launch(id, checks) {
    setLaunching(true);
    try {
      const assessment = await startScan(app.id, id, checks);
      toast('Scan started');
      navigate(`/app/assessments/${assessment.id}/progress`);
    } catch (err) {
      toast(err.message || 'Could not start the scan. Please try again.');
    } finally {
      setLaunching(false);
    }
  }

  const groupedChecks = ALL_CHECKS.reduce((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});

  if (profileId === 'custom') {
    return (
      <>
        <button type="button" className="link back-link" onClick={() => setProfileId(null)}><Icon name="right" size={16} className="back-link__icon" /> Back to scan profiles</button>
        <div className="card scan-config">
          <div className="app-detail__title" style={{ marginBottom: 16 }}>
            <IconBadge name="remediation" />
            <div>
              <h2>Custom Scan — {app.name}</h2>
              <p className="muted">{app.url}</p>
            </div>
          </div>
          <p style={{ margin: '0 0 20px' }}>Select the individual checks to execute.</p>
          {Object.entries(groupedChecks).map(([category, checks]) => (
            <div key={category} className="check-group">
              <h3 className="sect">{category}</h3>
              {checks.map(c => (
                <label className="check checklist-item" key={c.id}>
                  <input type="checkbox" checked={customChecks.includes(c.id)} onChange={() => toggleCheck(c.id)} />
                  <span>{c.id} — {c.label}</span>
                </label>
              ))}
            </div>
          ))}
          <div className="actions row">
            <button type="button" className="btn btn--danger" onClick={() => setProfileId(null)}>Cancel</button>
            <button type="button" className="btn" disabled={!customChecks.length || launching} onClick={() => launch('custom', customChecks)}>
              {launching ? 'Starting…' : `Run custom scan (${customChecks.length})`}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <button type="button" className="link back-link" onClick={() => navigate(`/app/applications/${app.id}`)}><Icon name="right" size={16} className="back-link__icon" /> Back to {app.name}</button>
      <div className="card scan-config">
        <div className="app-detail__title" style={{ marginBottom: 16 }}>
          <IconBadge name="apps" />
          <h2>Scan Application</h2>
        </div>
        <dl className="detail-grid" style={{ marginBottom: 24 }}>
          <div><dt>Application name</dt><dd>{app.name}</dd></div>
          <div><dt>Website / Domain</dt><dd>{app.url}</dd></div>
        </dl>
        <h3 className="sect">Assessment profile</h3>
        <div className="profile-grid">
          {SCAN_PROFILES.map(p => (
            <button type="button" key={p.id} className="card profile-card" onClick={() => choose(p.id)}>
              <div className="profile-card__head">
                <IconBadge name={PROFILE_ICON[p.id]} size={40} />
                {p.id === 'standard' && chip('Recommended', 'ok')}
              </div>
              <h4>{p.name}</h4>
              <p className="muted">{p.purpose}</p>
              <p className="meta">{p.id === 'custom' ? 'Choose your own checks' : `${p.checks.length} checks`}</p>
            </button>
          ))}
        </div>
      </div>

      {confirming && profile && (
        <div className="modal-backdrop" role="presentation" onClick={() => setConfirming(null)}>
          <div className="card confirm-modal" role="dialog" aria-modal="true" aria-labelledby="scan-confirm-title" onClick={e => e.stopPropagation()}>
            <h2 id="scan-confirm-title">Confirm {profile.name}</h2>
            <dl className="detail-grid">
              <div><dt>Application</dt><dd>{app.name}</dd></div>
              <div><dt>Target</dt><dd>{app.url}</dd></div>
              <div><dt>Profile</dt><dd>{profile.name}</dd></div>
              <div><dt>Checks</dt><dd>{profile.checks.length}</dd></div>
            </dl>
            <p className="muted">{profile.purpose}</p>
            <div className="actions row">
              <button type="button" className="btn btn--danger" onClick={() => setConfirming(null)}>Cancel</button>
              <button type="button" className="btn" disabled={launching} onClick={() => launch(profile.id)}>{launching ? 'Starting…' : 'Start scan'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
