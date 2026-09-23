import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Icon from '../../components/Icon.jsx';
import IconBadge from '../../components/IconBadge.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function AuthorizationReview() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { adminApps: apps, approveApplication, rejectApplication } = useApp();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const approveRef = useRef(null);
  const rejectRef = useRef(null);
  const app = apps.find(a => a.id === appId);

  if (!app) return <p className="empty">Application not found.</p>;

  const needsOwnershipVerification = !app.ownershipVerifiedAt;

  async function confirmApprove() {
    setBusy(true);
    try {
      await approveApplication(app.id);
      toast(`${app.name} was authorized`);
      navigate('/admin/applications');
    } catch (err) {
      toast(err.message || 'Could not authorize this application yet.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmReject(_, reason) {
    setBusy(true);
    try {
      await rejectApplication(app.id, reason);
      toast(`${app.name}'s registration was rejected`);
      navigate('/admin/applications');
    } catch (err) {
      toast(err.message || 'Could not reject this application.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="link back-link" onClick={() => navigate('/admin/applications')}><Icon name="right" size={16} className="back-link__icon" /> Back to Authorization Queue</button>
      <div className="card app-detail">
        <div className="app-detail__head">
          <div className="app-detail__title">
            <IconBadge name="apps" tintVar="--warn" />
            <div>
              <h2>Authorization Review</h2>
              <p className="muted">{app.name}</p>
            </div>
          </div>
        </div>
        <dl className="detail-grid">
          <div><dt>Application</dt><dd>{app.name}</dd></div>
          <div className="target-url-row"><dt>Target URL</dt><dd className="target-url">{app.url}</dd></div>
          <div><dt>Application type</dt><dd>{app.type}</dd></div>
          <div><dt>Organization</dt><dd>{app.org}</dd></div>
          <div><dt>Registered by</dt><dd>{app.registeredBy}</dd></div>
          <div><dt>Date requested</dt><dd>{app.registeredDate}</dd></div>
          <div><dt>Ownership verified</dt><dd>{app.ownershipVerifiedAt ? `Yes, ${app.ownershipVerifiedAt}` : 'Not yet'}</dd></div>
        </dl>
        {needsOwnershipVerification && (
          <p className="err" role="alert" style={{ marginBottom: 16 }}>
            This organization hasn't verified ownership of this domain yet — authorizing will be rejected by the server until they do.
          </p>
        )}
        <div className="actions row" style={{ justifyContent: 'flex-start' }}>
          <button type="button" className="btn btn--danger" disabled={busy} onClick={() => rejectRef.current?.open()}>Reject</button>
          <button type="button" className="btn" disabled={busy || needsOwnershipVerification} onClick={() => approveRef.current?.open()}>Approve</button>
        </div>
      </div>

      <ConfirmDialog
        ref={approveRef}
        title="Approve this application?"
        message={`${app.name} will be authorized and available for scanning immediately.`}
        confirmLabel="Approve"
        onConfirm={confirmApprove}
      />
      <ConfirmDialog
        ref={rejectRef}
        title="Reject this application?"
        message={`Explain why ${app.name}'s registration is being rejected. This is shared with the organization.`}
        confirmLabel="Reject"
        danger
        requireReason
        reasonLabel="Reason for rejection"
        onConfirm={confirmReject}
      />
    </>
  );
}
