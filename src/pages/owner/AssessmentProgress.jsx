import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import IconBadge from '../../components/IconBadge.jsx';

const POLL_MS = 3000;

export default function AssessmentProgress() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { assessments, apps, refreshAssessment } = useApp();
  const toast = useToast();
  const toastedRef = useRef(false);

  const assessment = assessments.find(a => a.id === assessmentId);
  const app = assessment && apps.find(a => a.id === assessment.appId);
  const inFlight = assessment && (assessment.rawStatus === 'PENDING' || assessment.rawStatus === 'RUNNING');

  // Real backend polling — assessments run server-side, there is no client
  // timer to simulate. Owners have no cancel endpoint (only System Admins do,
  // via Assessment Monitoring), so there's no cancel action here.
  useEffect(() => {
    if (!inFlight) return undefined;
    let cancelled = false;
    let timer;
    const poll = async () => {
      try {
        const updated = await refreshAssessment(assessmentId);
        if (cancelled) return;
        if (updated.rawStatus === 'PENDING' || updated.rawStatus === 'RUNNING') {
          timer = setTimeout(poll, POLL_MS);
        } else if (!toastedRef.current) {
          toastedRef.current = true;
          toast(updated.rawStatus === 'COMPLETED' ? 'Assessment completed' : updated.rawStatus === 'FAILED' ? 'Assessment failed' : 'Assessment cancelled');
        }
      } catch {
        if (!cancelled) timer = setTimeout(poll, POLL_MS * 2);
      }
    };
    timer = setTimeout(poll, POLL_MS);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [assessmentId, inFlight, refreshAssessment, toast]);

  if (!assessment) return <p className="empty">Assessment not found.</p>;

  if (assessment.status === 'Completed') {
    return (
      <div className="card progress-card">
        <IconBadge name="check" size={64} tintVar="--ok" />
        <h2>Assessment completed</h2>
        <p className="muted">{assessment.profile} on {app?.name}</p>
        <button type="button" className="btn" onClick={() => navigate(`/app/assessments/${assessment.id}`)}>View results</button>
      </div>
    );
  }

  if (assessment.status === 'Failed') {
    return (
      <div className="card progress-card">
        <IconBadge name="findings" size={64} tintVar="--danger" />
        <h2>Assessment failed</h2>
        {assessment.failureReason && <p className="muted">{assessment.failureReason}</p>}
        <button type="button" className="btn btn--ghost" onClick={() => navigate(app ? `/app/applications/${app.id}` : '/app/applications')}>Back</button>
      </div>
    );
  }

  if (assessment.status === 'Cancelled') {
    return (
      <div className="card progress-card">
        <IconBadge name="assess" size={64} tintVar="--info" />
        <h2>Assessment cancelled</h2>
        <button type="button" className="btn btn--ghost" onClick={() => navigate(app ? `/app/applications/${app.id}` : '/app/applications')}>Back</button>
      </div>
    );
  }

  const percent = assessment.totalChecks ? Math.round((assessment.checksExecuted / assessment.totalChecks) * 100) : 0;

  return (
    <div className="card progress-card">
      <div className="progress-spinner">
        <IconBadge name="assess" size={64} />
      </div>
      <h2>Running {assessment.profile}</h2>
      <p className="muted">{app?.name} · {app?.url}</p>
      <div className="bar bar--lg" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <i style={{ width: `${percent}%` }} />
      </div>
      <p className="progress-pct">{percent}%</p>
      <p className="muted">
        {assessment.totalChecks
          ? `Executed ${assessment.checksExecuted} of ${assessment.totalChecks} checks${assessment.currentCheck ? ` — running ${assessment.currentCheck}` : ''}…`
          : 'Starting scan…'}
      </p>
    </div>
  );
}
