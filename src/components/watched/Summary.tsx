import { average } from "../../utils/helpers";
import type { WatchedMovie } from "../../types/omdb";

export function Summary({ watched }: { watched: WatchedMovie[] }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <dl className="summary" aria-label="Collection statistics">
      <div>
        <dt>Titles watched</dt>
        <dd>{watched.length}</dd>
      </div>
      <div>
        <dt>Average IMDb</dt>
        <dd>{avgImdbRating.toFixed(1)}</dd>
      </div>
      <div>
        <dt>Your average</dt>
        <dd>
          {avgUserRating.toFixed(1)}
          <span>/10</span>
        </dd>
      </div>
      <div>
        <dt>Average runtime</dt>
        <dd>
          {avgRuntime.toFixed(0)}
          <span> min</span>
        </dd>
      </div>
    </dl>
  );
}
