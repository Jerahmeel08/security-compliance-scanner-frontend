import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chip } from '../../components/chips.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Icon from '../../components/Icon.jsx';
import IconBadge from '../../components/IconBadge.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function OrganizationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organizations, suspendOrganization, reactivateOrganization } = useApp();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const confirmRef = useRef(null);
  const organization = organizations.find(o => o.id === id);

  if (!organization) return <p className="empty">Organization not found.</p>;

  const isActive = organization.status === 'Active';

  function copyCode() {
    const code = organization.joinCode;
    if (!code || !navigator.clipboard) return;
    navigator.clipboard.writeText(code)
      .then(() => toast('Organization code copied'))
      .catch(() => toast('Could not copy the code.'));
  }

  async function confirm() {
    setBusy(true);
    try {
      if (isActive) {
        await suspendOrganization(organization.id);
        toast(`${organization.name} was suspended`);
      } else {
        await reactivateOrganization(organization.id);
        toast(`${organization.name} was reactivated`);
      }
    } catch (err) {
      toast(err.message || 'Could not update this organization.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="link back-link" onClick={() => navigate('/admin/organizations')}><Icon name="right" size={16} className="back-link__icon" /> Back to Organization Management</button>
      <div className="card app-detail">
        <div className="app-detail__head">
          <div className="app-detail__title">
            <IconBadge name="building" />
            <div>
              <h2>{organization.name}</h2>
              <p className="muted">{organization.type}</p>
            </div>
          </div>
          {chip(organization.status, isActive ? 'ok' : 'danger')}
        </div>
        <dl className="detail-grid">
          <div><dt>Members</dt><dd className="stat-num">{organization.memberCount}</dd></div>
          <div><dt>Applications</dt><dd className="stat-num">{organization.applicationCount}</dd></div>
          <div><dt>Created</dt><dd>{organization.createdDate}</dd></div>
          <div>
            <dt>Join code</dt>
            <dd className="acct__code">
              <span>{organization.joinCode || '—'}</span>
              {organization.joinCode && (
                <button type="button" className="acct__copy" onClick={copyCode} aria-label="Copy join code">
                  <Icon name="copy" size={14} />
                </button>
              )}
            </dd>
          </div>
        </dl>
        {isActive ? (
          <div className="danger-zone">
            <p className="muted">Suspending will block state-changing actions across the organization, including approving join requests and updating finding statuses. Members can still log in and view read-only information.</p>
            <div className="actions row" style={{ justifyContent: 'flex-start' }}>
              <button type="button" className="btn btn--danger" disabled={busy} onClick={() => confirmRef.current?.open()}>Suspend Organization</button>
            </div>
          </div>
        ) : (
          <>
            <p className="muted">Reactivating restores state-changing actions for this organization's members.</p>
            <div className="actions row" style={{ justifyContent: 'flex-start' }}>
              <button type="button" className="btn" disabled={busy} onClick={() => confirmRef.current?.open()}>Reactivate Organization</button>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        ref={confirmRef}
        title={isActive ? 'Suspend this organization?' : 'Reactivate this organization?'}
        message={isActive
          ? 'This blocks state-changing actions across the organization, including approving join requests and updating finding statuses. This is not a full lockout — members can still log in and view read-only information. The action takes effect immediately.'
          : "This restores state-changing actions for this organization's members, effective immediately."}
        confirmLabel={isActive ? 'Suspend Organization' : 'Reactivate Organization'}
        danger={isActive}
        onConfirm={confirm}
      />
    </>
  );
}
