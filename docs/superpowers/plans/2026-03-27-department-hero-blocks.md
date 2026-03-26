# Department Hero Blocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new hero blocks (HeroSpecimen, HeroBriefing) for department/service pages.

**Architecture:** Both blocks follow existing hero patterns — Payload block schema → React component with motion/react animations → render-blocks registration → Storybook fixture. HeroSpecimen is a contained card with header bar + split layout. HeroBriefing is a cinematic letterbox image with text below.

**Tech Stack:** Payload CMS 3.x block schemas, React 19, motion/react, Next.js Image, Tailwind CSS v4, Storybook

**Spec:** `docs/superpowers/specs/2026-03-27-department-hero-blocks-design.md`

---

### Task 1: HeroSpecimen Block Schema

**Files:**
- Create: `src/payload/block-schemas/HeroSpecimen.ts`

- [ ] **Step 1: Create the block schema**

```typescript
import type { Block } from "payload";
import { link } from "../fields/link/link";

export const HeroSpecimenBlock: Block = {
  slug: "heroSpecimen",
  dbName: "heroSpec",
  labels: { singular: "Hero Specimen", plural: "Hero Specimen" },
  admin: {
    group: "Heroes",
    custom: {
      description:
        "Contained specimen card with header bar, text left, full-bleed image right. For structured product/service pages.",
    },
  },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      required: true,
      admin: {
        description:
          'Department classification shown in header bar, e.g. "Core Operations — MDR"',
      },
    },
    {
      name: "icon",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Small department icon displayed in the header bar.",
      },
    },
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    {
      name: "mediaSrc",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description: "Department photo displayed full-bleed in the right column.",
      },
    },
    link({
      name: "primaryCta",
      required: true,
      appearance: {
        type: ["button"],
        button: { variants: ["default", "outline"], sizes: ["lg"] },
      },
    }),
    link({
      name: "secondaryCta",
      required: true,
      appearance: {
        type: ["button"],
        button: { variants: ["outline", "default"], sizes: ["lg"] },
      },
    }),
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/payload/block-schemas/HeroSpecimen.ts
git commit -m "feat: add HeroSpecimen block schema"
```

---

### Task 2: HeroBriefing Block Schema

**Files:**
- Create: `src/payload/block-schemas/HeroBriefing.ts`

- [ ] **Step 1: Create the block schema**

```typescript
import type { Block } from "payload";
import { link } from "../fields/link/link";

export const HeroBriefingBlock: Block = {
  slug: "heroBriefing",
  dbName: "heroBrief",
  labels: { singular: "Hero Briefing", plural: "Hero Briefing" },
  admin: {
    group: "Heroes",
    custom: {
      description:
        "Cinematic letterbox image (21:9) with text below. For editorial/brand pages where photography is the star.",
    },
  },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      required: true,
      admin: {
        description:
          'Department classification, e.g. "Research & Development — Biotech"',
      },
    },
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    {
      name: "mediaSrc",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description: "Department photo displayed in a cinematic 21:9 letterbox crop.",
      },
    },
    {
      name: "posterSrc",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Fallback poster image if mediaSrc is a video.",
      },
    },
    link({
      name: "primaryCta",
      required: true,
      appearance: {
        type: ["button"],
        button: { variants: ["default", "outline"], sizes: ["lg"] },
      },
    }),
    link({
      name: "secondaryCta",
      required: true,
      appearance: {
        type: ["button"],
        button: { variants: ["outline", "default"], sizes: ["lg"] },
      },
    }),
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/payload/block-schemas/HeroBriefing.ts
git commit -m "feat: add HeroBriefing block schema"
```

---

### Task 3: Register Schemas in Pages Collection

**Files:**
- Modify: `src/payload/collections/pages.ts` — add imports and register both blocks in the `hero` field's `blocks` array

- [ ] **Step 1: Add imports at the top of `pages.ts`**

Add alongside existing hero block imports:

```typescript
import { HeroSpecimenBlock } from "../block-schemas/HeroSpecimen";
import { HeroBriefingBlock } from "../block-schemas/HeroBriefing";
```

- [ ] **Step 2: Add both blocks to the hero blocks array**

In the `hero` field's `blocks` array, add `HeroSpecimenBlock` and `HeroBriefingBlock` after the existing entries:

```typescript
blocks: [HeroBlock, HeroCenteredBlock, HeroStatsBlock, HeroMinimalBlock, HeroSpecimenBlock, HeroBriefingBlock],
```

- [ ] **Step 3: Generate migration**

```bash
bun run migrate:create
```

