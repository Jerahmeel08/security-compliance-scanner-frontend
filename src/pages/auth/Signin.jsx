import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo.jsx';
import { FormField, PasswordField } from '../../components/FormField.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { ApiError } from '../../api/client.js';
import { EMAIL, focusFirstInvalid } from '../../utils.js';
import './SigninCooldown.css';

// Match the backend loginSchema: trimmed email, at most 255 characters,
// and a non-empty password of at most 128 characters. Never modify passwords.
function emailError(value) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 255 || !EMAIL.test(normalized) || /[\x00-\x1f\x7f]/.test(normalized)) {
    return 'Enter a valid email address (maximum 255 characters).';
  }
  return '';
}

function passwordError(value) {
  if (!value) return 'Enter your password.';
  if (value.length > 128) return 'Password must be at most 128 characters.';
  return '';
}

function formatCooldown(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

export default function Signin() {
  const { login, requestPasswordReset } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Count down to the server-provided expiry; do not restart at 15 minutes.
  useEffect(() => {
    if (!cooldown) return undefined;
    const update = () => {
      const remaining = Math.max(0, Math.ceil((cooldown.until - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0) setCooldown(null);
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [cooldown]);

  const isCoolingDown = remainingSeconds > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting || isCoolingDown) return;
    const nextErrors = {
      email: emailError(email),
      pw: passwordError(password)
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return setTimeout(focusFirstInvalid);

    setSubmitting(true);
    try {
      const nu = await login(email.trim().toLowerCase(), password);
      if (!nu.role) {
        // Keep the authenticated session so existing users can request to
        // join an organization without registering another account.
        navigate('/organization-access', { replace: true });
        return;
      }
      navigate(nu.role === 'Admin' ? '/admin' : '/app/overview');
    } catch (err) {
      if (err instanceof ApiError && (err.status === 423 || err.status === 429)) {
        const retryAfterSeconds = Number(err.details?.retryAfterSeconds);
        if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
          const seconds = Math.ceil(retryAfterSeconds);
          setRemainingSeconds(seconds);
          setCooldown({
            until: Date.now() + seconds * 1000,
            reason: err.status === 429 ? 'connection' : 'account',
          });
        } else {
          toast('Sign-in is temporarily unavailable. Please wait a moment and try again.');
        }
      } else if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setErrors({ pw: 'Incorrect email or password.' });
        setTimeout(focusFirstInvalid);
      } else {
        toast(err.message || 'Sign in failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function forgotPassword() {
    if (emailError(email)) {
      setErrors(prev => ({ ...prev, email: emailError(email) }));
      toast('Enter a valid email address above first, then try again.');
      setTimeout(focusFirstInvalid);
      return;
    }
    try {
      await requestPasswordReset(email.trim().toLowerCase());
    } catch { /* the endpoint always responds the same way either way */ }
    toast('If that email has an account, a reset link was sent.');
  }

  return (
    <main className="auth">
      <Link className="corner" to="/" aria-label="Security Compliance System home"><Logo /></Link>
      <section className="auth__col">
        <div className="panel panel--center">
          <h1 id="page-title" tabIndex={-1}>Welcome Back!</h1>
          <p className="sub">Sign in to continue to your account</p>
          <form className="narrow" noValidate onSubmit={handleSubmit}>
            <FormField id="email" label="Email Address" type="email" placeholder="Enter your email" autoComplete="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }} error={errors.email} />
            <PasswordField id="pw" label="Password" placeholder="Enter your password" autoComplete="current-password" value={password} onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, pw: '' })); }} error={errors.pw} />
            <div className="row-between">
              <label className="check"><input type="checkbox" name="remember" /> Remember me</label>
              <button type="button" className="link" onClick={forgotPassword}>Forgot password?</button>
            </div>
            <button className="btn btn--block" type="submit" disabled={submitting || isCoolingDown} style={{ minHeight: 57 }}>
              {submitting ? 'Signing in…' : isCoolingDown ? `Try again in ${formatCooldown(remainingSeconds)}` : 'Sign in'}
            </button>
            {isCoolingDown && (
              <div
                role="status"
                className="signin-cooldown"
                aria-label="Sign-in temporarily restricted"
              >
                <strong>{cooldown?.reason === 'connection' ? 'Too many sign-in attempts' : 'Account temporarily locked'}</strong>
                <p>
                  {cooldown?.reason === 'connection'
                    ? 'For security, sign-in from this connection is temporarily paused.'
                    : 'For security, this account is temporarily locked after several unsuccessful attempts.'}
                </p>
                <p>Try again in <strong aria-live="off">{formatCooldown(remainingSeconds)}</strong> (minutes:seconds).</p>
              </div>
            )}
            <p className="alt" style={{ marginTop: 32 }}>Don’t have an account? <Link to="/signup">Sign Up</Link></p>
          </form>
        </div>
      </section>
    </main>
  );
}
