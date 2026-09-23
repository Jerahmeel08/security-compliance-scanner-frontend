import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <main className="landing">
      <div>
        <h1 id="page-title" tabIndex={-1}>Security Compliance System</h1>
        <p className="tagline">Scan. Secure. Comply.</p>
        <p className="lede">Ensure your applications meet security standards and stay compliant.</p>
        <div className="cta" role="group" aria-label="Get started">
          <Link className="btn" to="/signin">Sign in</Link>
          <Link className="btn btn--light" to="/signup">Sign up</Link>
        </div>
      </div>
      <div className="landing__art">
        <svg className="hero-shield" viewBox="0 0 120 140" role="img" aria-label="Security Compliance System shield logo">
          <use href="#shield" />
          <g clipPath="url(#shieldClip)"><rect className="scan" x="0" y="-26" width="120" height="26" fill="url(#scanGrad)" /></g>
        </svg>
        <p className="art-copy">SCS scans your applications for security gaps, tracks every finding through to a fix, and keeps you ready for your next audit.</p>
      </div>
    </main>
  );
}
