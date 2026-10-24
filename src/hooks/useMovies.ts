import { useEffect, useState } from "react";
import { MIN_SEARCH_LENGTH } from "../constants";
import { searchMovies } from "../api/omdb";
import type { OmdbMovieSummary } from "../types/omdb";

export function useMovies(query: string) {
  const [movies, setMovies] = useState<OmdbMovieSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setLoading(true);
          setError("");
          setMovies([]);

          const result = await searchMovies(query.trim(), controller.signal);
          if (result.Response === "False") {
            throw new Error(result.Error ?? "No movies found.");
          }
          setMovies(result.Search ?? []);
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setError(
            error instanceof Error
              ? error.message
              : "The movie service is unavailable.",
          );
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      }

      if (query.trim().length < MIN_SEARCH_LENGTH) {
        setError("");
        setMovies([]);
        setLoading(false);
        return;
      }

      const timeoutId = window.setTimeout(() => {
        void fetchMovies();
      }, 280);

      return function () {
        window.clearTimeout(timeoutId);
        controller.abort();
      };
    },
    [query],
  );

  return { movies, loading, error };
}
