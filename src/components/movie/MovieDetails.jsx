import { useState, useEffect } from "react";
import { KEY } from "../../constants";
import { Loading } from "../ui/Loading";
import StarRating from "../ui/StarRating";
import { SeriesEpisodes } from "./SeriesEpisodes";
import { useKey } from "../../hooks/useKey";

export function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatched,
  inOurList,
}) {
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState("");
  const [loading, setLoading] = useState(false);

  function handleAddToList() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
    imdbRating: imdbRating,
    Type: type,
    totalSeasons,
  } = movie;

  useEffect(
    function () {
      setMovie({});

      async function getMovieDetails() {
        setLoading(true);

        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`,
        );
        const data = await res.json();
        setMovie(data);
        setLoading(false);
      }

      getMovieDetails();
    },
    [selectedId],
  );

  useKey("escape", onCloseMovie);

  useEffect(
    function () {
      if (!title) return;

      document.title = `${title} Movie`;

      return function () {
        document.title = "usePopcorn";
      };
    },
    [title],
  );

  return (
    <div className="details">
      {loading ? (
        <Loading />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &#8249;
            </button>
            <img src={poster} alt={`Poster of ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb Rating
              </p>
            </div>
          </header>
          <section>
            {inOurList ? (
              <h3 className="added-msg">You already rated this movie ⭐</h3>
            ) : (
              <div className="rating">
                <StarRating
                  maxRating={10}
                  size={20}
                  onSetRating={setUserRating}
                />
              </div>
            )}
            {userRating && (
              <button className="btn-add" onClick={handleAddToList}>
                + Add To The List
              </button>
            )}
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed By {director}</p>

            {type === "series" && (
              <SeriesEpisodes imdbID={selectedId} totalSeasons={totalSeasons} />
            )}
          </section>
        </>
      )}
    </div>
  );
}
