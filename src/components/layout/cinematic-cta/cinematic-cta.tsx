"use client";

import { VolumeHighIcon, VolumeMute02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useScroll, useTransform } from "motion/react";
import { useCallback, useRef, useState } from "react";

import { cinematicCtaData } from "./cinematic-cta-data";

export function CinematicCta() {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    const next = !muted;
    video.muted = next;
    if (!next) {
      video.volume = volume;
    }
    setMuted(next);
  }, [muted, volume]);

  const handleVolume = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoRef.current;
      if (!video) {
        return;
      }
      const v = Number.parseFloat(e.target.value);
      setVolume(v);
      video.volume = v;
      if (v === 0) {
        video.muted = true;
        setMuted(true);
      } else if (muted) {
        video.muted = false;
        setMuted(false);
      }
    },
    [muted]
  );

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  // Curtain animation: starts as section enters viewport, fully open by 60%
  const clipAmount = useTransform(scrollYProgress, [0, 0.6], [0, 100]);
  const leftClipPath = useTransform(clipAmount, (v) => `inset(0 ${v}% 0 0)`);
  const rightClipPath = useTransform(clipAmount, (v) => `inset(0 0 0 ${v}%)`);

  // Text fades in after curtains are mostly open
  const textOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.5, 0.7], [20, 0]);

  return (
    <section
      className="relative h-[200vh] bg-black"
      data-navbar-contrast="light"
      ref={containerRef}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Video layer (behind everything) */}
        <video
          autoPlay
          className="absolute inset-0 h-full w-full scale-125 object-cover"
          loop
          muted
          playsInline
          preload="none"
          ref={videoRef}
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

          {/* Glass audio control */}
          <motion.div
            className="group relative mt-8 flex items-center overflow-hidden rounded-full transition-all duration-300 ease-out hover:px-4 hover:py-2.5"
            style={{ opacity: textOpacity, y: textY }}
          >
            {/* Glass layers */}
            <div className="absolute inset-0 rounded-full backdrop-blur-xl backdrop-saturate-150" />
            <div className="absolute inset-0 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_1px_1px_1px_0_rgba(255,255,255,0.2),inset_-1px_-1px_1px_0_rgba(255,255,255,0.1)]" />

            {/* Content */}
            <button
              className="relative z-10 flex size-10 shrink-0 items-center justify-center text-white/70 transition-colors hover:text-white"
              onClick={toggleMute}
              type="button"
            >
              <HugeiconsIcon
                className="size-4"
                icon={muted ? VolumeMute02Icon : VolumeHighIcon}
              />
            </button>

            <div className="relative z-10 flex w-0 items-center overflow-hidden transition-all duration-300 ease-out group-hover:w-24 group-hover:pr-3">
              <input
                className="h-6 w-full cursor-pointer appearance-none rounded-full bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/20 [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                max="1"
                min="0"
                onChange={handleVolume}
                step="0.01"
                type="range"
                value={muted ? 0 : volume}
              />
            </div>
          </motion.div>
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
