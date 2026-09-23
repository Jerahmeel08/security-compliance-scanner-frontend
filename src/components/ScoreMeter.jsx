// Radial meter for a single score out of 100. Track is a neutral gray; the fill
// carries one status color chosen by band (good/warning/danger) — never a rainbow.
export default function ScoreMeter({ score, size = 100, label = 'score' }) {
  const stroke = Math.round(size * 0.09);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  if (score == null) {
    return (
      <div className="scoremeter scoremeter--empty" style={{ width: size, height: size }} role="img" aria-label={`No ${label} yet`}>
        <span>—</span>
      </div>
    );
  }

  const varName = score >= 90 ? '--ok' : score >= 70 ? '--warn' : '--danger';
  const offset = c * (1 - Math.max(0, Math.min(100, score)) / 100);

  return (
    <div className="scoremeter" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${score} out of 100`}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eceef5" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`var(${varName})`} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .5s ease' }}
        />
      </svg>
      <span className="scoremeter__value">{score}<small>/100</small></span>
    </div>
  );
}
