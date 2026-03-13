---
name: theme
description: "Project theme reference: Severance/Lumon aesthetic with exact design tokens, animation values, typography classes, spacing patterns, and component structure conventions. Use this skill alongside the design-language skill whenever building or modifying UI components in this project — it provides the specific values that design-language tells you how to apply. Triggers when creating new sections, components, or pages, or when checking if a component matches the project's visual identity."
---

# Theme — Severance / Lumon

Clinical minimalism meets institutional authority. Every component should feel like it was designed by a corporation that takes itself very seriously — precise, restrained, quietly unsettling in its perfection. Think Apple's design discipline applied to a dystopian workplace.

## Aesthetic Principles

- **Restraint over decoration** — No gratuitous effects. Every animation, shadow, and color choice should feel purposeful and earned.
- **Institutional tone** — The interface speaks with corporate authority. Clean geometry, rigid alignment, measured spacing.
- **Quiet tension** — Beneath the polish, something feels slightly off. A pause that's a beat too long. Opacity that's a shade too low. The uncanny valley of UI.
- **Precision** — Pixel-level alignment. Exact values. No "approximately." The numbers are the design.

## Animation

All motion components use `motion/react`. Every animated section follows the same skeleton.

**Shared easing (declare as constant in every component):**
```tsx
const EASE = [0.16, 1, 0.3, 1] as const;
```

**Scroll trigger (same config everywhere):**
```tsx
const sectionRef = useRef<HTMLElement>(null);
const inView = useInView(sectionRef, { once: true, margin: "-100px" });
```

**Standard reveal pattern:**
```tsx
<motion.div
  animate={inView ? { opacity: 1, y: 0 } : {}}
  initial={{ opacity: 0, y: 24 }}
  transition={{ duration: 0.8, ease: EASE }}
>
```

**Y-offsets by element importance:**
| Element type | initial y | duration |
|---|---|---|
| Section heading | `24` | `0.8s` |
| Secondary content (descriptions, subheadings) | `16` | `0.6s` |
| Tertiary (labels, metadata) | `12` | `0.6s` |
| Large blocks (cards, media) | `32` | `0.7s` |

**Stagger for grids/lists:**
```tsx
transition={{ delay: 0.1 + i * 0.05, duration: 0.8, ease: EASE }}
```

**Interactive spring (hover lift on cards):**
```tsx
whileHover={{ y: -4 }}
transition={{ type: "spring", stiffness: 400, damping: 25 }}
```

**CountUp numbers (trust section pattern):**
```tsx
animate(mv, target, { duration: 2.2, ease: [0.33, 1, 0.68, 1] })
```

## Typography

Fonts: **Nunito Sans** (`font-sans`) for all UI text, **Geist Mono** (`font-mono`) for code/terminal/technical labels.

| Role | Tailwind classes |
|---|---|
| Hero h1 | `font-semibold text-4xl text-white leading-tight sm:text-5xl lg:text-6xl` |
| Section h2 | `font-semibold text-3xl leading-tight sm:text-4xl` |
| Card/article h3 | `font-semibold text-xl leading-snug sm:text-2xl lg:text-3xl` |
| Eyebrow / label | `font-medium text-[11px] text-muted-foreground uppercase tracking-[0.2em]` |
| Mono eyebrow | `font-mono text-[11px] uppercase tracking-[0.3em]` |
| Body text | `text-base text-muted-foreground` |
| Lead paragraph | `text-base text-white/70` (on dark backgrounds) |
| Large stat number | `font-bold text-7xl tracking-tighter` |
| Price display | `font-semibold text-5xl tracking-tight` |
| Stat label | `mt-4 font-medium text-xs text-muted-foreground uppercase tracking-[0.2em]` |

**Key rules:**
- Headings are always `font-semibold`, never `font-bold` (except stat numbers)
- Eyebrows are always `text-[11px]`, never `text-xs`
- Uppercase text always has explicit letter-spacing (`tracking-[0.2em]` or `tracking-[0.3em]`)
- `leading-tight` for headings, `leading-snug` for card titles, `leading-relaxed` for body/quotes

## Spacing

**Section container (every section uses this):**
```tsx
<div className="mx-auto max-w-7xl px-4 lg:px-6">
```

**Section vertical padding:** `py-24 lg:py-32` (or controlled by parent gap)

**Page-level section gap:**
```tsx
<div className="flex flex-col gap-16 lg:gap-32">
```

**Heading → content gap:** `mt-3` (default) or `mt-4` (larger sections)

**Common grid gaps:** `gap-3` (bento), `gap-4` (pricing), `gap-6` (articles), `gap-8 lg:gap-12` (testimonials)

**Card internal padding:** `p-4` (compact), `p-5 lg:p-8` (featured), `p-8 lg:p-10` (pricing)

## Color System

oklch color space, defined in `src/app/globals.css`. Always use semantic tokens — never hardcode hex/rgb.

**Most-used text tokens:**
- `text-foreground` — primary text
- `text-muted-foreground` — secondary/description text
- `text-white` / `text-white/70` / `text-white/50` / `text-white/30` — on dark backgrounds

