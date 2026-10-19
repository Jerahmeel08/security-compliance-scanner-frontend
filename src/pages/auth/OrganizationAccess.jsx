import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo.jsx';
import { FormField } from '../../components/FormField.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { ApiError } from '../../api/client.js';
import './OrganizationAccess.css';

function statusText(request) {
  if (request?.status === 'PENDING') {
    return `Your request to join ${request.orgName} is waiting for the Organization Owner's approval.`;
  }
  if (request?.status === 'DENIED') {
    return `Your previous request to join ${request.orgName} was declined. You can submit a new request using a valid organization code.`;
  }
  if (request?.status === 'CANCELLED') {
    return 'Your previous request was cancelled. You can request to join an organization again.';
  }
  if (request?.status === 'APPROVED') {
    return 'You no longer have access to your previous organization. You can request to join again using a valid code.';
  }
  return 'You are not currently a member of an organization. Enter the join code shared by an Organization Owner.';
}

export default function OrganizationAccess() {
  const { user, bootstrapped, signOut, getMyJoinRequest, requestToJoin, refreshCurrentUser } = useApp();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadRequest = useCallback(async () => {
    const data = await getMyJoinRequest();
    setRequest(data.joinRequest || null);
    return data.joinRequest;
  }, [getMyJoinRequest]);

  useEffect(() => {
    if (!bootstrapped || !user || user.role) return undefined;
    let active = true;
    getMyJoinRequest()
      .then(data => { if (active) setRequest(data.joinRequest || null); })
      .catch(err => { if (active) setError(err.message || 'Could not load your organization request.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [bootstrapped, user?.id, user?.role, getMyJoinRequest]);

  if (!bootstrapped) return null;
  if (!user) return <Navigate to="/signin" replace />;
  if (user.role === 'Admin') return <Navigate to="/admin" replace />;
  if (user.role && user.orgId) return <Navigate to="/app/overview" replace />;

  const pending = request?.status === 'PENDING';

  async function submitRequest(e) {
    e.preventDefault();
    if (submitting || pending) return;
    const normalized = code.trim().toUpperCase();
    if (normalized.length !== 8) {
      setError('Please enter the 8-character organization code shared with you.');
      return;
    }
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const data = await requestToJoin(normalized);
      setRequest(data.joinRequest);
      setCode('');
      setNotice('Your request has been sent. You can check its status here while you wait for the Owner.');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        try { await loadRequest(); } catch { /* Preserve the original error */ }
      }
      setError(err.message || 'We could not send your request. Please try again.');
    } finally { setSubmitting(false); }
  }

  async function checkStatus() {
    if (checking) return;
    setChecking(true);
    setError('');
    setNotice('');
    try {
      const nextUser = await refreshCurrentUser();
      if (nextUser.role === 'Admin') return navigate('/admin', { replace: true });
      if (nextUser.role && nextUser.orgId) return navigate('/app/overview', { replace: true });
      const latest = await loadRequest();
      setNotice(latest?.status === 'PENDING'
        ? 'Your request is still waiting for approval. Please check again later.'
        : 'Your membership status is up to date.');
    } catch (err) {
      setError(err.message || 'Could not check your status. Please try again.');
    } finally { setChecking(false); }
  }

  function logOut() {
    signOut();
    navigate('/signin', { replace: true });
  }

  return (
    <main className="auth">
      <div className="corner"><Logo /></div>
      <section className="auth__col">
        <div className="panel organization-access">
          <div className="organization-access__top">
            <div>
              <p className="organization-access__eyebrow">Organization membership</p>
              <h1 id="page-title">Join an Organization</h1>
              <p className="organization-access__subtitle">Signed in as {user.email}</p>
            </div>
            <button type="button" className="btn btn--sm btn--ghost" onClick={logOut}>Sign out</button>
          </div>
          {loading ? (
            <p role="status">Loading your membership status…</p>
          ) : (
            <>
              <div className="organization-access__status" role="status">
                <p className="organization-access__status-heading">{pending ? 'Pending approval' : 'Organization access'}</p>
                <p>{statusText(request)}</p>
              </div>
              {!pending && (
                <form noValidate onSubmit={submitRequest} className="organization-access__form">
                  <FormField
                    id="orgCode" label="Organization Code" placeholder="Enter your 8-character code"
                    value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
                    error={error}
                  />
                  <p className="organization-access__hint">Ask an Organization Owner for their current join code. Your request must be approved before you can access the organization.</p>
                  <button className="btn btn--block" disabled={submitting} type="submit">
                    {submitting ? 'Sending request…' : 'Request to Join'}
                  </button>
                </form>
              )}
              {error && pending && <p className="organization-access__error" role="alert">{error}</p>}
              {notice && <p className="organization-access__notice" role="status">{notice}</p>}
              <div className="organization-access__footer">
                <button type="button" className="btn btn--ghost" disabled={checking} onClick={checkStatus}>
                  {checking ? 'Checking…' : 'Check request status'}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