Review the generated migration file in `src/migrations/` — it should create `heroSpec` and `heroBrief` tables with the expected columns.

- [ ] **Step 4: Apply migration**

```bash
bun run migrate
```

- [ ] **Step 5: Generate types**

```bash
bun generate:types
```

- [ ] **Step 6: Commit**

```bash
git add src/payload/collections/pages.ts src/migrations/
git commit -m "feat: register HeroSpecimen and HeroBriefing in pages collection"
```

---

### Task 4: HeroSpecimen Component

**Files:**
- Create: `src/components/blocks/hero/hero-specimen.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import { cn, getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { ExtractHeroBlock } from "@/types/block-types";

type HeroSpecimenBlock = ExtractHeroBlock<"heroSpecimen">;

const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroSpecimen({
  eyebrow,
  icon,
  headline,
  subtext,
  mediaSrc,
  primaryCta,
  secondaryCta,
}: HeroSpecimenBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const url = getMediaUrl(mediaSrc);
  const blurDataURL = getBlurDataURL(mediaSrc);
  const iconUrl = getMediaUrl(icon);

  return (
    <section className="w-full py-24 lg:py-32" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="overflow-hidden rounded-xl border border-border/50 bg-card"
          initial={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {/* Header bar */}
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="flex items-center gap-3 border-b border-border/40 px-6 py-3.5 lg:px-8"
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          >
            {iconUrl && (
              <div className="flex size-5 items-center justify-center overflow-hidden rounded border border-border/50">
                <Image
                  alt=""
                  className="object-contain"
                  height={20}
                  src={iconUrl}
                  width={20}
                />
              </div>
            )}
            <span
              className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
              data-field="eyebrow"
            >
              {eyebrow}
            </span>
          </motion.div>

          {/* Body: text + image split */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
            {/* Left: text content */}
            <div className="flex flex-col justify-center border-b border-border/40 p-8 lg:border-r lg:border-b-0 lg:p-10">
              <motion.h1
                animate={inView ? { opacity: 1, y: 0 } : {}}
                className="font-semibold text-3xl leading-tight sm:text-4xl"
                data-field="headline"
                initial={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
              >
                {headline}
              </motion.h1>

              <motion.div
                animate={inView ? { opacity: 1 } : {}}
                className="mt-4 h-px w-8 bg-border"
                initial={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
              />

              <motion.p
                animate={inView ? { opacity: 1, y: 0 } : {}}
                className="mt-4 text-base leading-relaxed text-muted-foreground"
                data-field="subtext"
                initial={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
              >
                {subtext}
              </motion.p>

              <motion.div
                animate={inView ? { opacity: 1, y: 0 } : {}}
                className="mt-8 flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
              >
                <CMSLink
                  data-field-group="primaryCta"
                  data-field-group-type="link"
                  link={primaryCta}
                />
                <CMSLink
                  data-field-group="secondaryCta"
                  data-field-group-type="link"
                  link={secondaryCta}
                />
              </motion.div>
            </div>

            {/* Right: full-bleed image */}
            <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto">
              {url && (
                <motion.div
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
                >
                  <Image
                    alt={headline || "Department image"}
                    blurDataURL={blurDataURL}
                    className="object-cover"
                    data-field="mediaSrc"
                    fill
                    placeholder={blurDataURL ? "blur" : "empty"}
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    src={url}
                  />
                  {/* Subtle left-edge fade on desktop */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-10 bg-gradient-to-r from-card to-transparent lg:block" />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/blocks/hero/hero-specimen.tsx
git commit -m "feat: add HeroSpecimen component"
```

---

### Task 5: HeroBriefing Component

