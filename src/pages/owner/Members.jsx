import { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Members() {
  const { user, members, pending, approveMember, declineMember, removeMember } = useApp();
  const toast = useToast();
  const [tab, setTab] = useState('current');
  const [detailsMember, setDetailsMember] = useState(null);
  const cur = tab === 'current';

  if (user?.role === 'Developer') return <Navigate to="/app/overview" replace />;

  const removeRef = useRef(null);
  const approveRef = useRef(null);
  const declineRef = useRef(null);

  async function confirmRemove(userId) {
    try {
      const m = await removeMember(userId);
      if (m) toast(`${m.name} was removed from the organization`);
    } catch (err) {
      toast(err.message || 'Could not remove that member.');
    }
  }
  async function confirmApprove(id) {
    try {
      const m = await approveMember(id);
      if (m) toast(`${m.name} joined the organization`);
    } catch (err) {
      toast(err.message || 'Could not approve that request.');
    }
  }
  async function confirmDecline(id) {
    try {
      const m = await declineMember(id);
      if (m) toast(`Request from ${m.name} declined`);
    } catch (err) {
      toast(err.message || 'Could not decline that request.');
    }
  }

  return (
    <>
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
                        <span style={{ display: 'inline-flex', gap: 8 }}>
                          <button className="btn btn--sm btn--dark-outline" onClick={() => setDetailsMember(m)}>View details</button>
                          <button className="btn btn--sm btn--danger" onClick={() => removeRef.current?.open(m.id)}>Remove</button>
                        </span>
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
        ref={removeRef}
        title="Remove member?"
        message={id => `Remove ${members.find(m => m.id === id)?.name} from the organization? They will lose access immediately.`}
        confirmLabel="Remove member"
        danger
        onConfirm={confirmRemove}
      />
      <ConfirmDialog
        ref={approveRef}
        title="Approve join request?"
        message={id => `Approve ${pending.find(p => p.id === id)?.name}'s request to join the organization?`}
        confirmLabel="Approve"
        onConfirm={confirmApprove}
      />
      <ConfirmDialog
        ref={declineRef}
        title="Decline join request?"
        message={id => `Decline ${pending.find(p => p.id === id)?.name}'s request to join the organization?`}
        confirmLabel="Decline"
        danger
        onConfirm={confirmDecline}
      />
    </>
  );
}
