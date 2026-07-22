import { WatchedMovie } from "./WatchedMovie";
import { Summary } from "./Summary";

export function WatchedMovies({ watched, onDeleteMovie }) {
  return (
    <>
      <Summary watched={watched} />

      <ul className="list">
        {watched.map((movie) => (
          <WatchedMovie
            key={movie.imdbID}
            movie={movie}
            onDeleteMovie={onDeleteMovie}
          />
        ))}
      </ul>
    </>
  );
}
