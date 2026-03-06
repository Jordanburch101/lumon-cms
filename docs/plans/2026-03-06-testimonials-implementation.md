# Testimonials Section Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a testimonials section with a spotlight/grid layout, Severance-themed copy, and polished micro-animations — placed between SplitMedia and Footer.

**Architecture:** A `"use client"` section component using `motion/react` for animations. Data lives in a separate `-data.ts` file. The featured spotlight auto-advances on a timer, with short quote cards clickable to promote into the spotlight. Follows the same layout/animation conventions as the existing bento and split-media sections.

**Tech Stack:** React 19, motion/react (framer-motion), Tailwind CSS v4, shadcn Avatar component

---

### Task 1: Create testimonials data file

**Files:**
- Create: `src/components/layout/testimonials/testimonials-data.ts`

**Step 1: Create the data file with types and all testimonial content**

```ts
export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  department: string;
  featured?: boolean;
}

export const testimonialsSectionData = {
  headline: "Praise from the severed floor",
  subtext:
    "Every department. Every disposition. One unified appreciation for the work.",
} as const;

export const testimonials: Testimonial[] = [
  {
    id: "cobel",
    quote:
      "The severance procedure represents the single greatest advancement in workplace productivity since the assembly line. Our employees arrive each morning unburdened by personal entanglement, fully present, fully devoted. I have never seen a more content workforce\u00A0\u2014\u00A0and I see everything.",
    name: "Harmony Cobel",
    role: "Director",
    department: "Severed Floor",
    featured: true,
  },
  {
    id: "milchick",
    quote:
      "What we've built on the severed floor isn't just efficient\u00A0\u2014\u00A0it's joyful. Our incentive programs drive real engagement. Last quarter alone we awarded three waffle parties, two music-dance experiences, and a coveted egg bar. Morale has never been higher.",
    name: "Seth Milchick",
    role: "Supervisor",
    department: "Macrodata Refinement",
    featured: true,
  },
  {
    id: "kier",
    quote:
      "Let not the mind wander beyond the walls of its purpose. For in the quiet of focused labor, man finds not chains\u00A0\u2014\u00A0but wings. The work is mysterious and important, and it cannot be done anywhere else.",
    name: "Kier Eagan",
    role: "Founder",
    department: "Lumon Industries",
    featured: true,
  },
  {
    id: "mark",
    quote: "I enjoy every moment of my work day. I have no reason not to.",
    name: "Mark S.",
    role: "Refiner",
    department: "MDR",
  },
  {
    id: "helly",
    quote: "I am grateful for the opportunity to serve Kier's vision.",
    name: "Helly R.",
    role: "Refiner",
    department: "MDR",
  },
  {
    id: "irving",
    quote:
      "The handbook says to find meaning in the work itself. I have.",
    name: "Irving B.",
    role: "Refiner",
    department: "MDR",
  },
  {
    id: "dylan",
    quote:
      "The incentives are real and the waffle parties are worth every bin.",
    name: "Dylan G.",
    role: "Refiner",
    department: "MDR",
  },
];

export const featuredTestimonials = testimonials.filter((t) => t.featured);
export const shortTestimonials = testimonials.filter((t) => !t.featured);
```

**Step 2: Commit**

```bash
git add src/components/layout/testimonials/testimonials-data.ts
git commit -m "feat(testimonials): add data file with Severance-themed copy"
```

---

### Task 2: Build the QuoteCard component (short quote cards)

**Files:**
- Create: `src/components/layout/testimonials/quote-card.tsx`

**Context:** These are the compact cards in the right-side 2x2 grid. They show a one-liner quote, name, and department. The active card (matching the current spotlight) gets a subtle primary border + glow. Clicking a card calls an `onSelect` callback.

**Step 1: Create the component**

```tsx
"use client";

import { motion } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/core/lib/utils";
import type { Testimonial } from "./testimonials-data";

interface QuoteCardProps {
  testimonial: Testimonial;
  isActive: boolean;
  onSelect: () => void;
}

export function QuoteCard({ testimonial, isActive, onSelect }: QuoteCardProps) {
  return (
    <motion.button
      className={cn(
        "relative flex w-full flex-col gap-3 rounded-xl border p-4 text-left transition-shadow duration-300",
        isActive
          ? "border-primary/30 shadow-[0_0_0_1px_var(--primary),0_0_16px_var(--primary)/8%]"
          : "border-border/50 hover:border-border hover:shadow-sm"
      )}
      onClick={onSelect}
      type="button"
      whileHover={isActive ? {} : { scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-muted-foreground text-sm leading-relaxed">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="flex items-center gap-2.5">
        <Avatar size="sm">
          <AvatarFallback className="text-[10px]">
            {testimonial.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <span className="block truncate font-medium text-foreground text-xs">
            {testimonial.name}
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {testimonial.department}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/testimonials/quote-card.tsx
git commit -m "feat(testimonials): add QuoteCard component"
```

