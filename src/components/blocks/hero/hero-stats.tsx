"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { type PointerEvent, useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import { getBlurDataURL, getMediaUrl, isVideoUrl } from "@/core/lib/utils";
import type { HeroStatsBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;

function TiltPanel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [2, -2]), {
    stiffness: 200,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2, 2]), {
    stiffness: 200,
    damping: 30,
  });

  function handlePointerMove(e: PointerEvent) {
    const el = ref.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      className="relative"
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      ref={ref}
      style={{ perspective: 1000, rotateX, rotateY }}
    >
      {children}
    </motion.div>
  );
}

export function HeroStats({
  mediaSrc,
  posterSrc,
  headline,
  subtext,
  stats,
  primaryCta,
  secondaryCta,
}: HeroStatsBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const url = getMediaUrl(mediaSrc);
  const blurDataURL = getBlurDataURL(mediaSrc);
  const posterUrl = getMediaUrl(posterSrc);
  const isVideo = url ? isVideoUrl(url) : false;
  const hasStats = stats && stats.length > 0;

  return (
    <section className="w-full py-24 lg:py-32" ref={sectionRef}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16 lg:px-6">
        {/* Left: Text */}
        <div className="flex flex-col">
          <motion.h1
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="font-semibold text-4xl leading-tight sm:text-5xl lg:text-6xl"
            data-field="headline"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {headline}
          </motion.h1>

          <motion.p
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="mt-4 max-w-lg text-base text-muted-foreground lg:text-lg"
            data-field="subtext"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          >
            {subtext}
          </motion.p>

          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          >
            <CMSLink
              data-field-group="primaryCta"
              data-field-group-type="link"
              link={primaryCta}
            />
            <CMSLink
              data-field-group="secondaryCta"
              data-field-group-type="link"
              link={secondaryCta}
            />
          </motion.div>
        </div>

        {/* Right: Stats or Media */}
        <TiltPanel>
          {hasStats ? (
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 lg:p-8">
              {/* Live Metrics badge */}
              <motion.div
                animate={{ opacity: [1, 0.6, 1] }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1"
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="font-medium text-muted-foreground text-xs">
                  Live Metrics
                </span>
              </motion.div>

              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, i) => (
                  <motion.div
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    className="flex flex-col"
                    data-array-item={`stats.${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    key={stat.id ?? `${stat.value}-${i}`}
                    transition={{
                      duration: 0.6,
                      ease: EASE,
                      delay: 0.15 * i,
                    }}
                  >
                    <span
                      className="font-semibold text-3xl tracking-tight lg:text-4xl"
                      data-field={`stats.${i}.value`}
                    >
                      {stat.value}
                    </span>
                    <span
                      className="mt-1 text-muted-foreground text-sm"
                      data-field={`stats.${i}.label`}
                    >
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
              {url && isVideo && (
                <video
                  autoPlay
                  className="h-full w-full object-cover"
                  data-field="mediaSrc"
                  loop
                  muted
                  playsInline
                  poster={posterUrl || blurDataURL || undefined}
                  preload="auto"
                  src={url}
                />
              )}
              {url && !isVideo && (
                <Image
                  alt="Hero media"
                  blurDataURL={blurDataURL}
                  className="object-cover"
                  data-field="mediaSrc"
                  fill
                  placeholder={blurDataURL ? "blur" : "empty"}
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src={url}
                />
              )}
            </div>
          )}
        </TiltPanel>
      </div>
    </section>
  );
}
