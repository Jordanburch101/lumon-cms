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
      className="relative w-full py-32 lg:py-40"
      data-navbar-contrast="light"
      ref={sectionRef}
    >
      {/* Dark background */}
      <div className="absolute inset-0 bg-background" />

      {/* Radial gradient spotlight */}
      <motion.div
        animate={inView ? { opacity: 1 } : {}}
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-xl px-4 text-center">
        <motion.h1
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="font-semibold text-4xl text-white leading-tight sm:text-5xl lg:text-6xl"
          data-field="headline"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {headline}
        </motion.h1>

        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mx-auto mt-6 max-w-xl text-base text-white/50 lg:text-lg"
          data-field="subtext"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        >
          {subtext}
        </motion.p>

        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
        >
          <CMSLink
            className="bg-white text-black hover:bg-white/90"
            data-field-group="primaryCta"
            data-field-group-type="link"
            link={primaryCta}
          />
          <CMSLink
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            data-field-group="secondaryCta"
            data-field-group-type="link"
            link={secondaryCta}
          />
        </motion.div>
      </div>

      {/* Bottom decorative divider — draws from center outward */}
      <motion.div
        animate={inView ? { scaleX: 1 } : {}}
        className="absolute inset-x-0 bottom-0 mx-auto h-px w-[200px] origin-center"
        initial={{ scaleX: 0 }}
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--border), transparent)",
        }}
        transition={{ duration: 1, ease: EASE, delay: 0.4 }}
      />
    </section>
  );
}
