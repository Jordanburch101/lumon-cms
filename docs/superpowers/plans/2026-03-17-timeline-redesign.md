# Timeline Block Redesign — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the timeline block into a scroll-driven, typographically cinematic component with a progress line, milestone state transitions, and stat count-up animations.

**Architecture:** Left-aligned vertical layout with a scroll-driven progress line. Three files: main timeline wrapper (scroll tracking, progress line), milestone sub-component (content, dot, state), and a reusable stat counter hook. All `"use client"` — no server component split needed since the entire block is interactive.

**Tech Stack:** React 19, motion/react (`useScroll`, `useTransform`, `useInView`, `useSpring`, `useReducedMotion`), Tailwind CSS v4, Payload CMS 3.x block schema

**Spec:** `docs/superpowers/specs/2026-03-17-timeline-redesign-design.md`

---

## Chunk 1: Schema + Types + Fixture

### Task 1: Update Payload block schema

**Files:**
- Modify: `src/payload/block-schemas/Timeline.ts`

- [ ] **Step 1: Update the schema**

Replace the entire file contents with the new schema. Remove the `icon` (select) and `image` (upload) fields. Add `stat`, `statLabel`, and `category` as optional text fields.

```ts
import type { Block } from "payload";

export const TimelineBlock: Block = {
  slug: "timeline",
  labels: { singular: "Timeline", plural: "Timelines" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        { name: "date", type: "text", required: true },
        { name: "heading", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
        { name: "stat", type: "text" },
        { name: "statLabel", type: "text" },
        { name: "category", type: "text" },
      ],
    },
  ],
};
```

- [ ] **Step 2: Regenerate Payload types**

Run: `bun run generate:types`
Expected: Success, `src/payload-types.ts` updated with new `stat`, `statLabel`, `category` fields on timeline items, `icon` and `image` fields removed.

- [ ] **Step 3: Verify the type exports still work**

Run: `bun check`
Expected: No type errors. `src/types/block-types.ts` uses `ExtractBlock<"timeline">` which auto-derives from the generated types — no changes needed there.

- [ ] **Step 4: Commit**

```bash
git add src/payload/block-schemas/Timeline.ts src/payload-types.ts
git commit -m "refactor(timeline): update schema — add stat/statLabel/category, remove icon/image"
```

### Task 2: Update fixture data

**Files:**
- Modify: `src/components/blocks/__fixtures__/block-fixtures.ts` (the `timeline` key, lines ~1181–1194)

- [ ] **Step 1: Replace the timeline fixture**

Replace the `timeline` fixture entry. The new fixture exercises all field combinations: all fields, no optional fields, stat-only, category-only, stat+category, and minimal. 6 items total.

```ts
  timeline: {
    blockType: "timeline",
    eyebrow: "Our Journey",
    heading: "The History of Lumon Industries",
    description: "From a single vision to a severed empire.",
    items: [
      {
        id: "tl1",
        date: "1865",
        heading: "Kier Eagan Founds Lumon",
        description:
          "What began as a modest topical salve company in the town of Kier, PE would grow into one of the world's most enigmatic corporations.",
        category: "Origins",
      },
      {
        id: "tl2",
        date: "2003",
        heading: "Severance Technology Conceived",
        description:
          "Lumon researchers achieve a breakthrough in neural partitioning, laying the groundwork for the severance procedure.",
        stat: "847",
        statLabel: "volunteers in first trial",
        category: "Product",
      },
      {
        id: "tl3",
        date: "2018",
        heading: "First Severed Floor Opens",
        description:
          "The inaugural severed floor begins operations with a small team of pioneers. The Macrodata Refinement department is born.",
      },
      {
        id: "tl4",
        date: "2020",
        heading: "Macrodata Refinement Scaled",
        description:
          "The severed floor expands to multiple departments, each handling classified data categories with growing operational capacity.",
        stat: "12K",
        statLabel: "severed employees worldwide",
        category: "Growth",
      },
      {
        id: "tl5",
        date: "2024",
        heading: "Global Expansion",
        description:
          "Lumon opens severed floors in 16 countries. The Board approves the most ambitious growth plan in company history.",
        stat: "$4.2B",
        statLabel: "annual revenue",
      },
      {
        id: "tl6",
        date: "2026",
        heading: "The Future Is Severed",
        description:
          "With near-perfect wellness scores and record refinement output, Lumon proves that the future of work is here.",
        stat: "99.9%",
        statLabel: "wellness score average",
        category: "Milestone",
      },
    ],
  },
```

