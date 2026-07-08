import { useState, useEffect } from "react";
import { KEY } from "./constants";
import { NavBar } from "./components/NavBar";
import { Logo } from "./components/Logo";
import { SearchBar } from "./components/SearchBar";
import { NumResults } from "./components/NumResults";
import { Main } from "./components/Main";
import { Box } from "./components/Box";
import { Loading } from "./components/Loading";
import { ErrorMessage } from "./components/ErrorMessage";
import { MovieList } from "./components/MovieList";
import { MovieDetails } from "./components/MovieDetails";
import { WatchedMovies } from "./components/WatchedMovies";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSelectedMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watchedMovie) => {
      const inList = watchedMovie.some((mv) => mv.imdbID === movie.imdbID);
      return inList ? watchedMovie : [...watchedMovie, movie];
    });
  }

  function handleDeleteMovie(id) {
    setWatched((newWatched) =>
      newWatched.filter((watch) => watch.imdbID !== id),
    );
  }

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

      handleCloseMovie();
      fetching();

      return function () {
        controller.abort();
        setError("");
        setMovies([]);
      };
    },
    [query],
  );

  return (
    <>
      <NavBar>
        <Logo />
        <SearchBar query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {loading && <Loading />}
          {error && <ErrorMessage message={error} />}
          {!loading && !error && (
            <MovieList movies={movies} onSelectedId={handleSelectedMovie} />
          )}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              inOurList={watched.some((mv) => mv.imdbID === selectedId)}
            />
          ) : (
            <WatchedMovies
              watched={watched}
              onDeleteMovie={handleDeleteMovie}
            />
          )}
        </Box>
      </Main>
    </>
  );
}
