"use client";

import Link from "next/link";

export default function PageError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]">
        System Error
      </span>
      <h2 className="font-semibold text-3xl leading-tight">
        Something went wrong
      </h2>
      <p className="max-w-md text-base text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <div className="flex items-center gap-3">
        <button
          className="rounded-md bg-primary px-4 py-2 font-mono text-primary-foreground text-xs uppercase tracking-wider transition-colors hover:bg-primary/90"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
        <Link
          className="rounded-md border border-border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors hover:bg-muted"
          href="/"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
