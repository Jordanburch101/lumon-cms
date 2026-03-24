export const EASE = [0.16, 1, 0.3, 1] as const;

export function fieldVariants(i: number, inView: boolean) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: inView
      ? {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: EASE, delay: 0.1 + i * 0.05 },
        }
      : {},
  };
}

export function LogoSvg({ className }: { className?: string }) {
  return (
    <svg
      aria-label="Lumon Industries logo"
      className={className}
      fill="none"
      role="img"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 40 40"
    >
      <rect height="28" rx="3" width="28" x="6" y="6" />
      <path d="M6 20h28M20 6v28" />
    </svg>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      aria-label="Loading"
      className={className ?? "h-4 w-4 animate-spin"}
      fill="none"
      role="img"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        fill="currentColor"
      />
    </svg>
  );
}
