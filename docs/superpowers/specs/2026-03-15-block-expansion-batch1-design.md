# Block Expansion — Batch 1

**Date**: 2026-03-15
**Scope**: 3 hero variants (expand existing block) + 4 new blocks (Features Grid, Team, CTA Band, Logo Cloud)

## Overview

Expand the block library with the most universally-needed content sections for client demos. All new blocks follow existing project patterns:

- Schema in `src/payload/block-schemas/` — exported as `<Name>Block` (e.g., `FeaturesGridBlock`)
- Component in `src/components/blocks/<kebab-name>/<kebab-name>.tsx` (not `index.tsx`)
- Registered in `render-blocks.tsx` via `switch/case` and in `Pages.ts` `layout.blocks` array
- Types derived via `ExtractBlock<"slug">` in `src/types/block-types.ts`
- CTAs use the `link()` group field helper from `src/payload/fields/link/link.ts`
- `data-field`, `data-field-group` attributes for admin panel pinpointing

**Motion system**: The existing Hero is a **server component** (no motion). New variants that require animation will be extracted into `"use client"` sub-components, keeping the server-rendered default variant unchanged. New blocks use the standard client skeleton:

```tsx
"use client";
import { motion, useInView } from "motion/react";
const EASE = [0.16, 1, 0.3, 1] as const;
// useRef + useInView({ once: true, margin: "-100px" })
```

Responsive breakpoints: `sm:` (640px) and `lg:` (1024px) only. No `md:`.

---

## 1. Hero — Variant Expansion

**Approach**: Add a `variant` select field to the existing Hero schema. One schema, one component entry point with variant branching.

### Schema Changes (`src/payload/block-schemas/Hero.ts`)

Add `variant` field and make `mediaSrc` conditionally required:

```ts
{
  name: 'variant',
  type: 'select',
  defaultValue: 'default',
  options: [
    { label: 'Default (Full Bleed)', value: 'default' },
    { label: 'Centered', value: 'centered' },
    { label: 'Split', value: 'split' },
    { label: 'Minimal', value: 'minimal' },
  ],
},
{
  name: 'mediaSrc',
  type: 'upload',
  relationTo: 'media',
  // No longer globally required — conditional per variant
  admin: {
    condition: (_, siblingData) => siblingData?.variant !== 'minimal',
    description: 'Required for Default, Centered, and Split variants.',
  },
  validate: (val, { siblingData }) => {
    const variant = siblingData?.variant ?? 'default';
    if (variant !== 'minimal' && !val) {
      return 'Media is required for this variant';
    }
    return true;
  },
},
```

Also add a condition to `posterSrc` to hide it for the minimal variant (no media = no poster):

```ts
{
  name: 'posterSrc',
  type: 'upload',
  relationTo: 'media',
  admin: {
    condition: (_, siblingData) => siblingData?.variant !== 'minimal',
    description: 'Still image shown while a video loads.',
  },
},
```

Add optional stats fields for the Split variant:

```ts
{
  name: 'stats',
  type: 'array',
  maxRows: 4,
  admin: {
    condition: (_, siblingData) => siblingData?.variant === 'split',
    description: 'Displayed in place of media on the Split variant. Leave empty to use media instead.',
  },
  fields: [
    { name: 'value', type: 'text', required: true },
    { name: 'label', type: 'text', required: true },
  ],
},
```

### Component Changes (`src/components/blocks/hero/`)

- `hero.tsx` — remains the server entry point. Switches on `variant`:
  - `default` — current behavior (no changes)
  - `centered` / `split` / `minimal` — render `"use client"` sub-components from the same directory
- New files:
  - `hero-centered.tsx` — `"use client"`, centered text over media with grid overlay
  - `hero-split.tsx` — `"use client"`, two-column with text + media/stats
  - `hero-minimal.tsx` — `"use client"`, no media, centered text only

### Variant: Centered

- Text centered vertically over media, constrained to `max-w-2xl`
- Subtle CSS grid overlay: `background-image` with `linear-gradient` grid lines, masked with `radial-gradient`
- **Microinteractions**:
  - **Grid pulse**: Grid lines nearest heading glow brighter on load, then fade. CSS `@keyframes` on grid overlay opacity, timed after text reveal.
  - **CTA magnetic hover**: Buttons shift toward cursor on approach. Track mouse position within radius, apply small `translate` via spring.
  - **Heading word stagger**: Each word animates in with `0.04s` stagger, same `y: 24` and `EASE`.

### Variant: Split

