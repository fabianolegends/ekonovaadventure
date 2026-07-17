export function Arrow({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size}>
      <path d="M5 12h14M14 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WalkerIcon({ size = 28 }: { size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 36 36" width={size} height={size}>
      <circle cx="19.5" cy="5.2" r="3.1" fill="currentColor" />
      <path d="m15.2 11.1 4.8 2.1 5.1 5.2 5.2-3.1M16 11.5l-2.6 10.1-4.7 4.7M14 21.4l6.1 4.1v6.2M13.3 21.8l-1.7 9.7M30.4 12.7v19.1" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.7 11.7c-3.7-1.5-6.5 1.1-6.7 4.6-.2 3.8 2.4 5.5 5.3 4.4" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CyclistIcon({ size = 30 }: { size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 36 36" width={size} height={size}>
      <circle cx="9" cy="27" r="6.3" fill="none" stroke="currentColor" strokeWidth="3.2" />
      <circle cx="28" cy="27" r="6.3" fill="none" stroke="currentColor" strokeWidth="3.2" />
      <circle cx="20.5" cy="5.2" r="3.1" fill="currentColor" />
      <path d="m17 11.2 4.2 2.2 4.3 4.3h4.1M17.2 11.6l-4.4 7.1 6.6 4.1V30M12.8 18.7 9 27m10.4-4.2L28 27M9.8 16.2h6" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RouteLine() {
  return (
    <svg aria-hidden="true" className="route-line" viewBox="0 0 240 80" preserveAspectRatio="none">
      <path d="M3 65C38 65 38 13 77 16c42 4 42 56 84 48 28-5 35-32 76-34" fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="4 6" />
      <circle cx="4" cy="65" r="3" fill="currentColor" /><circle cx="237" cy="30" r="3" fill="currentColor" />
    </svg>
  );
}
