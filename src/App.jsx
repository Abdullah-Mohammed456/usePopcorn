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
import { useMovies } from "./hooks/useMovies";

export default function App() {
  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem("watched");
    return storedValue ? JSON.parse(storedValue) : [];
  });

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, loading, error } = useMovies(query);

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
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched],
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
