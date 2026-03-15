"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import type { HeroBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroMinimal({
  headline,
  subtext,
  primaryCta,
  secondaryCta,
}: HeroBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      className="relative flex w-full items-center justify-center overflow-hidden"
      data-navbar-contrast="light"
      ref={sectionRef}
      style={{ minHeight: "calc(100svh - 56px)" }}
    >
      {/* Dark background */}
      <div className="absolute inset-0 bg-black" />

      {/* Subtle grid texture — institutional precision */}
      <motion.div
        animate={inView ? { opacity: 0.25 } : {}}
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 50% 50% at 50% 50%, black 0%, transparent 70%)",
        }}
        transition={{ duration: 2, ease: EASE, delay: 0.6 }}
      />

      {/* Radial gradient spotlight — centered behind heading */}
      <motion.div
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 1.8, ease: EASE, delay: 0.1 }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 45% 35% at 50% 45%, rgba(255,255,255,0.07) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center lg:px-6">
        {/* Thin mono eyebrow line */}
        <motion.div
          animate={inView ? { scaleX: 1, opacity: 1 } : {}}
          className="mx-auto mb-10 h-px w-16 origin-center"
          initial={{ scaleX: 0, opacity: 0 }}
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
          }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
        />

        <motion.h1
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="font-semibold text-4xl text-white leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
          data-field="headline"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          {headline}
        </motion.h1>

        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mx-auto mt-5 max-w-md text-[1.0625rem] text-white/50 leading-relaxed"
          data-field="subtext"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
        >
          {subtext}
        </motion.p>

        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
        >
          <CMSLink
            className="bg-white text-black hover:bg-white/90"
            data-field-group="primaryCta"
            data-field-group-type="link"
            link={primaryCta}
          />
          <CMSLink
            className="border-white/20 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            data-field-group="secondaryCta"
            data-field-group-type="link"
            link={secondaryCta}
          />
        </motion.div>
      </div>

      {/* Bottom decorative divider — draws from center outward */}
      <motion.div
        animate={inView ? { scaleX: 1, opacity: 1 } : {}}
        className="absolute inset-x-0 bottom-0 mx-auto h-px w-[200px] origin-center"
        initial={{ scaleX: 0, opacity: 0 }}
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--border), transparent)",
        }}
        transition={{ duration: 1, ease: EASE, delay: 0.5 }}
      />
    </section>
  );
}