- Two-column grid: `grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16`
- Text left, media or stats panel right
- If `stats` array is populated, renders a 2x2 stat grid instead of media
- `bg-background` — no full-bleed
- **Microinteractions**:
  - **Stat countup**: Numbers count from 0 on scroll-trigger using Trust section's `animate()` pattern — `duration: 2.2`, `ease: [0.33, 1, 0.68, 1]`. Cells stagger `0.15s`.
  - **Panel hover tilt**: Media/stats panel has subtle 3D tilt on mouse move — `rotateX/Y ±2deg` max, `perspective: 1000px`. Spring-damped return on mouse leave.
  - **"Live" badge pulse**: Static `"Live Metrics"` label with breathing `opacity` animation (1.0 → 0.6 → 1.0, `4s` loop).

### Variant: Minimal

- No media. Dark `bg-background`, centered text + CTA
- Content constrained to `max-w-xl`
- Decorative gradient fade line at bottom: `200px` wide, centered, `linear-gradient(90deg, transparent, var(--border), transparent)`
- **Microinteractions**:
  - **Gradient reveal**: Radial gradient spotlight fades in behind heading — starts at 0% opacity, expands outward.
  - **Divider draw**: Bottom decorative line draws from center outward (`scaleX: 0 → 1`) after content settles.

---

## 2. Features Grid (New Block)

**Slug**: `featuresGrid`

### Schema (`src/payload/block-schemas/FeaturesGrid.ts`)

Export: `FeaturesGridBlock`

```ts
fields: [
  { name: 'eyebrow', type: 'text' },
  { name: 'heading', type: 'text', required: true },
  { name: 'description', type: 'textarea' },
  {
    name: 'items',
    type: 'array',
    minRows: 2,
    maxRows: 9,
    fields: [
      {
        name: 'icon',
        type: 'select',
        options: [
          { label: 'Layers', value: 'layers' },
          { label: 'Shield Check', value: 'shieldCheck' },
          { label: 'Lightning', value: 'lightning' },
          { label: 'Lock', value: 'lock' },
          { label: 'Chart', value: 'chart' },
          { label: 'Sync', value: 'sync' },
          { label: 'Globe', value: 'globe' },
          { label: 'Code', value: 'code' },
          { label: 'Database', value: 'database' },
          { label: 'Cpu', value: 'cpu' },
          { label: 'Users', value: 'users' },
          { label: 'Settings', value: 'settings' },
        ],
      },
      { name: 'label', type: 'text' },
      { name: 'heading', type: 'text', required: true },
      { name: 'description', type: 'textarea', required: true },
      link({ name: 'link' }),
    ],
  },
]
```

### Component (`src/components/blocks/features-grid/features-grid.tsx`)

