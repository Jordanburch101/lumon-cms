# Immersive Image Gallery — Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** A cinematic, full-bleed image gallery section for Severance world-building — atmospheric editorial imagery with scroll-triggered clip-reveal animations.

**Architecture:** Stacked full-width image cards, each filling ~85vh, with clip-path + scale animations driven by `motion/react` `useInView`. Minimal text overlays (location label + one-line caption). Placed between Testimonials and Footer.

**Tech Stack:** motion/react, Tailwind CSS v4, Next.js Image component

---

## Concept

A series of 4–5 full-bleed image cards stacked vertically. As the user scrolls, each card reveals itself with a cinematic clip/scale animation. Minimal text — just a short label and a one-line atmospheric caption per image. The feel is editorial, like flipping through a Lumon corporate lookbook.

## Layout & Structure

- Each card is a `<figure>` with a full-width image (aspect-ratio ~16:9, capped at ~85vh)
- Image wrapped in an overflow-hidden container for the clip-reveal
- Below or overlaid on the image: a small **location label** and a **caption** in a quiet, typographic style
- Generous vertical spacing between cards
- No background color — images do all the visual work

## Scroll Animations (per card, triggered by `useInView`)

1. **Clip-reveal on entry** — image starts clipped (`clip-path: inset(15%)`) and expands to `inset(0%)` as it enters view. Creates a cinematic "opening curtain" effect.
2. **Subtle scale** — image starts at `scale(1.1)` and eases to `scale(1)` during the reveal, giving a gentle zoom-settle.
3. **Text fade-up** — label and caption fade in with a slight `y` offset, staggered after the image reveal.

All driven by `motion/react` with `useInView` and spring-based transitions. No scroll-jacking.

## Content (Severance Locations)

| # | Label | Caption | Image |
|---|-------|---------|-------|
| 1 | Severed Floor | "The elevator arrives. The work begins." | Long corridor, fluorescent lighting |
| 2 | Macrodata Refinement | "The numbers are unknowable. The work is not." | MDR office, terminals |
| 3 | The Break Room | "Forgive me for what I have done to the children of Kier." | Stark room, single chair |
| 4 | Perpetuity Wing | "Nine founders. Nine lives. Preserved in wax and wonder." | Wax figures, museum hallway |
| 5 | The Board | "The Board thanks you for your service." | Dark, abstract, minimal |

Images will be sourced separately and placed in `public/gallery/`.

## Component Structure

```
src/components/layout/image-gallery/
  image-gallery.tsx       — parent section, maps over data array
  gallery-card.tsx        — single card: clip-reveal image + text overlay
  image-gallery-data.ts   — content array (label, caption, imageSrc)
```

## What It Does NOT Include

- No interactivity (no clicks, hovers, modals, lightbox)
- No parallax
- No scroll-jacking
- No complex state management
