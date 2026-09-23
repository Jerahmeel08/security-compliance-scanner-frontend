import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const ConfirmDialog = forwardRef(function ConfirmDialog(
  { title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, requireReason = false, reasonLabel = 'Reason', onConfirm },
  ref
) {
  const dialogRef = useRef(null);
  const [payload, setPayload] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useImperativeHandle(ref, () => ({
    open(data) {
      setPayload(data);
      setReason('');
      setError('');
      dialogRef.current?.showModal();
    }
  }));

  function confirm() {
    if (requireReason && !reason.trim()) {
      setError('This field is required.');
      return;
    }
    dialogRef.current?.close();
    onConfirm(payload, reason.trim());
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dlg-title"
      onClick={e => { if (e.target === dialogRef.current) dialogRef.current.close(); }}
    >
      <div className="dlg__in">
        <h2 id="confirm-dlg-title">{title}</h2>
        <p className="confirm-msg">{typeof message === 'function' ? message(payload) : message}</p>
        {requireReason && (
          <div className="field">
            <label htmlFor="confirm-reason">{reasonLabel}</label>
            <textarea id="confirm-reason" value={reason} onChange={e => { setReason(e.target.value); if (error) setError(''); }} />
            <p className="err" role="alert">{error}</p>
          </div>
        )}
        <div className="actions row">
          <button type="button" className="btn btn--ghost" onClick={() => dialogRef.current?.close()}>{cancelLabel}</button>
          <button type="button" className={`btn${danger ? ' btn--danger' : ''}`} onClick={confirm}>{confirmLabel}</button>
        </div>
      </div>
    </dialog>
  );
});

export default ConfirmDialog;
