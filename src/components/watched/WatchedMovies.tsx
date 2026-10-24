import { WatchedMovie } from "./WatchedMovie";
import { Summary } from "./Summary";
import type { WatchedMovie as WatchedMovieData } from "../../types/omdb";

interface WatchedMoviesProps {
  watched: WatchedMovieData[];
  onDeleteMovie: (id: string) => void;
  onSelectedId: (id: string) => void;
  title: string;
  showSummary: boolean;
}

export function WatchedMovies({
  watched,
  onDeleteMovie,
  onSelectedId,
  title,
  showSummary,
}: WatchedMoviesProps) {
  const Heading = showSummary ? "h1" : "h2";

  return (
    <section className="content-section" aria-labelledby="collection-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Your collection</p>
          <Heading id="collection-title">{title}</Heading>
        </div>
        <span
          className="section-marker"
          data-scroll-marker
          aria-hidden="true"
        />
      </div>
      {showSummary && <Summary watched={watched} />}
      {watched.length > 0 ? (
        <ul className="movie-rail movie-rail-saved" aria-label={title}>
          {watched.map((movie) => (
            <WatchedMovie
              key={movie.imdbID}
              movie={movie}
              onDeleteMovie={onDeleteMovie}
              onSelectedId={onSelectedId}
            />
          ))}
        </ul>
      ) : (
        <p className="empty-state">
          Your collection is empty Search for a movie or series and add your
          rating to save it here
        </p>
      )}
    </section>
  );
}
