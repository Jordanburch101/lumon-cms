"use client";

export default function PageError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
        Something went wrong
      </h2>
      <button
        className="rounded-md border border-border bg-background px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors hover:bg-muted"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
