"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

import { cn } from "@/core/lib/utils";

import { CountUp } from "./count-up";
import { logos, stats, trustSectionData } from "./trust-data";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Trust() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

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
          {trustSectionData.eyebrow}
        </motion.p>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className={cn(
                "relative py-8 text-center sm:py-0",
                // Vertical dividers (desktop + tablet)
                i > 0 && "sm:border-border sm:border-l",
                // Horizontal dividers (mobile)
                i > 0 && "border-border border-t sm:border-t-0",
                // Horizontal divider between rows at tablet (after 2nd item)
                i >= 2 && "sm:border-border sm:border-t lg:border-t-0"
              )}
              initial={{ opacity: 0, y: 32 }}
              key={stat.label}
              transition={{
                duration: 1,
                ease: EASE,
                delay: 0.08 * i,
              }}
            >
              <div className="font-bold text-7xl text-foreground tracking-tighter">
                <CountUp
                  decimals={stat.decimals}
                  format={stat.format}
                  inView={inView}
                  suffix={stat.suffix}
                  target={stat.value}
                />
              </div>
              <p className="mt-4 font-medium text-muted-foreground text-xs uppercase tracking-[0.2em]">
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
            {logos.map((logo) => (
              <span
                className="font-semibold text-base text-foreground tracking-[0.04em] opacity-[0.18]"
                key={logo.name}
              >
                {logo.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
