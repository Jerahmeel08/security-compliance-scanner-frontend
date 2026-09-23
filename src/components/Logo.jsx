export default function Logo({ className = '' }) {
  return (
    <svg className={`logo ${className}`.trim()} viewBox="0 0 120 140" aria-hidden="true" focusable="false">
      <use href="#shield" />
    </svg>
  );
}

export function ShieldDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="shieldClip">
          <path d="M10 10h32l6 9h24l6-9h32v62c0 26-24 46-50 62C34 118 10 98 10 72z" />
        </clipPath>
        <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#00ffdd" stopOpacity="0" />
          <stop offset=".85" stopColor="#00ffdd" stopOpacity=".5" />
          <stop offset="1" stopColor="#00ffdd" stopOpacity=".9" />
        </linearGradient>
        <symbol id="shield" viewBox="0 0 120 140">
          <g fill="none" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
            <path d="M10 10h32l6 9h24l6-9h32v62c0 26-24 46-50 62C34 118 10 98 10 72z" strokeWidth="3" fill="currentColor" fillOpacity=".1" />
            <path d="M17 17h24l5 8h28l5-8h24v55c0 21-19 38-43 52C36 110 17 93 17 72z" strokeWidth="1.6" />
            <path d="M26 36v14M94 36v14M26 58v10M94 58v10" strokeWidth="1.6" />
          </g>
          <g fill="currentColor">
            <circle cx="26" cy="32" r="2" />
            <circle cx="94" cy="32" r="2" />
          </g>
          <path d="M38 58l15 15 29-31" fill="none" stroke="currentColor" strokeWidth="9" strokeLinejoin="miter" />
        </symbol>
      </defs>
    </svg>
  );
}