**Files:**
- Create: `src/components/blocks/hero/hero-briefing.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import { getBlurDataURL, getMediaUrl, isVideoUrl } from "@/core/lib/utils";
import type { ExtractHeroBlock } from "@/types/block-types";

type HeroBriefingBlock = ExtractHeroBlock<"heroBriefing">;

const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroBriefing({
  eyebrow,
  headline,
  subtext,
  mediaSrc,
  posterSrc,
  primaryCta,
  secondaryCta,
}: HeroBriefingBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const url = getMediaUrl(mediaSrc);
  const blurDataURL = getBlurDataURL(mediaSrc);
  const posterUrl = getMediaUrl(posterSrc);
  const isVideo = url ? isVideoUrl(url) : false;

  return (
    <section className="w-full py-24 lg:py-32" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Cinematic letterbox image */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border/50 lg:aspect-[21/9]"
          initial={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {url && isVideo && (
            <video
              autoPlay
              className="h-full w-full object-cover"
              data-field="mediaSrc"
              loop
              muted
              playsInline
              poster={posterUrl || blurDataURL || undefined}
              preload="auto"
              src={url}
            />
          )}
          {url && !isVideo && (
            <Image
              alt={headline || "Department image"}
              blurDataURL={blurDataURL}
              className="object-cover"
              data-field="mediaSrc"
              fill
              placeholder={blurDataURL ? "blur" : "empty"}
              priority
              sizes="100vw"
              src={url}
            />
          )}
          {/* Bottom gradient fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
        </motion.div>

        {/* Text below image */}
        <div className="mt-6 lg:mt-8">
          <motion.span
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
            data-field="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
          >
            {eyebrow}
          </motion.span>

          <motion.h1
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="mt-4 font-semibold text-3xl leading-tight sm:text-4xl"
            data-field="headline"
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          >
            {headline}
          </motion.h1>

          <motion.p
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground"
            data-field="subtext"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
          >
            {subtext}
          </motion.p>

          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          >
            <CMSLink
              data-field-group="primaryCta"
              data-field-group-type="link"
              link={primaryCta}
            />
            <CMSLink
              data-field-group="secondaryCta"
              data-field-group-type="link"
              link={secondaryCta}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/blocks/hero/hero-briefing.tsx
git commit -m "feat: add HeroBriefing component"
```

---

### Task 6: Register Components in render-blocks

**Files:**
- Modify: `src/components/blocks/render-blocks.tsx`
- Modify: `src/types/block-types.ts`

- [ ] **Step 1: Add type exports to `block-types.ts`**

Add after the existing `HeroMinimalBlock` export:

```typescript
export type HeroSpecimenBlock = ExtractHeroBlock<"heroSpecimen">;
export type HeroBriefingBlock = ExtractHeroBlock<"heroBriefing">;
```

- [ ] **Step 2: Add imports to `render-blocks.tsx`**

```typescript
import { HeroSpecimen } from "./hero/hero-specimen";
import { HeroBriefing } from "./hero/hero-briefing";
```

- [ ] **Step 3: Add cases to `renderHeroBlock` switch**

Add alongside existing hero cases:

```typescript
case "heroSpecimen":
  return <HeroSpecimen {...block} />;
case "heroBriefing":
  return <HeroBriefing {...block} />;
```

- [ ] **Step 4: Commit**

```bash
git add src/components/blocks/render-blocks.tsx src/types/block-types.ts
git commit -m "feat: register HeroSpecimen and HeroBriefing in render-blocks"
```

---

### Task 7: Storybook Fixtures

**Files:**
- Modify: `src/components/blocks/__fixtures__/block-fixtures.ts`

- [ ] **Step 1: Add fixtures to `blockFixtures` object**

Add after the existing `heroMinimal` fixture:

```typescript
heroSpecimen: {
  blockType: "heroSpecimen",
  eyebrow: "Core Operations — MDR",
  icon: mockMedia(800, 800),
  headline: "Macrodata Refinement",
  subtext:
    "Refining data to its essential form. The work is mysterious and important. Your outie has been informed of these results.",
  mediaSrc: mockMedia(1200, 800),
  primaryCta: mockCta("Explore Department"),
  secondaryCta: mockCta("Contact", "outline"),
},
heroBriefing: {
  blockType: "heroBriefing",
  eyebrow: "Research & Development — Biotech",
  headline: "Biotech Solutions",
  subtext:
    "Advancing the science of wellbeing. Every refinement brings us closer to the complete human experience Kier envisioned.",
  mediaSrc: mockMedia(1920, 823),
  primaryCta: mockCta("Explore Department"),
  secondaryCta: mockCta("Contact", "outline"),
},
```

Note: The `mockMedia(1920, 823)` dimensions approximate a 21:9 source image for the briefing hero.

- [ ] **Step 2: Run Storybook to verify both render**

```bash
bun storybook
```

Open http://localhost:6006 and confirm both "Hero Specimen" and "Hero Briefing" appear in the sidebar under the Heroes group.

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/__fixtures__/block-fixtures.ts
git commit -m "feat: add Storybook fixtures for HeroSpecimen and HeroBriefing"
```

---

### Task 8: Build Verification and Lint

- [ ] **Step 1: Run lint check**

```bash
bun check
```

Fix any issues with `bun fix` if needed.

- [ ] **Step 2: Run production build**

```bash
bun build
```

Expected: Build succeeds with no type errors. Both new hero block types are recognized by TypeScript.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "chore: lint fixes for department hero blocks"
```

(Skip if no fixes were needed.)
