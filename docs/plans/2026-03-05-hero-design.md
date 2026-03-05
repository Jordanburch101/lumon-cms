# Hero Section Design

## Context

Lumon Payload is a Next.js + Payload CMS template/showcase. The hero is the first page section users see. It should read as a real marketing website, not a demo.

## Goal

A full-viewport, photo-backed hero that is cinematic and editorial — not generic. Feels like a real product landing page.

## Visual Design

- **Background**: `/hero-bg` B&W landscape photo, `object-cover`, fills full viewport
- **Overlay**: `linear-gradient` from `transparent` at top to `black/65` at bottom — enhances text contrast while letting the landscape breathe
- **Height**: `min-h-[100svh]` — fills viewport including mobile
- **Navbar integration**: Navbar is already sticky/transparent on load, so it naturally floats over the photo — no changes needed

## Content

- Bottom-left anchored content block, inside `max-w-7xl` container (matches navbar/footer)
- **Headline**: Large display type (4xl–6xl), white, Nunito Sans semibold, tight leading
- **Subtext**: 1–2 lines, `white/70`, base size
- **CTAs**: Primary solid button + ghost/outline secondary button side by side

## Component Structure

```
src/components/layout/hero/
  hero.tsx        — component
  hero-data.ts    — copy (headline, subtext, CTA labels/hrefs)
```

Follows the same pattern as navbar and footer.

## Out of Scope

- Animation or parallax on the photo
- Video background
- Badge/trust element
- Mobile-specific copy variants
