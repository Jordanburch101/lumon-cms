# Split Media Redesign — Layered Depth

## Goal

Elevate the split media section from a generic 50/50 alternating layout to an immersive, layered storytelling experience with depth and presence.

## Design Decisions

- **Role:** Deep product storytelling — each row is a "chapter"
- **Feel:** Layered depth — parallax, overlapping elements, different visual planes
- **Consistency:** Same structure across all rows, varied details (parallax speed, overlap direction)
- **Ratio:** ~65/35 with the text panel overlapping onto the media edge
- **Motion:** Gentle media parallax + text panel slides in from the overlap edge

## Layout

- CSS grid: `grid-cols-[1fr_0.55fr]` (~65/35), alternating media/text direction per row
- Min height ~560-640px per row
- Text panel overlaps media by ~60-80px via negative margin (`-ml-16` or `-mr-16`)
- Text panel: `bg-background`, `rounded-2xl`, `shadow-lg`, `p-8 lg:p-12`, `z-10`
- Row gap increases to `gap-24 lg:gap-32`

## Motion

### Media parallax
- `useScroll` targeting each row, `offset: ["start end", "end start"]`
- Image/video Y translation: `-40px` to `+40px` via `useTransform`
- Creates subtle depth behind the floating text card

### Text panel entrance
- Slides from overlap direction: `translateX(-40px)` to `0` (or `+40px` for right-side overlap)
- Fades 0 to 1
- Ease: `[0.16, 1, 0.3, 1]`, duration ~0.7s
- Inner elements (eyebrow, headline, body, CTA) stagger sequentially

### Media entrance
- Fade in with subtle scale `0.97` to `1`
- Parallax provides ongoing motion after initial entrance

## Visual Treatment

- **Text card:** `bg-background`, `rounded-2xl`, `shadow-lg`, sits above media with `z-10`
- **Media:** Keeps `rounded-2xl`, `overflow-hidden`, color overlay, brightness filter, bottom gradient overlay with title/badge/description
- **Eyebrow label:** Replace step numbers (`01`, `02`) with `mediaLabel` text (`Process`, `Heritage`, `Culture`) — styled as uppercase tracking-wide eyebrow above headline
- **Category label:** Top-left of media stays as-is

## Mobile (< lg)

- Single column, media on top, text below
- No overlap — text sits below media with normal spacing
- No parallax — fade/slide entrance animations only
- Text card loses card treatment (no shadow, no background), becomes inline content
- Media keeps `aspect-[4/3]`
- Eyebrow label replaces step numbers on mobile too

## Files to Change

- `src/components/layout/split-media/split-media.tsx` — layout, motion, visual treatment
- `src/components/layout/split-media/split-media-data.ts` — no structural changes needed
