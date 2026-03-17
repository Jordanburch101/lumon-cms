"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { CMSLink } from "@/components/ui/cms-link";
import { useNearViewport } from "@/core/hooks/use-near-viewport";
import { cn, getBlurDataURL, getMediaUrl, isVideoUrl } from "@/core/lib/utils";
import type { SplitMediaBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;

/** A single row from the CMS block data. */
type SplitMediaRow = SplitMediaBlock["rows"][number];

function SplitRowItem({ row, index }: { index: number; row: SplitMediaRow }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rowRef, { once: true, margin: "-100px" });
  const isNearViewport = useNearViewport(rowRef);
  const mediaSrc = getMediaUrl(row.mediaSrc);
  const blurDataURL = getBlurDataURL(row.mediaSrc);
  const isVideo = isVideoUrl(mediaSrc);
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
            data-field={`rows.${index}.mediaSrc`}
            loop
            muted
            playsInline
            preload="none"
            src={isNearViewport ? mediaSrc : undefined}
          />
        ) : (
          <Image
            alt={row.mediaAlt}
            blurDataURL={blurDataURL}
            className="object-cover brightness-75"
            data-field={`rows.${index}.mediaSrc`}
            fill
            placeholder={blurDataURL ? "blur" : "empty"}
            sizes="(max-width: 1024px) 100vw, 65vw"
            src={mediaSrc}
          />
        )}
      </motion.div>

      {/* Bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
        <div className="flex items-center gap-2">
          <span
            className="font-medium text-sm text-white"
            data-field={`rows.${index}.mediaOverlay.title`}
          >
            {row.mediaOverlay.title}
          </span>
          {row.mediaOverlay.badge && (
            <Badge className="bg-white/20 text-[10px] text-white">
              <span data-field={`rows.${index}.mediaOverlay.badge`}>
                {row.mediaOverlay.badge}
              </span>
            </Badge>
          )}
        </div>
        <p
          className="mt-1 text-white/60 text-xs leading-relaxed"
          data-field={`rows.${index}.mediaOverlay.description`}
        >
          {row.mediaOverlay.description}
        </p>
      </div>
    </motion.div>
  );

  const text = (
    <motion.div
      animate={inView ? { x: 0 } : {}}
      className={cn(
        // Mobile: inline content, no card treatment
        "flex flex-col justify-center px-2 py-8",
        // Desktop: overlapping liquid glass card (no opacity animation — keeps backdrop-filter active)
        "lg:relative lg:z-10 lg:self-center lg:overflow-hidden lg:rounded-2xl lg:p-0",
        mediaFirst ? "lg:-ml-16" : "lg:-mr-16",
        !mediaFirst && "order-1 lg:order-0"
      )}
      initial={{ x: textSlideX }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
    >
      {/* Liquid glass layers (desktop only) */}
      <div className="pointer-events-none hidden lg:block">
        <div className="liquid-glass-effect absolute inset-0 rounded-2xl" />
        <div className="liquid-glass-tint absolute inset-0 rounded-2xl" />
        <div className="liquid-glass-shine absolute inset-0 rounded-2xl" />
      </div>

      {/* Content — sits above glass layers, fades in independently */}
      <motion.div
        animate={inView ? { opacity: 1 } : {}}
        className="relative z-10 flex flex-col justify-center lg:p-12"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
      >
        {/* Eyebrow label (replaces step numbers) */}
        <motion.span
          animate={inView ? { opacity: 1 } : {}}
          className="mb-4 font-medium text-[11px] text-muted-foreground/50 uppercase tracking-[0.2em]"
          data-field={`rows.${index}.mediaLabel`}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {row.mediaLabel}
        </motion.span>

        <motion.h3
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="font-semibold text-2xl leading-snug tracking-tight sm:text-3xl lg:text-4xl"
          data-field={`rows.${index}.headline`}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
        >
          {row.headline}
        </motion.h3>

        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mt-4 max-w-md text-base text-muted-foreground leading-relaxed lg:mt-6 lg:text-foreground/80 lg:text-lg"
          data-field={`rows.${index}.body`}
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
        >
          {row.body}
        </motion.p>

        {row.cta?.label && (
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="mt-6 lg:mt-8"
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.55 }}
          >
            <CMSLink
              className="group text-foreground"
              data-field-group={`rows.${index}.cta`}
              data-field-group-type="link"
              link={row.cta}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <div
      className={cn(
        "grid grid-cols-1 items-stretch gap-6",
        "lg:min-h-[580px] lg:gap-0",
        mediaFirst ? "lg:grid-cols-[1fr_0.6fr]" : "lg:grid-cols-[0.6fr_1fr]"
      )}
      data-array-item={`rows.${index}`}
      ref={rowRef}
    >
      {media}
      {text}
    </div>
  );
}

export function SplitMedia({ rows }: SplitMediaBlock) {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex flex-col gap-24 lg:gap-32">
          {rows.map((row, i) => (
            <SplitRowItem index={i} key={row.id ?? row.headline} row={row} />
          ))}
        </div>
      </div>
    </section>
  );
}
