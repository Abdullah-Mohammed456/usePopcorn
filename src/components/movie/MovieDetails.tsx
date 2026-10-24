import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { getMovieDetails } from "../../api/omdb";
import type { OmdbMovieDetails, WatchedMovie } from "../../types/omdb";
import { Loading } from "../ui/Loading";
import { MoviePoster } from "./MoviePoster";
import StarRating from "../ui/StarRating";
import { ErrorMessage } from "../ui/ErrorMessage";
import { SeriesEpisodes } from "./SeriesEpisodes";

interface MovieDetailsProps {
  selectedId: string;
  onCloseMovie: () => void;
  onAddWatched: (movie: WatchedMovie) => void;
  inOurList: boolean;
}

export function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatched,
  inOurList,
}: MovieDetailsProps) {
  const [movie, setMovie] = useState<OmdbMovieDetails | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    document.body.classList.add("modal-open");
    closeButtonRef.current?.focus();
    return () => {
      document.body.classList.remove("modal-open");
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDetails(): Promise<void> {
      try {
        setLoading(true);
        setError("");
        setMovie(null);
        const result = await getMovieDetails(selectedId, controller.signal);
        if (result.Response === "False") {
          throw new Error(result.Error ?? "Title details are unavailable");
        }
        setMovie(result);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "The movie service is unavailable",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void fetchDetails();
    return () => controller.abort();
  }, [selectedId]);

  useEffect(() => {
    document.title = movie?.Title
      ? `${movie.Title} · usePopcorn`
      : "Title details · usePopcorn";
    return () => {
      document.title = "usePopcorn — Find your next favorite story";
    };
  }, [movie?.Title]);

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLElement>): void {
    if (event.key === "Escape") {
      event.stopPropagation();
      onCloseMovie();
      return;
    }
    if (event.key !== "Tab") return;

    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable.item(0);
    const last = focusable.item(focusable.length - 1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  function handleAddToList(): void {
    if (!movie || userRating === 0) return;

    const watchedMovie: WatchedMovie = {
      imdbID: selectedId,
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster,
      imdbRating: Number.parseFloat(movie.imdbRating ?? "") || 0,
      runtime: Number.parseInt(movie.Runtime ?? "", 10) || 0,
      userRating,
    };

    onAddWatched(watchedMovie);
    onCloseMovie();
  }

  const title = movie?.Title ?? "Title details";

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onCloseMovie();
      }}
    >
      <section
        className="detail-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-busy={loading}
        tabIndex={-1}
        ref={dialogRef}
        onKeyDown={handleDialogKeyDown}
      >
        <h2 className="sr-only" id="dialog-title">
          {title}
        </h2>
        <button
          ref={closeButtonRef}
          className="dialog-close"
          type="button"
          onClick={onCloseMovie}
          aria-label="Close title details"
        >
          Close
        </button>

        {loading ? (
          <Loading />
        ) : error ? (
          <div className="dialog-message">
            <ErrorMessage message={error} />
          </div>
        ) : movie ? (
          <>
            <header className="detail-hero">
              <MoviePoster
                poster={movie.Poster}
                title={movie.Title}
                eager
                className="detail-poster"
              />
              <div className="detail-overview">
                <p className="eyebrow">
                  {movie.Type} · {movie.Year}
                </p>
                <h2>{movie.Title}</h2>
                <p className="detail-meta">
                  {[movie.Released, movie.Runtime, movie.Genre]
                    .filter((value) => value && value !== "N/A")
                    .join(" · ")}
                </p>
                {movie.imdbRating && movie.imdbRating !== "N/A" && (
                  <p className="imdb-score">
                    <span>IMDb</span> {movie.imdbRating}/10
                  </p>
                )}
              </div>
            </header>

            <div className="detail-content">
              {inOurList ? (
                <p className="saved-status" role="status">
                  This title is already in your list
                </p>
              ) : (
                <div className="rating-panel">
                  <StarRating maxRating={10} onSetRating={setUserRating} />
                  <button
                    className="button button-primary save-rating"
                    onClick={handleAddToList}
                    type="button"
                    disabled={userRating === 0}
                  >
                    Add to my list
                  </button>
                </div>
              )}
              {movie.Plot && movie.Plot !== "N/A" && (
                <p className="detail-plot">{movie.Plot}</p>
              )}
              <dl className="detail-credits">
                {movie.Director && movie.Director !== "N/A" && (
                  <div>
                    <dt>Director</dt>
                    <dd>{movie.Director}</dd>
                  </div>
                )}
                {movie.Actors && movie.Actors !== "N/A" && (
                  <div>
                    <dt>Cast</dt>
                    <dd>{movie.Actors}</dd>
                  </div>
                )}
              </dl>
              {movie.Type === "series" && (
                <SeriesEpisodes
                  imdbID={selectedId}
                  totalSeasons={movie.totalSeasons}
                />
              )}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
