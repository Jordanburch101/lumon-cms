# Timeline Block Redesign

**Date:** 2026-03-17
**Status:** Draft
**Scope:** Complete rebuild of the timeline block — schema, component, animations

## Context

The current timeline block uses a generic alternating zigzag layout with basic fade/slide animations, optional images, and icons borrowed from the features-grid. It doesn't match the project's design ambitions. This redesign makes it a flagship component: scroll-driven storytelling with cinematic typography, no media dependency.

## Design Goals

1. **Scroll-driven storytelling** — content reveals and transforms as you scroll, creating a narrative rhythm
2. **Cinematic typographic impact** — large type, dramatic stats, premium annual-report quality
3. **Elegant data density** — every detail considered, beautiful hierarchy, subtle micro-interactions
4. **Versatile** — works for company history, product roadmap, process steps, or any chronological/sequential narrative
5. **Optimized for 5–10 items** — each one gets room to breathe

## Schema

### Section-level fields (unchanged)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `eyebrow` | text | no | Small mono label above heading |
| `heading` | text | yes | Section title |
| `description` | textarea | no | Section subtitle |

### Item fields (changed)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `date` | text | yes | Temporal marker: "1865", "Q3 2024", "Phase 1" |
| `heading` | text | yes | Milestone title |
| `description` | textarea | yes | Supporting narrative |
| `stat` | text | no | Big number/metric: "500K", "$12M", "99.9%" |
| `statLabel` | text | no | Descriptor below stat: "users onboarded" |
| `category` | text | no | Freeform tag: "Product", "Growth", "Team" |

**Removed fields:** `icon` (decoration without purpose), `image` (design is typography-driven).

**Migration note:** The `icon` and `image` fields are removed from the schema. Existing data with these fields will be ignored by the new component. No data migration needed — Payload handles missing fields gracefully.

## Layout

### Desktop (lg+)

- **Left-aligned vertical layout** — no alternating/zigzag
- Each milestone is a `grid grid-cols-[40px_1fr] gap-8` — the 40px column holds the progress line and dot, the `1fr` column holds content
- This gives ~80px total offset from container edge (40px line column + 32px gap)
- `gap-y-[120px] lg:gap-y-[160px]` between milestones (via parent flex/grid gap or milestone padding)
- Section header (eyebrow, heading, description) left-aligned above the timeline, at the same content offset (`ml-[72px]` or equivalent)

### Mobile

- Same grid structure: `grid-cols-[32px_1fr] gap-6`
- Gaps between milestones compress to ~80px (`gap-y-[80px]`)

### Per-milestone content order (top to bottom)

```
DATE  ·  CATEGORY TAG        ← small mono, same line, gap-3
Heading Text                  ← large semibold
Description text              ← muted, max-w-lg
500K                          ← stat (huge mono, primary color)
users onboarded               ← stat label (tiny mono)
```

All optional fields (stat, statLabel, category) are simply absent when empty — no placeholder gaps.

## Typography

| Element | Classes | Color |
|---------|---------|-------|
| Date | `font-mono text-[11px] uppercase tracking-[0.15em]` | `text-primary` |
| Category tag | `font-mono text-[10px] uppercase tracking-wider` in pill (`border border-border/50 bg-muted/50 px-2.5 py-0.5 rounded-full`) | `text-muted-foreground` |
| Heading | `text-2xl lg:text-3xl font-semibold tracking-tight leading-snug` | `text-foreground` |
| Description | `text-sm lg:text-base leading-relaxed max-w-lg` | `text-muted-foreground` |
| Stat | `font-mono text-5xl lg:text-6xl font-bold tracking-tighter` | `text-primary` |
| Stat label | `font-mono text-[11px] uppercase tracking-[0.1em]` | `text-muted-foreground` |

## Scroll-Driven Progress Line

### Structure

Two layered vertical elements:

1. **Ghost line** — full height from first dot to last dot, `bg-border/20` (shows total path)
2. **Fill line** — `bg-primary`, height driven by scroll progress through the section

### Implementation

- `useScroll({ target: sectionRef, offset: ["start 60%", "end 40%"] })` tracks section scroll position
- The fill line is a `motion.div` with `style={{ scaleY: scrollYProgress }}` and `transformOrigin: "top"` — GPU-composited, driven directly by the 0–1 progress value. The element is sized to full ghost-line height via CSS; `scaleY` handles the visual fill.
- Smooth continuous fill — no per-milestone snapping

### Milestone dots

Positioned absolutely on the progress line. Each dot is an `absolute`-positioned element inside the milestone's grid row, aligned to the line column. The milestone grid is `grid-cols-[40px_1fr]` (mobile) / `grid-cols-[40px_1fr]` (desktop — same, since we're left-aligned). The dot sits centered in the 40px column.

