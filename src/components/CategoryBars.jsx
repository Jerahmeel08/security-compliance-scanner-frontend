// A small horizontal bar-breakdown chart. `data` is an ordered array of
// { label, value, varName } — varName names a CSS custom property (e.g. "--crit")
// so callers reuse the app's existing color tokens instead of inline hex values.
export default function CategoryBars({ data }) {
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <ul className="catbars">
      {data.map(d => {
        const pct = (d.value / max) * 100;
        return (
          <li className="catbars__row" key={d.label}>
            <span className="catbars__label">{d.label}</span>
            <span
              className="catbars__track"
              tabIndex={0}
              role="img"
              aria-label={`${d.label}: ${d.value}`}
            >
              <span className="catbars__fill" style={{ width: `${pct}%`, background: `var(${d.varName})` }} />
            </span>
            <b className="catbars__value">{d.value}</b>
          </li>
        );
      })}
    </ul>
  );
}
