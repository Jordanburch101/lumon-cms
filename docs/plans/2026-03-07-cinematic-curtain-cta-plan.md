# Cinematic Curtain CTA — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a scroll-driven closing section where the page splits like theatrical curtains to reveal a looping video with a Severance-style message.

**Architecture:** A sticky scroll-driven section using `motion/react`'s `useScroll` + `useTransform`. Two curtain panels animate apart via `clipPath`, revealing a `<video>` loop underneath. Text fades in after the curtains are ~80% open. Follows the same scroll-animation pattern as `ImageGallery`.

**Tech Stack:** React 19, motion/react, Next.js App Router, Tailwind CSS v4

---

### Task 1: Create data file

**Files:**
- Create: `src/components/layout/cinematic-cta/cinematic-cta-data.ts`

**Step 1: Create the data file**

```ts
export const cinematicCtaData = {
  videoSrc: "/hero-vid.mp4",
  label: "Lumon Industries",
  headline: "The work is mysterious and important.",
  subtext: "Your outie has approved this experience.",
} as const;
```

Uses `/hero-vid.mp4` as placeholder (distinct from hero-vid-new.mp4 used by the hero).

**Step 2: Commit**

```bash
git add src/components/layout/cinematic-cta/cinematic-cta-data.ts
git commit -m "feat(cinematic-cta): add data file with video source and copy"
```

---

### Task 2: Build the CinematicCta component

**Files:**
- Create: `src/components/layout/cinematic-cta/cinematic-cta.tsx`

**Reference files (read these first):**
- `src/components/layout/image-gallery/image-gallery.tsx` — scroll + sticky pattern
- `src/components/layout/image-gallery/gallery-card.tsx` — `useTransform` + `clipPath` pattern
- `src/components/layout/hero/hero.tsx` — video + gradient overlay pattern

**Step 1: Create the component**

```tsx
"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { cinematicCtaData } from "./cinematic-cta-data";

export function CinematicCta() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Curtain animation: 0-70% of scroll drives the curtain opening
  // Left curtain: clips from right edge inward (inset right side goes 0% → 50%)
  const leftClip = useTransform(scrollYProgress, [0, 0.7], [0, 50]);
  const leftClipPath = useTransform(
    leftClip,
    (v) => `inset(0 ${v}% 0 0)`
  );

  // Right curtain: clips from left edge inward (inset left side goes 0% → 50%)
  const rightClip = useTransform(scrollYProgress, [0, 0.7], [0, 50]);
  const rightClipPath = useTransform(
    rightClip,
    (v) => `inset(0 0 0 ${v}%)`
  );

  // Text fades in after curtains are ~80% open (scroll 0.55 → 0.75)
  const textOpacity = useTransform(scrollYProgress, [0.55, 0.75], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.55, 0.75], [20, 0]);

  return (
    <section
      className="relative bg-black"
      data-navbar-contrast="light"
      ref={containerRef}
      style={{ height: "250vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Video layer (behind everything) */}
        <video
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          src={cinematicCtaData.videoSrc}
        />

        {/* Gradient overlay on video */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />

        {/* Text overlay (centered) */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4">
          <motion.span
            className="block font-medium text-[11px] text-white/50 uppercase tracking-[0.2em]"
            style={{ opacity: textOpacity, y: textY }}
          >
            {cinematicCtaData.label}
          </motion.span>
          <motion.p
            className="mt-4 max-w-lg text-center font-light text-xl text-white/85 italic leading-relaxed lg:text-2xl"
            style={{ opacity: textOpacity, y: textY }}
          >
            &ldquo;{cinematicCtaData.headline}&rdquo;
          </motion.p>
          <motion.span
            className="mt-3 block text-[11px] text-white/30 uppercase tracking-[0.2em]"
            style={{ opacity: textOpacity, y: textY }}
          >
            {cinematicCtaData.subtext}
          </motion.span>
        </div>

        {/* Left curtain */}
        <motion.div
          className="absolute inset-0 z-20 bg-background"
          style={{ clipPath: leftClipPath }}
        />

        {/* Right curtain */}
        <motion.div
          className="absolute inset-0 z-20 bg-background"
          style={{ clipPath: rightClipPath }}
        />
      </div>
    </section>
  );
}
```

Key details:
- Curtains use `bg-background` so they match the page surface in both light/dark themes
- Curtains sit at `z-20` above the video and text
- As curtains part (clipPath animates), the video and text beneath are revealed
- Text has a staggered fade-in starting after curtains are ~80% open
- Typography matches gallery-card: `text-[11px] uppercase tracking-[0.2em]` for labels, italic for the quote

**Step 2: Verify it renders**

```bash
bun dev
```

Open browser, scroll to the bottom of the page (it won't be integrated yet — do that in Task 3). For now just confirm no TypeScript errors.

**Step 3: Commit**

```bash
git add src/components/layout/cinematic-cta/cinematic-cta.tsx
git commit -m "feat(cinematic-cta): add scroll-driven curtain reveal component"
```

---

### Task 3: Integrate into the home page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Add the import and component**

Add `CinematicCta` as the last section, after `LatestArticles`:

```tsx
import { BentoShowcase } from "@/components/layout/bento/bento";
import { CinematicCta } from "@/components/layout/cinematic-cta/cinematic-cta";
import { Hero } from "@/components/layout/hero/hero";
import { ImageGallery } from "@/components/layout/image-gallery/image-gallery";
import { LatestArticles } from "@/components/layout/latest-articles/latest-articles";
import { SplitMedia } from "@/components/layout/split-media/split-media";
import { Testimonials } from "@/components/layout/testimonials/testimonials";

export default function Page() {
  return (
    <>
      <Hero />
      <BentoShowcase />
      <SplitMedia />
      <Testimonials />
      <ImageGallery />
      <LatestArticles />
      <CinematicCta />
    </>
  );
}
```

**Step 2: Verify in browser**

```bash
bun dev
```

Scroll to the bottom of the home page. Verify:
- Curtains (matching page background) are visible initially
- Scrolling parts them left/right, revealing the video
- Text fades in after curtains are mostly open
- Section holds sticky before releasing into the footer
- Works in both light and dark mode (curtains match theme)

**Step 3: Run lint check**

```bash
bun check
```

Fix any issues.

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: integrate CinematicCta as final home page section"
```

---

### Task 4: Polish and refine

**Files:**
- Modify: `src/components/layout/cinematic-cta/cinematic-cta.tsx`
- Possibly modify: `src/components/layout/cinematic-cta/cinematic-cta-data.ts`

**Step 1: Visual review**

Open browser and scroll through the full page. Check:
- Timing: do curtains open at a satisfying pace? Adjust scroll ranges if too fast/slow
- Text reveal: does the text appear at the right moment? Should it be earlier/later?
- Gradient: is the video too bright or too dark? Adjust gradient overlay opacity
- Scroll height: is 250vh too much or too little? Adjust for pacing
- Mobile: check on smaller viewports — text sizing, curtain behavior

**Step 2: Adjust based on review**

Common adjustments:
- Scroll height: try `200vh` or `300vh` for different pacing
- Curtain timing: adjust the `[0, 0.7]` range — smaller end value = faster open
- Text timing: adjust `[0.55, 0.75]` — later values = more dramatic delay
- Gradient: tweak `from-black/70 via-black/30 to-black/50` for video readability

**Step 3: Commit**

```bash
git add src/components/layout/cinematic-cta/
git commit -m "polish(cinematic-cta): refine scroll timing and visual balance"
```