- `"use client"` with motion skeleton
- **Layout**: 1px-gap grid using `bg-border/50` on parent, `bg-card` on cells. `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. Cards hover to `bg-card` with slight brightness shift.
- **Icon rendering**: Map icon select value → Hugeicons component. Wrapped in `w-10 h-10 rounded-lg` container with `bg-primary/8 border border-primary/15`. Icon rendered at `size={20}` with `className="text-blue-400"`.
- **Label**: `font-mono text-[10px] uppercase tracking-[0.2em] text-blue-400`

### Microinteractions

- **Card border trace**: On hover, a 1px highlight traces the card border — animated `background-position` on a `linear-gradient` border.
- **Icon float**: Icons have slow `y: -2px → 2px` breathing animation (CSS `@keyframes`, `3s` infinite, `ease-in-out`). Pauses on hover, locks to `y: 0`.
- **Stagger on scroll**: Cards reveal with `0.1 + i * 0.05` delay. Internal elements (icon, label, heading, description) cascade with `0.03s` micro-delays within each card.

---

## 3. Team / People (New Block)

**Slug**: `team`

### Schema (`src/payload/block-schemas/Team.ts`)

Export: `TeamBlock`

```ts
fields: [
  { name: 'eyebrow', type: 'text' },
  { name: 'heading', type: 'text', required: true },
  { name: 'description', type: 'textarea' },
  {
    name: 'variant',
    type: 'select',
    defaultValue: 'detailed',
    options: [
      { label: 'Detailed', value: 'detailed' },
      { label: 'Compact', value: 'compact' },
    ],
  },
  {
    name: 'members',
    type: 'array',
    minRows: 1,
    maxRows: 12,
    fields: [
      { name: 'photo', type: 'upload', relationTo: 'media' },
      { name: 'name', type: 'text', required: true },
      { name: 'role', type: 'text', required: true },
      { name: 'department', type: 'text' },
      // bio and links are always collected in the schema (no admin.condition)
      // because they are nested inside the members array and cannot access
      // the block-level variant field from condition callbacks.
      // The component handles visibility: only renders bio/links when variant !== 'compact'.
      { name: 'bio', type: 'textarea' },
      {
        name: 'links',
        type: 'array',
        maxRows: 4,
        fields: [
          {
            name: 'platform',
            type: 'select',
            options: [
              { label: 'LinkedIn', value: 'linkedin' },
              { label: 'Twitter / X', value: 'twitter' },
              { label: 'GitHub', value: 'github' },
              { label: 'Website', value: 'website' },
            ],
          },
          { name: 'url', type: 'text', required: true },
        ],
      },
    ],
  },
]
```

### Component (`src/components/blocks/team/team.tsx`)

- `"use client"` with motion skeleton
- **Layout**: `grid-cols-2 gap-6 lg:grid-cols-4`. Employee badge aesthetic.
- **Photo**: `aspect-[3/4]`, `overflow-hidden`, `rounded-lg`. Placeholder: subtle person silhouette SVG (inline, no external deps).
- **ID badge**: Derived from array index — `LU-${String(index + 1).padStart(3, '0')}`. Rendered as: `font-mono text-[9px] uppercase tracking-[0.2em]`, frosted glass background (`bg-black/50 backdrop-blur-sm`).
- **Name**: `font-semibold text-[0.9375rem]`
- **Role**: `font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground`
- **Department tag**: `bg-primary/8 border border-primary/15 font-mono text-[9px] rounded-[3px] px-2 py-0.5`
- **Compact variant**: Hides bio, links, department tag. Tighter card padding (`p-3` vs `p-4`).

### Microinteractions

- **Photo clip-reveal**: Photos reveal from bottom to top on scroll — `clipPath: inset(100% 0 0 0)` → `inset(0)`, `duration: 0.7`. Like a file pulled from a cabinet.
- **ID typewriter**: Badge text types in character-by-character (`0.05s` per char) after photo reveals.
- **Card lift**: `whileHover={{ y: -4 }}` spring + `box-shadow` from `0` to `0 8px 24px rgba(0,0,0,0.3)`.
- **Department tag fade**: Badge fades in last with `delay: 0.4s` — like clearance being granted.

---

## 4. CTA Band (New Block)

**Slug**: `ctaBand`

### Schema (`src/payload/block-schemas/CtaBand.ts`)

Export: `CtaBandBlock`

```ts
import { link } from '../fields/link/link';

fields: [
  { name: 'eyebrow', type: 'text' },
  { name: 'heading', type: 'text', required: true },
  { name: 'subtext', type: 'textarea' },
  {
    name: 'variant',
    type: 'select',
    defaultValue: 'primary',
    options: [
      { label: 'Primary (Blue)', value: 'primary' },
      { label: 'Card (Centered)', value: 'card' },
    ],
  },
  link({
    name: 'primaryCta',
    required: true,
    appearance: {
      type: ['button'],
      button: { variants: ['default', 'outline'], sizes: ['default', 'lg'] },
    },
  }),
  link({
    name: 'secondaryCta',
    appearance: {
      type: ['button'],
      button: { variants: ['outline', 'default'], sizes: ['default', 'lg'] },
    },
  }),
]
```

### Component (`src/components/blocks/cta-band/cta-band.tsx`)

- `"use client"` with motion skeleton
- **Primary variant**: `bg-primary` full-width, side-by-side layout (`flex justify-between items-center flex-wrap gap-8`). Primary CTA uses `bg-white text-primary` override. Renders via `<CMSLink>`.
- **Card variant**: `bg-card` with `border-t border-b border-border/50`. Centered layout (`flex-col items-center text-center`). Standard `<CMSLink>` button rendering.
- No media, no arrays beyond the two link groups. Lightweight section divider.

### Microinteractions

- **Primary — background shimmer**: Diagonal light sweep on load — `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)` animating `background-position`. Single pass.
- **Button scale press**: `whileTap={{ scale: 0.97 }}` on CTA buttons.
- **Card — border glow**: On viewport entry, top/bottom borders briefly brighten from `border-border/50` → `border-border` → settle back. Single pulse.
- **Card — eyebrow tracking**: `tracking-[0.3em]` animates from `tracking-[0.5em]` on reveal — letters tighten as they settle.

---

## 5. Logo Cloud (New Block)

**Slug**: `logoCloud`

### Schema (`src/payload/block-schemas/LogoCloud.ts`)

Export: `LogoCloudBlock`

```ts
fields: [
  { name: 'eyebrow', type: 'text' },
  {
    name: 'variant',
    type: 'select',
    defaultValue: 'scroll',
    options: [
      { label: 'Scrolling Row', value: 'scroll' },
      { label: 'Featured Grid', value: 'grid' },
    ],
  },
  {
    name: 'logos',
    type: 'array',
    minRows: 4,
    maxRows: 20,
    fields: [
      { name: 'logo', type: 'upload', relationTo: 'media', required: true },
      { name: 'name', type: 'text', required: true },
      link({ name: 'link' }),
    ],
  },
]
```

### Component (`src/components/blocks/logo-cloud/logo-cloud.tsx`)

- `"use client"` with motion skeleton
- **Scroll variant**: Infinite horizontal CSS scroll. Logos array duplicated in JSX for seamless loop. Edge fade: `mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent)`. Logos rendered as `next/image` with `brightness-0 invert` filter for dark mode consistency.
- **Grid variant**: 1px-gap grid using `bg-border/50` parent background. `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`. Each cell: `bg-card` → `bg-card-hover` on hover. Logo image + name side by side.

### Microinteractions

- **Scroll — pause on hover**: `animation-play-state: paused` on track `:hover`. Individual logos brighten to full opacity on hover, siblings dim to `0.3`.
- **Grid — stagger pop**: Cells appear with `scale: 0.95 → 1` + opacity, staggered left-to-right with `0.04s` delays.
- **Grid — hover highlight**: Hovered cell brightens while all others dim — attention isolation.

---

## Registration

### `src/payload/collections/Pages.ts`

Add imports and register in `layout.blocks`:

```ts
import { FeaturesGridBlock } from '../block-schemas/FeaturesGrid';
import { TeamBlock } from '../block-schemas/Team';
import { CtaBandBlock } from '../block-schemas/CtaBand';
import { LogoCloudBlock } from '../block-schemas/LogoCloud';

