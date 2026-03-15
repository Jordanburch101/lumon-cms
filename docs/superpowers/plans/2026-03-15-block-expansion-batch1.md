# Block Expansion Batch 1 — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 hero variants and 4 new blocks (Features Grid, Team, CTA Band, Logo Cloud) to the Payload CMS block library.

**Architecture:** Each block follows the existing pattern — schema in `payload/block-schemas/`, client component in `components/blocks/`, registered via switch/case in `render-blocks.tsx` and `Pages.ts`. Hero gets a `variant` field; new blocks each get their own schema + component file. All animated components use motion/react with the standard `EASE`/`useInView` skeleton.

**Tech Stack:** Next.js 16, Payload CMS 3.x, React 19, motion/react, Tailwind CSS v4, Hugeicons, next/image

**Spec:** `docs/superpowers/specs/2026-03-15-block-expansion-batch1-design.md`

---

## Chunk 1: Hero Variant Expansion

### Task 1: Update Hero Schema with Variant Field

**Files:**
- Modify: `src/payload/block-schemas/Hero.ts`

- [ ] **Step 1: Add variant select and make mediaSrc conditional**

```ts
// src/payload/block-schemas/Hero.ts
import type { Block } from "payload";
import { link } from "../fields/link/link";

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Hero" },
  fields: [
    {
      name: "variant",
      type: "select",
      defaultValue: "default",
      options: [
        { label: "Default (Full Bleed)", value: "default" },
        { label: "Centered", value: "centered" },
        { label: "Split", value: "split" },
        { label: "Minimal", value: "minimal" },
      ],
    },
    {
      name: "mediaSrc",
      type: "upload",
      relationTo: "media",
      admin: {
        condition: (_, siblingData) => siblingData?.variant !== "minimal",
        description:
          "Required for Default, Centered, and Split variants.",
      },
      validate: (
        val: unknown,
        { siblingData }: { siblingData: Record<string, unknown> },
      ) => {
        const variant = (siblingData?.variant as string) ?? "default";
        if (variant !== "minimal" && !val) {
          return "Media is required for this variant";
        }
        return true;
      },
    },
    {
      name: "posterSrc",
      type: "upload",
      relationTo: "media",
      admin: {
        condition: (_, siblingData) => siblingData?.variant !== "minimal",
        description:
          "Still image shown while a video loads. Upload a frame from the video for best results.",
      },
    },
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    {
      name: "stats",
      type: "array",
      maxRows: 4,
      admin: {
        condition: (_, siblingData) => siblingData?.variant === "split",
        description:
          "Displayed in place of media on the Split variant. Leave empty to use media instead.",
      },
      fields: [
        { name: "value", type: "text", required: true },
        { name: "label", type: "text", required: true },
      ],
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

- [ ] **Step 2: Regenerate types**

Run: `bun run generate:types`
Expected: `src/payload-types.ts` updated with new Hero fields (variant, stats)

- [ ] **Step 3: Commit**

```bash
git add src/payload/block-schemas/Hero.ts src/payload-types.ts
git commit -m "feat(hero): add variant select field and stats array to schema"
```

---

### Task 2: Hero Entry Point — Variant Dispatch

**Files:**
- Modify: `src/components/blocks/hero/hero.tsx`

- [ ] **Step 1: Update Hero component to dispatch variants**

The existing Hero is a server component. Keep it as the entry point that switches on variant. New variant sub-components will be `"use client"`.

```tsx
// src/components/blocks/hero/hero.tsx
import Image from "next/image";
import { CMSLink } from "@/components/ui/cms-link";
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { HeroBlock } from "@/types/block-types";
import { HeroCentered } from "./hero-centered";
import { HeroMinimal } from "./hero-minimal";
import { HeroSplit } from "./hero-split";

const VIDEO_EXTENSION_RE = /\.(mp4|webm|ogg)$/i;

function getMediaType(src: string): "video" | "image" {
  return VIDEO_EXTENSION_RE.test(src) ? "video" : "image";
}

export function Hero(props: HeroBlock) {
  const { variant = "default" } = props;

  switch (variant) {
    case "centered":
      return <HeroCentered {...props} />;
    case "split":
      return <HeroSplit {...props} />;
    case "minimal":
      return <HeroMinimal {...props} />;
    default:
      return <HeroDefault {...props} />;
  }
}

