import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { statusChip } from '../../components/chips.jsx';
import Icon from '../../components/Icon.jsx';
import IconBadge from '../../components/IconBadge.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function ApplicationDetails() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { apps, findings, verifyOwnership } = useApp();
  const toast = useToast();
  const [verifying, setVerifying] = useState(false);
  const app = apps.find(a => a.id === appId);

  if (!app) {
    return (
      <div className="card">
        <p className="empty">Application not found.</p>
        <Link className="btn btn--ghost" to="/app/applications">Back to Applications</Link>
      </div>
    );
  }

  const isAuthorized = app.status === 'Authorized';
  const isPending = app.status === 'Pending';
  const needsOwnershipVerification = isPending && !app.ownershipVerifiedAt;
  const openCount = findings.filter(f => f.appId === app.id && f.status !== 'Resolved').length;

  async function handleVerify() {
    setVerifying(true);
    try {
      const result = await verifyOwnership(app.id);
      toast(result.verified ? 'Ownership verified — waiting for a System Admin to authorize.' : (result.error || 'Verification failed. Double-check the token is in place and try again.'));
    } catch (err) {
      toast(err.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <>
      <button type="button" className="link back-link" onClick={() => navigate('/app/applications')}><Icon name="right" size={16} className="back-link__icon" /> Back to Applications</button>
      <div className="card app-detail">
        <div className="app-detail__head">
          <div className="app-detail__title">
            <IconBadge name="apps" />
            <div>
              <h2>{app.name}</h2>
              <p className="muted">{app.url}</p>
            </div>
          </div>
          {statusChip(app.status)}
        </div>
        <dl className="detail-grid">
          <div><dt>Application type</dt><dd>{app.type}</dd></div>
          <div><dt>Standard</dt><dd>{app.framework}</dd></div>
          <div><dt>Registered by</dt><dd>{app.registeredBy}</dd></div>
          <div><dt>Registration date</dt><dd>{app.registeredDate}</dd></div>
          <div><dt>Last assessment</dt><dd>{app.assessed || '—'}</dd></div>
          <div><dt>Security score</dt><dd>{app.score != null ? `${app.score}/100` : '—'}</dd></div>
        </dl>

        {needsOwnershipVerification && (
          <div className="empty" style={{ textAlign: 'left', padding: '16px 0' }}>
            <p style={{ marginBottom: 8 }}>
              <b>Verify you own this domain before it can be authorized.</b>
            </p>
            {app.ownershipVerificationMethod === 'DNS_TXT' ? (
              <p className="muted">Add a DNS TXT record on your domain with the value <code>scs-verify={app.ownershipVerificationToken}</code>, then verify below.</p>
            ) : (
              <p className="muted">Host a file at <code>{app.url.replace(/\/$/, '')}/.well-known/scs-verification.txt</code> containing exactly: <code>{app.ownershipVerificationToken}</code></p>
            )}
            {app.ownershipVerificationLastError && (
              <p className="err" role="alert" style={{ marginTop: 8 }}>{app.ownershipVerificationLastError}</p>
            )}
            <button type="button" className="btn" style={{ marginTop: 12 }} disabled={verifying} onClick={handleVerify}>
              {verifying ? 'Checking…' : "I've added it — Verify now"}
            </button>
          </div>
        )}

        {isPending && !needsOwnershipVerification && (
          <p className="empty" style={{ textAlign: 'left', padding: '16px 0' }}>
            Ownership verified. Waiting for a System Administrator to authorize this application before it can be scanned.
          </p>
        )}

        {app.status === 'Rejected' && (
          <p className="empty" style={{ textAlign: 'left', padding: '16px 0' }}>
            This application's registration was rejected.{app.rejectionReason ? ` Reason: ${app.rejectionReason}` : ''}
          </p>
        )}
        {app.status === 'Revoked' && (
          <p className="empty" style={{ textAlign: 'left', padding: '16px 0' }}>
            This application's authorization has been revoked. Contact your system administrator.
          </p>
        )}

        <div className="actions row" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
          <Link className="btn" aria-disabled={!isAuthorized} to={isAuthorized ? `/app/applications/${app.id}/scan` : '#'} onClick={e => { if (!isAuthorized) e.preventDefault(); }}>
            Scan Application
          </Link>
          <Link className="btn btn--ghost" aria-disabled={!isAuthorized} to={isAuthorized ? `/app/applications/${app.id}/assessments` : '#'} onClick={e => { if (!isAuthorized) e.preventDefault(); }}>
            View Assessments
          </Link>
          <Link className="btn btn--ghost" aria-disabled={!isAuthorized} to={isAuthorized ? `/app/findings?appId=${app.id}` : '#'} onClick={e => { if (!isAuthorized) e.preventDefault(); }}>
            View Findings{isAuthorized && openCount > 0 ? ` (${openCount})` : ''}
          </Link>
        </div>
      </div>
    </>
  );
}
