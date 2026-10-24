interface SearchPaginationProps {
  page: number;
  totalResults: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function SearchPagination({
  page,
  totalResults,
  loading,
  onPageChange,
}: SearchPaginationProps) {
  const totalPages = Math.min(Math.ceil(totalResults / 10), 100);
  if (totalPages < 2) return null;

  return (
    <nav className="results-pagination" aria-label="Search result pages">
      <button
        className="button button-secondary"
        type="button"
        disabled={loading || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span aria-live="polite">
        Page {page} of {totalPages}
      </span>
      <button
        className="button button-secondary"
        type="button"
        disabled={loading || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
      {totalResults > 1000 && (
        <p className="pagination-note">
          OMDb provides up to 1,000 results for a search
        </p>
      )}
    </nav>
  );
}
