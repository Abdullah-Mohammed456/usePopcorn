import type { WatchedMovie as WatchedMovieData } from "../../types/omdb";
import { MoviePoster } from "../movie/MoviePoster";

interface WatchedMovieProps {
  movie: WatchedMovieData;
  onDeleteMovie: (id: string) => void;
  onSelectedId: (id: string) => void;
}

export function WatchedMovie({
  movie,
  onDeleteMovie,
  onSelectedId,
}: WatchedMovieProps) {
  return (
    <li className="movie-card movie-card-saved">
      <button
        className="movie-card-button"
        onClick={() => onSelectedId(movie.imdbID)}
        type="button"
        aria-label={`Open details for ${movie.title}`}
      >
        <MoviePoster poster={movie.poster} title={movie.title} />
        <span className="movie-card-copy">
          <span className="movie-card-meta">
            <span>{movie.year}</span>
            <span className="type-label">
              Your rating {movie.userRating}/10
            </span>
          </span>
          <span className="movie-card-title">{movie.title}</span>
        </span>
      </button>
      <button
        className="button-remove"
        onClick={() => onDeleteMovie(movie.imdbID)}
        type="button"
        aria-label={`Remove ${movie.title} from your list`}
      >
        Remove
      </button>
    </li>
  );
}
