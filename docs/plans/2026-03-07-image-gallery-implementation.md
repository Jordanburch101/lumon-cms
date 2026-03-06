# Immersive Image Gallery — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a cinematic full-bleed image gallery section with scroll-triggered clip-reveal animations for Severance world-building.

**Architecture:** Data-driven array of gallery items rendered as stacked `<figure>` elements. Each card uses `motion/react` `useInView` to trigger a clip-path + scale reveal animation. Minimal text overlay (label + caption) fades in after the image. Placed between Testimonials and Footer in the page.

**Tech Stack:** motion/react, Tailwind CSS v4, Next.js Image (`next/image`), TypeScript

---

### Task 1: Create the gallery data file

**Files:**
- Create: `src/components/layout/image-gallery/image-gallery-data.ts`

**Step 1: Create the data file with type and content array**

```ts
export interface GalleryItem {
  id: string;
  label: string;
  caption: string;
  imageSrc: string;
  imageAlt: string;
}

export const galleryItems: GalleryItem[] = [
  {
    id: "severed-floor",
    label: "Severed Floor",
    caption: "The elevator arrives. The work begins.",
    imageSrc: "/gallery/severed-floor.jpg",
    imageAlt: "The long fluorescent-lit corridor of the severed floor",
  },
  {
    id: "macrodata-refinement",
    label: "Macrodata Refinement",
    caption: "The numbers are unknowable. The work is not.",
    imageSrc: "/gallery/macrodata-refinement.jpg",
    imageAlt: "The MDR office with terminals and refiners at work",
  },
  {
    id: "break-room",
    label: "The Break Room",
    caption: "Forgive me for what I have done to the children of Kier.",
    imageSrc: "/gallery/break-room.jpg",
    imageAlt: "The stark break room with a single chair and speaker",
  },
  {
    id: "perpetuity-wing",
    label: "Perpetuity Wing",
    caption: "Nine founders. Nine lives. Preserved in wax and wonder.",
    imageSrc: "/gallery/perpetuity-wing.jpg",
    imageAlt: "Wax figures of the Eagan founders in the Perpetuity Wing",
  },
  {
    id: "the-board",
    label: "The Board",
    caption: "The Board thanks you for your service.",
    imageSrc: "/gallery/the-board.jpg",
    imageAlt: "A dark, minimal conference space",
  },
];
```

**Step 2: Run lint check**

Run: `bun check`
Expected: No errors in the new file

**Step 3: Commit**

```bash
git add src/components/layout/image-gallery/image-gallery-data.ts
git commit -m "feat(gallery): add gallery data with Severance locations"
```

---

### Task 2: Build the gallery card component

**Files:**
- Create: `src/components/layout/image-gallery/gallery-card.tsx`

**Context:** This is the core visual component. Each card renders a full-width image inside an overflow-hidden container. On scroll into view, the image reveals via `clip-path: inset()` animation and a subtle scale-down. Text fades in after.

The project uses `motion/react` (not `framer-motion`). See `src/components/layout/split-media/split-media.tsx` for the existing pattern: `useInView` with `{ once: true, margin: "-100px" }`, motion components with `animate={inView ? { ... } : {}}` and `initial={{ ... }}`.

**Step 1: Create the gallery card component**

```tsx
"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

import type { GalleryItem } from "./image-gallery-data";

const EASE = [0.16, 1, 0.3, 1] as const;

interface GalleryCardProps {
  item: GalleryItem;
}

export function GalleryCard({ item }: GalleryCardProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <figure ref={ref} className="relative w-full overflow-hidden">
      {/* Image container — clip-path + scale reveal */}
      <motion.div
        animate={
          inView
            ? { clipPath: "inset(0%)", scale: 1 }
            : {}
        }
        className="relative aspect-[16/9] max-h-[85vh] w-full"
        initial={{ clipPath: "inset(8%)", scale: 1.08 }}
        transition={{
          duration: 1.2,
          ease: EASE,
        }}
      >
        <Image
          alt={item.imageAlt}
          className="object-cover"
          fill
          sizes="100vw"
          src={item.imageSrc}
        />

        {/* Subtle bottom gradient for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
      </motion.div>

      {/* Text overlay — anchored to bottom-left of the image */}
      <figcaption className="absolute inset-x-0 bottom-0 z-10 p-6 lg:p-10">
        <motion.span
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="block font-medium text-[11px] text-white/60 uppercase tracking-[0.2em]"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
        >
          {item.label}
        </motion.span>
        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mt-2 max-w-lg font-light text-lg text-white/90 italic leading-relaxed lg:text-xl"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.75 }}
        >
          &ldquo;{item.caption}&rdquo;
        </motion.p>
      </figcaption>
    </figure>
  );
}
```