- [ ] **Step 2: Run lint check**

Run: `bun check`
Expected: PASS — fixture type-checks against the regenerated `TimelineBlock` type.

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/__fixtures__/block-fixtures.ts
git commit -m "refactor(timeline): update fixture with stat/statLabel/category field combinations"
```

---

## Chunk 2: Stat Counter Hook

### Task 3: Create `use-stat-counter` hook

**Files:**
- Create: `src/components/blocks/timeline/use-stat-counter.ts`

This hook is self-contained and has no dependency on the milestone or timeline components, so we build it first.

- [ ] **Step 1: Write the hook**

The hook parses a stat string (e.g., `"$12M"`, `"500K"`, `"99.9%"`), extracts the numeric portion, and animates from 0 to the target using `useSpring`. Returns the formatted display string. If the stat has no numeric portion (e.g., `"3x"`), returns it as-is without animation.

```ts
"use client";

import { useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

const STAT_REGEX = /^([^0-9]*)([0-9]+(?:[.,][0-9]+)?)(.*)$/;

function formatNumber(value: number, decimalPlaces: number, hasCommas: boolean): string {
  const fixed = value.toFixed(decimalPlaces);
  if (!hasCommas) return fixed;
  const [intPart, decPart] = fixed.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart ? `${withCommas}.${decPart}` : withCommas;
}

export function useStatCounter(stat: string | undefined, active: boolean) {
  const hasAnimated = useRef(false);
  const [displayValue, setDisplayValue] = useState(stat ?? "");

  const match = stat?.match(STAT_REGEX);
  const prefix = match?.[1] ?? "";
  const rawNumber = match?.[2] ?? "";
  const suffix = match?.[3] ?? "";

  const hasCommas = rawNumber.includes(",");
  const cleanNumber = rawNumber.replace(/,/g, "");
  const target = Number.parseFloat(cleanNumber) || 0;
  const decimalPlaces = cleanNumber.includes(".") ? cleanNumber.split(".")[1].length : 0;

  const canAnimate = Boolean(match && target > 0);

  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (!canAnimate) {
      setDisplayValue(stat ?? "");
      return;
    }

    const unsubscribe = spring.on("change", (v: number) => {
      setDisplayValue(`${prefix}${formatNumber(v, decimalPlaces, hasCommas)}${suffix}`);
    });

    return unsubscribe;
  }, [spring, canAnimate, prefix, suffix, decimalPlaces, hasCommas, stat]);

  useEffect(() => {
    if (active && canAnimate && !hasAnimated.current) {
      hasAnimated.current = true;
      motionValue.set(target);
    }
  }, [active, canAnimate, motionValue, target]);

  return displayValue;
}
```

- [ ] **Step 2: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/timeline/use-stat-counter.ts
git commit -m "feat(timeline): add useStatCounter hook for animated stat display"
```

---

## Chunk 3: Milestone Sub-Component

### Task 4: Create `timeline-milestone.tsx`

**Files:**
- Create: `src/components/blocks/timeline/timeline-milestone.tsx`

- [ ] **Step 1: Write the milestone component**

This component renders a single milestone: the dot (in the line column) and the content (date, category, heading, description, stat). It receives its state (`upcoming | active | passed`) as a prop from the parent, along with `reducedMotion` so it doesn't need to call the hook itself.

