import type { Dispatch, RefObject, SetStateAction } from "react";

interface SearchBarProps {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  inputRef: RefObject<HTMLInputElement | null>;
}

export function SearchBar({ query, setQuery, inputRef }: SearchBarProps) {
  return (
    <div className="search-wrap">
      <svg className="search-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <circle cx="10.8" cy="10.8" r="6.7" stroke="currentColor" strokeWidth="1.8" />
        <path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <label className="sr-only" htmlFor="movie-search">
        Search movies and series
      </label>
      <input
        ref={inputRef}
        id="movie-search"
        className="search"
        type="search"
        placeholder="Search movies and series"
        value={query}
        autoComplete="off"
        onChange={(event) => setQuery(event.target.value)}
      />
      {query && (
        <button
          className="search-clear"
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
        >
          Clear
        </button>
      )}
    </div>
  );
}
