import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo.jsx';
import Icon from '../../components/Icon.jsx';
import { FormField, PasswordField } from '../../components/FormField.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { ApiError } from '../../api/client.js';
import { EMAIL, focusFirstInvalid } from '../../utils.js';
import './SignupSections.css';

// Keep these boundaries aligned with src/modules/auth/schemas.js in the backend.
const NAME_OK = /^[\p{L}][\p{L}'.\- ]*$/u;
const PASSWORD_HINT = 'Use at least 10 characters, with uppercase, lowercase and a number (maximum 72 UTF-8 bytes).';
const PASSWORD_BYTES = pw => new TextEncoder().encode(pw).length;
const INVALID_CONTROLS = /[\x00-\x1f\x7f]/;

function nameError(value, field) {
  const name = value.trim();
  if (!name) return `Please enter your ${field} name.`;
  if (name.length > 100) return `${field === 'first' ? 'First' : 'Last'} name must be 100 characters or fewer.`;
  if (/[0-9]/.test(name)) return 'Names cannot contain numbers. Please use letters instead.';
  if (!NAME_OK.test(name)) return 'Use letters only. Spaces, apostrophes, hyphens and periods are allowed.';
  return '';
}

function emailError(value) {
  const email = value.trim();
  if (!email) return 'Please enter your email address.';
  if (email.length > 255) return 'Email address must be 255 characters or fewer.';
  if (INVALID_CONTROLS.test(email) || /\s/.test(email)) return 'Remove spaces or unsupported characters from your email address.';
  if (!email.includes('@')) return 'Include an @ symbol in your email address.';
  const parts = email.split('@');
  if (parts.length !== 2 || !parts[0]) return 'Enter an email like name@example.com.';
  if (!parts[1] || !parts[1].includes('.')) return 'Include a valid domain, like example.com.';
  if (!EMAIL.test(email) || parts[1].startsWith('.') || parts[1].endsWith('.') || parts[1].includes('..')) return 'Enter a valid email address, like name@example.com.';
  return '';
}

function passwordError(pw) {
  if (!pw) return 'Please create a password.';
  if (pw.length < 10) return 'Use at least 10 characters for your password.';
  if (!/[a-z]/.test(pw)) return 'Add at least one lowercase letter (a–z).';
  if (!/[A-Z]/.test(pw)) return 'Add at least one uppercase letter (A–Z).';
  if (!/[0-9]/.test(pw)) return 'Add at least one number (0–9).';
  if (PASSWORD_BYTES(pw) > 72) return 'Your password is too long. Keep it within 72 UTF-8 bytes.';
  return '';
}

function confirmationError(confirmation, password) {
  if (!confirmation) return 'Please confirm your password.';
  if (confirmation.length > 128) return 'Confirmation must be 128 characters or fewer.';
  if (confirmation !== password) return 'The passwords do not match. Please try again.';
  return '';
}

function websiteError(value) {
  const website = value.trim();
  if (!website) return 'Please enter your organization’s website URL.';
  if (website.length > 255) return 'Website URL must be 255 characters or fewer.';
  if (!/^https?:\/\//i.test(website)) return 'Start your website URL with https:// or http://.';
  try {
    const url = new URL(website);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) return 'Enter a valid website URL, like https://example.com.';
    if (url.username || url.password) return 'Remove usernames or passwords from the website URL.';
  } catch {
    return 'Enter a valid website URL, like https://example.com.';
  }
  return '';
}

function organizationNameError(value) {
  const name = value.trim();
  if (!name) return 'Please enter your organization’s name.';
  if (name.length > 200) return 'Organization name must be 200 characters or fewer.';
  return '';
}

function organizationTypeError(value) {
  if (!value.trim()) return 'Please select an organization type.';
  if (value.trim().length > 100) return 'Organization type must be 100 characters or fewer.';
  return '';
}

function organizationCodeError(value) {
  const code = value.trim();
  if (!code) return 'Please enter the organization code shared by your owner.';
  if (code.length !== 8) return 'Organization code must be exactly 8 characters.';
  return '';
}
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
      ln: nameError(personal.ln, 'last'),
      fn: nameError(personal.fn, 'first'),
      em: emailError(personal.em),
      pw: passwordError(personal.pw),
      pw2: confirmationError(personal.pw2, personal.pw)
    };
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
      oname: organizationNameError(create.oname),
      otype: organizationTypeError(create.otype),
      odom: websiteError(create.odom),
      odesc: create.odesc.trim().length > 2000 ? 'Description must be 2,000 characters or fewer.' : ''
    };
    setCreateErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return setTimeout(focusFirstInvalid);

    setSubmitting(true);
    try {
      const { code } = await signupCreateOrg({
        firstName: personal.fn.trim(),
        lastName: personal.ln.trim(),
        email: personal.em.trim().toLowerCase(),
        password: personal.pw,
        confirmPassword: personal.pw2,
        orgName: create.oname.trim(),
        orgType: create.otype.trim(),
        website: create.odom.trim(),
        description: create.odesc.trim() || undefined
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
    const codeError = organizationCodeError(orgCode);
    if (codeError) {
      setJoinError(codeError);
      return setTimeout(focusFirstInvalid);
    }
    setSubmitting(true);
    try {
      const { joinRequest } = await signupJoinOrg({
        firstName: personal.fn.trim(),
        lastName: personal.ln.trim(),
        email: personal.em.trim().toLowerCase(),
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
              <h2 id="step-title" className="stitle" tabIndex={-1}>Personal Information &amp; Password Setup</h2>
              <form noValidate onSubmit={submitStep1}>
                <section className="signup-section" aria-labelledby="signup-personal-title">
                  <h3 id="signup-personal-title" className="sect signup-section__title">Personal Information</h3>
                  <div className="grid2">
                    <FormField id="ln" label="Last Name" placeholder="Enter your last name" autoComplete="family-name" value={personal.ln} onChange={e => { setPersonal(p => ({ ...p, ln: e.target.value })); setPersonalErrors(prev => ({ ...prev, ln: '' })); } } error={personalErrors.ln} />
                    <FormField id="fn" label="First Name" placeholder="Enter your first name" autoComplete="given-name" value={personal.fn} onChange={e => { setPersonal(p => ({ ...p, fn: e.target.value })); setPersonalErrors(prev => ({ ...prev, fn: '' })); } } error={personalErrors.fn} />
                  </div>
                  <FormField id="em" label="Email Address" type="email" placeholder="Enter your email" autoComplete="email" value={personal.em} onChange={e => { setPersonal(p => ({ ...p, em: e.target.value })); setPersonalErrors(prev => ({ ...prev, em: '' })); } } error={personalErrors.em} />
                </section>
                <section className="signup-section signup-section--separated" aria-labelledby="signup-password-title">
                  <h3 id="signup-password-title" className="sect signup-section__title">Password Setup</h3>
                  <PasswordField id="pw" label="Password" placeholder="Create a password" autoComplete="new-password" hint={personalErrors.pw ? undefined : PASSWORD_HINT} value={personal.pw} onChange={e => { setPersonal(p => ({ ...p, pw: e.target.value })); setPersonalErrors(prev => ({ ...prev, pw: '' })); } } error={personalErrors.pw} />
                  <PasswordField id="pw2" label="Confirm Password" placeholder="Confirm your password" autoComplete="new-password" value={personal.pw2} onChange={e => { setPersonal(p => ({ ...p, pw2: e.target.value })); setPersonalErrors(prev => ({ ...prev, pw2: '' })); } } error={personalErrors.pw2} />
                </section>
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
                <FormField id="oname" label="Organization Name" placeholder="Enter organization name" autoComplete="organization" value={create.oname} onChange={e => { setCreate(c => ({ ...c, oname: e.target.value })); setCreateErrors(prev => ({ ...prev, oname: '' })); } } error={createErrors.oname} />
                <div className="field">
                  <label htmlFor="otype">Organization Type</label>
                  <select id="otype" required aria-describedby="otype-err" aria-invalid={createErrors.otype ? 'true' : undefined} value={create.otype} onChange={e => { setCreate(c => ({ ...c, otype: e.target.value })); setCreateErrors(prev => ({ ...prev, otype: '' })); } }>
                    <option value="" disabled>Select organization type</option>
                    <option>Company</option>
                    <option>Government agency</option>
                    <option>Non-profit</option>
                    <option>Educational institution</option>
                    <option>Other</option>
                  </select>
                  <p className="err" id="otype-err" role="alert">{createErrors.otype || ''}</p>
                </div>
                <FormField id="odom" label="Website / Domain" placeholder="https://example.com" autoComplete="url" value={create.odom} onChange={e => { setCreate(c => ({ ...c, odom: e.target.value })); setCreateErrors(prev => ({ ...prev, odom: '' })); } } error={createErrors.odom} />
                <div className="field">
                  <label htmlFor="odesc">Description</label>
                  <textarea id="odesc" placeholder="Enter description (optional)" value={create.odesc} onChange={e => { setCreate(c => ({ ...c, odesc: e.target.value })); setCreateErrors(prev => ({ ...prev, odesc: '' })); } } aria-invalid={Boolean(createErrors.odesc)} aria-describedby="odesc-err" />
                  <p className="err" id="odesc-err" role="alert">{createErrors.odesc || ''}</p>
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
                  placeholder="8-character code"
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
