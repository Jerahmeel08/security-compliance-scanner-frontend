import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chip } from '../../components/chips.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Icon from '../../components/Icon.jsx';
import IconBadge from '../../components/IconBadge.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me, users, suspendUserAccount, reactivateUserAccount } = useApp();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const confirmRef = useRef(null);
  const user = users.find(u => u.id === id);

  if (!user) return <p className="empty">User not found.</p>;

  const isActive = user.status === 'Active';
  const isSelf = user.id === me?.id;
  const isOtherAdmin = user.role === 'Admin' && !isSelf;

  async function confirm() {
    setBusy(true);
    try {
      if (isActive) {
        await suspendUserAccount(user.id);
        toast(`${user.name}'s account was suspended`);
      } else {
        await reactivateUserAccount(user.id);
        toast(`${user.name}'s account was reactivated`);
      }
    } catch (err) {
      toast(err.message || 'Could not update this account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="link back-link" onClick={() => navigate('/admin/users')}><Icon name="right" size={16} className="back-link__icon" /> Back to User Management</button>
      <div className="card app-detail">
        <div className="app-detail__head">
          <div className="app-detail__title">
            <IconBadge name="account" />
            <div>
              <h2>{user.name}</h2>
              <p className="muted">{user.email}</p>
            </div>
          </div>
          {chip(user.status, isActive ? 'ok' : 'danger')}
        </div>
        <dl className="detail-grid">
          <div><dt>Role</dt><dd>{user.role || 'No role yet (join request pending/denied)'}</dd></div>
          <div><dt>Organization</dt><dd>{user.organization}</dd></div>
          <div><dt>Joined</dt><dd>{user.joined}</dd></div>
        </dl>
        {isSelf && <p className="muted">You can't suspend your own account.</p>}
        {isOtherAdmin && isActive && <p className="muted">System administrators can't suspend one another.</p>}
        <div className="actions row" style={{ justifyContent: 'flex-start' }}>
          <button type="button" className={`btn${isActive ? ' btn--danger' : ''}`} disabled={busy || isSelf || (isOtherAdmin && isActive)} onClick={() => confirmRef.current?.open()}>
            {isActive ? 'Suspend Account' : 'Reactivate Account'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        ref={confirmRef}
        title={isActive ? 'Suspend this account?' : 'Reactivate this account?'}
        message={isActive
          ? `${user.name} will immediately lose access to Security Compliance System until reactivated.`
          : `${user.name} will regain access to Security Compliance System immediately.`}
        confirmLabel={isActive ? 'Suspend Account' : 'Reactivate Account'}
        danger={isActive}
        onConfirm={confirm}
      />
    </>
  );
}