/** Original full-bleed hero — kept as server component */
function HeroDefault({
  mediaSrc,
  posterSrc,
  headline,
  subtext,
  primaryCta,
  secondaryCta,
}: HeroBlock) {
  const url = getMediaUrl(mediaSrc);
  const blurDataURL = getBlurDataURL(mediaSrc);
  const posterUrl = getMediaUrl(posterSrc);
  const mediaType = url ? getMediaType(url) : "image";

  const preloadHref = mediaType === "video" ? posterUrl || blurDataURL : url;

  return (
    <section
      className="relative min-h-[calc(100svh-56px)] w-full"
      data-navbar-contrast="light"
    >
      {preloadHref && (
        <link
          as="image"
          fetchPriority="high"
          href={preloadHref}
          rel="preload"
        />
      )}

      {url && mediaType === "video" && (
        <video
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          data-field="mediaSrc"
          loop
          muted
          playsInline
          poster={posterUrl || blurDataURL || undefined}
          preload="auto"
          src={url}
        />
      )}
      {url && mediaType === "image" && (
        <Image
          alt="Hero background"
          blurDataURL={blurDataURL}
          className="object-cover"
          data-field="mediaSrc"
          fill
          placeholder={blurDataURL ? "blur" : "empty"}
          priority
          src={url}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-16 lg:px-6">
        <h1
          className="max-w-2xl font-semibold text-4xl text-white leading-tight sm:text-5xl lg:text-6xl"
          data-field="headline"
        >
          {headline}
        </h1>
        <p
          className="mt-4 max-w-xl text-base text-white/70"
          data-field="subtext"
        >
          {subtext}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <CMSLink
            className="bg-white text-black hover:bg-white/90"
            data-field-group="primaryCta"
            data-field-group-type="link"
            link={primaryCta}
          />
          <CMSLink
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            data-field-group="secondaryCta"
            data-field-group-type="link"
            link={secondaryCta}
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify default variant still works**

Run: `bun dev` — visit a page with the existing Hero block. It should render identically.

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/hero/hero.tsx
git commit -m "feat(hero): add variant dispatch, preserve default as server component"
```

---

### Task 3: Hero Centered Variant

**Files:**
- Create: `src/components/blocks/hero/hero-centered.tsx`

- [ ] **Step 1: Create the centered hero component**

```tsx
// src/components/blocks/hero/hero-centered.tsx
"use client";

import { motion, useInView, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useCallback, useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { HeroBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;
const VIDEO_EXTENSION_RE = /\.(mp4|webm|ogg)$/i;

export function HeroCentered({
  mediaSrc,
  posterSrc,
  headline,
  subtext,
  primaryCta,
  secondaryCta,
}: HeroBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const url = getMediaUrl(mediaSrc);
  const blurDataURL = getBlurDataURL(mediaSrc);
  const posterUrl = getMediaUrl(posterSrc);
  const isVideo = url ? VIDEO_EXTENSION_RE.test(url) : false;

  // Magnetic hover for CTAs
  const mouseX = useSpring(0, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 300, damping: 30 });
  const btnTranslateX = useTransform(mouseX, [-200, 200], [-4, 4]);
  const btnTranslateY = useTransform(mouseY, [-200, 200], [-2, 2]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // Split headline into words for stagger
  const words = headline?.split(" ") ?? [];

  return (
    <section
      className="relative flex min-h-[calc(100svh-56px)] w-full items-center justify-center overflow-hidden"
      data-navbar-contrast="light"
      ref={sectionRef}
    >
      {/* Background media */}
      {url && isVideo && (
        <video
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
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
          alt="Hero background"
          blurDataURL={blurDataURL}
          className="object-cover"
          data-field="mediaSrc"
          fill
          placeholder={blurDataURL ? "blur" : "empty"}
          priority
          src={url}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />

      {/* Grid overlay */}
      <motion.div
        animate={inView ? { opacity: [0.4, 0.2] } : {}}
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%)",
        }}
        transition={{ duration: 2, ease: EASE }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-2xl px-4 text-center lg:px-6">
        <h1
          className="font-semibold text-4xl text-white leading-tight sm:text-5xl lg:text-6xl"
          data-field="headline"
        >
          {words.map((word, i) => (
            <motion.span
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="inline-block"
              initial={{ opacity: 0, y: 24 }}
              key={`${word}-${i}`}
              transition={{
                duration: 0.8,
                ease: EASE,
                delay: 0.1 + i * 0.04,
              }}
            >
              {word}
              {i < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          ))}
        </h1>

        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mx-auto mt-5 max-w-lg text-[1.0625rem] text-white/60 leading-relaxed"
          data-field="subtext"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
        >
          {subtext}
        </motion.p>

        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mt-10 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          style={{ x: btnTranslateX, y: btnTranslateY }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
        >
          <CMSLink
            className="bg-white text-black hover:bg-white/90"
            data-field-group="primaryCta"
            data-field-group-type="link"
            link={primaryCta}
          />
          <CMSLink
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            data-field-group="secondaryCta"
            data-field-group-type="link"
            link={secondaryCta}
          />
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Test in dev**

Run: `bun dev` — create/edit a page, set Hero variant to "Centered". Verify:
- Words stagger in
- Grid overlay pulses on load
- CTA buttons shift subtly on mouse move

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/hero/hero-centered.tsx
git commit -m "feat(hero): add centered variant with word stagger and magnetic CTAs"
```

---

### Task 4: Hero Split Variant

**Files:**
- Create: `src/components/blocks/hero/hero-split.tsx`

- [ ] **Step 1: Create the split hero component**

```tsx
// src/components/blocks/hero/hero-split.tsx
"use client";

import { motion, useInView, useSpring } from "motion/react";
import Image from "next/image";
import { useCallback, useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { HeroBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;
const VIDEO_EXTENSION_RE = /\.(mp4|webm|ogg)$/i;

export function HeroSplit({
  mediaSrc,
  posterSrc,
  headline,
  subtext,
  primaryCta,
  secondaryCta,
  stats,
}: HeroBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const hasStats = stats && stats.length > 0;

  const url = getMediaUrl(mediaSrc);
  const blurDataURL = getBlurDataURL(mediaSrc);
  const posterUrl = getMediaUrl(posterSrc);
  const isVideo = url ? VIDEO_EXTENSION_RE.test(url) : false;

  // Panel tilt
  const rotateX = useSpring(0, { stiffness: 200, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 30 });

  const handlePanelMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      rotateY.set(x * 4);
      rotateX.set(-y * 4);
    },
    [rotateX, rotateY],
  );

  const handlePanelMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <section className="w-full py-24 lg:py-32" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text */}
          <div>
            <motion.h1
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="font-semibold text-4xl leading-tight sm:text-5xl lg:text-6xl"
              data-field="headline"
              initial={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
            >
              {headline}
            </motion.h1>

            <motion.p
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="mt-4 max-w-md text-base text-muted-foreground leading-relaxed"
              data-field="subtext"
              initial={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
            >
              {subtext}
            </motion.p>

            <motion.div
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="mt-8 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
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

          {/* Media / Stats panel */}
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="relative overflow-hidden rounded-lg border border-border/50 bg-card"
            initial={{ opacity: 0, y: 32 }}
            onMouseLeave={handlePanelMouseLeave}
            onMouseMove={handlePanelMouseMove}
            style={{
              perspective: 1000,
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          >
            {hasStats ? (
              <>
                {/* Live badge */}
                <motion.div
                  animate={{ opacity: [1, 0.6, 1] }}
                  className="absolute top-3 right-3 z-10 rounded border border-primary/25 bg-primary/15 px-2.5 py-1 font-mono text-[10px] text-blue-400 uppercase tracking-[0.15em]"
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  Live Metrics
                </motion.div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 divide-x divide-y divide-border/50">
                  {stats.map((stat, i) => (
                    <motion.div
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      className="flex flex-col items-center justify-center gap-2 p-8"
                      data-array-item={`stats.${i}`}
                      initial={{ opacity: 0, y: 16 }}
                      key={stat.id}
                      transition={{
                        duration: 0.8,
                        ease: EASE,
                        delay: 0.3 + i * 0.15,
                      }}
                    >
                      <span
                        className="font-bold text-3xl tracking-tighter"
                        data-field={`stats.${i}.value`}
                      >
                        {stat.value}
                      </span>
                      <span
                        className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
                        data-field={`stats.${i}.label`}
                      >
                        {stat.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              /* Media fallback */
              <div className="aspect-[4/3]">
                {url && isVideo && (
                  <video
                    autoPlay
                    className="h-full w-full object-cover"
                    data-field="mediaSrc"
                    loop
                    muted
                    playsInline
                    poster={posterUrl || blurDataURL || undefined}
                    src={url}
                  />
                )}
                {url && !isVideo && (
                  <Image
                    alt="Hero media"
                    blurDataURL={blurDataURL}
                    className="object-cover"
                    data-field="mediaSrc"
                    fill
                    placeholder={blurDataURL ? "blur" : "empty"}
                    src={url}
                  />
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Test in dev**

Run: `bun dev` — create a Hero with variant "Split" and add 4 stats. Verify:
- Two-column layout with text left, stats right
- Panel tilts on mouse move
- "Live Metrics" badge pulses
- Stats stagger in

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/hero/hero-split.tsx
git commit -m "feat(hero): add split variant with stats panel and tilt interaction"
```

---

### Task 5: Hero Minimal Variant

**Files:**
- Create: `src/components/blocks/hero/hero-minimal.tsx`

- [ ] **Step 1: Create the minimal hero component**

```tsx
// src/components/blocks/hero/hero-minimal.tsx
"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import type { HeroBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroMinimal({
  headline,
  subtext,
  primaryCta,
  secondaryCta,
}: HeroBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      className="relative w-full py-32 lg:py-40"
      ref={sectionRef}
    >
      {/* Gradient spotlight */}
      <motion.div
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0, scale: 0.8 }}
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 45%, oklch(0.25 0.02 260 / 0.4), transparent 70%)",
        }}
        transition={{ duration: 1.5, ease: EASE }}
      />

      <div className="relative mx-auto max-w-xl px-4 text-center lg:px-6">
        <motion.h1
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="font-semibold text-4xl leading-tight sm:text-5xl lg:text-6xl"
          data-field="headline"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          {headline}
        </motion.h1>

        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mx-auto mt-4 max-w-md text-base text-muted-foreground/70"
          data-field="subtext"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
        >
          {subtext}
        </motion.p>

        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mt-10 flex flex-wrap justify-center gap-3"
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

      {/* Decorative divider — draws from center */}
      <motion.div
        animate={inView ? { scaleX: 1, opacity: 1 } : {}}
        className="absolute inset-x-0 bottom-0 mx-auto h-px w-[200px]"
        initial={{ scaleX: 0, opacity: 0 }}
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--border), transparent)",
        }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
      />
    </section>
  );
}
```

- [ ] **Step 2: Test in dev**

Run: `bun dev` — create a Hero with variant "Minimal". Verify:
- No media fields visible in admin
- Centered text with gradient spotlight reveal
- Bottom divider draws from center outward

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/hero/hero-minimal.tsx
git commit -m "feat(hero): add minimal variant with gradient spotlight and divider draw"
```

---

### Task 6: Lint Check for Hero Changes

- [ ] **Step 1: Run lint**

Run: `bun check`
Expected: No errors in hero files

- [ ] **Step 2: Fix any issues**

Run: `bun fix` if needed

- [ ] **Step 3: Commit fixes if any**

```bash
git add -u
git commit -m "style: fix lint issues in hero variants"
```

---

## Chunk 2: Features Grid Block

### Task 7: Features Grid Schema

**Files:**
- Create: `src/payload/block-schemas/FeaturesGrid.ts`

- [ ] **Step 1: Create the schema**

```ts
// src/payload/block-schemas/FeaturesGrid.ts
import type { Block } from "payload";
import { link } from "../fields/link/link";

export const FeaturesGridBlock: Block = {
  slug: "featuresGrid",
  labels: { singular: "Features Grid", plural: "Features Grids" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "items",
      type: "array",
      minRows: 2,
      maxRows: 9,
      fields: [
        {
          name: "icon",
          type: "select",
          options: [
            { label: "Layers", value: "layers" },
            { label: "Shield Check", value: "shieldCheck" },
            { label: "Lightning", value: "lightning" },
            { label: "Lock", value: "lock" },
            { label: "Chart", value: "chart" },
            { label: "Sync", value: "sync" },
            { label: "Globe", value: "globe" },
            { label: "Code", value: "code" },
            { label: "Database", value: "database" },
            { label: "Cpu", value: "cpu" },
            { label: "Users", value: "users" },
            { label: "Settings", value: "settings" },
          ],
        },
        { name: "label", type: "text" },
        { name: "heading", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
        link({ name: "link" }),
      ],
    },
  ],
};
```

- [ ] **Step 2: Register in Pages collection**

In `src/payload/collections/Pages.ts`, add:

```ts
import { FeaturesGridBlock } from "../block-schemas/FeaturesGrid";
```

Add `FeaturesGridBlock` to the `layout.blocks` array.

- [ ] **Step 3: Add type export**

In `src/types/block-types.ts`, add:

```ts
export type FeaturesGridBlock = ExtractBlock<"featuresGrid">;
```

- [ ] **Step 4: Regenerate types**

Run: `bun run generate:types`

- [ ] **Step 5: Commit**

```bash
git add src/payload/block-schemas/FeaturesGrid.ts src/payload/collections/Pages.ts src/types/block-types.ts src/payload-types.ts
git commit -m "feat: add Features Grid block schema and register in Pages"
```

---

### Task 8: Features Grid Icon Map

**Files:**
- Create: `src/components/blocks/features-grid/icon-map.tsx`

- [ ] **Step 1: Create the icon mapping**

```tsx
// src/components/blocks/features-grid/icon-map.tsx
import {
  Layers01Icon,
  ShieldCheckIcon,
  FlashIcon,
  LockIcon,
  BarChart01Icon,
  Refresh01Icon,
  Globe02Icon,
  Code02Icon,
  Database01Icon,
  Cpu01Icon,
  UserGroup01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import type { IconData } from "@hugeicons/react";

export const FEATURE_ICONS: Record<string, IconData> = {
  layers: Layers01Icon,
  shieldCheck: ShieldCheckIcon,
  lightning: FlashIcon,
  lock: LockIcon,
  chart: BarChart01Icon,
  sync: Refresh01Icon,
  globe: Globe02Icon,
  code: Code02Icon,
  database: Database01Icon,
  cpu: Cpu01Icon,
  users: UserGroup01Icon,
  settings: Settings01Icon,
};
```

**IMPORTANT:** Hugeicons icon import names are speculative. Before committing, verify each import resolves:

Run: `bunx tsc --noEmit src/components/blocks/features-grid/icon-map.tsx`

If an import fails, search the package for the correct name:
```bash
bun run -e "const m = require('@hugeicons/core-free-icons'); console.log(Object.keys(m).filter(k => k.toLowerCase().includes('layer')).slice(0, 5))"
```

Substitute with the closest match for any that don't resolve.

- [ ] **Step 2: Commit**

```bash
git add src/components/blocks/features-grid/icon-map.tsx
git commit -m "feat: add icon map for Features Grid block"
```

---

### Task 9: Features Grid Component

**Files:**
- Create: `src/components/blocks/features-grid/features-grid.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/blocks/features-grid/features-grid.tsx
"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import type { FeaturesGridBlock } from "@/types/block-types";
import { FEATURE_ICONS } from "./icon-map";

const EASE = [0.16, 1, 0.3, 1] as const;

export function FeaturesGrid({
  eyebrow,
  heading,
  description,
  items,
}: FeaturesGridBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Header */}
        <div className="mb-16 max-w-md">
          {eyebrow && (
            <motion.p
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="mb-4 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]"
              data-field="eyebrow"
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h2
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="font-semibold text-3xl leading-tight sm:text-4xl"
            data-field="heading"
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
          >
            {heading}
          </motion.h2>
          {description && (
            <motion.p
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="mt-3 text-base text-muted-foreground"
              data-field="description"
              initial={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            >
              {description}
            </motion.p>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border/50 bg-border/50 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const iconData = item.icon
              ? FEATURE_ICONS[item.icon]
              : undefined;

            return (
              <motion.div
                animate={inView ? { opacity: 1, y: 0 } : {}}
                className="group flex flex-col gap-4 bg-card p-8 transition-colors duration-300 hover:bg-card/80"
                data-array-item={`items.${i}`}
                initial={{ opacity: 0, y: 32 }}
                key={item.id}
                transition={{
                  duration: 0.7,
                  ease: EASE,
                  delay: 0.1 + i * 0.05,
                }}
              >
                {/* Icon */}
                {iconData && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/8">
                    <HugeiconsIcon
                      className="text-blue-400"
                      data-field={`items.${i}.icon`}
                      icon={iconData}
                      size={20}
                      strokeWidth={1.5}
                    />
                  </div>
                )}

                {/* Label */}
                {item.label && (
                  <span
                    className="font-mono text-[10px] text-blue-400 uppercase tracking-[0.2em]"
                    data-field={`items.${i}.label`}
                  >
                    {item.label}
                  </span>
                )}

                {/* Heading */}
                <h3
                  className="font-semibold text-lg leading-snug"
                  data-field={`items.${i}.heading`}
                >
                  {item.heading}
                </h3>

                {/* Description */}
                <p
                  className="text-[0.9375rem] text-muted-foreground leading-relaxed"
                  data-field={`items.${i}.description`}
                >
                  {item.description}
                </p>

                {/* Optional link */}
                {item.link?.label && (
                  <CMSLink
                    className="mt-auto text-foreground"
                    data-field-group={`items.${i}.link`}
                    data-field-group-type="link"
                    link={item.link}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Register in render-blocks**

In `src/components/blocks/render-blocks.tsx`, add:

```tsx
import { FeaturesGrid } from "./features-grid/features-grid";

// In switch(block.blockType):
case "featuresGrid":
  return <FeaturesGrid {...block} />;
```

- [ ] **Step 3: Test in dev**

Run: `bun dev` — add a Features Grid block to a page. Verify:
- 3-column grid with 1px dividers
- Icons render with blue accent
- Cards stagger in on scroll
- Hover changes background

- [ ] **Step 4: Lint check**

Run: `bun check`

- [ ] **Step 5: Commit**

```bash
git add src/components/blocks/features-grid/features-grid.tsx src/components/blocks/render-blocks.tsx
git commit -m "feat: add Features Grid block component with icon map and stagger animation"
```

---

## Chunk 3: Team Block

### Task 10: Team Schema

**Files:**
- Create: `src/payload/block-schemas/Team.ts`

- [ ] **Step 1: Create the schema**

```ts
// src/payload/block-schemas/Team.ts
import type { Block } from "payload";

export const TeamBlock: Block = {
  slug: "team",
  labels: { singular: "Team", plural: "Team" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "variant",
      type: "select",
      defaultValue: "detailed",
      options: [
        { label: "Detailed", value: "detailed" },
        { label: "Compact", value: "compact" },
      ],
    },
    {
      name: "members",
      type: "array",
      minRows: 1,
      maxRows: 12,
      fields: [
        { name: "photo", type: "upload", relationTo: "media" },
        { name: "name", type: "text", required: true },
        { name: "role", type: "text", required: true },
        { name: "department", type: "text" },
        { name: "bio", type: "textarea" },
        {
          name: "links",
          type: "array",
          maxRows: 4,
          fields: [
            {
              name: "platform",
              type: "select",
              options: [
                { label: "LinkedIn", value: "linkedin" },
                { label: "Twitter / X", value: "twitter" },
                { label: "GitHub", value: "github" },
                { label: "Website", value: "website" },
              ],
            },
            { name: "url", type: "text", required: true },
          ],
        },
      ],
    },
  ],
};
```

- [ ] **Step 2: Register in Pages and add type**

In `src/payload/collections/Pages.ts`:
```ts
import { TeamBlock } from "../block-schemas/Team";
// Add TeamBlock to layout.blocks array
```

In `src/types/block-types.ts`:
```ts
export type TeamBlock = ExtractBlock<"team">;
```

- [ ] **Step 3: Regenerate types**

Run: `bun run generate:types`

- [ ] **Step 4: Commit**

```bash
git add src/payload/block-schemas/Team.ts src/payload/collections/Pages.ts src/types/block-types.ts src/payload-types.ts
git commit -m "feat: add Team block schema and register in Pages"
```

---

### Task 11: Team Component

**Files:**
- Create: `src/components/blocks/team/team.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/blocks/team/team.tsx
"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { TeamBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Team({
  eyebrow,
  heading,
  description,
  variant = "detailed",
  members,
}: TeamBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const isCompact = variant === "compact";

  return (
    <section ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-md text-center">
          {eyebrow && (
            <motion.p
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="mb-4 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]"
              data-field="eyebrow"
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h2
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="font-semibold text-3xl leading-tight sm:text-4xl"
            data-field="heading"
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
          >
            {heading}
          </motion.h2>
          {description && (
            <motion.p
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="mt-3 text-base text-muted-foreground"
              data-field="description"
              initial={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            >
              {description}
            </motion.p>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {members.map((member, i) => {
            const photoUrl = getMediaUrl(member.photo);
            const blurDataURL = getBlurDataURL(member.photo);
            const memberId = `LU-${String(i + 1).padStart(3, "0")}`;

            return (
              <motion.div
                animate={inView ? { opacity: 1, y: 0 } : {}}
                className="group overflow-hidden rounded-lg border border-border/50 bg-card transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-border"
                data-array-item={`members.${i}`}
                initial={{ opacity: 0, y: 32 }}
                key={member.id}
                transition={{
                  duration: 0.7,
                  ease: EASE,
                  delay: 0.1 + i * 0.05,
                }}
              >
                {/* Photo */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-card to-muted">
                  {photoUrl ? (
                    <motion.div
                      animate={
                        inView
                          ? { clipPath: "inset(0 0 0 0)" }
                          : {}
                      }
                      className="h-full w-full"
                      initial={{
                        clipPath: "inset(100% 0 0 0)",
                      }}
                      transition={{
                        duration: 0.7,
                        ease: EASE,
                        delay: 0.2 + i * 0.05,
                      }}
                    >
                      <Image
                        alt={member.name}
                        blurDataURL={blurDataURL}
                        className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:brightness-110"
                        data-field={`members.${i}.photo`}
                        fill
                        placeholder={
                          blurDataURL ? "blur" : "empty"
                        }
                        src={photoUrl}
                      />
                    </motion.div>
                  ) : (
                    /* Placeholder silhouette */
                    <div className="flex h-full items-center justify-center">
                      <svg
                        className="h-12 w-12 opacity-[0.12]"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M20 21a8 8 0 1 0-16 0" />
                      </svg>
                    </div>
                  )}

                  {/* ID badge */}
                  <motion.div
                    animate={inView ? { opacity: 1 } : {}}
                    className="absolute top-2.5 left-2.5 rounded bg-black/50 px-2 py-0.5 font-mono text-[9px] text-white/35 uppercase tracking-[0.2em] backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: EASE,
                      delay: 0.4 + i * 0.05,
                    }}
                  >
                    {memberId}
                  </motion.div>
                </div>

                {/* Info */}
                <div className={`border-t border-border/50 ${isCompact ? "p-3" : "p-4"}`}>
                  <p
                    className="font-semibold text-[0.9375rem]"
                    data-field={`members.${i}.name`}
                  >
                    {member.name}
                  </p>
                  <p
                    className="mt-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
                    data-field={`members.${i}.role`}
                  >
                    {member.role}
                  </p>

                  {/* Detailed-only content */}
                  {!isCompact && (
                    <>
                      {member.department && (
                        <motion.span
                          animate={
                            inView ? { opacity: 1 } : {}
                          }
                          className="mt-2.5 inline-block rounded-[3px] border border-primary/15 bg-primary/8 px-2 py-0.5 font-mono text-[9px] text-blue-400 uppercase tracking-[0.15em]"
                          data-field={`members.${i}.department`}
                          initial={{ opacity: 0 }}
                          transition={{
                            duration: 0.4,
                            ease: EASE,
                            delay: 0.5 + i * 0.05,
                          }}
                        >
                          {member.department}
                        </motion.span>
                      )}
                      {member.bio && (
                        <p
                          className="mt-3 text-sm text-muted-foreground leading-relaxed"
                          data-field={`members.${i}.bio`}
                        >
                          {member.bio}
                        </p>
                      )}
                      {member.links && member.links.length > 0 && (
                        <div className="mt-3 flex gap-3">
                          {member.links.map((socialLink, li) => (
                            <a
                              className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em] transition-colors hover:text-foreground"
                              data-array-item={`members.${i}.links.${li}`}
                              href={socialLink.url}
                              key={socialLink.id}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {socialLink.platform}
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Register in render-blocks**

In `src/components/blocks/render-blocks.tsx`:
```tsx
import { Team } from "./team/team";

case "team":
  return <Team {...block} />;
```

- [ ] **Step 3: Test in dev**

Run: `bun dev` — add a Team block with 4 members. Verify:
- 4-column grid with badge aesthetic
- Photo clip-reveal animation
- ID badge fades in
- Department tag appears last
- Compact variant hides bio/department

- [ ] **Step 4: Lint and commit**

```bash
bun check
git add src/components/blocks/team/team.tsx src/components/blocks/render-blocks.tsx
git commit -m "feat: add Team block component with clip-reveal and badge animations"
```

---

## Chunk 4: CTA Band Block

### Task 12: CTA Band Schema

**Files:**
- Create: `src/payload/block-schemas/CtaBand.ts`

- [ ] **Step 1: Create the schema**

```ts
// src/payload/block-schemas/CtaBand.ts
import type { Block } from "payload";
import { link } from "../fields/link/link";

export const CtaBandBlock: Block = {
  slug: "ctaBand",
  labels: { singular: "CTA Band", plural: "CTA Bands" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "subtext", type: "textarea" },
    {
      name: "variant",
      type: "select",
      defaultValue: "primary",
      options: [
        { label: "Primary (Blue)", value: "primary" },
        { label: "Card (Centered)", value: "card" },
      ],
    },
    link({
      name: "primaryCta",
      required: true,
      appearance: {
        type: ["button"],
        button: { variants: ["default", "outline"], sizes: ["default", "lg"] },
      },
    }),
    link({
      name: "secondaryCta",
      appearance: {
        type: ["button"],
        button: { variants: ["outline", "default"], sizes: ["default", "lg"] },
      },
    }),
  ],
};
```

- [ ] **Step 2: Register in Pages and add type**

In `src/payload/collections/Pages.ts`:
```ts
import { CtaBandBlock } from "../block-schemas/CtaBand";
// Add CtaBandBlock to layout.blocks array
```

In `src/types/block-types.ts`:
```ts
export type CtaBandBlock = ExtractBlock<"ctaBand">;
```

- [ ] **Step 3: Regenerate types**

Run: `bun run generate:types`

- [ ] **Step 4: Commit**

```bash
git add src/payload/block-schemas/CtaBand.ts src/payload/collections/Pages.ts src/types/block-types.ts src/payload-types.ts
git commit -m "feat: add CTA Band block schema and register in Pages"
```

---

### Task 13: CTA Band Component

**Files:**
- Create: `src/components/blocks/cta-band/cta-band.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/blocks/cta-band/cta-band.tsx
"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import type { CtaBandBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CtaBand({
  eyebrow,
  heading,
  subtext,
  variant = "primary",
  primaryCta,
  secondaryCta,
}: CtaBandBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const isPrimary = variant === "primary";

  return (
    <section
      className={`relative overflow-hidden ${
        isPrimary
          ? "bg-primary py-20"
          : "border-border/50 border-t border-b bg-card py-20"
      }`}
      ref={sectionRef}
    >
      {/* Primary shimmer */}
      {isPrimary && (
        <motion.div
          animate={inView ? { backgroundPosition: ["200% 0", "-200% 0"] } : {}}
          className="pointer-events-none absolute inset-0"
          initial={{ backgroundPosition: "200% 0" }}
          style={{
            backgroundImage:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
          }}
          transition={{ duration: 1.5, ease: EASE, delay: 0.3 }}
        />
      )}

      {/* Card border glow */}
      {!isPrimary && (
        <motion.div
          animate={
            inView
              ? {
                  opacity: [0, 0.5, 0],
                }
              : {}
          }
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border"
          transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div
          className={`flex ${
            isPrimary
              ? "flex-wrap items-center justify-between gap-8"
              : "flex-col items-center gap-6 text-center"
          }`}
        >
          {/* Text */}
          <div className={isPrimary ? "max-w-lg" : "max-w-md"}>
            {eyebrow && (
              <motion.p
                animate={inView ? { opacity: 1, y: 0, letterSpacing: "0.3em" } : {}}
                className="mb-4 font-mono text-[11px] uppercase tracking-[0.5em]"
                data-field="eyebrow"
                initial={{ opacity: 0, y: 12, letterSpacing: "0.5em" }}
                style={{
                  color: isPrimary
                    ? "rgba(255,255,255,0.7)"
                    : undefined,
                }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                {eyebrow}
              </motion.p>
            )}
            <motion.h2
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className={`font-semibold text-2xl leading-tight sm:text-3xl ${
                isPrimary ? "text-white" : ""
              }`}
              data-field="heading"
              initial={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
            >
              {heading}
            </motion.h2>
            {subtext && (
              <motion.p
                animate={inView ? { opacity: 1, y: 0 } : {}}
                className={`mt-2 text-[0.9375rem] leading-relaxed ${
                  isPrimary
                    ? "text-white/70"
                    : "text-muted-foreground"
                }`}
                data-field="subtext"
                initial={{ opacity: 0, y: 16 }}
                transition={{
                  duration: 0.6,
                  ease: EASE,
                  delay: 0.1,
                }}
              >
                {subtext}
              </motion.p>
            )}
          </div>

          {/* CTAs */}
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="flex shrink-0 gap-3"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          >
            <motion.div whileTap={{ scale: 0.97 }}>
              <CMSLink
                className={
                  isPrimary
                    ? "bg-white font-semibold text-primary hover:bg-white/90"
                    : ""
                }
                data-field-group="primaryCta"
                data-field-group-type="link"
                link={primaryCta}
              />
            </motion.div>
            {secondaryCta?.label && (
              <motion.div whileTap={{ scale: 0.97 }}>
                <CMSLink
                  className={
                    isPrimary
                      ? "border-white/30 bg-transparent text-white hover:bg-white/10"
                      : ""
                  }
                  data-field-group="secondaryCta"
                  data-field-group-type="link"
                  link={secondaryCta}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Register in render-blocks**

In `src/components/blocks/render-blocks.tsx`:
```tsx
import { CtaBand } from "./cta-band/cta-band";

case "ctaBand":
  return <CtaBand {...block} />;
```

- [ ] **Step 3: Test in dev**

Run: `bun dev` — add both CTA Band variants. Verify:
- Primary: blue bg, side-by-side, shimmer on load
- Card: centered, border glow pulse, eyebrow tracking animation

- [ ] **Step 4: Lint and commit**

```bash
bun check
git add src/components/blocks/cta-band/cta-band.tsx src/components/blocks/render-blocks.tsx
git commit -m "feat: add CTA Band block with primary and card variants"
```

---

## Chunk 5: Logo Cloud Block

### Task 14: Logo Cloud Schema

**Files:**
- Create: `src/payload/block-schemas/LogoCloud.ts`

- [ ] **Step 1: Create the schema**

```ts
// src/payload/block-schemas/LogoCloud.ts
import type { Block } from "payload";
import { link } from "../fields/link/link";

export const LogoCloudBlock: Block = {
  slug: "logoCloud",
  labels: { singular: "Logo Cloud", plural: "Logo Clouds" },
  fields: [
    { name: "eyebrow", type: "text" },
    {
      name: "variant",
      type: "select",
      defaultValue: "scroll",
      options: [
        { label: "Scrolling Row", value: "scroll" },
        { label: "Featured Grid", value: "grid" },
      ],
    },
    {
      name: "logos",
      type: "array",
      minRows: 4,
      maxRows: 20,
      fields: [
        { name: "logo", type: "upload", relationTo: "media", required: true },
        { name: "name", type: "text", required: true },
        link({ name: "link" }),
      ],
    },
  ],
};
```

- [ ] **Step 2: Register in Pages and add type**

In `src/payload/collections/Pages.ts`:
```ts
import { LogoCloudBlock } from "../block-schemas/LogoCloud";
// Add LogoCloudBlock to layout.blocks array
```

In `src/types/block-types.ts`:
```ts
export type LogoCloudBlock = ExtractBlock<"logoCloud">;
```

- [ ] **Step 3: Regenerate types**

Run: `bun run generate:types`

- [ ] **Step 4: Commit**

```bash
git add src/payload/block-schemas/LogoCloud.ts src/payload/collections/Pages.ts src/types/block-types.ts src/payload-types.ts
git commit -m "feat: add Logo Cloud block schema and register in Pages"
```

---

### Task 15: Logo Cloud Component

**Files:**
- Create: `src/components/blocks/logo-cloud/logo-cloud.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/blocks/logo-cloud/logo-cloud.tsx
"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import { getMediaUrl } from "@/core/lib/utils";
import type { LogoCloudBlock } from "@/types/block-types";

import "./logo-cloud.css";

const EASE = [0.16, 1, 0.3, 1] as const;

export function LogoCloud({
  eyebrow,
  variant = "scroll",
  logos,
}: LogoCloudBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Eyebrow */}
        {eyebrow && (
          <motion.p
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="mb-12 text-center font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]"
            data-field="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {eyebrow}
          </motion.p>
        )}

        {variant === "scroll" ? (
          <ScrollVariant inView={inView} logos={logos} />
        ) : (
          <GridVariant inView={inView} logos={logos} />
        )}
      </div>
    </section>
  );
}

// --- Scroll variant ---

function ScrollVariant({
  logos,
  inView,
}: {
  logos: LogoCloudBlock["logos"];
  inView: boolean;
}) {
  // Duplicate logos for seamless loop
  const doubled = [...logos, ...logos];

  return (
    <motion.div
      animate={inView ? { opacity: 1 } : {}}
      className="logo-cloud-scroll-track"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
    >
      <div className="logo-cloud-scroll-inner">
        {doubled.map((logo, i) => {
          const logoUrl = getMediaUrl(logo.logo);
          const isOriginal = i < logos.length;

          return (
            <div
              className="logo-cloud-item"
              data-array-item={
                isOriginal ? `logos.${i}` : undefined
              }
              key={`${logo.id}-${i}`}
            >
              {logoUrl && (
                <Image
                  alt={logo.name}
                  className="h-6 w-auto brightness-0 invert"
                  data-field={
                    isOriginal
                      ? `logos.${i}.logo`
                      : undefined
                  }
                  height={24}
                  src={logoUrl}
                  width={120}
                />
              )}
              <span className="font-semibold text-base tracking-tight">
                {logo.name}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// --- Grid variant ---

function GridVariant({
  logos,
  inView,
}: {
  logos: LogoCloudBlock["logos"];
  inView: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/50 bg-border/50 sm:grid-cols-3 lg:grid-cols-5">
      {logos.map((logo, i) => {
        const logoUrl = getMediaUrl(logo.logo);

        return (
          <motion.div
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            className="flex items-center justify-center gap-2.5 bg-card px-6 py-8 text-muted-foreground transition-[background,color] duration-300 hover:bg-card/80 hover:text-foreground"
            data-array-item={`logos.${i}`}
            initial={{ opacity: 0, scale: 0.95 }}
            key={logo.id}
            transition={{
              duration: 0.6,
              ease: EASE,
              delay: 0.1 + i * 0.04,
            }}
          >
            {logoUrl && (
              <Image
                alt={logo.name}
                className="h-6 w-auto brightness-0 invert opacity-60"
                data-field={`logos.${i}.logo`}
                height={24}
                src={logoUrl}
                width={120}
              />
            )}
            <span
              className="font-semibold text-[0.9375rem]"
              data-field={`logos.${i}.name`}
            >
              {logo.name}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create CSS file for scroll animation**

```css
/* src/components/blocks/logo-cloud/logo-cloud.css */
.logo-cloud-scroll-track {
  overflow: hidden;
  mask-image: linear-gradient(
    90deg,
    transparent,
    black 10%,
    black 90%,
    transparent
  );
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent,
    black 10%,
    black 90%,
    transparent
  );
}

.logo-cloud-scroll-inner {
  display: flex;
  gap: 4rem;
  align-items: center;
  width: max-content;
  animation: logo-scroll 30s linear infinite;
}

.logo-cloud-scroll-track:hover .logo-cloud-scroll-inner {
  animation-play-state: paused;
}

.logo-cloud-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--color-muted-foreground);
  opacity: 0.5;
  transition: opacity 0.3s ease;
  white-space: nowrap;
}

.logo-cloud-scroll-track:hover .logo-cloud-item {
  opacity: 0.3;
}

.logo-cloud-scroll-track:hover .logo-cloud-item:hover {
  opacity: 0.8;
}

@keyframes logo-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
```

- [ ] **Step 3: Register in render-blocks**

In `src/components/blocks/render-blocks.tsx`:
```tsx
import { LogoCloud } from "./logo-cloud/logo-cloud";

case "logoCloud":
  return <LogoCloud {...block} />;
```

- [ ] **Step 4: Test in dev**

Run: `bun dev` — add Logo Cloud block with both variants. Verify:
- Scroll: continuous horizontal scroll, pauses on hover, individual logo highlight
- Grid: stagger pop with scale, hover dims siblings

- [ ] **Step 5: Lint and commit**

```bash
bun check
git add src/components/blocks/logo-cloud/ src/components/blocks/render-blocks.tsx
git commit -m "feat: add Logo Cloud block with scroll and grid variants"
```

---

## Chunk 6: Final Integration & Cleanup

### Task 16: Final Lint Pass

- [ ] **Step 1: Run full lint**

Run: `bun check`
Expected: No errors

- [ ] **Step 2: Fix any issues**

Run: `bun fix` if needed

- [ ] **Step 3: Commit fixes**

```bash
git add -u
git commit -m "style: fix lint issues across new blocks"
```

---

### Task 17: Verify All Blocks Load

- [ ] **Step 1: Start dev server**

Run: `bun dev`

- [ ] **Step 2: Create a test page with all new blocks**

In admin panel at `http://localhost:3000/admin`:
1. Create a new page with slug `block-test`
2. Add one of each new block: Hero (each variant), Features Grid, Team, CTA Band (both variants), Logo Cloud (both variants)
3. Save and preview

- [ ] **Step 3: Verify each block renders correctly**

Visit `http://localhost:3000/block-test` and check:
- All blocks render without console errors
- Animations trigger on scroll
- Admin panel pinpointing works (click block in admin → highlights on page)
- Responsive: resize to mobile width, verify layouts adapt

- [ ] **Step 4: Final commit**

```bash
git add -u
git commit -m "feat: block expansion batch 1 complete — 3 hero variants + 4 new blocks"
```
