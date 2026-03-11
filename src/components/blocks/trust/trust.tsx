"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

import { cn, getMediaUrl } from "@/core/lib/utils";

import { FlipCounter } from "./flip-counter";
import {
  logos as defaultLogos,
  stats as defaultStats,
  type Logo,
  type Stat,
  trustSectionData,
} from "./trust-data";

const EASE = [0.16, 1, 0.3, 1] as const;

interface TrustProps {
  eyebrow?: string;
  logos?: { name: string; logo?: { url?: string } | string }[];
  stats?: {
    label: string;
    value: number;
    decimals?: number;
    format?: string;
    suffix?: string;
  }[];
}

export function Trust(props: TrustProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const eyebrow = props.eyebrow || trustSectionData.eyebrow;

  const stats: Stat[] = props.stats
    ? props.stats.map((s) => ({
        label: s.label,
        value: s.value,
        decimals: s.decimals,
        format: s.format === "k" ? ("k" as const) : undefined,
        suffix: s.suffix,
      }))
    : defaultStats;

  const logos: Logo[] = props.logos
    ? props.logos.map((l) => ({
        name: l.name,
        logoUrl: getMediaUrl(l.logo),
      }))
    : defaultLogos;

  return (
    <section className="w-full" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Eyebrow */}
        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-18 text-center font-medium text-[11px] text-muted-foreground uppercase tracking-[0.25em]"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {eyebrow}
        </motion.p>

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
              key={stat.label}
              transition={{
                duration: 0.8,
                ease: EASE,
                delay: 0.15 * i,
              }}
            >
              <div className="font-bold text-4xl text-foreground tracking-tighter sm:text-5xl lg:text-7xl">
                <FlipCounter
                  decimals={stat.decimals}
                  delay={0.15 * i + 0.2}
                  format={stat.format}
                  inView={inView}
                  suffix={stat.suffix}
                  target={stat.value}
                />
              </div>
              <p className="mt-2 font-medium text-[10px] text-muted-foreground uppercase tracking-[0.2em] sm:text-xs lg:mt-4">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Hairline + Logo strip */}
        <motion.div
          animate={inView ? { opacity: 1 } : {}}
          className="mt-20 border-border border-t pt-12"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
        >
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-16">
            {logos.map((logo) =>
              logo.logoUrl ? (
                <Image
                  alt={logo.name}
                  className="h-6 w-auto opacity-[0.18] dark:invert"
                  height={24}
                  key={logo.name}
                  src={logo.logoUrl}
                  width={120}
                />
              ) : (
                <span
                  className="font-semibold text-base text-foreground tracking-[0.04em] opacity-[0.18]"
                  key={logo.name}
                >
                  {logo.name}
                </span>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
