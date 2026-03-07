"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/core/lib/utils";
import { type SplitRow, splitMediaRows } from "./split-media-data";

const VIDEO_RE = /\.(mp4|webm|ogg)$/i;
const EASE = [0.16, 1, 0.3, 1] as const;

function SplitRowItem({ row, index }: { row: SplitRow; index: number }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rowRef, { once: true, margin: "-100px" });
  const isVideo = VIDEO_RE.test(row.mediaSrc);
  const mediaFirst = index % 2 === 0;

  // Detect desktop for parallax (mobile gets no parallax per spec)
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Parallax: media drifts as the row scrolls through the viewport
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const staticY = useMotionValue(0);
  const mediaY = isDesktop ? parallaxY : staticY;

  // Text slides in from the overlap direction
  const textSlideX = mediaFirst ? -40 : 40;

  const media = (
    <motion.div
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-muted",
        "aspect-[4/3] lg:aspect-auto lg:h-full",
        !mediaFirst && "order-0 lg:order-1"
      )}
      initial={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
    >
      {/* Color overlay */}
      <div className="absolute inset-0 z-10 bg-primary opacity-20 mix-blend-color" />

      {/* Media with parallax (desktop only via CSS containment) */}
      <motion.div
        className="absolute inset-0 lg:-inset-20"
        style={{ y: mediaY }}
      >
        {isVideo ? (
          <video
            autoPlay
            className="h-full w-full object-cover brightness-75"
            loop
            muted
            playsInline
            src={row.mediaSrc}
          />
        ) : (
          <Image
            alt={row.mediaAlt}
            className="object-cover brightness-75"
            fill
            sizes="(max-width: 1024px) 100vw, 65vw"
            src={row.mediaSrc}
          />
        )}
      </motion.div>

      {/* Category label */}
      <span className="absolute top-4 left-4 z-20 text-[11px] text-white/50 uppercase tracking-wider">
        {row.mediaLabel}
      </span>

      {/* Bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">
            {row.mediaOverlay.title}
          </span>
          <Badge className="bg-white/20 text-[10px] text-white">
            {row.mediaOverlay.badge}
          </Badge>
        </div>
        <p className="mt-1 text-white/60 text-xs leading-relaxed">
          {row.mediaOverlay.description}
        </p>
      </div>
    </motion.div>
  );

  const text = (
    <motion.div
      animate={inView ? { opacity: 1, x: 0 } : {}}
      className={cn(
        // Mobile: inline content, no card treatment
        "flex flex-col justify-center px-2 py-8",
        // Desktop: overlapping liquid glass card
        "lg:relative lg:z-10 lg:self-center lg:overflow-hidden lg:rounded-2xl lg:p-0",
        mediaFirst ? "lg:-ml-16" : "lg:-mr-16",
        !mediaFirst && "order-1 lg:order-0"
      )}
      initial={{ opacity: 0, x: textSlideX }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
    >
      {/* Liquid glass layers (desktop only) */}
      <div className="pointer-events-none hidden lg:block">
        <div className="liquid-glass-effect absolute inset-0 rounded-2xl" />
        <div className="liquid-glass-tint absolute inset-0 rounded-2xl" />
        <div className="liquid-glass-shine absolute inset-0 rounded-2xl" />
      </div>

      {/* Content — sits above glass layers */}
      <div className="relative z-10 flex flex-col justify-center lg:p-12">
        {/* Eyebrow label (replaces step numbers) */}
        <motion.span
          animate={inView ? { opacity: 1 } : {}}
          className="mb-4 font-medium text-[11px] text-muted-foreground/50 uppercase tracking-[0.2em]"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {row.mediaLabel}
        </motion.span>

        <motion.h3
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="font-semibold text-2xl leading-snug tracking-tight sm:text-3xl lg:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
        >
          {row.headline}
        </motion.h3>

        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mt-4 max-w-md text-base text-muted-foreground leading-relaxed lg:mt-6 lg:text-foreground/80 lg:text-lg"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
        >
          {row.body}
        </motion.p>

        {row.cta && (
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="mt-6 lg:mt-8"
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.55 }}
          >
            <Link
              className="group inline-flex items-center gap-2 font-medium text-foreground text-sm transition-colors hover:text-foreground/70"
              href={row.cta.href}
            >
              {row.cta.label}
              <HugeiconsIcon
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                icon={ArrowRight01Icon}
              />
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div
      className={cn(
        "grid grid-cols-1 items-stretch gap-6",
        "lg:min-h-[580px] lg:gap-0",
        mediaFirst ? "lg:grid-cols-[1fr_0.6fr]" : "lg:grid-cols-[0.6fr_1fr]"
      )}
      ref={rowRef}
    >
      {media}
      {text}
    </div>
  );
}

export function SplitMedia() {
  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex flex-col gap-24 lg:gap-32">
          {splitMediaRows.map((row, i) => (
            <SplitRowItem index={i} key={row.headline} row={row} />
          ))}
        </div>
      </div>
    </section>
  );
}
