import { Movie } from "./Movie";
import type { OmdbMovieSummary } from "../../types/omdb";

interface MovieListProps {
  movies: OmdbMovieSummary[];
  onSelectedId: (id: string) => void;
}

export function MovieList({ movies, onSelectedId }: MovieListProps) {
  return (
    <ul className="movie-rail list-movies" aria-label="Search results">
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} onSelectedId={onSelectedId} />
      ))}
    </ul>
  );
}
