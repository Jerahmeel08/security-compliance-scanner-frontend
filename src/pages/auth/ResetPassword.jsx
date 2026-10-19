import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Logo from '../../components/Logo.jsx';
import { PasswordField } from '../../components/FormField.jsx';
import { confirmPasswordReset } from '../../api/auth.js';
import { focusFirstInvalid } from '../../utils.js';
import './ResetPassword.css';

const PASSWORD_HINT = 'At least 10 characters, including uppercase, lowercase, and a number (72 UTF-8 bytes maximum).';

function validatePassword(value) {
  if (!value) return 'Please enter your new password.';
  if (value.length < 10) return 'Use at least 10 characters.';
  if (!/[a-z]/.test(value)) return 'Include at least one lowercase letter (a–z).';
  if (!/[A-Z]/.test(value)) return 'Include at least one uppercase letter (A–Z).';
  if (!/[0-9]/.test(value)) return 'Include at least one number (0–9).';
  if (new TextEncoder().encode(value).length > 72) return 'Keep your password within 72 UTF-8 bytes.';
  return '';
}

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [complete, setComplete] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (submitting || complete || !token) return;
    const pw = validatePassword(password);
    const confirm = !confirmation ? 'Please confirm your new password.' :
      password !== confirmation ? 'Your passwords do not match. Please try again.' : '';
    setErrors({ pw, confirm });
    if (pw || confirm) { setTimeout(focusFirstInvalid, 0); return; }
    setSubmitting(true);
    setMessage('');
    try {
      await confirmPasswordReset(token, password, confirmation);
      setComplete(true);
      setPassword('');
      setConfirmation('');
      // Avoid leaving the one-time token in browser history after success.
      window.history.replaceState(window.history.state, '', window.location.href.replace(/([?&])token=[^&]*/, ''));
    } catch (err) {
      setMessage(err?.status === 401
        ? 'This reset link is invalid, expired, or already used. Request a new reset link from Sign in.'
        : 'We could not reset your password right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth">
      <Link className="corner" to="/" aria-label="Security Compliance System home"><Logo /></Link>
      <section className="auth__col">
        <div className="panel panel--center">
          <h1 id="page-title" tabIndex={-1}>Reset Your Password</h1>
          {complete ? (
            <div className="reset-password-result" role="status">
              <p>Your password was updated successfully. Please sign in with your new password.</p>
              <Link to="/signin" className="btn btn--block">Go to Sign in</Link>
            </div>
          ) : !token ? (
            <div className="reset-password-result" role="alert">
              <p>This reset link is missing its security token. Request a new link from the Sign in page.</p>
              <Link to="/signin" className="btn btn--block">Back to Sign in</Link>
            </div>
          ) : (
            <>
              <p className="sub">Choose a secure new password for your account.</p>
              <form className="narrow" noValidate onSubmit={submit}>
                <PasswordField
                  id="pw" label="New Password" placeholder="Enter a new password" autoComplete="new-password"
                  value={password} onChange={e => { setPassword(e.target.value); setErrors(x => ({ ...x, pw: '' })); }}
                  hint={errors.pw ? undefined : PASSWORD_HINT} error={errors.pw}
                />
                <PasswordField
                  id="confirm" label="Confirm New Password" placeholder="Confirm your new password" autoComplete="new-password"
                  value={confirmation} onChange={e => { setConfirmation(e.target.value); setErrors(x => ({ ...x, confirm: '' })); }}
                  error={errors.confirm}
                />
                {message && <p className="reset-password-error" role="alert">{message}</p>}
                <button className="btn btn--block" type="submit" disabled={submitting}>
                  {submitting ? 'Updating password…' : 'Reset Password'}
                </button>
                <p className="alt reset-password-signin"><Link to="/signin">Back to Sign in</Link></p>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
