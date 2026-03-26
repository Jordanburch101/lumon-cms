# Department Hero Blocks — Design Spec

**Date:** 2026-03-27
**Status:** Approved

## Overview

Two new hero blocks for department/service pages. They complement the existing 4 heroes (Hero, HeroCentered, HeroMinimal, HeroStats) by providing contained, non-full-bleed layouts specifically designed for product/service detail pages.

Both follow the Severance/Lumon institutional aesthetic — clinical minimalism, restrained animation, corporate authority.

## Block 1: HeroSpecimen

A contained card centered on the page, structured like an institutional specimen display or catalog entry.

### Layout

- Full-width section with `bg-background` (page surface visible around the card)
- Single card centered within `max-w-7xl` container, `border border-border/50`, `rounded-xl`, `bg-card`
- **Header bar:** department icon (small, 20px, bordered) + mono eyebrow classification (`font-mono text-[11px] uppercase tracking-[0.3em]`), separated by `border-bottom border-border/40`
- **Body:** two-column grid (`grid-cols-1 lg:grid-cols-[1fr_1.1fr]`) with `border-r border-border/40` divider
  - **Left column:** headline, thin divider (`w-8 h-px bg-border`), subtext, two CTAs. Padding `p-8 lg:p-10`
  - **Right column:** full-bleed image (`object-cover`, fills entire right half). Subtle left-edge gradient fade (`bg-gradient-to-r from-card to-transparent`, ~40px wide) to soften the transition from divider to photo

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `eyebrow` | text | yes | Department classification, e.g. "Core Operations — MDR" |
| `icon` | upload (Media) | no | Small department icon for header bar |
| `headline` | text | yes | Department name |
| `subtext` | text | yes | Department description (1-2 sentences) |
| `mediaSrc` | upload (Media) | yes | Department photo, displayed full-bleed in right column |
| `primaryCta` | link | yes | Main action button |
| `secondaryCta` | link | yes | Secondary action button |

### Animation

Standard scroll-triggered reveal using project conventions:
- `useInView(sectionRef, { once: true, margin: "-100px" })`
- Card entrance: `initial={{ opacity: 0, y: 32 }}`, `duration: 0.7`, `ease: EASE`
- Header bar content: `delay: 0.1`, `y: 12`, `duration: 0.6`
- Left column text: staggered, `delay: 0.15 + i * 0.05`, `y: 16`, `duration: 0.6`
- Right column image: `initial={{ opacity: 0, scale: 1.02 }}`, fades in with `duration: 0.8`, `delay: 0.2`

### Responsive

- **Mobile:** single column stack — header bar, image (aspect-ratio 16/9), then text content below
- **Desktop (lg+):** side-by-side as described

## Block 2: HeroBriefing

A cinematic letterbox image with left-aligned text below. Evokes a frame from a Lumon orientation film.

### Layout

- Full-width section with `bg-background`
- Content contained within `max-w-7xl` container
- **Image:** wide cinematic aspect ratio (`aspect-[21/9]`), `rounded-xl`, `border border-border/50`, `overflow-hidden`. Bottom gradient fade (`bg-gradient-to-t from-background to-transparent`, covers bottom ~50%)
- **Text area:** below image, left-aligned, `mt-6 lg:mt-8`
  - Mono eyebrow classification
  - Headline (section h2 scale: `text-3xl sm:text-4xl`)
  - Subtext (`max-w-xl` to prevent overly wide lines)
  - Two CTAs

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `eyebrow` | text | yes | Department classification |
| `headline` | text | yes | Department name |
| `subtext` | text | yes | Department description |
| `mediaSrc` | upload (Media) | yes | Department photo, displayed in 21:9 letterbox crop |
| `posterSrc` | upload (Media) | no | Fallback poster if mediaSrc is video |
| `primaryCta` | link | yes | Main action button |
| `secondaryCta` | link | yes | Secondary action button |

### Animation

- Image: `initial={{ opacity: 0, y: 32 }}`, `duration: 0.8`, `ease: EASE`
- Eyebrow: `delay: 0.15`, `y: 12`, `duration: 0.6`
- Headline: `delay: 0.2`, `y: 24`, `duration: 0.8`
- Subtext: `delay: 0.25`, `y: 16`, `duration: 0.6`
- CTAs: `delay: 0.3`, `y: 16`, `duration: 0.6`

### Responsive

- **Mobile:** image uses `aspect-[16/9]` instead of `21/9` (letterbox too thin on small screens). Text left-aligned, full width.
- **Desktop (lg+):** `aspect-[21/9]` as described

## Shared Patterns

Both blocks follow existing project conventions:

- **"use client"** directive (motion/react requires it)
- **EASE constant:** `[0.16, 1, 0.3, 1] as const`
- **Section ref + useInView** for scroll trigger
- **cn()** from `@/core/lib/utils` for class merging
- **Link component** from project's link system for CTAs
- **Next.js Image** for all media with `object-cover`
- **Typography** per theme skill: `font-semibold` headings, `text-[11px]` eyebrows, `tracking-[0.2em]`/`tracking-[0.3em]` on uppercase

## File Structure

Following existing conventions in `payload-ops` skill:

```
src/payload/block-schemas/hero-specimen.ts     — Payload field schema
src/payload/block-schemas/hero-briefing.ts     — Payload field schema
src/components/blocks/hero-specimen.tsx         — React component
src/components/blocks/hero-briefing.tsx         — React component
src/components/blocks/__fixtures__/hero-specimen.ts  — Storybook fixture
src/components/blocks/__fixtures__/hero-briefing.ts  — Storybook fixture
```

Plus updates to:
- `src/payload/block-schemas/index.ts` — export new schemas
- `src/components/blocks/render-blocks.tsx` — register new block renderers
- `src/payload/collections/pages.ts` — add blocks to layout field
- `src/payload/lib/cached-payload/` — add to cache tag types if needed
- Migration file via `bun run migrate:create`
- TypeScript types via `bun generate:types`

## Suggested Page Assignments

| Department | Hero Block | Rationale |
|-----------|-----------|-----------|
| Macrodata Refinement | HeroSpecimen | Structured, institutional, technical |
| Optics & Design | HeroSpecimen | Precise, catalog-like |
| Compliance & Integration | HeroSpecimen | Corporate authority |
| Topical Applications | HeroSpecimen | Clinical, product-focused |
| Biotech Solutions | HeroBriefing | More human, photography-driven |
| Mammalian Nurturance | HeroBriefing | Emotional, needs visual breathing room |

These are editorial suggestions — both blocks are interchangeable in the CMS.
