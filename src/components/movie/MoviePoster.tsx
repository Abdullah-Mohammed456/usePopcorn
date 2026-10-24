import { useState } from "react";

interface MoviePosterProps {
  poster: string;
  title: string;
  eager?: boolean;
  className?: string;
}

export function MoviePoster({
  poster,
  title,
  eager = false,
  className = "",
}: MoviePosterProps) {
  const [failed, setFailed] = useState(false);
  const hasPoster = poster !== "N/A" && poster.trim().length > 0 && !failed;

  return (
    <div className={`poster-frame ${className}`}>
      {hasPoster ? (
        <img
          src={poster}
          alt={`${title} poster`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "auto"}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="poster-fallback" role="img" aria-label={`Poster unavailable for ${title}`}>
          {title}
        </span>
      )}
    </div>
  );
}
