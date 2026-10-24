export function Logo() {
  return (
    <a className="logo" href="/" aria-label="usePopcorn home">
      <svg aria-hidden="true" viewBox="0 0 34 34" fill="none">
        <path d="M9.2 6.2h15.6l2.1 21.4H7.1L9.2 6.2Z" fill="currentColor" />
        <path
          d="m9.2 6.2 5.1 21.4M16.9 6.2l.2 21.4m7.7-21.4-5.1 21.4"
          stroke="#171719"
          strokeWidth="1.4"
        />
        <path d="m14.1 12.2 7.1 4.6-7.1 4.7v-9.3Z" fill="#171719" />
      </svg>
      <span>usePopcorn</span>
    </a>
  );
}
