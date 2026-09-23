import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { chip } from '../../components/chips.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Account() {
  const { user, org, joinCode, signOut } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const u = user || { name: 'User', email: '', role: 'Owner' };
  const initials = u.name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

  function copyCode() {
    if (!joinCode || !navigator.clipboard) return;
    navigator.clipboard.writeText(joinCode)
      .then(() => toast('Organization code copied'))
      .catch(() => toast('Could not copy the code.'));
  }

  return (
    <section className="card acct">
      <div className="head-row">
        <div className="avatar" aria-hidden="true">{initials}</div>
        <div>
          <h2>{u.name}</h2>
          {chip(u.role, 'info')}
        </div>
      </div>
      <dl>
        <div><dt>Email</dt><dd>{u.email}</dd></div>
        <div><dt>Organization</dt><dd>{org}</dd></div>
        <div>
          <dt>Organization code</dt>
          <dd className="acct__code">
            <span>{joinCode || '—'}</span>
            {joinCode && (
              <button type="button" className="acct__copy" onClick={copyCode} aria-label="Copy organization code">
                <Icon name="copy" size={14} />
              </button>
            )}
          </dd>
        </div>
      </dl>
      <button className="btn btn--block" onClick={() => { signOut(); navigate('/'); }}>
        <Icon name="logout" size={20} /> Sign out
      </button>
    </section>
  );
}
