# Trust Section ("The Corridor") Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a trust/credibility section as the final section on the home page — four animated stat counters separated by vertical rules, with a logo strip below.

**Architecture:** Single client component with a CountUp sub-component using motion/react's useMotionValue for number animation. Data lives in a sibling data file following the project's established `*-data.ts` pattern. Responsive grid collapses from 4-col → 2x2 → single column.

**Tech Stack:** React 19, motion/react, Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-03-10-trust-section-design.md`

---

## File Structure

```
src/components/layout/trust/
  trust-data.ts      — types, stats array, logos array, eyebrow copy
  count-up.tsx       — CountUp component (useMotionValue + useTransform)
  trust.tsx          — main section component ("use client", animations)
```

**Modify:** `src/app/page.tsx` — add Trust import and render after MdrTerminal

---

## Chunk 1: Data + CountUp + Main Component + Page Integration

### Task 1: Create trust-data.ts

**Files:**
- Create: `src/components/layout/trust/trust-data.ts`

- [ ] **Step 1: Create the data file with types and exports**

```ts
export interface Stat {
  value: number;
  format?: "k";
  decimals?: number;
  suffix?: string;
  label: string;
}

export interface Logo {
  name: string;
}

export const trustSectionData = {
  eyebrow: "Your outie has been informed of these results",
} as const;

export const stats: Stat[] = [
  { value: 10000, format: "k", suffix: "+", label: "Refined Files" },
  { value: 99.9, decimals: 1, suffix: "%", label: "Severance Uptime" },
  { value: 4.9, decimals: 1, suffix: "", label: "Wellness Score" },
  { value: 50, suffix: "+", label: "Departments" },
];

export const logos: Logo[] = [
  { name: "Acme" },
  { name: "Globex" },
  { name: "Initech" },
  { name: "Hooli" },
  { name: "Umbrella" },
];
```

- [ ] **Step 2: Run lint check**

Run: `bun check`
Expected: PASS (no errors in new file)

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/trust/trust-data.ts
git commit -m "feat(trust): add data file with stats, logos, and types"
```

---

### Task 2: Create count-up.tsx

**Files:**
- Create: `src/components/layout/trust/count-up.tsx`

- [ ] **Step 1: Create the CountUp component**

Uses `useMotionValue` + `useTransform` + `animate` from motion/react — the same pattern the pricing component uses for animated price numbers.

Note: The `format: "k"` display simplifies the spec's "rolling digits then snap" language — values show as raw numbers until ≥1000, then switch to "Xk" format. This creates a natural visual progression during the count-up.

```tsx
"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";

interface CountUpProps {
  target: number;
  format?: "k";
  decimals?: number;
  suffix?: string;
  inView: boolean;
}

function formatValue(n: number, format?: "k", decimals?: number): string {
  if (format === "k") {
    if (n >= 1000) return `${Math.floor(n / 1000)}k`;
    return Math.floor(n).toString();
  }
  if (decimals !== undefined && decimals > 0) return n.toFixed(decimals);
  return Math.floor(n).toString();
}

export function CountUp({
  target,
  format,
  decimals,
  suffix = "",
  inView,
}: CountUpProps) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => formatValue(v, format, decimals) + suffix);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, target, {
      duration: 2.2,
      ease: [0.33, 1, 0.68, 1], // easeOutExpo approximation as cubic-bezier
    });
    return controls.stop;
  }, [inView, mv, target]);

  return <motion.span>{display}</motion.span>;
}
```

- [ ] **Step 2: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/trust/count-up.tsx
git commit -m "feat(trust): add CountUp component with useMotionValue animation"
```

---

### Task 3: Create trust.tsx — Main Section Component

**Files:**
- Create: `src/components/layout/trust/trust.tsx`

- [ ] **Step 1: Create the main Trust component**

Follow the pricing.tsx pattern exactly: `"use client"`, EASE constant, useRef + useInView, motion.div wrappers with staggered animations.

```tsx
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
                "relative text-center py-8 sm:py-0",
                // Vertical dividers (desktop + tablet)
                i > 0 && "sm:border-l sm:border-border",
                // Horizontal dividers (mobile)
                i > 0 && "border-t border-border sm:border-t-0",
                // Horizontal divider between rows at tablet (after 2nd item)
                i >= 2 && "sm:border-t sm:border-border lg:border-t-0",
              )}
              initial={{ opacity: 0, y: 32 }}
              key={stat.label}
              transition={{
                duration: 1,
                ease: EASE,
                delay: 0.08 * i,
              }}
            >
              <div className="font-bold text-7xl tracking-tighter text-foreground">
                <CountUp
                  decimals={stat.decimals}
                  format={stat.format}
                  inView={inView}
                  suffix={stat.suffix}
                  target={stat.value}
                />
              </div>
              <p className="mt-4 font-medium text-xs text-muted-foreground uppercase tracking-[0.2em]">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Hairline + Logo strip */}
        <motion.div
          animate={inView ? { opacity: 1 } : {}}
          className="mt-20 border-t border-border pt-12"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
        >
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-16">
            {logos.map((logo) => (
              <span
                className="font-semibold text-base text-foreground opacity-[0.18] tracking-[0.04em]"
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
```

- [ ] **Step 2: Run lint check**

Run: `bun check`
Expected: PASS (fix any formatting issues with `bun fix` if needed)

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/trust/trust.tsx
git commit -m "feat(trust): add Trust section component with animated stats corridor"
```

---

### Task 4: Add Trust to the Home Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add Trust import and render after MdrTerminal**

Add import at the top of `page.tsx`:
```ts
import { Trust } from "@/components/layout/trust/trust";
```

Add `<Trust />` as the last child inside the flex container, after `<MdrTerminal />`:
```tsx
<MdrTerminal />
<Trust />
```

- [ ] **Step 2: Verify dev server renders correctly**

Run: `bun dev`
Navigate to http://localhost:3000, scroll to the bottom. Verify:
- Eyebrow text appears and fades in
- Four stats animate in with staggered timing
- Numbers count up from 0 to their targets
- Logo strip fades in after stats
- Vertical dividers appear between stats on desktop
- Responsive: resize browser to check 2x2 and single-column layouts

- [ ] **Step 3: Run build to verify no errors**

Run: `bun build`
Expected: PASS with no type errors or build failures

- [ ] **Step 4: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): add Trust section as final section after MdrTerminal"
```
