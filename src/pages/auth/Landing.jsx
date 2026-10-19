import { Link } from 'react-router-dom';
import './Landing.css';

const workflow = [
  {
    number: '01',
    title: 'Scan',
    description: 'Assess your applications',
  },
  {
    number: '02',
    title: 'Review',
    description: 'Understand security findings',
  },
  {
    number: '03',
    title: 'Remediate',
    description: 'Track fixes through resolution',
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Landing() {
  return (
    <div className="scs-landing">
      <header className="scs-landing__header">
        <div className="scs-landing__brand" aria-label="Security Compliance System">
          <span className="scs-landing__brand-mark" aria-hidden="true">
            <svg viewBox="0 0 120 140" focusable="false">
              <use href="#shield" />
            </svg>
          </span>
          <span className="scs-landing__brand-copy">
            <strong>SCS</strong>
            <small>Security Compliance System</small>
          </span>
        </div>
        <div className="scs-landing__header-status">
          <span className="scs-landing__status-dot" aria-hidden="true" />
          Application security workspace
        </div>
      </header>

      <main className="scs-landing__main">
        <section className="scs-landing__intro" aria-labelledby="page-title">
          <div className="scs-landing__eyebrow">
            <span className="scs-landing__eyebrow-line" aria-hidden="true" />
            SCAN. SECURE. COMPLY.
          </div>

          <h1 id="page-title" tabIndex={-1}>
            Security compliance,
            <span> made actionable.</span>
          </h1>

          <p className="scs-landing__description">
            Scan your applications, review security findings, and track remediation
            in one focused workspace. Turn assessment results into clear next steps.
          </p>

          <div className="scs-landing__actions" role="group" aria-label="Get started">
            <Link className="scs-landing__action scs-landing__action--primary" to="/signin">
              Sign in
              <ArrowIcon />
            </Link>
            <Link className="scs-landing__action scs-landing__action--secondary" to="/signup">
              Create an account
            </Link>
          </div>

          <div className="scs-landing__capabilities" aria-label="Platform workflow">
            <div><span className="scs-landing__capability-marker" /> Application scanning</div>
            <div><span className="scs-landing__capability-marker" /> Findings management</div>
            <div><span className="scs-landing__capability-marker" /> Remediation tracking</div>
          </div>
        </section>

        <section className="scs-landing__showcase" aria-label="Security assessment workflow">
          <div className="scs-landing__showcase-top">
            <div>
              <span className="scs-landing__kicker">HOW IT WORKS</span>
              <h2>From assessment to action</h2>
            </div>
            <span className="scs-landing__showcase-badge">SCS WORKSPACE</span>
          </div>

          <div className="scs-landing__shield-stage" aria-hidden="true">
            <div className="scs-landing__shield-glow" />
            <div className="scs-landing__shield-ring scs-landing__shield-ring--outer" />
            <div className="scs-landing__shield-ring scs-landing__shield-ring--inner" />
            <svg className="scs-landing__hero-shield" viewBox="0 0 120 140" focusable="false">
              <use href="#shield" />
            </svg>
          </div>

          <ol className="scs-landing__workflow">
            {workflow.map((step) => (
              <li key={step.number}>
                <span className="scs-landing__workflow-number">{step.number}</span>
                <span className="scs-landing__workflow-copy">
                  <strong>{step.title}</strong>
                  <span>{step.description}</span>
                </span>
                <span className="scs-landing__workflow-indicator" aria-hidden="true" />
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="scs-landing__footer">
        <span>Security Compliance System</span>
        <span>Identify risks. Prioritize action.</span>
      </footer>
    </div>
  );
}
