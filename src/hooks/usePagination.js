import { useEffect, useMemo, useState } from 'react';

export const DEFAULT_PAGE_SIZE = 10;

// This app loads each list once into AppContext and derives every view
// (search, filters, tabs) via in-memory arrays — see AppContext.jsx's
// refresh* functions and the "no real pagination system yet, limit-as-cap"
// convention on the backend. Paging follows the same shape: it slices the
// already-filtered array in the browser rather than making a fresh request
// per page. Pass it the FINAL filtered list (after search/status/etc. are
// applied) so page 1 always reflects the current filters.
export function usePagination(items, pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Filters/search can shrink the list out from under the current page
  // (e.g. typing a query while sitting on page 4 of 5) — snap back to the
  // new last page instead of showing an empty page with pager controls
  // that imply there's more.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return { page, setPage, totalPages, pageItems, total, pageSize };
}
