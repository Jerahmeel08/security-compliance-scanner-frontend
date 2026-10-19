import { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import './MembersJoinCode.css';

export default function Members() {
  const { user, members, pending, approveMember, declineMember, removeMember, joinCode, regenerateJoinCode } = useApp();
  const toast = useToast();
  const [tab, setTab] = useState('current');
  const [detailsMember, setDetailsMember] = useState(null);
  const cur = tab === 'current';

  const removeRef = useRef(null);
  const approveRef = useRef(null);
  const declineRef = useRef(null);
  const codeRef = useRef(null);
  const [regenerating, setRegenerating] = useState(false);

  if (user?.role === 'Developer') return <Navigate to="/app/overview" replace />;

  async function confirmRemove(userId) {
    try {
      const m = await removeMember(userId);
      if (m) toast(`${m.name} has been removed. Their organization access has been revoked.`);
    } catch (err) {
      toast(err.message || 'We couldn’t remove this member. Please try again.');
    }
  }
  async function confirmApprove(id) {
    try {
      const m = await approveMember(id);
      if (m) toast(`${m.name} has been approved and can now access the organization.`);
    } catch (err) {
      toast(err.message || 'We couldn’t approve this request. Please try again.');
    }
  }
  async function confirmDecline(id) {
    try {
      const m = await declineMember(id);
      if (m) toast(`${m.name}’s join request has been declined.`);
    } catch (err) {
      toast(err.message || 'We couldn’t decline this request. Please try again.');
    }
  }

  async function confirmRegenerateCode() {
    if (regenerating) return;
    setRegenerating(true);
    try {
      await regenerateJoinCode();
      toast('Your organization code was updated successfully. The previous code no longer works. Share the new code with people you want to invite.');
    } catch (err) {
      toast(err.message || 'We couldn’t update the organization code. Your current code is unchanged. Please try again.');
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <>
      <section className="card members-code-card" aria-labelledby="members-code-title">
        <div className="members-code-card__header">
          <div className="members-code-card__icon" aria-hidden="true"><Icon name="key" size={22} /></div>
          <div>
            <h2 id="members-code-title" className="members-code-card__title">Organization Join Code</h2>
            <p className="members-code-card__description">Share this code with people you invite to your organization.</p>
          </div>
        </div>
        <div className="members-code-card__bottom">
          <div className="members-code-card__code-group">
            <span className="members-code-card__label">Current join code</span>
            <strong className="members-code-card__code">{joinCode || 'Unavailable'}</strong>
          </div>
          <button
            type="button"
            className="btn members-code-card__button"
            disabled={regenerating}
            onClick={() => codeRef.current?.open()}
          >
            <Icon name="refresh" size={18} />
            <span>{regenerating ? 'Changing code…' : 'Change Org Code'}</span>
          </button>
        </div>
      </section>
      <div className="tabs" role="tablist" aria-label="Members">
        <button className="tab-btn" role="tab" id="t-cur" aria-selected={cur} aria-controls="mpanel" onClick={() => setTab('current')}>
          <Icon name="members" size={22} />Current Members
        </button>
        <button className="tab-btn" role="tab" id="t-pen" aria-selected={!cur} aria-controls="mpanel" onClick={() => setTab('pending')}>
          <Icon name="userplus" size={22} />Pending Members
        </button>
      </div>
      <div className="stats stats--two">
        <div className="card stat"><h2>Current members</h2><p>{members.length}</p></div>
        <div className="card stat"><h2>Pending requests</h2><p>{pending.length}</p></div>
      </div>
      <div className="card tblcard" id="mpanel" role="tabpanel" aria-labelledby={cur ? 't-cur' : 't-pen'}>
        {cur ? (
          members.length ? (
            <div className="tblwrap">
              <table className="tbl">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id}>
                      <td className="lead" data-label="Name">{m.name}</td>
                      <td data-label="Email">{m.email}</td>
                      <td data-label="Role">{m.role}</td>
                      <td data-label="Joined">{m.joined}</td>
                      <td data-label="Actions">
                        {m.role === 'Owner' || m.role === 'OWNER' || m.id === user?.id ? (
                          <span className="hint">Organization Owner</span>
                        ) : (
                          <span style={{ display: 'inline-flex', gap: 8 }}>
                            <button className="btn btn--sm btn--dark-outline" onClick={() => setDetailsMember(m)}>View details</button>
                            <button className="btn btn--sm btn--danger" onClick={() => removeRef.current?.open(m.id)}>Remove</button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty">No members yet.</p>
        ) : (
          pending.length ? (
            <div className="tblwrap">
              <table className="tbl">
                <thead><tr><th>Name</th><th>Email</th><th>Requested</th><th>Actions</th></tr></thead>
                <tbody>
                  {pending.map(m => (
                    <tr key={m.id}>
                      <td className="lead" data-label="Name">{m.name}</td>
                      <td data-label="Email">{m.email}</td>
                      <td data-label="Requested">{m.requested}</td>
                      <td data-label="Actions">
                        <span style={{ display: 'inline-flex', gap: 8 }}>
                          <button className="btn btn--sm" aria-label={`Approve ${m.name}`} onClick={() => approveRef.current?.open(m.id)}>Approve</button>
                          <button className="btn btn--sm btn--dark-outline" aria-label={`Decline ${m.name}`} onClick={() => declineRef.current?.open(m.id)}>Decline</button>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty">No pending requests. New join requests will show up here.</p>
        )}
      </div>

      {detailsMember && (
        <div className="modal-backdrop" role="presentation" onClick={() => setDetailsMember(null)}>
          <div className="card confirm-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <h2>{detailsMember.name}</h2>
            <dl className="detail-grid">
              <div><dt>Email</dt><dd>{detailsMember.email}</dd></div>
              <div><dt>Role</dt><dd>{detailsMember.role}</dd></div>
              <div><dt>Joined</dt><dd>{detailsMember.joined}</dd></div>
            </dl>
            <div className="actions row">
              <button type="button" className="btn" onClick={() => setDetailsMember(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        ref={codeRef}
        title="Generate a new organization code?"
        message="Are you sure you want to generate a new join code? Your current code will stop working immediately, so anyone who has the old code won’t be able to use it to join. Existing members will not be affected. You’ll need to share the new code with future members."
        confirmLabel="Yes, change code"
        cancelLabel="Keep current code"
        onConfirm={confirmRegenerateCode}
      />
      <ConfirmDialog
        ref={removeRef}
        title="Remove this member?"
        message={id => `Are you sure you want to remove ${members.find(m => m.id === id)?.name || 'this member'}? They will immediately lose access to this organization, including its applications, assessments and findings. Existing scan history will be kept.`}
        confirmLabel="Yes, remove member"
        cancelLabel="Keep member"
        danger
        onConfirm={confirmRemove}
      />
      <ConfirmDialog
        ref={approveRef}
        title="Approve this join request?"
        message={id => `Approve ${pending.find(p => p.id === id)?.name || 'this applicant'}? They will become a Developer/Pentester and gain access to your organization’s authorized features and data.`}
        confirmLabel="Yes, approve"
        cancelLabel="Not now"
        onConfirm={confirmApprove}
      />
      <ConfirmDialog
        ref={declineRef}
        title="Decline this join request?"
        message={id => `Are you sure you want to decline ${pending.find(p => p.id === id)?.name || 'this applicant'}’s request? They will not be added to your organization or receive member access.`}
        confirmLabel="Yes, decline"
        cancelLabel="Go back"
        danger
        onConfirm={confirmDecline}
      />
    </>
  );
}
