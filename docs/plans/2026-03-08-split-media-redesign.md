# Split Media Redesign — Layered Depth Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevate the split media section from a generic 50/50 alternating layout to an immersive, layered storytelling experience with depth and presence.

**Architecture:** Single-file rewrite of `SplitRowItem` component. Adds `useScroll`/`useTransform` for parallax, changes grid to 65/35 with overlapping text card, and adds responsive breakpoints for mobile fallback.

**Tech Stack:** motion/react (useScroll, useTransform, useInView, motion), Next.js Image, Tailwind CSS v4

---

## Design Decisions

- **Role:** Deep product storytelling — each row is a "chapter"
- **Feel:** Layered depth — parallax, overlapping elements, different visual planes
- **Consistency:** Same structure across all rows, varied details (parallax speed, overlap direction)
- **Ratio:** ~65/35 with the text panel overlapping onto the media edge
- **Motion:** Gentle media parallax + text panel slides in from the overlap edge

---

### Task 1: Rewrite SplitRowItem with new layout, motion, and visual treatment

**Files:**
- Modify: `src/components/layout/split-media/split-media.tsx` (full rewrite)
- No changes: `src/components/layout/split-media/split-media-data.ts`

**Step 1: Rewrite split-media.tsx**

Replace the entire file with:

```tsx
"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/core/lib/utils";
import { type SplitRow, splitMediaRows } from "./split-media-data";

const VIDEO_RE = /\.(mp4|webm|ogg)$/i;
const EASE = [0.16, 1, 0.3, 1] as const;

function SplitRowItem({ row, index }: { row: SplitRow; index: number }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rowRef, { once: true, margin: "-100px" });
  const isVideo = VIDEO_RE.test(row.mediaSrc);
  const mediaFirst = index % 2 === 0;

  // Parallax: media drifts as the row scrolls through the viewport
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  // Text slides in from the overlap direction
  const textSlideX = mediaFirst ? -40 : 40;

  const media = (
    <motion.div
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-muted",
        "aspect-[4/3] lg:aspect-auto lg:h-full",
        !mediaFirst && "order-0 lg:order-1"
      )}
      initial={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
    >
      {/* Color overlay */}
      <div className="absolute inset-0 z-10 bg-primary opacity-20 mix-blend-color" />

      {/* Media with parallax (desktop only via CSS containment) */}
      <motion.div
        className="absolute inset-0 lg:-inset-10"
        style={{ y: mediaY }}
      >
        {isVideo ? (
          <video
            autoPlay
            className="h-full w-full object-cover brightness-75"
            loop
            muted
            playsInline
            src={row.mediaSrc}
          />
        ) : (
          <Image
            alt={row.mediaAlt}
            className="object-cover brightness-75"
            fill
            sizes="(max-width: 1024px) 100vw, 65vw"
          src={row.mediaSrc}
          />
        )}
      </motion.div>

      {/* Category label */}
      <span className="absolute top-4 left-4 z-20 text-[11px] text-white/50 uppercase tracking-wider">
        {row.mediaLabel}
      </span>

      {/* Bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">
            {row.mediaOverlay.title}
          </span>
          <Badge className="bg-white/20 text-[10px] text-white">
            {row.mediaOverlay.badge}
          </Badge>
        </div>
        <p className="mt-1 text-white/60 text-xs leading-relaxed">
          {row.mediaOverlay.description}
        </p>
      </div>
    </motion.div>
  );

  const text = (
    <motion.div
      animate={inView ? { opacity: 1, x: 0 } : {}}
      className={cn(
        "flex flex-col justify-center",
        // Mobile: inline content, no card treatment
        "px-2 py-8",
        // Desktop: overlapping card
        "lg:relative lg:z-10 lg:self-center lg:rounded-2xl lg:bg-background lg:p-12 lg:shadow-lg",
        mediaFirst ? "lg:-ml-16" : "lg:-mr-16",
        !mediaFirst && "order-1 lg:order-0"
      )}
      initial={{ opacity: 0, x: textSlideX }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
    >
      {/* Eyebrow label (replaces step numbers) */}
      <motion.span
        animate={inView ? { opacity: 1 } : {}}
        className="mb-4 font-medium text-[11px] text-muted-foreground/50 uppercase tracking-[0.2em]"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {row.mediaLabel}
      </motion.span>

      <motion.h3
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="font-semibold text-2xl leading-snug tracking-tight sm:text-3xl lg:text-4xl"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
      >
        {row.headline}
      </motion.h3>

      <motion.p
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mt-4 max-w-md text-base text-muted-foreground leading-relaxed lg:mt-6 lg:text-lg"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
      >
        {row.body}
      </motion.p>

      {row.cta && (
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mt-6 lg:mt-8"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.55 }}
        >
          <Link
            className="group inline-flex items-center gap-2 font-medium text-foreground text-sm transition-colors hover:text-foreground/70"
            href={row.cta.href}
          >
            {row.cta.label}
            <HugeiconsIcon
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
              icon={ArrowRight01Icon}
            />
          </Link>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <div
      className={cn(
        "grid grid-cols-1 items-stretch gap-6",
        "lg:grid-cols-[1fr_0.55fr] lg:gap-0 lg:min-h-[580px]"
      )}
      ref={rowRef}
    >
      {media}
      {text}
    </div>
  );
}

export function SplitMedia() {
  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex flex-col gap-24 lg:gap-32">
          {splitMediaRows.map((row, i) => (
            <SplitRowItem index={i} key={row.headline} row={row} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Key changes from current code:**
- Grid: `lg:grid-cols-2` → `lg:grid-cols-[1fr_0.55fr]` (65/35 ratio)
- Text panel: adds `lg:bg-background lg:rounded-2xl lg:shadow-lg lg:p-12` + negative margin overlap (`lg:-ml-16` / `lg:-mr-16`)
- Text entrance: `y` animation → `x` animation (slides from overlap direction)
- Media: wraps image/video in `motion.div` with `style={{ y: mediaY }}` for parallax
- Media inner container: `lg:-inset-10` gives overflow room for parallax travel
- Step numbers (`01`, `02`) → eyebrow label from `row.mediaLabel`
- Row gap: `gap-16 lg:gap-24` → `gap-24 lg:gap-32`
- Mobile: no card treatment, no parallax — just fade/slide entrance

**Step 2: Run lint check**

Run: `bun check`
Expected: PASS (no lint errors)

**Step 3: Visual verification**

Open `http://localhost:3000` and scroll to the split media section. Verify:
- Media takes ~65% width on desktop
- Text card overlaps media edge with background/shadow/rounded corners
- Media parallaxes subtly as you scroll
- Text card slides in from the overlap side
- Alternating layout works (row 1: media left, row 2: media right, row 3: media left)
- Mobile: single column, no overlap, no card treatment
- Eyebrow labels show "Process", "Heritage", "Culture" instead of "01", "02", "03"

**Step 4: Commit**

```bash
git add src/components/layout/split-media/split-media.tsx
git commit -m "refine(split-media): layered depth with parallax and overlapping text cards"
```