**Step 2: Run lint check**

Run: `bun check`
Expected: No errors in the new file

**Step 3: Commit**

```bash
git add src/components/layout/image-gallery/gallery-card.tsx
git commit -m "feat(gallery): add gallery card with clip-reveal animation"
```

---

### Task 3: Build the parent gallery section

**Files:**
- Create: `src/components/layout/image-gallery/image-gallery.tsx`

**Context:** The parent section maps over the gallery data and renders each `GalleryCard`. Follows the same section pattern as other layout components (see `src/components/layout/testimonials/testimonials.tsx` for reference): a `<section>` with max-width container and padding.

**Step 1: Create the image gallery section component**

```tsx
"use client";

import { GalleryCard } from "./gallery-card";
import { galleryItems } from "./image-gallery-data";

export function ImageGallery() {
  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex flex-col gap-10 lg:gap-16">
          {galleryItems.map((item) => (
            <GalleryCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Run lint check**

Run: `bun check`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/layout/image-gallery/image-gallery.tsx
git commit -m "feat(gallery): add parent image gallery section"
```

---

### Task 4: Wire up the gallery to the page

**Files:**
- Modify: `src/app/page.tsx`

**Context:** Add the `ImageGallery` component between `<Testimonials />` and the closing fragment. The page currently renders: Hero → BentoShowcase → SplitMedia → Testimonials.

**Step 1: Add the import and component**

Add import at the top of `src/app/page.tsx`:
```ts
import { ImageGallery } from "@/components/layout/image-gallery/image-gallery";
```

Add `<ImageGallery />` after `<Testimonials />`:
```tsx
export default function Page() {
  return (
    <>
      <Hero />
      <BentoShowcase />
      <SplitMedia />
      <Testimonials />
      <ImageGallery />
    </>
  );
}
```

**Step 2: Run lint check**

Run: `bun check`
Expected: No errors

**Step 3: Verify visually**

Run: `bun dev` (if not already running)
Navigate to `http://localhost:3000` and scroll to the bottom of the page. You should see:
- 5 stacked image cards between Testimonials and Footer
- Each card has a placeholder/broken image (images not yet sourced) but the clip-reveal animation and text overlay should still be visible
- Text labels and captions should fade in as each card scrolls into view

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(gallery): wire image gallery section into homepage"
```

---

### Task 5: Source placeholder images

**Files:**
- Create: `public/gallery/` directory with 5 images

**Context:** The gallery needs 5 images. For now, use placeholder images so the section renders properly. The user will source real Severance location images separately.

**Step 1: Create the gallery directory and add placeholder images**

Generate 5 placeholder images using a service or copy existing project images as temporary stand-ins. The images need to be at `public/gallery/`:
- `severed-floor.jpg`
- `macrodata-refinement.jpg`
- `break-room.jpg`
- `perpetuity-wing.jpg`
- `the-board.jpg`

If no suitable placeholders are available, create simple gradient SVGs or use existing videos' poster frames. Alternatively, update the data file to point to existing project images temporarily (e.g. reuse images from `/public/` that already exist).

**Step 2: Verify visually**

Reload `http://localhost:3000` and confirm all 5 gallery cards render with visible images, the clip-reveal animation works, and the text overlays are legible.

**Step 3: Commit**

```bash
git add public/gallery/
git commit -m "feat(gallery): add placeholder gallery images"
```
