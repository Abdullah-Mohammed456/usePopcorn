import { useState, useEffect } from "react";
import { KEY } from "./constants";
import { NavBar } from "./components/layout/NavBar";
import { Logo } from "./components/ui/Logo";
import { SearchBar } from "./components/layout/SearchBar";
import { NumResults } from "./components/layout/NumResults";
import { Main } from "./components/layout/Main";
import { Box } from "./components/ui/Box";
import { Loading } from "./components/ui/Loading";
import { ErrorMessage } from "./components/ui/ErrorMessage";
import { MovieList } from "./components/movie/MovieList";
import { MovieDetails } from "./components/movie/MovieDetails";
import { WatchedMovies } from "./components/watched/WatchedMovies";
import { useMovies } from "./hooks/useMovies";
import { useLocalStorageState } from "./hooks/useLocalStorageState";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [watched, setWatched] = useLocalStorageState([], "watched");
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
