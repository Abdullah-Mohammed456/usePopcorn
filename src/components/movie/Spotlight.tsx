import type { WatchedMovie } from "../../types/omdb";
import type { OmdbMovieSummary } from "../../types/omdb";
import { MoviePoster } from "./MoviePoster";

interface SpotlightProps {
  watched: WatchedMovie[];
  featured?: OmdbMovieSummary;
  onFocusSearch: () => void;
  onSelectedId: (id: string) => void;
}

export function Spotlight({
  watched,
  featured,
  onFocusSearch,
  onSelectedId,
}: SpotlightProps) {
  const latestMovie = watched.at(-1);
  const posterTitle = featured?.Title ?? latestMovie?.title;
  const poster = featured?.Poster ?? latestMovie?.poster;
  const posterId = featured?.imdbID ?? latestMovie?.imdbID;

  return (
    <section className="spotlight" aria-labelledby="spotlight-title">
      <div className="spotlight-copy">
        {featured ? (
          <>
            <p className="eyebrow">Top match from your search</p>
            <h1 id="spotlight-title">{featured.Title}</h1>
            <p className="spotlight-description">
              {featured.Year} · {featured.Type} Open the title for its story,
              cast, and your own rating
            </p>
            <button
              className="button button-primary"
              onClick={() => onSelectedId(featured.imdbID)}
              type="button"
            >
              View details
            </button>
          </>
        ) : (
          <>
            <p className="eyebrow">A collection of movies and series</p>
            <h1 id="spotlight-title">
              Find your next <span>favorite story</span>
            </h1>
            <p className="spotlight-description">
              Search the movies and series you love, explore the details, then
              save your rating to remember what stayed with you
            </p>
            <button
              className="button button-primary"
              onClick={onFocusSearch}
              type="button"
            >
              Search the collection
            </button>
          </>
        )}
      </div>

      <div className="spotlight-art">
        {posterTitle && poster && posterId ? (
          <button
            className="spotlight-feature"
            onClick={() => onSelectedId(posterId)}
            type="button"
            aria-label={`Open details for ${posterTitle}`}
          >
            <MoviePoster
              poster={poster}
              title={posterTitle}
              eager
              className="spotlight-poster"
            />
            <span className="spotlight-feature-copy">
              <span className="eyebrow">
                {featured ? "Search result" : "Recently added"}
              </span>
              <strong>{posterTitle}</strong>
              <span>
                {featured?.Year ?? latestMovie?.year}
                {latestMovie &&
                  !featured &&
                  ` · Your rating ${latestMovie.userRating}/10`}
              </span>
            </span>
          </button>
        ) : (
          <div className="spotlight-screen" aria-hidden="true">
            <span className="screen-number">01</span>
            <span className="screen-beam" />
            <span className="screen-caption">
              Tonight starts with a search
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
