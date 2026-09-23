import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo.jsx';
import Icon from '../../components/Icon.jsx';
import { FormField, PasswordField } from '../../components/FormField.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { ApiError } from '../../api/client.js';
import { EMAIL, focusFirstInvalid } from '../../utils.js';

const PASSWORD_HINT = 'Use at least 10 characters, with an uppercase letter, a lowercase letter, and a number.';
const PASSWORD_OK = pw => pw.length >= 10 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[0-9]/.test(pw);

const Stepper = ({ n }) => (
  <ol className="steps" aria-label="Sign-up progress">
    {[1, 2, 3].map(i => (
      <li key={i} className={i < n ? 'done' : i === n ? 'now' : ''} aria-current={i === n ? 'step' : undefined}>
        {i < n ? <Icon name="check" size={16} /> : i}
      </li>
    ))}
  </ol>
);

export default function Signup() {
  const { signupCreateOrg, signupJoinOrg } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [path, setPath] = useState('');
  const [personal, setPersonal] = useState({ ln: '', fn: '', em: '', pw: '', pw2: '' });
  const [personalErrors, setPersonalErrors] = useState({});
  const [pathError, setPathError] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinedOrgName, setJoinedOrgName] = useState('');
  const [create, setCreate] = useState({ oname: '', otype: '', odom: '', odesc: '' });
  const [createErrors, setCreateErrors] = useState({});
  const [createdCode, setCreatedCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const stepNumber = typeof step === 'number' ? step : 3;

  function submitStep1(e) {
    e.preventDefault();
    const nextErrors = {
      ln: personal.ln ? '' : 'Enter your last name.',
      fn: personal.fn ? '' : 'Enter your first name.',
      em: EMAIL.test(personal.em) ? '' : 'Enter a valid email address, like name@company.com.',
      pw: PASSWORD_OK(personal.pw) ? '' : PASSWORD_HINT,
      pw2: personal.pw2 === personal.pw ? '' : 'Passwords don’t match. Re-enter your password.'
    };
    if (personal.pw2 === '' && PASSWORD_OK(personal.pw)) nextErrors.pw2 = 'Confirm your password.';
    setPersonalErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return setTimeout(focusFirstInvalid);
    setStep(2);
  }

  function submitStep2(e) {
    e.preventDefault();
    if (!path) return setPathError('Choose an option to continue.');
    setPathError('');
    setStep(path);
  }

  function apiErrorMessage(err, fallback) {
    if (err instanceof ApiError && err.message) return err.message;
    return fallback;
  }

  async function submitCreate(e) {
    e.preventDefault();
    const nextErrors = {
      oname: create.oname ? '' : 'Enter your organization’s name.',
      otype: create.otype ? '' : 'Select an organization type.',
      odom: create.odom ? '' : 'Enter your organization’s website or domain.'
    };
    setCreateErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return setTimeout(focusFirstInvalid);

    setSubmitting(true);
    try {
      const { code } = await signupCreateOrg({
        firstName: personal.fn,
        lastName: personal.ln,
        email: personal.em,
        password: personal.pw,
        confirmPassword: personal.pw2,
        orgName: create.oname,
        orgType: create.otype,
        website: create.odom,
        description: create.odesc || undefined
      });
      setCreatedCode(code || '');
      setStep('created');
    } catch (err) {
      setCreateErrors({ oname: apiErrorMessage(err, 'Something went wrong creating your organization. Please try again.') });
      setTimeout(focusFirstInvalid);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitJoin(e) {
    e.preventDefault();
    if (!orgCode.trim()) {
      setJoinError('Enter the organization code your owner shared with you.');
      return setTimeout(focusFirstInvalid);
    }
    setSubmitting(true);
    try {
      const { joinRequest } = await signupJoinOrg({
        firstName: personal.fn,
        lastName: personal.ln,
        email: personal.em,
        password: personal.pw,
        confirmPassword: personal.pw2,
        orgCode: orgCode.trim()
      });
      setJoinedOrgName(joinRequest?.orgName || '');
      setJoinError('');
      setStep('sent');
    } catch (err) {
      setJoinError(apiErrorMessage(err, 'No organization matches that code. Check it with the organization owner and try again.'));
      setTimeout(focusFirstInvalid);
    } finally {
      setSubmitting(false);
    }
  }

  function back() {
    setStep(step === 'create' || step === 'join' ? 2 : 1);
  }

  if (step === 'sent') {
    return (
      <main className="auth">
        <Link className="corner" to="/" aria-label="Security Compliance System home"><Logo /></Link>
        <section className="auth__col">
          <div className="panel">
            <div className="done-card">
              <Icon name="check" size={56} />
              <h2 id="step-title" tabIndex={-1}>Join request sent</h2>
              <p>An owner of {joinedOrgName || 'the organization'} needs to approve your request. You can sign in once it’s approved.</p>
              <Link className="btn" to="/signin">Back to sign in</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (step === 'created') {
    return (
      <main className="auth">
        <Link className="corner" to="/" aria-label="Security Compliance System home"><Logo /></Link>
        <section className="auth__col">
          <div className="panel">
            <div className="done-card">
              <Icon name="check" size={56} />
              <h2 id="step-title" tabIndex={-1}>Organization created</h2>
              <p>Share this code with your developers and security testers so they can request to join.</p>
              <p className="org-code" aria-label={`Organization code ${createdCode.split('').join(' ')}`}>{createdCode}</p>
              <Link className="btn" to="/app/overview" onClick={() => navigate('/app/overview')}>Continue to dashboard</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth">
      <Link className="corner" to="/" aria-label="Security Compliance System home"><Logo /></Link>
      <section className="auth__col">
        <h1 id="page-title">Sign Up</h1>
        <div className="panel">
          <div className="steps-head">
            <p className="stepno">Step {stepNumber} of 3</p>
            <Stepper n={stepNumber} />
          </div>

          {step === 1 && (
            <>
              <h2 id="step-title" className="stitle" tabIndex={-1}>Personal information<br />&amp; Password Setup</h2>
              <form noValidate onSubmit={submitStep1}>
                <h3 className="sect">Personal Information</h3>
                <div className="grid2">
                  <FormField id="ln" label="Last Name" placeholder="Enter your last name" autoComplete="family-name" value={personal.ln} onChange={e => setPersonal(p => ({ ...p, ln: e.target.value }))} error={personalErrors.ln} />
                  <FormField id="fn" label="First Name" placeholder="Enter your first name" autoComplete="given-name" value={personal.fn} onChange={e => setPersonal(p => ({ ...p, fn: e.target.value }))} error={personalErrors.fn} />
                </div>
                <FormField id="em" label="Email Address" type="email" placeholder="Enter your email" autoComplete="email" value={personal.em} onChange={e => setPersonal(p => ({ ...p, em: e.target.value }))} error={personalErrors.em} />
                <h3 className="sect">Password Setup</h3>
                <PasswordField id="pw" label="Password" placeholder="Create a password" autoComplete="new-password" hint={PASSWORD_HINT} value={personal.pw} onChange={e => setPersonal(p => ({ ...p, pw: e.target.value }))} error={personalErrors.pw} />
                <PasswordField id="pw2" label="Confirm Password" placeholder="Confirm your password" autoComplete="new-password" value={personal.pw2} onChange={e => setPersonal(p => ({ ...p, pw2: e.target.value }))} error={personalErrors.pw2} />
                <div className="actions">
                  <p className="alt">Already have an account? <Link to="/signin">Sign In</Link></p>
                  <button className="btn" type="submit">Next</button>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 id="step-title" className="stitle" tabIndex={-1}>What do you want to do?</h2>
              <p style={{ fontWeight: 600, marginBottom: 16 }} id="opt-help">Choose an option to continue</p>
              <form noValidate onSubmit={submitStep2}>
                <div role="radiogroup" aria-labelledby="opt-help">
                  <label className="opt">
                    <input type="radio" name="path" value="create" checked={path === 'create'} onChange={() => setPath('create')} />
                    <Icon name="building" size={44} /><span>Create Organization</span><Icon name="right" size={24} />
                  </label>
                  <label className="opt">
                    <input type="radio" name="path" value="join" checked={path === 'join'} onChange={() => setPath('join')} />
                    <Icon name="userplus" size={44} /><span>Join Organization</span><Icon name="right" size={24} />
                  </label>
                </div>
                <p className="err" id="path-err" role="alert">{pathError}</p>
                <div className="actions row">
                  <button type="button" className="btn btn--ghost" onClick={back}>Back</button>
                  <button className="btn" type="submit">Next</button>
                </div>
              </form>
            </>
          )}

          {step === 'create' && (
            <>
              <h2 id="step-title" className="stitle" tabIndex={-1}>Create an Organization</h2>
              <form noValidate onSubmit={submitCreate}>
                <FormField id="oname" label="Organization Name" placeholder="Enter organization name" autoComplete="organization" value={create.oname} onChange={e => setCreate(c => ({ ...c, oname: e.target.value }))} error={createErrors.oname} />
                <div className="field">
                  <label htmlFor="otype">Organization Type</label>
                  <select id="otype" required aria-describedby="otype-err" aria-invalid={createErrors.otype ? 'true' : undefined} value={create.otype} onChange={e => setCreate(c => ({ ...c, otype: e.target.value }))}>
                    <option value="" disabled>Select organization type</option>
                    <option>Company</option>
                    <option>Government agency</option>
                    <option>Non-profit</option>
                    <option>Educational institution</option>
                    <option>Other</option>
                  </select>
                  <p className="err" id="otype-err" role="alert">{createErrors.otype || ''}</p>
                </div>
                <FormField id="odom" label="Website / Domain" placeholder="https://example.com" autoComplete="url" value={create.odom} onChange={e => setCreate(c => ({ ...c, odom: e.target.value }))} error={createErrors.odom} />
                <div className="field">
                  <label htmlFor="odesc">Description</label>
                  <textarea id="odesc" placeholder="Enter description (optional)" value={create.odesc} onChange={e => setCreate(c => ({ ...c, odesc: e.target.value }))} />
                </div>
                <div className="actions row">
                  <button type="button" className="btn btn--ghost" onClick={back}>Back</button>
                  <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</button>
                </div>
              </form>
            </>
          )}

          {step === 'join' && (
            <>
              <h2 id="step-title" className="stitle" tabIndex={-1}>Join Organization</h2>
              <form noValidate onSubmit={submitJoin}>
                <FormField
                  id="ocode"
                  label="Organization code"
                  placeholder="e.g. ACME-2026"
                  value={orgCode}
                  onChange={e => { setOrgCode(e.target.value); if (joinError) setJoinError(''); }}
                  error={joinError}
                />
                <p className="hint" style={{ marginBottom: 16 }}>Ask your organization owner for this code. We’ll check it when you submit your request.</p>
                <div className="actions row">
                  <button type="button" className="btn btn--ghost" onClick={back}>Back</button>
                  <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Join Request'}</button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
