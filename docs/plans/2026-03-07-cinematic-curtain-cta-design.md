# Cinematic Curtain CTA — Design Doc

## Overview

A scroll-driven closing section for the home page. The page content splits apart like theatrical curtains to reveal a looping ambient video underneath. Once fully revealed, an ominous Severance-style message fades in. Purely a design showcase piece — no real product CTA.

## Placement

Final section on the home page, after LatestArticles and before the footer.

## Interaction Flow

1. **Scroll enter** — Two "curtain" panels (matching the page background) begin parting left/right via `clipPath` animation, driven by scroll progress.
2. **Mid-reveal** — The ambient video becomes visible between the parting panels. Dark, moody, Lumon-esque.
3. **Fully open** — Curtains gone, full-bleed video fills the viewport. Text fades in centered over a gradient overlay.
4. **Sticky hold** — Section stays pinned briefly so the user sits in the moment before scrolling into the footer.

## Message / Copy

Primary: "The work is mysterious and important."
- Uppercase, wide tracking, small font — matching the gallery's label typography
- Optional secondary line in italic quote style beneath

## Technical Approach

- `motion/react` with `useScroll` + `useTransform` (same pattern as ImageGallery)
- Sticky container (`position: sticky; top: 0; height: 100vh`)
- Scroll-height container: ~250vh to give enough scroll runway for the animation
- Two curtain `div`s with animated `clipPath: inset()` — left curtain clips from right edge inward, right curtain clips from left edge inward
- `<video>` element behind curtains (autoPlay, muted, loop, playsInline)
- Gradient overlay on video (same style as hero: `from-black/65 to-transparent`)
- Text opacity + y-transform animated in after curtains are ~80% open
- `data-navbar-contrast="light"` since the section is dark/video-based

## Component Structure

```
src/components/layout/cinematic-cta/
  cinematic-cta.tsx        — Main section component (scroll logic, sticky container)
  cinematic-cta-data.ts    — Video source, message text, config
```

## Design Tokens

- Background: black (matches ImageGallery)
- Text: white, white/50 for label
- Typography: uppercase tracked label + italic quote style (matching gallery-card.tsx)
- Animation easing: `[0.16, 1, 0.3, 1]` (consistent with split-media)

## Dependencies

- `motion/react` (already installed)
- A placeholder video file (can reuse hero video initially or add a new one)
