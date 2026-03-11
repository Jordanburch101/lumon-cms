"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { cn, getMediaUrl } from "@/core/lib/utils";
import type { TrustBlock } from "@/types/block-types";

import { FlipCounter } from "./flip-counter";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Trust({ eyebrow, stats, logos }: TrustBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section className="w-full" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Eyebrow */}
        {eyebrow && (
          <motion.p
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="mb-18 text-center font-medium text-[11px] text-muted-foreground uppercase tracking-[0.25em]"
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            {eyebrow}
          </motion.p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className={cn(
                "relative py-6 text-center lg:py-0",
                // Vertical dividers: odd items always, even item 2 at desktop only
                i % 2 !== 0 && "border-border border-l",
                i === 2 && "lg:border-border lg:border-l",
                // Horizontal dividers: bottom row on mobile, removed at desktop
                i >= 2 && "border-border border-t lg:border-t-0"
              )}
              initial={{ opacity: 0, y: 16 }}
              key={stat.id ?? stat.label}
              transition={{
                duration: 0.8,
                ease: EASE,
                delay: 0.15 * i,
              }}
            >
              <div className="font-bold text-4xl text-foreground tracking-tighter sm:text-5xl lg:text-7xl">
                <FlipCounter
                  delay={0.15 * i + 0.2}
                  inView={inView}
                  stat={stat}
                />
              </div>
              <p className="mt-2 font-medium text-[10px] text-muted-foreground uppercase tracking-[0.2em] sm:text-xs lg:mt-4">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Hairline + Logo strip */}
        {logos && logos.length > 0 && (
          <motion.div
            animate={inView ? { opacity: 1 } : {}}
            className="mt-20 border-border border-t pt-12"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
          >
            <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-16">
              {logos.map((logo) => {
                const logoUrl = getMediaUrl(logo.logo);
                return logoUrl ? (
                  <Image
                    alt={logo.name}
                    className="h-6 w-auto opacity-[0.18] dark:invert"
                    height={24}
                    key={logo.id ?? logo.name}
                    src={logoUrl}
                    width={120}
                  />
                ) : (
                  <span
                    className="font-semibold text-base text-foreground tracking-[0.04em] opacity-[0.18]"
                    key={logo.id ?? logo.name}
                  >
                    {logo.name}
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
