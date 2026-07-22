// components/SeriesEpisodes.jsx
import { useState, useEffect } from "react";
import { KEY } from "../constants";
import { Loading } from "./Loading";
import { ErrorMessage } from "./ErrorMessage";

export function SeriesEpisodes({ imdbID, totalSeasons }) {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      if (!totalSeasons) return;

      async function fetchAllSeasons() {
        try {
          setLoading(true);
          setError("");

          const total = parseInt(totalSeasons, 10);
          const requests = [];

          for (let s = 1; s <= total; s++) {
            requests.push(
              fetch(
                `http://www.omdbapi.com/?apikey=${KEY}&i=${imdbID}&Season=${s}`,
              ).then((res) => res.json()),
            );
          }

          const results = await Promise.all(requests);
          const valid = results.filter((r) => r.Response !== "False");

          if (valid.length === 0) throw new Error("No episode data found");

          setSeasons(valid);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }

      fetchAllSeasons();
    },
    [imdbID, totalSeasons],
  );

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!seasons.length) return null;

  return (
    <div className="episodes">
      {seasons.map((season) => (
        <div key={season.Season} className="season">
          <h3>Season {season.Season}</h3>
          <ul>
            {season.Episodes.map((ep) => (
              <li key={ep.imdbID}>
                <span>
                  Ep {ep.Episode}: {ep.Title}
                </span>
                <span> ⭐ {ep.imdbRating}</span>
                <span> 📅 {ep.Released}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
