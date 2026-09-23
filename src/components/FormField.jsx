import { useState } from 'react';
import Icon from './Icon.jsx';

export function FormField({ id, label, type = 'text', placeholder, autoComplete = 'off', value, onChange, error }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        aria-describedby={`${id}-err`}
        aria-invalid={error ? 'true' : undefined}
      />
      <p className="err" id={`${id}-err`} role="alert">{error || ''}</p>
    </div>
  );
}

export function PasswordField({ id, label, placeholder, autoComplete = 'current-password', value, onChange, error, hint }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="pw">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          aria-describedby={`${hint ? id + '-hint ' : ''}${id}-err`}
          aria-invalid={error ? 'true' : undefined}
        />
        <button
          type="button"
          className="eye"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible(v => !v)}
        >
          <Icon name={visible ? 'eyeoff' : 'eye'} />
        </button>
      </div>
      {hint && <p className="hint" id={`${id}-hint`}>{hint}</p>}
      <p className="err" id={`${id}-err`} role="alert">{error || ''}</p>
    </div>
  );
}
