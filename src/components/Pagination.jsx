// Shared pager for the client-side-paginated tables (see usePagination.js).
// Renders nothing when everything fits on one page, so it's safe to drop in
// unconditionally right after a table.

// Compact page-number list with gaps ("1 2 3 … 9 10") instead of every page,
// so this stays a fixed handful of circles even when a list has many pages —
// always the first, the last, and a small window around the current page.
function pageNumbers(current, total) {
  const delta = 1;
  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) pages.push(i);
  }
  const withGaps = [];
  let prev;
  for (const p of pages) {
    if (prev != null && p - prev > 1) {
      // A single skipped page is just shown as itself — "…" only earns its
      // place when it's standing in for two or more hidden pages.
      withGaps.push(p - prev === 2 ? prev + 1 : '…');
    }
    withGaps.push(p);
    prev = p;
  }
  return withGaps;
}

export default function Pagination({ page, totalPages, total, pageSize, onChange }) {
  if (totalPages <= 1) return null;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      <p className="pagination__summary">Showing {from}–{to} of {total}</p>
      <div className="pagination__controls">
        <button type="button" className="btn btn--sm btn--dark-outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </button>
        <div className="pagination__pages">
          {pageNumbers(page, totalPages).map((p, i) => (
            p === '…' ? (
              <span key={`gap-${i}`} className="pagination__num pagination__num--gap" aria-hidden="true">…</span>
            ) : (
              <button
                key={p}
                type="button"
                className={`pagination__num${p === page ? ' pagination__num--active' : ''}`}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Go to page ${p}`}
                onClick={() => onChange(p)}
              >
                {p}
              </button>
            )
          ))}
        </div>
        <button type="button" className="btn btn--sm btn--dark-outline" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
