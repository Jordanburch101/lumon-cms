# Trust Section — "The Corridor"

## Overview

Final section on the home page, added as the last child in `page.tsx` after `<MdrTerminal />` (the footer lives in `layout.tsx` and renders after page content automatically). A trust/credibility section presenting key metrics and partner logos in a minimal, institutional layout inspired by Lumon's clinical aesthetic.

## Layout

**The Corridor** — four stats side by side separated by thin vertical rules, logos as a quiet strip below a full-width hairline. No cards, no containers. Just typography and whitespace.

### Structure (top to bottom)

1. **Eyebrow** — centered, uppercase, wide-tracked: "Your outie has been informed of these results"
2. **Stats row** — four equal-width columns with vertical 1px dividers between them:
   - 10k+ / Refined Files
   - 99.9% / Severance Uptime
   - 4.9 / Wellness Score
   - 50+ / Departments
3. **Hairline divider** — full-width `border-top: 1px solid border`
4. **Logo strip** — company logos at ~18% opacity, evenly spaced, no hover effects

### Spacing

- Section container: `<section className="w-full">` with `<div className="mx-auto max-w-7xl px-4 lg:px-6">`
- Eyebrow to stats: `mb-[72px]`
- Stats to hairline: `mt-20` (80px)
- Hairline to logos: `pt-12` (48px)

### Responsive

- **Desktop (`lg`)**: 4-column row, vertical 1px dividers between columns
- **Tablet (`sm` to `lg`)**: 2x2 grid with `gap-y-12 gap-x-0`. Vertical divider between columns in each row. Horizontal hairline between the two rows.
- **Mobile (below `sm`)**: single column stack, no vertical dividers, horizontal hairlines between each stat

## Typography

- Stat numbers: `text-7xl font-bold tracking-tighter` (~72px, weight 700, -0.04em)
- Stat labels: `text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground` (12px)
- Eyebrow: `text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground`
- Logo text (placeholder): `text-base font-semibold` at 18% opacity

## Animation

All animations use the project's standard easing `EASE = [0.16, 1, 0.3, 1]` and `useInView({ once: true, margin: "-100px" })`. This is a `"use client"` component (requires motion/react hooks).

1. **Eyebrow** — fade + slide up (y: 24 → 0), 0.8s, delay 0s
2. **Stats** — staggered fade + slide up (y: 32 → 0), 1s each, stagger 0.08s
3. **Count-up** — numbers animate from 0 to target with easeOutExpo over 2.2s, staggered to sync with stat entrance
4. **Logo strip** — fade in only (no y movement), 0.8s, delay after stats complete

## Count-Up Component

`count-up.tsx` exports a `<CountUp>` React component (not a hook).

- Uses `useMotionValue` + `useTransform` from motion/react (same pattern as the pricing card's animated price counter)
- Accepts props: `target: number`, `format?: "k"`, `decimals?: number`, `suffix?: string`
- Accepts an `inView: boolean` prop from the parent — starts counting when `true`
- Animates the motion value from 0 → target over 2.2s with easeOutExpo
- `format: "k"` — animates 0 → 10000 internally, displays as rolling digits, then snaps to "10k" at the end for the final display value
- Renders a `<motion.span>` displaying the transformed value

## Colors

All theme colors via CSS variables — no hardcoded values:
- Background: `bg-background` (white in light mode)
- Numbers: `text-foreground`
- Labels: `text-muted-foreground`
- Dividers: `border-border`
- Logos: `text-foreground` at `opacity-[0.18]`

## Component Structure

```
src/components/layout/trust/
  trust.tsx          — main section component ("use client")
  count-up.tsx       — CountUp component using useMotionValue
  trust-data.ts      — stats array + logos array (template placeholder data)
```

## Data Model

Defined in `trust-data.ts`. Stats and logos are hardcoded arrays (template/placeholder data — will become CMS-driven when Payload is added). Eyebrow copy is also placeholder and should be replaced when forking for clients.

```ts
type Stat = {
  value: number
  format?: "k"
  decimals?: number
  suffix?: string
  label: string
}

type Logo = {
  name: string
  // Future: add `src` for SVG/image logos
}

const stats: Stat[] = [
  { value: 10000, format: "k", suffix: "+", label: "Refined Files" },
  { value: 99.9, decimals: 1, suffix: "%", label: "Severance Uptime" },
  { value: 4.9, decimals: 1, suffix: "", label: "Wellness Score" },
  { value: 50, suffix: "+", label: "Departments" },
]

const logos: Logo[] = [
  { name: "Acme" },
  { name: "Globex" },
  { name: "Initech" },
  { name: "Hooli" },
  { name: "Umbrella" },
]

const eyebrow = "Your outie has been informed of these results"
```

## Dependencies

- `motion/react` — animations (already in project)
- No new packages needed
