interface NumResultsProps {
  loading: boolean;
  totalResults: number;
  page: number;
}

export function NumResults({ loading, totalResults, page }: NumResultsProps) {
  const firstResult = totalResults === 0 ? 0 : (page - 1) * 10 + 1;
  const lastResult = Math.min(page * 10, totalResults);

  return (
    <p className="num-results" aria-live="polite" aria-atomic="true">
      {loading
        ? "Searching"
        : totalResults > 0
          ? `${firstResult}–${lastResult} of ${totalResults} results`
          : "0 results"}
    </p>
  );
}
