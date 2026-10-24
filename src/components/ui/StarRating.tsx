import { useId, useState } from "react";

interface StarRatingProps {
  maxRating?: number;
  defaultRating?: number;
  onSetRating: (rating: number) => void;
}

export default function StarRating({
  maxRating = 10,
  defaultRating = 0,
  onSetRating,
}: StarRatingProps) {
  const [rating, setRating] = useState(defaultRating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const ratingName = useId();
  const displayedRating = hoverRating ?? rating;

  function handleRating(value: number): void {
    setRating(value);
    setHoverRating(null);
    onSetRating(value);
  }

  return (
    <fieldset className="rating-fieldset">
      <legend>Your rating</legend>
      <div className="star-rating" onMouseLeave={() => setHoverRating(null)}>
        {Array.from({ length: maxRating }, (_, index) => {
          const value = index + 1;
          return (
            <label
              className={`rating-option${value <= displayedRating ? " is-filled" : ""}`}
              key={value}
              onMouseEnter={() => setHoverRating(value)}
            >
              <input
                type="radio"
                name={ratingName}
                value={value}
                checked={rating === value}
                onChange={() => handleRating(value)}
                onFocus={() => setHoverRating(null)}
              />
              <span className="star-mark" aria-hidden="true">
                ★
              </span>
              <span className="sr-only">
                {value} out of {maxRating}
              </span>
            </label>
          );
        })}
      </div>
      <p className="rating-value" aria-live="polite">
        {rating > 0 ? `${rating} / ${maxRating}` : "Choose a rating"}
      </p>
    </fieldset>
  );
}
