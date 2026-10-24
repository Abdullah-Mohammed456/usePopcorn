import { useEffect, useState } from "react";
import { getSeason } from "../../api/omdb";
import type { OmdbSeason } from "../../types/omdb";
import { Loading } from "../ui/Loading";
import { ErrorMessage } from "../ui/ErrorMessage";

interface SeriesEpisodesProps {
  imdbID: string;
  totalSeasons: string | undefined;
}

export function SeriesEpisodes({ imdbID, totalSeasons }: SeriesEpisodesProps) {
  const [seasons, setSeasons] = useState<OmdbSeason[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const total = Number.parseInt(totalSeasons ?? "", 10);
  const hasSeasons = Number.isInteger(total) && total > 0;

  useEffect(() => {
    if (!hasSeasons) return;

    const controller = new AbortController();

    async function fetchAllSeasons(): Promise<void> {
      try {
        setLoading(true);
        setError("");
        const results = await Promise.all(
          Array.from({ length: total }, (_, index) =>
            getSeason(imdbID, index + 1, controller.signal),
          ),
        );
        const validSeasons = results.flatMap((result) =>
          result.Response === "True" && result.Season && result.Episodes
            ? [{ Season: result.Season, Episodes: result.Episodes }]
            : [],
        );

        if (validSeasons.length === 0) {
          throw new Error("No episode data found.");
        }
        setSeasons(validSeasons);
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
            : "Episode data is unavailable.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void fetchAllSeasons();
    return () => controller.abort();
  }, [hasSeasons, imdbID, total, totalSeasons]);

  if (!hasSeasons) return null;
  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (seasons.length === 0) return null;

  return (
    <div className="episodes">
      {seasons.map((season) => (
        <div key={season.Season} className="season">
          <h3>Season {season.Season}</h3>
          <ul>
            {season.Episodes.map((episode) => (
              <li key={episode.imdbID}>
                <span>
                  Ep {episode.Episode}: {episode.Title}
                </span>
                <span>IMDb {episode.imdbRating} / 10</span>
                <span>Released {episode.Released}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
