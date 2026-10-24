export function Loading() {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <span>Loading titles...</span>
    </div>
  );
}
