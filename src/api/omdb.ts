import type {
  OmdbMovieDetails,
  OmdbSearchResult,
  OmdbSeasonResult,
} from "../types/omdb";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...(signal ? { signal } : {}),
  });
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "The movie service is unavailable Please try again";
    throw new Error(message);
  }

  return payload as T;
}

export function searchMovies(
  query: string,
  page: number,
  signal?: AbortSignal,
): Promise<OmdbSearchResult> {
  const params = new URLSearchParams({ query, page: String(page) });
  return request(`/movies?${params.toString()}`, signal);
}

export function getMovieDetails(
  imdbID: string,
  signal?: AbortSignal,
): Promise<OmdbMovieDetails> {
  return request(`/movies/${encodeURIComponent(imdbID)}`, signal);
}

export function getSeason(
  imdbID: string,
  season: number,
  signal?: AbortSignal,
): Promise<OmdbSeasonResult> {
  return request(
    `/series/${encodeURIComponent(imdbID)}/seasons/${season}`,
    signal,
  );
}