// In layout.blocks array:
blocks: [
  // ... existing blocks ...
  FeaturesGridBlock,
  TeamBlock,
  CtaBandBlock,
  LogoCloudBlock,
],
```

### `src/components/blocks/render-blocks.tsx`

Add `switch/case` entries:

```tsx
import { FeaturesGrid } from './features-grid/features-grid';
import { Team } from './team/team';
import { CtaBand } from './cta-band/cta-band';
import { LogoCloud } from './logo-cloud/logo-cloud';

// In switch(block.blockType):
case 'featuresGrid':
  return <FeaturesGrid {...block} />;
case 'team':
  return <Team {...block} />;
case 'ctaBand':
  return <CtaBand {...block} />;
case 'logoCloud':
  return <LogoCloud {...block} />;
```

### `src/types/block-types.ts`

Add type exports:

```ts
export type FeaturesGridBlock = ExtractBlock<'featuresGrid'>;
export type TeamBlock = ExtractBlock<'team'>;
export type CtaBandBlock = ExtractBlock<'ctaBand'>;
export type LogoCloudBlock = ExtractBlock<'logoCloud'>;
```

---

## Files Created/Modified

**New files:**
- `src/payload/block-schemas/FeaturesGrid.ts`
- `src/payload/block-schemas/Team.ts`
- `src/payload/block-schemas/CtaBand.ts`
- `src/payload/block-schemas/LogoCloud.ts`
- `src/components/blocks/features-grid/features-grid.tsx`
- `src/components/blocks/team/team.tsx`
- `src/components/blocks/cta-band/cta-band.tsx`
- `src/components/blocks/logo-cloud/logo-cloud.tsx`
- `src/components/blocks/hero/hero-centered.tsx`
- `src/components/blocks/hero/hero-split.tsx`
- `src/components/blocks/hero/hero-minimal.tsx`

**Modified files:**
- `src/payload/block-schemas/Hero.ts` — add `variant` select, make `mediaSrc` conditionally required, add `stats` array
- `src/components/blocks/hero/hero.tsx` — variant switch dispatching to sub-components
- `src/components/blocks/render-blocks.tsx` — add 4 new `case` entries
- `src/payload/collections/Pages.ts` — add 4 new blocks to `layout.blocks`
- `src/types/block-types.ts` — add 4 type exports

**Note:** After schema changes, run `bun run generate:types` to regenerate `payload-types.ts`.

---

## Mockup Reference

Static HTML wireframes at `docs/mockups/block-concepts.html` — layout and content direction only. Production implementation uses the full motion system.
