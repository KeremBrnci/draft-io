/** Minimal generic football icon for card footer branding. */
export function CardFootballIcon(): React.ReactElement {
  return (
    <svg
      className="fc-card__football-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 4.2l2.15 3.32 3.78 1.08-2.48 3.05.58 3.82L12 14.6l-4.03 1.89.58-3.82-2.48-3.05 3.78-1.08L12 4.2z"
        stroke="currentColor"
        strokeWidth="1.1"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path
        d="M12 4.2v10.4M6.05 8.95h11.9M7.35 15.05l9.3-5.3M16.65 15.05l-9.3-5.3"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
