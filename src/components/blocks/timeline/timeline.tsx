"use client";

import { motion, useInView, useReducedMotion, useScroll } from "motion/react";
import { useRef } from "react";
import type { TimelineBlock as TimelineBlockType } from "@/types/block-types";
import {
  EASE,
  type MilestoneState,
  TimelineMilestone,
} from "./timeline-milestone";

function MilestoneWithState({
  item,
  index,
  reducedMotion,
}: {
  index: number;
  item: TimelineBlockType["items"][number];
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hasBeenSeen = useRef(false);

  // "Sweet spot" — middle portion of the viewport
  const inView = useInView(ref, { once: false, margin: "-40% 0px -55% 0px" });

  if (inView) {
    hasBeenSeen.current = true;
  }

  let state: MilestoneState = "upcoming";
  if (inView) {
    state = "active";
  } else if (hasBeenSeen.current) {
    state = "passed";
  }

  if (reducedMotion) {
    state = "active"; // show everything at full opacity
  }

  return (
    <div ref={ref}>
      <TimelineMilestone
        index={index}
        item={item}
        reducedMotion={reducedMotion}
        state={state}
      />
    </div>
  );
}

export function Timeline({
  eyebrow,
  heading,
  description,
  items,
}: TimelineBlockType) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const headerInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 60%", "end 40%"],
  });

  const headerAnimate =
    reducedMotion || headerInView
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 24 };

  return (
    <section aria-label={heading} className="w-full" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* ── Section header ── */}
        <motion.div
          animate={headerAnimate}
          className="mb-16 ml-[56px] max-w-2xl lg:ml-[72px]"
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          transition={
            reducedMotion ? { duration: 0 } : { duration: 0.8, ease: EASE }
          }
        >
          {eyebrow && (
            <p
              className="mb-4 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]"
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
              className="mt-3 text-base text-muted-foreground"
              data-field="description"
            >
              {description}
            </p>
          )}
        </motion.div>

        {/* ── Timeline body ── */}
        {items && items.length > 0 && (
          <div className="relative">
            {/* Ghost line — full height, faint */}
            <div
              aria-hidden="true"
              className="absolute top-0 bottom-0 left-4 w-px bg-border/20 lg:left-5"
            />

            {/* Fill line — scroll-driven progress */}
            <motion.div
              aria-hidden="true"
              className="absolute top-0 bottom-0 left-4 w-px origin-top bg-primary lg:left-5"
              style={{
                scaleY: reducedMotion ? 1 : scrollYProgress,
              }}
            />

            {/* Milestones */}
            {items.map((item, i) => (
              <MilestoneWithState
                index={i}
                item={item}
                key={item.id ?? `${item.date}-${String(i)}`}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
