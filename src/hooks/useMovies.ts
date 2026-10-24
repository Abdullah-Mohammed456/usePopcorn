import { useEffect, useState } from "react";
import { MIN_SEARCH_LENGTH } from "../constants";
import { searchMovies } from "../api/omdb";
import type { OmdbMovieSummary } from "../types/omdb";

interface MovieSearchState {
  key: string;
  movies: OmdbMovieSummary[];
  totalResults: number;
  loading: boolean;
  error: string;
}

const EMPTY_RESULTS = {
  movies: [] as OmdbMovieSummary[],
  totalResults: 0,
  loading: false,
  error: "",
};

export function useMovies(query: string, page: number) {
  const normalizedQuery = query.trim();
  const searchKey = `${normalizedQuery}\u0000${page}`;
  const [state, setState] = useState<MovieSearchState>({
    key: "",
    ...EMPTY_RESULTS,
  });

  useEffect(() => {
    const requestQuery = query.trim();
    if (requestQuery.length < MIN_SEARCH_LENGTH) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setState({
        key: searchKey,
        movies: [],
        totalResults: 0,
        loading: true,
        error: "",
      });

      async function fetchMovies(): Promise<void> {
        try {
          const result = await searchMovies(
            requestQuery,
            page,
            controller.signal,
          );
          if (result.Response === "False") {
            throw new Error(result.Error ?? "No movies found");
          }

          if (controller.signal.aborted) return;
          setState({
            key: searchKey,
            movies: result.Search ?? [],
            totalResults: Number.parseInt(result.totalResults ?? "", 10) || 0,
            loading: false,
            error: "",
          });
        } catch (error) {
          if (
            controller.signal.aborted ||
            (error instanceof DOMException && error.name === "AbortError")
          ) {
            return;
          }
          setState({
            key: searchKey,
            movies: [],
            totalResults: 0,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "The movie service is unavailable",
          });
        }
      }

      void fetchMovies();
    }, 280);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [page, query, searchKey]);

  if (normalizedQuery.length < MIN_SEARCH_LENGTH) return EMPTY_RESULTS;
  if (state.key !== searchKey) {
    return { ...EMPTY_RESULTS, loading: true };
  }

  return {
    movies: state.movies,
    totalResults: state.totalResults,
    loading: state.loading,
    error: state.error,
  };
}
