export interface OmdbMovieSummary {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
}

export interface OmdbMovieDetails extends OmdbMovieSummary {
  Response?: "True" | "False";
  Error?: string;
  Runtime?: string;
  Plot?: string;
  Released?: string;
  Actors?: string;
  Director?: string;
  Genre?: string;
  imdbRating?: string;
  totalSeasons?: string;
}

export interface OmdbSearchResult {
  Response: "True" | "False";
  Search?: OmdbMovieSummary[];
  totalResults?: string;
  Error?: string;
}

export interface OmdbSeason {
  Season: string;
  Episodes: Array<{
    imdbID: string;
    Episode: string;
    Title: string;
    imdbRating: string;
    Released: string;
  }>;
}

export interface OmdbSeasonResult {
  Response: "True" | "False";
  Season?: string;
  Episodes?: OmdbSeason["Episodes"];
  Error?: string;
}

export interface WatchedMovie {
  imdbID: string;
  title: string;
  year: string;
  poster: string;
  imdbRating: number;
  runtime: number;
  userRating: number;
}
