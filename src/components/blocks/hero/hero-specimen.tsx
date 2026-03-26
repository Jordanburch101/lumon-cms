"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { ExtractHeroBlock } from "@/types/block-types";

type HeroSpecimenBlock = ExtractHeroBlock<"heroSpecimen">;

const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroSpecimen({
  eyebrow,
  icon,
  headline,
  subtext,
  mediaSrc,
  primaryCta,
  secondaryCta,
}: HeroSpecimenBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const url = getMediaUrl(mediaSrc);
  const blurDataURL = getBlurDataURL(mediaSrc);
  const iconUrl = getMediaUrl(icon);

  return (
    <section className="w-full py-24 lg:py-32" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="overflow-hidden rounded-xl border border-border/50 bg-card"
          initial={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {/* Header bar */}
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="flex items-center gap-3 border-border/40 border-b px-6 py-3.5 lg:px-8"
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          >
            {iconUrl && (
              <div className="flex size-5 items-center justify-center overflow-hidden rounded border border-border/50">
                <Image
                  alt=""
                  className="object-contain"
                  height={20}
                  src={iconUrl}
                  width={20}
                />
              </div>
            )}
            <span
              className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]"
              data-field="eyebrow"
            >
              {eyebrow}
            </span>
          </motion.div>

          {/* Body: text + image split */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
            {/* Left: text content */}
            <div className="flex flex-col justify-center border-border/40 border-b p-8 lg:border-r lg:border-b-0 lg:p-10">
              <motion.h1
                animate={inView ? { opacity: 1, y: 0 } : {}}
                className="font-semibold text-3xl leading-tight sm:text-4xl"
                data-field="headline"
                initial={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
              >
                {headline}
              </motion.h1>

              <motion.div
                animate={inView ? { opacity: 1 } : {}}
                className="mt-4 h-px w-8 bg-border"
                initial={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
              />

              <motion.p
                animate={inView ? { opacity: 1, y: 0 } : {}}
                className="mt-4 text-base text-muted-foreground leading-relaxed"
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

            {/* Right: full-bleed image */}
            <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto">
              {url && (
                <motion.div
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
                >
                  <Image
                    alt={headline || "Department image"}
                    blurDataURL={blurDataURL}
                    className="object-cover"
                    data-field="mediaSrc"
                    fill
                    placeholder={blurDataURL ? "blur" : "empty"}
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    src={url}
                  />
                  {/* Subtle left-edge fade on desktop */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-10 bg-gradient-to-r from-card to-transparent lg:block" />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
