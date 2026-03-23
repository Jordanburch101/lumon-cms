"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useRef } from "react";
import { cn, isVideoUrl } from "@/core/lib/utils";
import { EASE } from "./auth-constants";

interface AuthLayoutProps {
  children: ReactNode;
  heading?: string;
  mediaSrc?: string;
  subtext?: string;
}

function LogoSvg({ className }: { className?: string }) {
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

export function AuthLayout({
  children,
  mediaSrc = "https://bucket.jordanburch.dev/hero-vid-new.mp4",
  heading = "Lumon Industries",
  subtext = "The work is mysterious and important.",
}: AuthLayoutProps) {
  const layoutRef = useRef<HTMLDivElement>(null);
  const inView = useInView(layoutRef, { once: true, margin: "-50px" });

  const isVideo = mediaSrc ? isVideoUrl(mediaSrc) : false;

  return (
    <div className="flex min-h-svh w-full" ref={layoutRef}>
      {/* Left panel — cinematic media (hidden below lg) */}
      <div className="relative hidden w-[45%] overflow-hidden lg:block">
        {/* Background media */}
        {mediaSrc && isVideo && (
          <video
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
            loop
            muted
            playsInline
            preload="auto"
            src={mediaSrc}
          />
        )}
        {mediaSrc && !isVideo && (
          <Image alt="" className="object-cover" fill priority src={mediaSrc} />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Grid texture */}
        <motion.div
          animate={inView ? { opacity: 0.25 } : {}}
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 50% 50% at 50% 50%, black 0%, transparent 70%)",
          }}
          transition={{ duration: 2, ease: EASE }}
        />

        {/* Text overlay at bottom */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="absolute inset-x-0 bottom-0 z-10 p-10"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
        >
          {/* Gradient divider line */}
          <motion.div
            animate={inView ? { scaleX: 1, opacity: 1 } : {}}
            className="mb-6 h-px w-full origin-left"
            initial={{ scaleX: 0, opacity: 0 }}
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.3), transparent)",
            }}
            transition={{ duration: 1, ease: EASE, delay: 0.6 }}
          />

          <Link
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
            href="/"
          >
            <LogoSvg className="h-8 w-8 shrink-0 text-white/70" />
            <div>
              <h2 className="font-semibold text-lg text-white tracking-tight">
                {heading}
              </h2>
              <p className="text-sm text-white/50">{subtext}</p>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Right panel — form area */}
      <motion.div
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className={cn(
          "relative flex w-full flex-col items-center justify-center bg-background px-6 py-12",
          "lg:w-[55%]"
        )}
        initial={{ opacity: 0, y: 24 }}
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
    </div>
  );
}
