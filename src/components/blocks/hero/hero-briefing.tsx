"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import { getBlurDataURL, getMediaUrl, isVideoUrl } from "@/core/lib/utils";
import type { ExtractHeroBlock } from "@/types/block-types";

type HeroBriefingBlock = ExtractHeroBlock<"heroBriefing">;

const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroBriefing({
  eyebrow,
  headline,
  subtext,
  mediaSrc,
  posterSrc,
  primaryCta,
  secondaryCta,
}: HeroBriefingBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const url = getMediaUrl(mediaSrc);
  const blurDataURL = getBlurDataURL(mediaSrc);
  const posterUrl = getMediaUrl(posterSrc);
  const isVideo = url ? isVideoUrl(url) : false;

  return (
    <section className="w-full py-24 lg:py-32" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Cinematic letterbox image */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border/50 lg:aspect-[21/9]"
          initial={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
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
              alt={headline || "Department image"}
              blurDataURL={blurDataURL}
              className="object-cover"
              data-field="mediaSrc"
              fill
              placeholder={blurDataURL ? "blur" : "empty"}
              priority
              sizes="100vw"
              src={url}
            />
          )}
          {/* Bottom gradient fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
        </motion.div>

        {/* Text below image */}
        <div className="mt-6 lg:mt-8">
          <motion.span
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
            data-field="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
          >
            {eyebrow}
          </motion.span>

          <motion.h1
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="mt-4 font-semibold text-3xl leading-tight sm:text-4xl"
            data-field="headline"
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          >
            {headline}
          </motion.h1>

          <motion.p
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground"
            data-field="subtext"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
          >
            {subtext}
          </motion.p>

          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
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
      </div>
    </section>
  );
}
