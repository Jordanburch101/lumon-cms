"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import type { TeamBlock } from "@/types/block-types";
import { TeamCard } from "./team-card";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Team({
  eyebrow,
  heading,
  description,
  variant,
  members,
}: TeamBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const isCompact = variant === "compact";

  return (
    <section aria-label="Team members" className="w-full" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-12 text-center lg:mb-16"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {eyebrow && (
            <p
              className="mb-4 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.25em]"
              data-field="eyebrow"
            >
              {eyebrow}
            </p>
          )}
          <h2
            className="font-semibold text-3xl leading-tight sm:text-4xl"
            data-field="heading"
          >
            {heading}
          </h2>
          {description && (
            <p
              className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground"
              data-field="description"
            >
              {description}
            </p>
          )}
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {members.map((member, i) => (
            <TeamCard
              index={i}
              inView={inView}
              isCompact={isCompact}
              key={member.id}
              member={member}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
