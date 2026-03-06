# Testimonials Section Design

## Overview

Social proof section placed between SplitMedia and Footer. Features a spotlight + grid layout with polished micro-animations. All copy is Severance-themed — Lumon corporate testimonials from severed employees and management.

## Layout

### Desktop (lg+)

```
+---------------------------------------------------------------+
|  Section heading + subtext (left-aligned, like bento)         |
+------------------------------------+--------------------------+
|                                    |  [Short card 1] [Short 2]|
|  FEATURED SPOTLIGHT                |  [Short card 3] [Short 4]|
|  Large quote, avatar, name/role    |                          |
|  Company/dept logo                 |                          |
|  [====== progress bar ======]      |                          |
+------------------------------------+--------------------------+
```

- Container: `max-w-7xl`, consistent with all other sections
- Left ~60%: featured testimonial spotlight
- Right ~40%: 2x2 grid of short quote cards
- Section padding: `py-16 lg:py-24` (matches bento + split-media)

### Mobile

- Featured quote stacked on top
- Short quotes in a horizontally scrollable row below

## Featured Spotlight (left)

- Oversized decorative quote mark — large, low-opacity (`text-[120px] opacity-5`), positioned behind text
- Quote text: `text-2xl lg:text-3xl`, `leading-relaxed`
- Below quote: avatar (48px circle), name, role, department/division logo
- Thin progress bar at bottom: CSS `scaleX(0 -> 1)` over ~6s, linear timing, resets on swap
- Auto-advances through featured-eligible testimonials

## Short Quote Cards (right)

- Compact card: one-liner quote, name, department
- Active card (currently in spotlight): subtle primary-color border + soft glow (`box-shadow: 0 0 0 1px primary, 0 0 12px primary/10`)
- Hover: `scale(1.02)` + slightly elevated shadow
- Click: promotes card to featured spotlight with crossfade

## Animations

All use the project's standard easing: `[0.16, 1, 0.3, 1]` (matches split-media).

| Element | Enter | Exit | Timing |
|---------|-------|------|--------|
| Quote text | Per-line stagger: `opacity: 0, y: 12` -> `opacity: 1, y: 0` | `opacity: 0, y: -8` | 0.5s per line, 80ms stagger |
| Attribution | `opacity: 0` -> `opacity: 1` | `opacity: 0` | 0.4s, 200ms delay after last line |
| Progress bar | `scaleX(0)` -> `scaleX(1)` | Reset to 0 | 6s linear |
| Card active state | Border + glow fade in | Fade out | 0.3s ease |
| Section entrance | `useInView`: `opacity: 0, y: 24` -> `opacity: 1, y: 0` | n/a | 0.8s, once |

## Data Shape

```ts
interface Testimonial {
  quote: string
  name: string
  role: string
  department: string
  avatarSrc?: string
  featured?: boolean // eligible for spotlight rotation
}
```

## Copy — Severance Theme

### Section Header
- Headline: "Praise from the severed floor"
- Subtext: "Every department. Every disposition. One unified appreciation for the work."

### Featured Quotes (long, rotate in spotlight)

1. **Harmony Cobel** — Director, Severed Floor
   "The severance procedure represents the single greatest advancement in workplace productivity since the assembly line. Our employees arrive each morning unburdened by personal entanglement, fully present, fully devoted. I have never seen a more content workforce — and I see everything."

2. **Seth Milchick** — Supervisor, Macrodata Refinement
   "What we've built on the severed floor isn't just efficient — it's joyful. Our incentive programs drive real engagement. Last quarter alone we awarded three waffle parties, two music-dance experiences, and a coveted egg bar. Morale has never been higher."

3. **Kier Eagan** — Founder, Lumon Industries
   "Let not the mind wander beyond the walls of its purpose. For in the quiet of focused labor, man finds not chains — but wings. The work is mysterious and important, and it cannot be done anywhere else."

### Short Quotes (punchy one-liners)

1. **Mark S.** — Refiner, MDR
   "I enjoy every moment of my work day. I have no reason not to."

2. **Helly R.** — Refiner, MDR
   "I am grateful for the opportunity to serve Kier's vision."

3. **Irving B.** — Refiner, MDR
   "The handbook says to find meaning in the work itself. I have."

4. **Dylan G.** — Refiner, MDR
   "The incentives are real and the waffle parties are worth every bin."

## Technical Notes

- Use `motion/react` (framer-motion) for all animations, consistent with split-media
- `useInView` for scroll-triggered entrance
- `useState` + `useEffect` timer for auto-advance
- Data file: `testimonials-data.ts` in the component folder
- Component folder: `src/components/layout/testimonials/`
- Files: `testimonials.tsx`, `testimonials-data.ts`, `featured-quote.tsx`, `quote-card.tsx`
