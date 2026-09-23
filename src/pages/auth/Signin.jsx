import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo.jsx';
import { FormField, PasswordField } from '../../components/FormField.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { ApiError } from '../../api/client.js';
import { EMAIL, focusFirstInvalid } from '../../utils.js';

export default function Signin() {
  const { login, signOut, requestPasswordReset } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {
      email: EMAIL.test(email) ? '' : 'Enter a valid email address, like name@company.com.',
      pw: password ? '' : 'Enter your password.'
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return setTimeout(focusFirstInvalid);

    setSubmitting(true);
    try {
      const nu = await login(email, password);
      if (!nu.role) {
        // No org/role assigned yet - could be pending approval, denied, or
        // (rarely) no join request found at all. Tell them apart instead of
        // showing the same "still waiting" message for every case.
        signOut();
        if (nu.joinRequestStatus === 'DENIED') {
          toast('Your request to join this organization was denied. Contact the organization owner for more information.');
        } else if (nu.joinRequestStatus === 'CANCELLED') {
          toast('Your join request was cancelled. Please sign up again to request access.');
        } else {
          toast('Your request to join an organization is still waiting for approval.');
        }
        return;
      }
      navigate(nu.role === 'Admin' ? '/admin' : '/app/overview');
    } catch (err) {
      if (err instanceof ApiError && err.status === 423) {
        toast('Too many failed attempts. Try again in 15 minutes.');
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
    if (!EMAIL.test(email)) {
      toast('Enter your email address above first, then try again.');
      return;
    }
    try {
      await requestPasswordReset(email);
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
            <FormField id="email" label="Email Address" type="email" placeholder="Enter your email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
            <PasswordField id="pw" label="Password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} error={errors.pw} />
            <div className="row-between">
              <label className="check"><input type="checkbox" name="remember" /> Remember me</label>
              <button type="button" className="link" onClick={forgotPassword}>Forgot password?</button>
            </div>
            <button className="btn btn--block" type="submit" disabled={submitting} style={{ minHeight: 57 }}>{submitting ? 'Signing in…' : 'Sign in'}</button>
            <p className="alt" style={{ marginTop: 32 }}>Don’t have an account? <Link to="/signup">Sign Up</Link></p>
          </form>
        </div>
      </section>
    </main>
  );
}
