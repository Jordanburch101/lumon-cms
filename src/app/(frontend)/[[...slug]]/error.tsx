"use client";

import { motion } from "motion/react";
import Link from "next/link";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function PageError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]">
          Error
        </p>
        <h1 className="mt-3 font-semibold text-3xl leading-tight sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          An unexpected error occurred.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            className="text-muted-foreground text-sm underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground/50"
            onClick={reset}
            type="button"
          >
            Try again
          </button>
          <Link
            className="text-muted-foreground text-sm underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground/50"
            href="/"
          >
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
