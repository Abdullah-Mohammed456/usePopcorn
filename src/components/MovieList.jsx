import { Movie } from "./Movie";

export function MovieList({ movies, onSelectedId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} onSelectedId={onSelectedId} />
      ))}
    </ul>
  );
}
