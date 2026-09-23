import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField } from './FormField.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const AddAppDialog = forwardRef(function AddAppDialog(_, ref) {
  const dialogRef = useRef(null);
  const { addApp } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('Web app');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useImperativeHandle(ref, () => ({
    open() {
      setName(''); setUrl(''); setType('Web app'); setErrors({});
      dialogRef.current?.showModal();
    }
  }));

  async function submit(e) {
    e.preventDefault();
    const nextErrors = {
      name: name ? '' : 'Enter the application’s name.',
      url: url ? '' : 'Enter the website or domain to assess.'
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      const created = await addApp({ name, url, type });
      dialogRef.current?.close();
      toast('Application added — verify ownership before requesting authorization');
      navigate(`/app/applications/${created.id}`);
    } catch (err) {
      setErrors({ url: err.message || 'Could not register the application. Check the URL and try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="dlg-title"
      onClick={e => { if (e.target === dialogRef.current) dialogRef.current.close(); }}
    >
      <form className="dlg__in" noValidate onSubmit={submit}>
        <h2 id="dlg-title">Add application</h2>
        <FormField id="aname" label="Application name" placeholder="e.g. Customer Portal" value={name} onChange={e => setName(e.target.value)} error={errors.name} />
        <FormField id="aurl" label="Website / Domain" placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} error={errors.url} />
        <div className="field">
          <label htmlFor="atype">Application type</label>
          <select id="atype" value={type} onChange={e => setType(e.target.value)}>
            <option>Web app</option>
            <option>Mobile app</option>
            <option>API</option>
            <option>Desktop app</option>
          </select>
        </div>
        <div className="actions row">
          <button type="button" className="btn btn--ghost" onClick={() => dialogRef.current?.close()}>Cancel</button>
          <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Adding…' : 'Add application'}</button>
        </div>
      </form>
    </dialog>
  );
});

export default AddAppDialog;
