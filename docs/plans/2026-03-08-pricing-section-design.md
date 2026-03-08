# Pricing Section Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Severance-themed pricing section with animated billing toggle, three tier cards, and scroll-in animations.

**Architecture:** Static data file defines tiers/copy. A parent `Pricing` component manages billing state and renders a toggle + 3 `PricingCard` components. `AnimatePresence` handles price crossfade, `layoutId` handles toggle pill slide.

**Tech Stack:** React 19, motion/react, Hugeicons, Tailwind CSS v4, shadcn Button/Badge

---

### Task 1: Create pricing-data.ts

**Files:**
- Create: `src/components/layout/pricing/pricing-data.ts`

**Step 1: Create the data file**

```ts
export interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  badge?: string;
  features: string[];
  cta: { label: string; href: string };
  recommended?: boolean;
}

export const pricingSectionData = {
  headline: "Choose your Severance Package",
  subtext:
    "Each tier has been carefully calibrated by the Board to maximize your contribution to the work.",
  footnote: "The work is mysterious and important.",
  footnoteAttribution: "Kier Eagan",
} as const;

export const pricingTiers: PricingTier[] = [
  {
    name: "Innie",
    description: "Begin your journey on the severed floor.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "Macrodata access (read-only)",
      "Standard break allowance",
      "Handbook chapters 1\u20133",
      "Shared perpetuity wing access",
      "Basic wellness check",
    ],
    cta: { label: "Begin Orientation", href: "/orientation" },
  },
  {
    name: "Refined",
    description: "Full access to the work and its rewards.",
    monthlyPrice: 49,
    annualPrice: 39,
    badge: "Board Approved",
    recommended: true,
    features: [
      "Everything in Innie",
      "Full refinement capabilities",
      "Priority waffle party queue",
      "Music-dance experience (monthly)",
      "Dedicated supervisor",
      "Egg bar access",
    ],
    cta: { label: "Begin Refinement", href: "/refinement" },
  },
  {
    name: "Perpetuity",
    description: "For those who give everything to Kier's vision.",
    monthlyPrice: 199,
    annualPrice: 159,
    features: [
      "Everything in Refined",
      "Unlimited department transfers",
      "Private wellness sessions",
      "Board-level analytics",
      "Revolving (unlimited) incentives",
      "Custom orientation protocol",
    ],
    cta: { label: "Contact the Board", href: "/contact" },
  },
];
```

**Step 2: Commit**

```bash
git add src/components/layout/pricing/pricing-data.ts
git commit -m "feat(pricing): add pricing data with Severance-themed tiers"
```

---

### Task 2: Create pricing-toggle.tsx

**Files:**
- Create: `src/components/layout/pricing/pricing-toggle.tsx`

**Context:**
- Uses `motion/react` for the sliding pill indicator via `layoutId`
- The "Save 20%" badge animates in when "Annual" is selected
- Pattern reference: the project uses `motion.div` extensively (see `cinematic-cta.tsx`, `testimonials.tsx`)

**Step 1: Create the toggle component**

```tsx
"use client";

import { AnimatePresence, motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/core/lib/utils";

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: (annual: boolean) => void;
}

const options = [
  { label: "Monthly", value: false },
  { label: "Annual", value: true },
] as const;

export function PricingToggle({ isAnnual, onToggle }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="relative inline-flex rounded-full border bg-muted/50 p-0.5">
        {options.map((option) => {
          const isActive = isAnnual === option.value;
          return (
            <button
              className={cn(
                "relative z-10 px-4 py-1.5 font-medium text-sm transition-colors duration-200",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
              key={option.label}
              onClick={() => onToggle(option.value)}
              type="button"
            >
              {isActive && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-background shadow-sm"
                  layoutId="pricing-toggle-pill"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              {option.label}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {isAnnual && (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            initial={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Badge variant="secondary">Save 20%</Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/pricing/pricing-toggle.tsx
git commit -m "feat(pricing): add animated billing toggle"
```

---

### Task 3: Create pricing-card.tsx

**Files:**
- Create: `src/components/layout/pricing/pricing-card.tsx`

**Context:**
- Uses `Tick02Icon` from `@hugeicons/core-free-icons` (same as checkbox, dropdown-menu, etc.)
- Card styling: `rounded-2xl border bg-card` — clean, no heavy shadows
- Recommended card gets a subtle ring accent
- Price animates on billing toggle via `AnimatePresence`
- Button variants: recommended = `default`, others = `outline`
- Button size: `lg` (h-8, matching hero CTA pattern)

