"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import type { CtaBandBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CtaBand({
  eyebrow,
  heading,
  subtext,
  variant,
  primaryCta,
  secondaryCta,
}: CtaBandBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  if (variant === "card") {
    return (
      <CardVariant
        eyebrow={eyebrow}
        heading={heading}
        inView={inView}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
        sectionRef={sectionRef}
        subtext={subtext}
      />
    );
  }

  return (
    <PrimaryVariant
      eyebrow={eyebrow}
      heading={heading}
      inView={inView}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
      sectionRef={sectionRef}
      subtext={subtext}
    />
  );
}

// --- Primary variant ---

function PrimaryVariant({
  eyebrow,
  heading,
  subtext,
  primaryCta,
  secondaryCta,
  sectionRef,
  inView,
}: VariantProps) {
  return (
    <section
      aria-label="Call to action"
      className="relative w-full overflow-hidden bg-primary"
      ref={sectionRef}
    >
      {/* Background shimmer — single pass diagonal sweep */}
      <motion.div
        animate={inView ? { backgroundPosition: "200% 0" } : {}}
        className="pointer-events-none absolute inset-0"
        initial={{ backgroundPosition: "-100% 0" }}
        style={{
          backgroundImage:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
        }}
        transition={{ duration: 1.2, ease: EASE }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
        <div className="flex flex-wrap items-center justify-between gap-8">
          {/* Text content */}
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {eyebrow && (
              <p
                className="mb-3 font-mono text-[11px] text-white/60 uppercase tracking-[0.3em]"
                data-field="eyebrow"
              >
                {eyebrow}
              </p>
            )}
            <h2
              className="font-semibold text-2xl text-white leading-tight sm:text-3xl"
              data-field="heading"
            >
              {heading}
            </h2>
            {subtext && (
              <p className="mt-3 text-white/70" data-field="subtext">
                {subtext}
              </p>
            )}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          >
            {primaryCta?.label && (
              <motion.div whileTap={{ scale: 0.97 }}>
                <CMSLink
                  className="bg-white font-semibold text-primary hover:bg-white/90"
                  data-field-group="primaryCta"
                  data-field-group-type="link"
                  link={primaryCta}
                />
              </motion.div>
            )}
            {secondaryCta?.label && (
              <motion.div whileTap={{ scale: 0.97 }}>
                <CMSLink
                  className="border-white/30 text-white hover:bg-white/10"
                  data-field-group="secondaryCta"
                  data-field-group-type="link"
                  link={secondaryCta}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// --- Card variant ---

function CardVariant({
  eyebrow,
  heading,
  subtext,
  primaryCta,
  secondaryCta,
  sectionRef,
  inView,
}: VariantProps) {
  return (
    <section
      aria-label="Call to action"
      className="relative w-full overflow-hidden border-border/50 border-t border-b bg-card"
      ref={sectionRef}
    >
      {/* Border glow pulse on viewport entry */}
      <motion.div
        animate={inView ? { opacity: [0, 0.6, 0] } : {}}
        className="pointer-events-none absolute top-0 right-0 left-0 h-px bg-primary"
        initial={{ opacity: 0 }}
        transition={{ duration: 1, ease: EASE }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Eyebrow with letter-spacing animation */}
          {eyebrow && (
            <motion.p
              animate={inView ? { letterSpacing: "0.3em", opacity: 1 } : {}}
              className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]"
              data-field="eyebrow"
              initial={{ letterSpacing: "0.5em", opacity: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              {eyebrow}
            </motion.p>
          )}

          {/* Heading */}
          <motion.h2
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="max-w-2xl font-semibold text-2xl leading-tight sm:text-3xl"
            data-field="heading"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
          >
            {heading}
          </motion.h2>

          {/* Subtext */}
          {subtext && (
            <motion.p
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="max-w-lg text-muted-foreground"
              data-field="subtext"
              initial={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            >
              {subtext}
            </motion.p>
          )}

          {/* CTA buttons */}
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          >
            {primaryCta?.label && (
              <motion.div whileTap={{ scale: 0.97 }}>
                <CMSLink
                  data-field-group="primaryCta"
                  data-field-group-type="link"
                  link={primaryCta}
                />
              </motion.div>
            )}
            {secondaryCta?.label && (
              <motion.div whileTap={{ scale: 0.97 }}>
                <CMSLink
                  data-field-group="secondaryCta"
                  data-field-group-type="link"
                  link={secondaryCta}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// --- Shared type ---

interface VariantProps {
  eyebrow?: CtaBandBlock["eyebrow"];
  heading: CtaBandBlock["heading"];
  inView: boolean;
  primaryCta: CtaBandBlock["primaryCta"];
  secondaryCta?: CtaBandBlock["secondaryCta"];
  sectionRef: React.RefObject<HTMLElement | null>;
  subtext?: CtaBandBlock["subtext"];
}
