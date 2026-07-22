import { useEffect, useState } from "react";
import { KEY } from "../constants";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetching() {
        try {
          setLoading(true);
          setError("");
          setMovies([]);

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal },
          );

          if (!res.ok) {
            throw new Error("Something Went Wrong");
          }
          const data = await res.json();

          if (data.Response === "False") throw new Error("Not Found the Movie");
          setMovies(data.Search);
        } catch (error) {
          if (error.name !== "AbortError") setError(error.message);
        } finally {
          setLoading(false);
        }
      }

      if (query.length < 3) {
        setError("");
        setMovies([]);
        return;
      }

      fetching();

      return function () {
        controller.abort();
        setError("");
        setMovies([]);
      };
    },
    [query],
  );

  return { movies, loading, error };
}