---

### Task 3: Build the FeaturedQuote component (spotlight)

**Files:**
- Create: `src/components/layout/testimonials/featured-quote.tsx`

**Context:** This is the large left-side spotlight. It shows the full quote with per-line staggered animation, attribution (name/role/department), and a progress bar that fills over the auto-advance duration. Uses `AnimatePresence` with `mode="wait"` for crossfade transitions. The quote text is split by sentences for the stagger effect.

**Step 1: Create the component**

```tsx
"use client";

import { AnimatePresence, motion } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Testimonial } from "./testimonials-data";

const EASE = [0.16, 1, 0.3, 1] as const;

interface FeaturedQuoteProps {
  testimonial: Testimonial;
  duration: number;
  isPaused: boolean;
}

export function FeaturedQuote({
  testimonial,
  duration,
  isPaused,
}: FeaturedQuoteProps) {
  // Split quote into sentences for staggered animation
  const sentences = testimonial.quote.match(/[^.!?]+[.!?]+/g) ?? [
    testimonial.quote,
  ];

  return (
    <div className="relative flex h-full flex-col justify-center">
      {/* Decorative quote mark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-4 -left-2 select-none font-serif text-[140px] text-foreground/[0.04] leading-none"
      >
        &ldquo;
      </span>

      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          initial={{ opacity: 0 }}
          key={testimonial.id}
          transition={{ duration: 0.3 }}
        >
          {/* Quote text — staggered by sentence */}
          <blockquote className="relative z-10">
            {sentences.map((sentence, i) => (
              <motion.span
                animate={{ opacity: 1, y: 0 }}
                className="inline text-xl leading-relaxed tracking-tight sm:text-2xl lg:text-3xl lg:leading-relaxed"
                initial={{ opacity: 0, y: 12 }}
                key={`${testimonial.id}-${i}`}
                transition={{
                  duration: 0.5,
                  ease: EASE,
                  delay: 0.15 + i * 0.08,
                }}
              >
                {sentence}
              </motion.span>
            ))}
          </blockquote>

          {/* Attribution */}
          <motion.div
            animate={{ opacity: 1 }}
            className="mt-6 flex items-center gap-3 lg:mt-8"
            initial={{ opacity: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.15 + sentences.length * 0.08 + 0.2,
            }}
          >
            <Avatar>
              <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <span className="block font-medium text-foreground text-sm">
                {testimonial.name}
              </span>
              <span className="block text-muted-foreground text-xs">
                {testimonial.role}, {testimonial.department}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="mt-8 h-px w-full bg-border/60 lg:mt-10">
        <motion.div
          animate={{ scaleX: 1 }}
          className="h-full origin-left bg-foreground/20"
          initial={{ scaleX: 0 }}
          key={`progress-${testimonial.id}`}
          style={{
            animationPlayState: isPaused ? "paused" : "running",
          }}
          transition={{
            duration: duration / 1000,
            ease: "linear",
          }}
        />
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/testimonials/featured-quote.tsx
git commit -m "feat(testimonials): add FeaturedQuote spotlight component"
```

---

### Task 4: Build the main Testimonials section component

**Files:**
- Create: `src/components/layout/testimonials/testimonials.tsx`

**Context:** This is the parent section that composes FeaturedQuote and QuoteCard. It manages: which featured testimonial is active (auto-advancing on a 6s timer), pause on hover, and promoting a short quote card into the spotlight. Uses `useInView` for scroll-triggered entrance animation. Layout is a 2-column grid on desktop (60/40 split), stacked on mobile.

**Step 1: Create the section component**

