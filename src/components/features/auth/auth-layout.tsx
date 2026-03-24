"use client";

import { motion, useInView } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useRef } from "react";
import { EASE, LogoSvg } from "./auth-constants";

/**
 * Right panel content wrapper for auth pages.
 * The left cinematic panel lives in (auth)/layout.tsx and persists across routes.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      animate={inView ? { opacity: 1, y: 0 } : {}}
      className="relative flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-[55%]"
      initial={{ opacity: 0, y: 24 }}
      ref={ref}
      transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
    >
      {/* Back to site */}
      <Link
        className="absolute top-6 right-6 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.15em] transition-colors hover:text-foreground"
        href="/"
      >
        &larr; Back to site
      </Link>

      {/* Mobile-only logo */}
      <Link className="mb-8 lg:hidden" href="/">
        <LogoSvg className="h-10 w-10 text-foreground" />
      </Link>

      {/* Centered content slot */}
      <div className="w-full max-w-[380px]">{children}</div>
    </motion.div>
  );
}
