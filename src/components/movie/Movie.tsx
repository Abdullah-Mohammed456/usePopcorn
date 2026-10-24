import type { OmdbMovieSummary } from "../../types/omdb";
import { MoviePoster } from "./MoviePoster";

interface MovieProps {
  movie: OmdbMovieSummary;
  onSelectedId: (id: string) => void;
}

export function Movie({ movie, onSelectedId }: MovieProps) {
  return (
    <li className="movie-card">
      <button
        className="movie-card-button"
        onClick={() => onSelectedId(movie.imdbID)}
        type="button"
        aria-label={`Open details for ${movie.Title}, ${movie.Year}`}
      >
        <MoviePoster poster={movie.Poster} title={movie.Title} />
        <span className="movie-card-copy">
          <span className="movie-card-meta">
            <span>{movie.Year}</span>
            <span className="type-label">{movie.Type}</span>
          </span>
          <span className="movie-card-title">{movie.Title}</span>
        </span>
      </button>
    </li>
  );
}