```tsx
"use client";

import { motion } from "motion/react";
import { cn } from "@/core/lib/utils";
import type { TimelineBlock } from "@/types/block-types";
import { useStatCounter } from "./use-stat-counter";

const EASE = [0.16, 1, 0.3, 1] as const;

type MilestoneState = "upcoming" | "active" | "passed";
type TimelineItem = TimelineBlock["items"][number];

const STATE_OPACITY = { upcoming: 0.3, active: 1, passed: 0.55 } as const;
const STAGGER = [0, 0.05, 0.1, 0.15] as const;

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
      {/* ── Dot column ── */}
      <div className="relative flex justify-center pt-1">
        <motion.div
          animate={{
            scale: reducedMotion ? 1 : isActive ? 1.25 : 1,
            opacity: 1,
          }}
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

        {/* Stat */}
        {item.stat && (
          <motion.div
            animate={animate}
            className="mt-4"
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            transition={{
              ...transition,
              delay: reducedMotion ? 0 : STAGGER[3],
            }}
          >
            <span
              aria-label={item.stat}
              className="font-mono text-5xl font-bold text-primary tracking-tighter lg:text-6xl"
              data-field={`items.${String(index)}.stat`}
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
        )}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/timeline/timeline-milestone.tsx
git commit -m "feat(timeline): add TimelineMilestone sub-component with state-driven animations"
```

---

## Chunk 4: Main Timeline Component

### Task 5: Rewrite `timeline.tsx`

**Files:**
- Modify: `src/components/blocks/timeline/timeline.tsx` (full rewrite)

- [ ] **Step 1: Write the new timeline component**

This replaces the entire file. The component handles: section header, scroll tracking via `useScroll`, progress line rendering (ghost + fill), and mapping milestones with state derivation via per-milestone `useInView`.

The key challenge is milestone state. Each milestone needs its own ref and `useInView` — but hooks can't be called in a loop. So we use a sub-component (`MilestoneWithState`) that wraps `TimelineMilestone` and manages its own state tracking.

```tsx
"use client";

import { motion, useInView, useReducedMotion, useScroll } from "motion/react";
import { useRef } from "react";
import type { TimelineBlock as TimelineBlockType } from "@/types/block-types";
import { TimelineMilestone } from "./timeline-milestone";

const EASE = [0.16, 1, 0.3, 1] as const;

type MilestoneState = "upcoming" | "active" | "passed";

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
    reducedMotion || headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 };

  return (
    <section aria-label="Timeline" className="w-full" ref={sectionRef}>
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
```

- [ ] **Step 2: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 3: Verify in Storybook**

Run: `bun storybook` (if not already running on port 6006)
Navigate to the Timeline story. Verify:
- Section header renders with eyebrow, heading, description
- 6 milestones render in vertical layout
- Progress line is visible (ghost + fill)
- Milestone dots show three states as you scroll
- Stats display with count-up animation
- Category pills render on milestones that have them
- Milestones without optional fields look clean (no empty gaps)

- [ ] **Step 4: Verify on dev site**

Open `http://localhost:3100` and navigate to a page with a timeline block (or use Payload admin to add one). Verify scroll-driven behavior works in the real app context.

- [ ] **Step 5: Commit**

```bash
git add src/components/blocks/timeline/timeline.tsx
git commit -m "feat(timeline): rewrite with scroll-driven progress line and milestone states"
```

---

## Chunk 5: Cleanup + Final Verification

### Task 6: Remove dead icon-map dependency

**Files:**
- Possibly modify: `src/components/blocks/features-grid/icon-map.tsx` — only if timeline was the only other consumer

- [ ] **Step 1: Check if icon-map is still used elsewhere**

Run: `grep -r "FEATURE_ICONS\|icon-map" src/components/blocks/ --include="*.tsx" --include="*.ts" | grep -v "timeline" | grep -v "icon-map.tsx"`

If other components still import `FEATURE_ICONS`, no changes needed. If timeline was the only consumer besides features-grid itself, no changes needed either (it's features-grid's own file).

- [ ] **Step 2: Run full lint + type check**

Run: `bun check`
Expected: PASS — no unused imports, no type errors

- [ ] **Step 3: Build check**

Run: `bun build`
Expected: Production build succeeds with no errors.

- [ ] **Step 4: Commit (if any cleanup was needed)**

```bash
git add -A
git commit -m "chore(timeline): clean up unused imports after redesign"
```

### Task 7: Final Storybook verification

- [ ] **Step 1: Build Storybook**

Run: `bun storybook:build`
Expected: Static build succeeds. Timeline story renders in the output.

- [ ] **Step 2: Commit if any fixes were needed**

Only commit if there were issues to fix. Otherwise, skip.