```tsx
"use client";

import { motion, useInView } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/core/lib/utils";
import { FeaturedQuote } from "./featured-quote";
import { QuoteCard } from "./quote-card";
import {
  featuredTestimonials,
  shortTestimonials,
  testimonialsSectionData,
  type Testimonial,
} from "./testimonials-data";

const ADVANCE_MS = 6000;
const EASE = [0.16, 1, 0.3, 1] as const;

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const [activeIndex, setActiveIndex] = useState(0);
  const [activePool, setActivePool] = useState<Testimonial[]>(featuredTestimonials);
  const [isPaused, setIsPaused] = useState(false);

  const activeTestimonial = activePool[activeIndex % activePool.length];

  // Auto-advance timer
  useEffect(() => {
    if (!inView || isPaused) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % activePool.length);
    }, ADVANCE_MS);

    return () => clearInterval(timer);
  }, [inView, isPaused, activePool.length]);

  // Handle short quote card click — promote to spotlight
  const handleSelectShort = useCallback(
    (testimonial: Testimonial) => {
      // Temporarily replace pool with just this testimonial + featured ones
      const newPool = [
        testimonial,
        ...featuredTestimonials,
      ];
      setActivePool(newPool);
      setActiveIndex(0);
    },
    []
  );

  return (
    <section
      className="w-full py-16 lg:py-24"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      ref={sectionRef}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Section header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-10 max-w-2xl lg:mb-14"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
            {testimonialsSectionData.headline}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {testimonialsSectionData.subtext}
          </p>
        </motion.div>

        {/* Content grid */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          {/* Featured spotlight — 3 of 5 columns */}
          <div className="lg:col-span-3">
            <FeaturedQuote
              duration={ADVANCE_MS}
              isPaused={isPaused}
              testimonial={activeTestimonial}
            />
          </div>

          {/* Short quote cards — 2 of 5 columns */}
          <div className="lg:col-span-2">
            {/* Desktop: 2x2 grid */}
            <div className="hidden gap-3 lg:grid lg:grid-cols-2">
              {shortTestimonials.map((t) => (
                <QuoteCard
                  isActive={activeTestimonial.id === t.id}
                  key={t.id}
                  onSelect={() => handleSelectShort(t)}
                  testimonial={t}
                />
              ))}
            </div>

            {/* Mobile: horizontal scroll */}
            <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden">
              {shortTestimonials.map((t) => (
                <div className="w-[260px] shrink-0" key={t.id}>
                  <QuoteCard
                    isActive={activeTestimonial.id === t.id}
                    onSelect={() => handleSelectShort(t)}
                    testimonial={t}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/testimonials/testimonials.tsx
git commit -m "feat(testimonials): add main section with auto-advance and interactions"
```

---

### Task 5: Wire into page and verify

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Add testimonials to the page between SplitMedia and closing fragment**

```tsx
import { BentoShowcase } from "@/components/layout/bento/bento";
import { Hero } from "@/components/layout/hero/hero";
import { SplitMedia } from "@/components/layout/split-media/split-media";
import { Testimonials } from "@/components/layout/testimonials/testimonials";

export default function Page() {
  return (
    <>
      <Hero />
      <BentoShowcase />
      <SplitMedia />
      <Testimonials />
    </>
  );
}
```

**Step 2: Run dev server and verify in browser**

```bash
bun dev
```

Open `http://localhost:3000`, scroll to the testimonials section. Verify:
- Section heading renders
- Featured quote shows with staggered sentence animation
- Progress bar fills over 6 seconds
- Auto-advances to next featured quote
- Short quote cards render in 2x2 grid on desktop
- Clicking a short quote card promotes it to spotlight
- Hovering pauses auto-advance
- Mobile: short quotes scroll horizontally

**Step 3: Run lint check**

```bash
bun check
```

Fix any issues.

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(testimonials): wire section into homepage"
```

---

### Task 6: Visual polish pass

**Files:**
- Modify: `src/components/layout/testimonials/featured-quote.tsx`
- Modify: `src/components/layout/testimonials/quote-card.tsx`
- Modify: `src/components/layout/testimonials/testimonials.tsx`

**Step 1: Open browser and take screenshot**

```bash
cmux browser open http://localhost:3000
cmux browser surface:N scroll-into-view "section:has(h2)"  # scroll to testimonials
cmux browser surface:N screenshot --out /tmp/testimonials.png
```

**Step 2: Review and adjust**

Check for:
- Spacing consistency with bento and split-media sections above
- Quote text readability at different viewport sizes
- Progress bar visibility (should be subtle but noticeable)
- Card hover/active states looking clean
- Dark mode rendering (toggle theme and screenshot again)
- Mobile layout (resize browser and screenshot)

Make any needed CSS tweaks to spacing, font sizes, or animation timing.

**Step 3: Run lint check and commit**

```bash
bun check
git add -A src/components/layout/testimonials/
git commit -m "feat(testimonials): visual polish and responsive adjustments"
```
