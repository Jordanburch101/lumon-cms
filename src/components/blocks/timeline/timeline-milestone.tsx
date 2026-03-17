"use client";

import type { TargetAndTransition, Transition } from "motion/react";
import { motion } from "motion/react";
import { cn } from "@/core/lib/utils";
import type { TimelineBlock } from "@/types/block-types";
import { useStatCounter } from "./use-stat-counter";

const EASE = [0.16, 1, 0.3, 1] as const;

type MilestoneState = "upcoming" | "active" | "passed";
type TimelineItem = TimelineBlock["items"][number];

const STATE_OPACITY = { upcoming: 0.3, active: 1, passed: 0.55 } as const;
const STAGGER = [0, 0.05, 0.1, 0.15] as const;

function getDotScale(reducedMotion: boolean, isActive: boolean): number {
  if (reducedMotion) {
    return 1;
  }
  return isActive ? 1.25 : 1;
}

function MilestoneDot({
  state,
  isActive,
  reducedMotion,
}: {
  isActive: boolean;
  reducedMotion: boolean;
  state: MilestoneState;
}) {
  return (
    <div className="relative flex justify-center pt-1">
      <motion.div
        animate={{ scale: getDotScale(reducedMotion, isActive), opacity: 1 }}
        className={cn(
          "relative z-10 rounded-full",
          state === "upcoming" &&
            "size-2 border-[1.5px] border-border/30 bg-transparent",
          state === "active" &&
            "size-3.5 border-2 border-primary bg-background shadow-[0_0_16px_rgba(var(--primary),0.3)]",
          state === "passed" && "size-2.5 bg-primary"
        )}
        initial={false}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 300, damping: 20 }
        }
      />
    </div>
  );
}

function MilestoneStat({
  animate,
  index,
  item,
  reducedMotion,
  statDisplay,
  transition,
}: {
  animate: TargetAndTransition;
  index: number;
  item: TimelineItem;
  reducedMotion: boolean;
  statDisplay: string;
  transition: Transition;
}) {
  if (!item.stat) {
    return null;
  }
  return (
    <motion.div
      animate={animate}
      className="mt-4"
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      transition={{ ...transition, delay: reducedMotion ? 0 : STAGGER[3] }}
    >
      <span
        aria-label={item.stat}
        className="font-bold font-mono text-5xl text-primary tracking-tighter lg:text-6xl"
        data-field={`items.${String(index)}.stat`}
        role="img"
      >
        {reducedMotion ? item.stat : statDisplay}
      </span>
      {item.statLabel && (
        <p
          className="mt-1 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.1em]"
          data-field={`items.${String(index)}.statLabel`}
        >
          {item.statLabel}
        </p>
      )}
    </motion.div>
  );
}

export function TimelineMilestone({
  item,
  index,
  state,
  reducedMotion,
}: {
  index: number;
  item: TimelineItem;
  reducedMotion: boolean;
  state: MilestoneState;
}) {
  const isActive = state === "active";
  const statDisplay = useStatCounter(item.stat ?? undefined, isActive);

  const animate = reducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: STATE_OPACITY[state], y: state === "upcoming" ? 16 : 0 };

  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.6, ease: EASE };

  return (
    <div
      className="grid grid-cols-[32px_1fr] gap-6 lg:grid-cols-[40px_1fr] lg:gap-8"
      data-array-item={`items.${String(index)}`}
    >
      <MilestoneDot
        isActive={isActive}
        reducedMotion={reducedMotion}
        state={state}
      />

      {/* ── Content column ── */}
      <motion.div
        animate={animate}
        className="pb-20 lg:pb-28"
        initial={reducedMotion ? false : { opacity: 0.3, y: 16 }}
        transition={transition}
      >
        {/* Date + Category row */}
        <motion.div
          animate={animate}
          className="mb-2 flex items-center gap-3"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          transition={{ ...transition, delay: reducedMotion ? 0 : STAGGER[0] }}
        >
          <span
            className="font-mono text-[11px] text-primary uppercase tracking-[0.15em]"
            data-field={`items.${String(index)}.date`}
          >
            {item.date}
          </span>
          {item.category && (
            <span
              className="rounded-full border border-border/50 bg-muted/50 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase tracking-wider"
              data-field={`items.${String(index)}.category`}
            >
              {item.category}
            </span>
          )}
        </motion.div>

        {/* Heading */}
        <motion.h3
          animate={animate}
          className="font-semibold text-2xl leading-snug tracking-tight lg:text-3xl"
          data-field={`items.${String(index)}.heading`}
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          transition={{ ...transition, delay: reducedMotion ? 0 : STAGGER[1] }}
        >
          {item.heading}
        </motion.h3>

        {/* Description */}
        <motion.p
          animate={animate}
          className="mt-2 max-w-lg text-muted-foreground text-sm leading-relaxed lg:text-base"
          data-field={`items.${String(index)}.description`}
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          transition={{ ...transition, delay: reducedMotion ? 0 : STAGGER[2] }}
        >
          {item.description}
        </motion.p>

        <MilestoneStat
          animate={animate}
          index={index}
          item={item}
          reducedMotion={reducedMotion}
          statDisplay={statDisplay}
          transition={transition}
        />
      </motion.div>
    </div>
  );
}