**Step 1: Create the card component**

```tsx
"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/lib/utils";
import type { PricingTier } from "./pricing-data";

interface PricingCardProps {
  isAnnual: boolean;
  tier: PricingTier;
}

export function PricingCard({ tier, isAnnual }: PricingCardProps) {
  const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-6 transition-shadow duration-300 lg:p-8",
        tier.recommended
          ? "ring-1 ring-primary/15 lg:scale-[1.02]"
          : "hover:shadow-sm"
      )}
    >
      {/* Tier header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
            {tier.name}
          </span>
          {tier.badge && <Badge variant="secondary">{tier.badge}</Badge>}
        </div>
        <p className="mt-2 text-muted-foreground text-sm">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6 flex items-baseline gap-1">
        <AnimatePresence mode="popLayout">
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className="font-semibold text-4xl tracking-tight"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            key={price}
            transition={{ duration: 0.2 }}
          >
            {price === 0 ? "Free" : `$${price}`}
          </motion.span>
        </AnimatePresence>
        {price > 0 && (
          <span className="text-muted-foreground text-sm">/mo</span>
        )}
      </div>

      {/* Features */}
      <ul className="mb-8 flex flex-1 flex-col gap-2.5">
        {tier.features.map((feature) => (
          <li className="flex items-start gap-2.5" key={feature}>
            <HugeiconsIcon
              className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
              icon={Tick02Icon}
              strokeWidth={2}
            />
            <span className="text-muted-foreground text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        asChild
        className="w-full"
        size="lg"
        variant={tier.recommended ? "default" : "outline"}
      >
        <Link href={tier.cta.href}>{tier.cta.label}</Link>
      </Button>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/pricing/pricing-card.tsx
git commit -m "feat(pricing): add pricing card component"
```

---

### Task 4: Create pricing.tsx (main section)

**Files:**
- Create: `src/components/layout/pricing/pricing.tsx`

**Context:**
- Section pattern: `py-16 lg:py-24`, `max-w-7xl`, `px-4 lg:px-6`
- Scroll animation: `useInView` with `once: true, margin: "-100px"`, staggered delays
- EASE curve: `[0.16, 1, 0.3, 1]` (same as testimonials, latest-articles)
- Manages `isAnnual` state, passes to toggle + cards

**Step 1: Create the section component**

```tsx
"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";

import { PricingCard } from "./pricing-card";
import { pricingSectionData, pricingTiers } from "./pricing-data";
import { PricingToggle } from "./pricing-toggle";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Section header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-6 max-w-2xl"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
            {pricingSectionData.headline}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {pricingSectionData.subtext}
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-10 lg:mb-14"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        >
          <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {pricingTiers.map((tier, i) => (
            <motion.div
              animate={inView ? { opacity: 1, y: 0 } : {}}
              initial={{ opacity: 0, y: 24 }}
              key={tier.name}
              transition={{
                duration: 0.8,
                ease: EASE,
                delay: 0.1 + i * 0.05,
              }}
            >
              <PricingCard isAnnual={isAnnual} tier={tier} />
            </motion.div>
          ))}
        </div>

        {/* Footnote */}
        <motion.p
          animate={inView ? { opacity: 1 } : {}}
          className="mt-10 text-center text-muted-foreground/50 text-xs italic lg:mt-14"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
        >
          &ldquo;{pricingSectionData.footnote}&rdquo; &mdash;{" "}
          {pricingSectionData.footnoteAttribution}
        </motion.p>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/pricing/pricing.tsx
git commit -m "feat(pricing): add main pricing section with scroll animations"
```

---

### Task 5: Wire into page.tsx

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Add Pricing between LatestArticles and CinematicCta**

Add import:
```tsx
import { Pricing } from "@/components/layout/pricing/pricing";
```

Add component between `<LatestArticles />` and `<CinematicCta />`:
```tsx
<LatestArticles />
<Pricing />
<CinematicCta />
```

**Step 2: Run dev server and verify**

```bash
bun dev
```

Open browser, scroll to pricing section. Verify:
- Section header animates in on scroll
- Toggle slides between Monthly/Annual with pill animation
- "Save 20%" badge appears/disappears on Annual
- Price numbers crossfade when toggling
- Cards stagger in
- Recommended card has subtle ring accent
- Footnote appears last
- Responsive: stacks to single column on mobile

**Step 3: Run lint**

```bash
bun check
```

Fix any issues.

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(pricing): wire pricing section into homepage"
```
