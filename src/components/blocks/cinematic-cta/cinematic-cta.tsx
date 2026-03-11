"use client";

import { VolumeHighIcon, VolumeMute02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import Link from "next/link";
import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { getMediaUrl } from "@/core/lib/utils";
import type { CinematicCtaBlock } from "@/types/block-types";

export function CinematicCta({
  videoSrc,
  label,
  headline,
  subtext,
  cta,
}: CinematicCtaBlock) {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);

  // Sync muted/volume state to the video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.muted = muted;
    video.volume = volume;
  }, [muted, volume]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  const setVolumeFromPointer = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const rect = track.getBoundingClientRect();
    const v = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setVolume(v);
    setMuted(v === 0);
  }, []);

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setVolumeFromPointer(e.clientX);
    },
    [setVolumeFromPointer]
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (e.buttons === 0) {
        return;
      }
      setVolumeFromPointer(e.clientX);
    },
    [setVolumeFromPointer]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const step = 0.05;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        const v = Math.min(1, volume + step);
        setVolume(v);
        setMuted(v === 0);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        const v = Math.max(0, volume - step);
        setVolume(v);
        setMuted(v === 0);
      }
    },
    [volume]
  );

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  // Curtain animation: starts as section enters viewport, fully open by 60%
  const clipAmount = useTransform(scrollYProgress, [0, 0.6], [0, 100]);
  const leftClipPath = useTransform(clipAmount, (v) => `inset(0 ${v}% 0 0)`);
  const rightClipPath = useTransform(clipAmount, (v) => `inset(0 0 0 ${v}%)`);

  // Track when the video is visible enough for controls to be usable
  const [videoVisible, setVideoVisible] = useState(false);
  useMotionValueEvent(clipAmount, "change", (v) => setVideoVisible(v > 80));

  const videoUrl = getMediaUrl(videoSrc);

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
        {/* scale-125 compensates for residual black bar artifacts in the source video */}
        <video
          autoPlay
          className="absolute inset-0 h-full w-full scale-125 object-cover"
          loop
          muted
          playsInline
          preload="metadata"
          ref={videoRef}
          src={videoUrl}
        />

        {/* Gradient overlay on video */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />

        {/* Text overlay (centered) */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4">
          <motion.span
            className="block font-medium text-[11px] text-white/50 uppercase tracking-[0.2em]"
            style={{ opacity: textOpacity, y: textY }}
          >
            {label}
          </motion.span>
          <motion.p
            className="mt-4 max-w-lg text-center font-light text-white/85 text-xl italic leading-relaxed lg:text-2xl"
            style={{ opacity: textOpacity, y: textY }}
          >
            &ldquo;{headline}&rdquo;
          </motion.p>
          <motion.span
            className="mt-3 block text-[11px] text-white/30 uppercase tracking-[0.2em]"
            style={{ opacity: textOpacity, y: textY }}
          >
            {subtext}
          </motion.span>

          {/* CTA button */}
          {cta.label && cta.href && (
            <motion.div style={{ opacity: textOpacity, y: textY }}>
              <Button
                asChild
                className="mt-6 bg-white text-black hover:bg-white/90"
                size="lg"
              >
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            </motion.div>
          )}

          {/* Glass audio control — only interactive when video is visible */}
          <motion.div
            aria-hidden={!videoVisible}
            className="group relative mt-8 flex items-center overflow-hidden rounded-full transition-all duration-300 ease-out hover:px-4 hover:py-2.5"
            style={{
              opacity: textOpacity,
              y: textY,
              pointerEvents: videoVisible ? "auto" : "none",
            }}
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
              {/* Custom slider — thin track + small circle thumb */}
              <div
                aria-label="Volume"
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={Math.round((muted ? 0 : volume) * 100)}
                className="relative h-6 w-full cursor-pointer touch-none select-none"
                onKeyDown={onKeyDown}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                ref={trackRef}
                role="slider"
                tabIndex={videoVisible ? 0 : -1}
              >
                {/* Track background */}
                <div className="absolute top-1/2 right-0 left-0 h-[2px] -translate-y-1/2 rounded-full bg-white/20" />
                {/* Track fill */}
                <div
                  className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 rounded-full bg-white/60"
                  style={{ width: `${(muted ? 0 : volume) * 100}%` }}
                />
                {/* Thumb */}
                <div
                  className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-150 hover:scale-125"
                  style={{
                    left: `clamp(0px, calc(${(muted ? 0 : volume) * 100}% - 5px), calc(100% - 10px))`,
                  }}
                />
              </div>
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