| State | Size | Style |
|-------|------|-------|
| **Upcoming** | 8px | `border-1.5 border-border/30 bg-transparent` |
| **Active** | 14px | `border-2 border-primary bg-background` + `box-shadow: 0 0 16px primary/40` glow + `scale(1.25)` spring transition |
| **Passed** | 10px | `bg-primary` solid, no border, no glow |

State transitions are smooth — spring for scale, ease for opacity/color.

## Milestone States & Animations

### State determination

Each milestone uses its own `useInView(ref, { once: false, margin: "-40% 0px -55% 0px" })` — this defines a "sweet spot" zone in the middle ~40% of the viewport. This matches the codebase convention (every block already uses `useInView`). A milestone is:

- **Upcoming** — `inView` has never been true (below the sweet spot)
- **Active** — `inView` is currently true (inside the sweet spot)
- **Passed** — `inView` was true but is now false, and the element is above the viewport midpoint. Tracked via a `hasBeenSeen` ref that flips to true on first `inView`.

| State | Opacity | Transform |
|-------|---------|-----------|
| **Upcoming** | `0.3` | `translateY(16px)` |
| **Active** | `1.0` | `translateY(0)` |
| **Passed** | `0.55` | `translateY(0)` |

### Entrance animation (upcoming → active)

When a milestone crosses into the active zone, its content elements stagger in:

1. **Date + category** — 0ms delay
2. **Heading** — 50ms delay
3. **Description** — 100ms delay
4. **Stat + label** — 150ms delay

Each element: `opacity 0→1`, `translateY 16px→0`, duration `0.6s`, ease `[0.16, 1, 0.3, 1]`

### Stat count-up animation

When a milestone becomes active and has a `stat` field:

- Parse the stat string using regex: `/^([^0-9]*)([0-9]+(?:[.,][0-9]+)?)(.*)$/`
  - Group 1: prefix (e.g., "$")
  - Group 2: numeric portion (e.g., "12", "99.9", "10,000")
  - Group 3: suffix (e.g., "K", "M", "%", "+")
- If no numeric portion is found (e.g., "3x"), render the stat string as-is without animation
- Strip commas for animation math, re-insert during display formatting
- Animate from 0 to the parsed number over 1.5s using `useSpring({ stiffness: 50, damping: 20 })`
- Display with matching decimal places (if input has "99.9", animate to 1 decimal place)
- Preserve prefix + suffix framing the animated number
- Fires once — gated by a `hasAnimated` ref that flips on first active state

### Exit animation (active → passed)

- `opacity 1→0.55` over `0.4s` with standard ease
- No positional shift — content stays in place
- Dot transitions from hollow+glow to solid fill

## Component Architecture

### File structure

```
src/components/blocks/timeline/
  timeline.tsx          — main export, section header, scroll tracking, progress line
  timeline-milestone.tsx — individual milestone: content, dot, state management
  use-stat-counter.ts   — hook for stat count-up animation
```

Three files instead of one 300-line monolith. The stat counter hook is reusable.

### Key implementation details

- `"use client"` — required for scroll tracking and animations
- `useScroll` from `motion/react` for section-level scroll progress
- Each milestone uses its own `useInView` or ref-based position check to determine state
- The progress line fill and milestone states are both derived from the same scroll progress value
- Milestone state is computed, not stored — `scrollProgress > milestoneThreshold` determines passed/active/upcoming
- `data-field` and `data-array-item` attributes preserved for frontend editor overlay compatibility — new fields need: `data-field="items.N.stat"`, `data-field="items.N.statLabel"`, `data-field="items.N.category"`

## Fixture Data

Update the fixture to exercise all field combinations:

- Milestone with all fields (date, heading, description, stat, statLabel, category)
- Milestone with no optional fields (date, heading, description only)
- Milestone with stat but no category
- Milestone with category but no stat
- 6 items total to test spacing and scroll behavior

## Storybook

Existing auto-discovery via `block-fixtures.ts` will pick up the updated fixture automatically. No manual story file needed.

## Accessibility

- Section uses `aria-label="Timeline"`
- Progress line is decorative — `aria-hidden="true"`
- Milestone content is always in the DOM at all scroll positions (not conditionally rendered), just opacity-reduced
- Stat count-up shows the final value in a `aria-label` so screen readers get the real number, not the animating intermediate
- Respects `prefers-reduced-motion` via `useReducedMotion()` from `motion/react`: disables scroll-driven progress line animation (show full fill), shows all milestones at full opacity with no translateY, stat shows final value immediately without count-up. This is the first component in the codebase to use JS-side reduced motion detection.

## Post-Schema Checklist

After updating the Payload schema, run `bun run generate:types` to regenerate TypeScript types. The component will reference `item.stat`, `item.statLabel`, and `item.category` which won't exist in the type system until regeneration.
