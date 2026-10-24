import { useEffect, useRef, useState } from "react";
import { NavBar } from "./components/layout/NavBar";
import { NumResults } from "./components/layout/NumResults";
import { SearchBar } from "./components/layout/SearchBar";
import { SearchPagination } from "./components/layout/SearchPagination";
import { Main } from "./components/layout/Main";
import { Logo } from "./components/ui/Logo";
import { Loading } from "./components/ui/Loading";
import { ErrorMessage } from "./components/ui/ErrorMessage";
import { MovieList } from "./components/movie/MovieList";
import { MovieDetails } from "./components/movie/MovieDetails";
import { Spotlight } from "./components/movie/Spotlight";
import { WatchedMovies } from "./components/watched/WatchedMovies";
import { useMovies } from "./hooks/useMovies";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import { MIN_SEARCH_LENGTH } from "./constants";
import type { WatchedMovie } from "./types/omdb";

type Page = "discover" | "collection";

export default function App() {
  const [query, setQuery] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState<Page>("discover");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const motionRootRef = useRef<HTMLDivElement>(null);
  const [watched, setWatched] = useLocalStorageState<WatchedMovie[]>(
    [],
    "watched",
  );
  const { movies, totalResults, loading, error } = useMovies(query, searchPage);
  const hasSearch = query.length >= MIN_SEARCH_LENGTH;

  function handleSelectedMovie(id: string): void {
    setSelectedId(id);
  }

  function handleAddWatched(movie: WatchedMovie): void {
    setWatched((current) => {
      const existingIndex = current.findIndex(
        (item) => item.imdbID === movie.imdbID,
      );

      if (existingIndex === -1) return [...current, movie];

      return current.map((item, index) =>
        index === existingIndex ? movie : item,
      );
    });
  }

  function handleDeleteMovie(id: string): void {
    setWatched((current) => current.filter((movie) => movie.imdbID !== id));
  }

  function focusSearch(): void {
    setPage("discover");
    searchInputRef.current?.focus();
  }

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    let disposed = false;
    let context: { revert: () => void } | undefined;
    const handleMotionPreference = (event: MediaQueryListEvent): void => {
      if (event.matches) context?.revert();
    };
    reduceMotion.addEventListener("change", handleMotionPreference);

    async function addScrollMotion(): Promise<void> {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

        if (disposed || !motionRootRef.current) return;
        gsap.registerPlugin(ScrollTrigger);
        context = gsap.context(() => {
          const spotlight =
            motionRootRef.current?.querySelector(".spotlight-copy");
          if (spotlight) {
            gsap.fromTo(
              spotlight,
              { y: 12, opacity: 0.82 },
              { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" },
            );
          }

          motionRootRef.current
            ?.querySelectorAll<HTMLElement>("[data-scroll-marker]")
            .forEach((marker) => {
              gsap.fromTo(
                marker,
                { scaleX: 0.25 },
                {
                  scaleX: 1,
                  duration: 0.4,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: marker,
                    start: "top 88%",
                    once: true,
                  },
                },
              );
            });
        }, motionRootRef);
      } catch {
        // Motion is progressive enhancement; the complete interface stays visible without it.
      }
    }

    void addScrollMotion();
    return () => {
      disposed = true;
      reduceMotion.removeEventListener("change", handleMotionPreference);
      context?.revert();
    };
  }, [page, hasSearch]);

  const validQuery = query.trim().length >= MIN_SEARCH_LENGTH;

  return (
    <>
      <div
        className="site-shell"
        ref={motionRootRef}
        aria-hidden={selectedId ? true : undefined}
        inert={selectedId !== null}
      >
        <NavBar>
          <Logo />
          <nav className="nav-links" aria-label="Main navigation">
            <button
              className={
                page === "discover" ? "nav-link is-active" : "nav-link"
              }
              aria-current={page === "discover" ? "page" : undefined}
              onClick={() => setPage("discover")}
              type="button"
            >
              Discover
            </button>
            <button
              className={
                page === "collection" ? "nav-link is-active" : "nav-link"
              }
              aria-current={page === "collection" ? "page" : undefined}
              onClick={() => setPage("collection")}
              type="button"
            >
              My list <span className="nav-count">{watched.length}</span>
            </button>
          </nav>
          <SearchBar
            query={query}
            setQuery={(nextQuery) => {
              setPage("discover");
              setSearchPage(1);
              setQuery(nextQuery);
            }}
            inputRef={searchInputRef}
          />
          {page === "discover" && validQuery && (
            <NumResults
              totalResults={totalResults}
              page={searchPage}
              loading={loading}
            />
          )}
        </NavBar>

        <Main>
          {page === "discover" ? (
            <div className="page-content">
              {!validQuery && (
                <Spotlight
                  watched={watched}
                  onFocusSearch={focusSearch}
                  onSelectedId={handleSelectedMovie}
                />
              )}

              {validQuery && !loading && !error && movies[0] && (
                <Spotlight
                  watched={watched}
                  featured={movies[0]}
                  onFocusSearch={focusSearch}
                  onSelectedId={handleSelectedMovie}
                />
              )}

              {validQuery && (loading || error || movies.length === 0) && (
                <h1 className="sr-only">Search results for {query.trim()}</h1>
              )}

              {query.trim().length > 0 && !validQuery && (
                <p className="search-hint" role="status">
                  Enter at least {MIN_SEARCH_LENGTH} characters to search
                  titles
                </p>
              )}

              {validQuery && (
                <section
                  className="content-section"
                  aria-labelledby="results-title"
                >
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Movies & series</p>
                      <h2 id="results-title">
                        Results for{" "}
                        <span className="query-label">“{query.trim()}”</span>
                      </h2>
                    </div>
                    <span
                      className="section-marker"
                      data-scroll-marker
                      aria-hidden="true"
                    />
                  </div>

                  {loading ? (
                    <Loading />
                  ) : error ? (
                    <ErrorMessage message={error} />
                  ) : movies.length > 0 ? (
                    <>
                      <MovieList
                        movies={movies}
                        onSelectedId={handleSelectedMovie}
                      />
                      <SearchPagination
                        page={searchPage}
                        totalResults={totalResults}
                        loading={loading}
                        onPageChange={setSearchPage}
                      />
                    </>
                  ) : (
                    <p className="empty-state">
                      No titles found Try another title or search term
                    </p>
                  )}
                </section>
              )}

              {watched.length > 0 && (
                <WatchedMovies
                  watched={watched}
                  onDeleteMovie={handleDeleteMovie}
                  onSelectedId={handleSelectedMovie}
                  title="From your collection"
                  showSummary={false}
                />
              )}
            </div>
          ) : (
            <div className="page-content">
              {watched.length > 0 ? (
                <WatchedMovies
                  watched={watched}
                  onDeleteMovie={handleDeleteMovie}
                  onSelectedId={handleSelectedMovie}
                  title="My list"
                  showSummary
                />
              ) : (
                <div className="collection-empty">
                  <h1>Your list starts with a movie or series</h1>
                  <p>
                    Search for a title, open its details, and save your rating
                    here
                  </p>
                  <button
                    className="button button-primary"
                    onClick={focusSearch}
                    type="button"
                  >
                    Explore titles
                  </button>
                </div>
              )}
            </div>
          )}
        </Main>
      </div>
      {selectedId && (
        <MovieDetails
          key={selectedId}
          selectedId={selectedId}
          onCloseMovie={() => setSelectedId(null)}
          onAddWatched={handleAddWatched}
          inOurList={watched.some((movie) => movie.imdbID === selectedId)}
        />
      )}
    </>
  );
}
