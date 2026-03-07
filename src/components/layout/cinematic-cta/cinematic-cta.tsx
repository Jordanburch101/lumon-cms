"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { cinematicCtaData } from "./cinematic-cta-data";

export function CinematicCta() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Curtain animation: 0-70% of scroll drives the curtain opening
  const leftClip = useTransform(scrollYProgress, [0, 0.7], [0, 50]);
  const leftClipPath = useTransform(leftClip, (v) => `inset(0 ${v}% 0 0)`);

  const rightClip = useTransform(scrollYProgress, [0, 0.7], [0, 50]);
  const rightClipPath = useTransform(rightClip, (v) => `inset(0 0 0 ${v}%)`);

  // Text fades in after curtains are ~80% open (scroll 0.55 -> 0.75)
  const textOpacity = useTransform(scrollYProgress, [0.55, 0.75], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.55, 0.75], [20, 0]);

  return (
    <section
      className="relative bg-black"
      data-navbar-contrast="light"
      ref={containerRef}
      style={{ height: "250vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Video layer (behind everything) */}
        <video
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          src={cinematicCtaData.videoSrc}
        />

        {/* Gradient overlay on video */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />

        {/* Text overlay (centered) */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4">
          <motion.span
            className="block font-medium text-[11px] text-white/50 uppercase tracking-[0.2em]"
            style={{ opacity: textOpacity, y: textY }}
          >
            {cinematicCtaData.label}
          </motion.span>
          <motion.p
            className="mt-4 max-w-lg text-center font-light text-white/85 text-xl italic leading-relaxed lg:text-2xl"
            style={{ opacity: textOpacity, y: textY }}
          >
            &ldquo;{cinematicCtaData.headline}&rdquo;
          </motion.p>
          <motion.span
            className="mt-3 block text-[11px] text-white/30 uppercase tracking-[0.2em]"
            style={{ opacity: textOpacity, y: textY }}
          >
            {cinematicCtaData.subtext}
          </motion.span>
        </div>

        {/* Left curtain */}
        <motion.div
          className="absolute inset-0 z-20 bg-background"
          style={{ clipPath: leftClipPath }}
        />

        {/* Right curtain */}
        <motion.div
          className="absolute inset-0 z-20 bg-background"
          style={{ clipPath: rightClipPath }}
        />
      </div>
    </section>
  );
}