**Most-used background tokens:**
- `bg-background` — page surface
- `bg-card` — card surfaces
- `bg-primary` — primary CTA, recommended tier
- `bg-black` — full-bleed cinematic sections

**Border tokens:**
- `border-border` — standard borders
- `border-border/40` — subtle borders
- `border-border/50` — bento card borders
- `border-primary/30` — active/selected state

**Gradient overlays (on dark media):**
- Standard: `bg-gradient-to-t from-black/65 to-transparent`
- Heavy: `bg-gradient-to-t from-black/80 via-black/40 to-transparent`
- Featured article: `bg-gradient-to-t from-black/80 via-[45%] via-black/30 to-transparent`

## Layout Grids

**Responsive breakpoints:** Only `sm:` (640px) and `lg:` (1024px). No `md:`. Mobile-first.

| Pattern | Classes |
|---|---|
| Bento (4-col) | `grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4` |
| Pricing (3-col) | `grid-cols-1 gap-4 lg:grid-cols-3` |
| Featured + sidebar | `grid-cols-1 gap-6 lg:grid-cols-5` (featured: `lg:col-span-3`, sidebar: `lg:col-span-2`) |
| Stats (4-col) | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` |
| Split media | `grid-cols-1 gap-6 lg:gap-0 lg:grid-cols-[1fr_0.6fr]` (or `[0.6fr_1fr]` reversed) |
| Footer links (6-col) | `grid-cols-2 gap-6 lg:grid-cols-6` |

## Component Structure

Every layout section follows this template:

```tsx
"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { cn } from "@/core/lib/utils";
import { sectionData, items } from "./component-data";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ComponentName() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* content with motion.div wrappers */}
      </div>
    </section>
  );
}
```

**Data file pattern** (`component-data.ts`):
```tsx
export interface ItemType { /* ... */ }

export const componentSectionData = {
  heading: "...",
  description: "...",
} as const;

export const items: ItemType[] = [ /* ... */ ];
```

## Interaction States

**Card hover:**
```tsx
className="transition-transform duration-300 hover:-translate-y-1 hover:shadow-sm"
// or with motion:
whileHover={{ y: -4 }}
```

**Image hover (in groups):**
```tsx
className="transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:brightness-110"
```

**Link hover:**
```tsx
className="transition-colors hover:text-foreground/70"
```

**Dividers:**
```tsx
// Horizontal
<div className="my-8 h-px bg-border" />
// Vertical (between stats)
<div className="border-l border-border" />
// Decorative fade
background: linear-gradient(90deg, transparent, var(--border), transparent)
```

## Copy Voice

The site speaks in Severance's institutional register — corporate euphemism delivered with absolute conviction.

- **Eyebrows:** "Your outie has been informed of these results" / "The work is mysterious and important"
- **Labels:** Use Lumon-world nouns — "Refined Files", "Severance Uptime", "Wellness Score", "Departments"
- **Tone:** Deadpan authority. No exclamation marks. No casual language. No emoji.
- **Footnotes:** Institutional boilerplate — "All metrics reflect live production data as of [date]"

## Rich Text / Prose

The `RichText` component (`src/components/features/rich-text/rich-text.tsx`) renders Lexical editor content with Tailwind Typography. All rich text content uses these prose classes:

**Base prose:**
```
prose dark:prose-invert max-w-none
```

**Heading overrides:**
```
prose-headings:font-semibold prose-headings:leading-tight prose-headings:tracking-tight
```

**Body text:**
```
prose-p:text-muted-foreground prose-p:leading-relaxed
```

**Links:**
```
prose-a:text-foreground prose-a:underline-offset-4 prose-a:decoration-border hover:prose-a:decoration-foreground/50
```

**Code:**
```
prose-code:font-mono prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:before:content-none prose-code:after:content-none
```

**Images suppressed** — `prose-img:hidden` (the media converter renders images explicitly with Next.js `Image`)

**Size variants:** `prose-sm`, `prose-base` (default), `prose-lg`

**Custom block converters** use `not-prose` to escape typography and handle their own styling:
- Callout: left-border accent with institutional labels (Notice, Advisory, Guidance, Alert)
- Horizontal rule: gradient fade (`linear-gradient(90deg, transparent, var(--border), transparent)`)
- Media: Next.js Image with size/alignment options, eyebrow-style credit badge
- Checklist: shadcn-styled checkboxes (pure SVG, server-renderable)
- Button: block-level CTA with variant/size options

**Server rendering constraint:** All converters must be server-renderable. No Radix, no Hugeicons, no `"use client"`. Use inline SVG for icons.

## What to Avoid

- **Generic SaaS patterns** — rounded-full pills with gradient backgrounds, "Get Started Free" buttons, testimonial carousels with star ratings
- **AI slop tells** — Inter/Roboto fonts, purple-on-white gradients, predictable card grids with identical padding, drop shadows on everything
- **Decoration without purpose** — Noise textures, grain overlays, or glassmorphism just because. Every effect should serve the Severance aesthetic (the CRT terminal has effects because it IS a CRT; the trust stats don't because they're corporate signage)
- **Warmth** — This interface is deliberately cool. No warm colors, rounded-cute elements, or friendly micro-copy. The friendliest thing on screen is a waffle party.
