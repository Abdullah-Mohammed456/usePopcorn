import type { OmdbMovieSummary } from "../../types/omdb";

interface NumResultsProps {
  movies: OmdbMovieSummary[];
  loading: boolean;
}

export function NumResults({ movies, loading }: NumResultsProps) {
  return (
    <p className="num-results" aria-live="polite" aria-atomic="true">
      {loading ? "Searching" : `${movies.length} results`}
    </p>
  );
}
