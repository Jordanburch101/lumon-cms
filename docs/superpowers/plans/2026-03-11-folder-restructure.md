# Folder Restructure Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate all Payload CMS concerns under `src/payload/` and separate block components from site chrome in `src/components/`.

**Architecture:** Move block schemas, collections, hooks, jobs, and Payload-specific utilities into a single `src/payload/` directory. Move block-rendering components from `components/layout/` to `components/blocks/`, leaving only navbar and footer in `layout/`. Update all import paths and project documentation.

**Tech Stack:** Next.js 16, Payload CMS 3.x, Bun, TypeScript

---

## Before / After

```
BEFORE                              AFTER
src/                                src/
├── blocks/          (schemas)      ├── payload/
├── collections/                    │   ├── block-schemas/   (10 files)
│   └── hooks/                      │   ├── collections/     (3 files)
├── jobs/                           │   ├── hooks/           (2 files)
├── lib/             (payload)      │   ├── jobs/            (1 file)
├── components/                     │   └── lib/             (2 files)
│   ├── blocks/      (renderer)     ├── components/
│   ├── layout/      (everything)   │   ├── blocks/          (renderer + 11 section folders)
│   ├── features/                   │   ├── layout/          (navbar + footer only)
│   └── ui/                         │   ├── features/
├── core/                           │   └── ui/
│   └── lib/         (agnostic)     ├── core/
└── payload.config.ts               │   └── lib/             (agnostic, unchanged)
                                    └── payload.config.ts    (stays, Payload requires it here)
```

## Files Moving (52 total)

| From | To | Count |
|------|----|-------|
| `src/blocks/*.ts` | `src/payload/block-schemas/*.ts` | 10 |
| `src/collections/*.ts` | `src/payload/collections/*.ts` | 3 |
| `src/collections/hooks/*.ts` | `src/payload/hooks/*.ts` | 2 |
| `src/jobs/*.ts` | `src/payload/jobs/*.ts` | 1 |
| `src/lib/ffmpeg.ts`, `src/lib/download-media.ts` | `src/payload/lib/*.ts` | 2 |
| `src/components/layout/{hero,bento,...}/` | `src/components/blocks/{hero,bento,...}/` | 34 |

## Import Paths to Update (6 files, 29 imports)

| File | # Changes | Notes |
|------|-----------|-------|
| `src/payload.config.ts` | 4 | `./collections/*` → `./payload/collections/*`, `./jobs/*` → `./payload/jobs/*` |
| `src/payload/collections/Pages.ts` | 10 | `../blocks/*` → `../block-schemas/*` |
| `src/payload/collections/Media.ts` | 2 | `./hooks/*` → `../hooks/*` |
| `src/payload/hooks/optimizeVideo.ts` | 1 | `@/lib/ffmpeg` → `../lib/ffmpeg` |
| `src/payload/jobs/optimize-video.ts` | 2 | `@/lib/*` → `../lib/*` |
| `src/components/blocks/render-blocks.tsx` | 10 | `@/components/layout/*` → `@/components/blocks/*` |

## Files NOT Moving (confirmed no changes needed)

- `src/components/layout/navbar/` (7 files) — stays
- `src/components/layout/footer/` (3 files) — stays
- `src/app/(frontend)/layout.tsx` — imports navbar/footer, paths unchanged
- `src/app/(frontend)/[[...slug]]/page.tsx` — imports render-blocks, path unchanged
- `src/app/showcase/page.tsx` — imports only from `@/components/ui/`
- `src/providers/providers.tsx` — imports navbar search, path unchanged
- `src/core/` — entirely untouched
- All 42 block component files — internal imports are relative (local data files, local sub-components), no cross-folder imports

---

## Chunk 1: Create `src/payload/` and move Payload files

### Task 1: Move block schemas

**Files:**
- Move: `src/blocks/*.ts` → `src/payload/block-schemas/*.ts` (10 files)
- Delete: `src/blocks/` (empty after move)

- [ ] **Step 1: Create target directory and move files**

```bash
mkdir -p src/payload/block-schemas
git mv src/blocks/Hero.ts src/payload/block-schemas/Hero.ts
git mv src/blocks/Bento.ts src/payload/block-schemas/Bento.ts
git mv src/blocks/SplitMedia.ts src/payload/block-schemas/SplitMedia.ts
git mv src/blocks/Testimonials.ts src/payload/block-schemas/Testimonials.ts
git mv src/blocks/ImageGallery.ts src/payload/block-schemas/ImageGallery.ts
git mv src/blocks/LatestArticles.ts src/payload/block-schemas/LatestArticles.ts
git mv src/blocks/CinematicCta.ts src/payload/block-schemas/CinematicCta.ts
git mv src/blocks/Pricing.ts src/payload/block-schemas/Pricing.ts
git mv src/blocks/Faq.ts src/payload/block-schemas/Faq.ts
git mv src/blocks/Trust.ts src/payload/block-schemas/Trust.ts
```

- [ ] **Step 2: Verify `src/blocks/` is now empty and remove it**

```bash
ls src/blocks/  # should be empty
rmdir src/blocks
```

### Task 2: Move collections

**Files:**
- Move: `src/collections/Users.ts`, `Pages.ts`, `Media.ts` → `src/payload/collections/`
- Delete: `src/collections/` (after hooks also moved)

- [ ] **Step 1: Create target directory and move files**

```bash
mkdir -p src/payload/collections
git mv src/collections/Users.ts src/payload/collections/Users.ts
git mv src/collections/Pages.ts src/payload/collections/Pages.ts
git mv src/collections/Media.ts src/payload/collections/Media.ts
```

### Task 3: Move collection hooks

**Files:**
- Move: `src/collections/hooks/generateBlurDataURL.ts`, `optimizeVideo.ts` → `src/payload/hooks/`
- Delete: `src/collections/hooks/` and `src/collections/`

- [ ] **Step 1: Create target directory and move files**

```bash
mkdir -p src/payload/hooks
git mv src/collections/hooks/generateBlurDataURL.ts src/payload/hooks/generateBlurDataURL.ts
git mv src/collections/hooks/optimizeVideo.ts src/payload/hooks/optimizeVideo.ts
```

- [ ] **Step 2: Remove empty directories**

```bash
rmdir src/collections/hooks
rmdir src/collections
```

### Task 4: Move jobs

**Files:**
- Move: `src/jobs/optimize-video.ts` → `src/payload/jobs/optimize-video.ts`
- Delete: `src/jobs/`

- [ ] **Step 1: Create target directory and move file**

```bash
mkdir -p src/payload/jobs
git mv src/jobs/optimize-video.ts src/payload/jobs/optimize-video.ts
rmdir src/jobs
```

### Task 5: Move Payload-specific lib files

**Files:**
- Move: `src/lib/ffmpeg.ts`, `src/lib/download-media.ts` → `src/payload/lib/`
- Delete: `src/lib/` (empty after move)

- [ ] **Step 1: Create target directory and move files**

```bash
mkdir -p src/payload/lib
git mv src/lib/ffmpeg.ts src/payload/lib/ffmpeg.ts
git mv src/lib/download-media.ts src/payload/lib/download-media.ts
rmdir src/lib
```

### Task 6: Update imports in moved Payload files

**Files:**
- Modify: `src/payload/collections/Pages.ts` — 10 imports
- Modify: `src/payload/collections/Media.ts` — 2 imports
- Modify: `src/payload/hooks/optimizeVideo.ts` — 1 import
- Modify: `src/payload/jobs/optimize-video.ts` — 2 imports

- [ ] **Step 1: Update Pages.ts block schema imports**

In `src/payload/collections/Pages.ts`, change all 10 block imports from:
```typescript
import { HeroBlock } from "../blocks/Hero";
```
to:
```typescript
import { HeroBlock } from "../block-schemas/Hero";
```
(Repeat for all 10: Hero, Bento, SplitMedia, Testimonials, ImageGallery, LatestArticles, CinematicCta, Pricing, Faq, Trust)

- [ ] **Step 2: Update Media.ts hook imports**

In `src/payload/collections/Media.ts`, change:
```typescript
import { generateBlurDataURL } from "./hooks/generateBlurDataURL";
import { optimizeVideo } from "./hooks/optimizeVideo";
```
to:
```typescript
import { generateBlurDataURL } from "../hooks/generateBlurDataURL";
import { optimizeVideo } from "../hooks/optimizeVideo";
```

- [ ] **Step 3: Update optimizeVideo hook import**

In `src/payload/hooks/optimizeVideo.ts`, change:
```typescript
import { isFFmpegAvailable } from "@/lib/ffmpeg";
```
to:
```typescript
import { isFFmpegAvailable } from "../lib/ffmpeg";
```

- [ ] **Step 4: Update optimize-video job imports**

In `src/payload/jobs/optimize-video.ts`, change:
```typescript
import { downloadMediaToDisk } from "@/lib/download-media";
import { isFFmpegAvailable, runFFmpeg } from "@/lib/ffmpeg";
```
to:
```typescript
import { downloadMediaToDisk } from "../lib/download-media";
import { isFFmpegAvailable, runFFmpeg } from "../lib/ffmpeg";
```

### Task 7: Update payload.config.ts imports

**Files:**
- Modify: `src/payload.config.ts` — 4 imports

- [ ] **Step 1: Update collection and job imports**

In `src/payload.config.ts`, change:
```typescript
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
import { Users } from "./collections/Users";
import { optimizeVideoTask } from "./jobs/optimize-video";
```
to:
```typescript
import { Media } from "./payload/collections/Media";
import { Pages } from "./payload/collections/Pages";
import { Users } from "./payload/collections/Users";
import { optimizeVideoTask } from "./payload/jobs/optimize-video";
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
bun tsc --noEmit 2>&1 | head -20
```
Expected: No errors related to Payload imports.

- [ ] **Step 3: Commit Payload directory consolidation**

```bash
git add src/payload/ src/payload.config.ts
git add -u  # stages deletions of old paths
git commit -m "refactor: consolidate Payload CMS files under src/payload/"
```

---

## Chunk 2: Move block components from `layout/` to `blocks/`

### Task 8: Move block component folders

**Files:**
- Move: 11 folders from `src/components/layout/` to `src/components/blocks/` (34 files)
- Keep: `src/components/layout/navbar/` and `src/components/layout/footer/` stay

- [ ] **Step 1: Move all block section folders**

```bash
# render-blocks.tsx already exists at src/components/blocks/render-blocks.tsx
# Move all block component folders alongside it
git mv src/components/layout/hero src/components/blocks/hero
git mv src/components/layout/bento src/components/blocks/bento
git mv src/components/layout/split-media src/components/blocks/split-media
git mv src/components/layout/testimonials src/components/blocks/testimonials
git mv src/components/layout/image-gallery src/components/blocks/image-gallery
git mv src/components/layout/latest-articles src/components/blocks/latest-articles
git mv src/components/layout/cinematic-cta src/components/blocks/cinematic-cta
git mv src/components/layout/pricing src/components/blocks/pricing
git mv src/components/layout/faq src/components/blocks/faq
git mv src/components/layout/trust src/components/blocks/trust
git mv src/components/layout/mdr-terminal src/components/blocks/mdr-terminal
```

- [ ] **Step 2: Verify layout/ only has navbar and footer**

```bash
ls src/components/layout/
```
Expected: `footer/` and `navbar/` only.

### Task 9: Update render-blocks.tsx imports

**Files:**
- Modify: `src/components/blocks/render-blocks.tsx` — 10 imports

- [ ] **Step 1: Update all block component imports**

In `src/components/blocks/render-blocks.tsx`, change all imports from:
```typescript
import { BentoShowcase } from "@/components/layout/bento/bento";
import { CinematicCta } from "@/components/layout/cinematic-cta/cinematic-cta";
import { Faq } from "@/components/layout/faq/faq";
import { Hero } from "@/components/layout/hero/hero";
import { ImageGallery } from "@/components/layout/image-gallery/image-gallery";
import { LatestArticles } from "@/components/layout/latest-articles/latest-articles";
import { Pricing } from "@/components/layout/pricing/pricing";
import { SplitMedia } from "@/components/layout/split-media/split-media";
import { Testimonials } from "@/components/layout/testimonials/testimonials";
import { Trust } from "@/components/layout/trust/trust";
```
to:
```typescript
import { BentoShowcase } from "@/components/blocks/bento/bento";
import { CinematicCta } from "@/components/blocks/cinematic-cta/cinematic-cta";
import { Faq } from "@/components/blocks/faq/faq";
import { Hero } from "@/components/blocks/hero/hero";
import { ImageGallery } from "@/components/blocks/image-gallery/image-gallery";
import { LatestArticles } from "@/components/blocks/latest-articles/latest-articles";
import { Pricing } from "@/components/blocks/pricing/pricing";
import { SplitMedia } from "@/components/blocks/split-media/split-media";
import { Testimonials } from "@/components/blocks/testimonials/testimonials";
import { Trust } from "@/components/blocks/trust/trust";
```

Note: These now resolve to local sibling folders since render-blocks.tsx is already in `src/components/blocks/`. Using `@/` absolute paths is fine and consistent with the codebase style.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
bun tsc --noEmit 2>&1 | head -20
```
Expected: No errors.

- [ ] **Step 3: Commit component restructure**

```bash
git add src/components/blocks/ src/components/layout/
git add -u
git commit -m "refactor: move block components from layout/ to blocks/"
```

---

## Chunk 3: Clean up, verify build, update docs

### Task 10: Remove stale .gitkeep and example files

**Files:**
- Delete: `src/components/blocks/.gitkeep` (directory now has real content)
- Optionally move: `src/components/component-example.tsx` and `src/components/example.tsx` — these are loose example files at the components root

- [ ] **Step 1: Remove .gitkeep from blocks/**

```bash
git rm src/components/blocks/.gitkeep
```

- [ ] **Step 2: Move example files to showcase or delete**

Move the loose example files somewhere intentional (or leave if the user wants them):
```bash
# If keeping:
mkdir -p src/components/examples
git mv src/components/component-example.tsx src/components/examples/component-example.tsx
git mv src/components/example.tsx src/components/examples/example.tsx
# If removing:
# git rm src/components/component-example.tsx src/components/example.tsx
```

### Task 11: Verify full build

- [ ] **Step 1: Run lint check**

```bash
bun check
```
Expected: No new errors (Biome should be happy since no code logic changed).

- [ ] **Step 2: Run production build**

```bash
bun build
```
Expected: Build succeeds. All pages render correctly.

- [ ] **Step 3: Start dev server and spot-check**

```bash
bun dev
# Visit http://localhost:3000 — verify homepage loads with all blocks
# Visit http://localhost:3000/admin — verify Payload admin loads
```

### Task 12: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` — update Project Structure section and path alias references

- [ ] **Step 1: Update the Project Structure section**

Replace the existing structure block in CLAUDE.md with:
```markdown
## Project Structure

\```
src/
  app/              — Next.js App Router pages and layouts
  payload/          — All Payload CMS concerns
    block-schemas/  — Block field definitions (Hero, Bento, etc.)
    collections/    — Data models (Users, Media, Pages)
    hooks/          — Collection & field hooks
    jobs/           — Async job tasks (video optimization)
    lib/            — Payload-specific utilities (ffmpeg, downloads)
  core/             — Upstream-safe agnostic code (hooks, utils)
    hooks/          — Generic reusable hooks
    lib/            — Generic utilities (cn, helpers)
  components/       — All UI rendering
    ui/             — shadcn UI primitives (generated, don't hand-edit)
    blocks/         — Payload block components + render-blocks mapper
    layout/         — Structural components (navbar, footer)
    features/       — Feature-level composed components
  types/            — Project-specific TypeScript types
  providers/        — Context providers (theme, etc.)
scripts/            — CLI scripts (seed, migrate, codegen)
docs/plans/         — Design documents
\```
```

- [ ] **Step 2: Update the path alias documentation**

Add/update the path aliases section to include:
```markdown
  - `@/payload` — Payload CMS schemas, collections, hooks, jobs, utilities
  - `@/components/blocks` — Block rendering components
```

- [ ] **Step 3: Update the Payload CMS Architecture section**

Update references from:
- "Collections: `src/collections/`" → "`src/payload/collections/`"
- "Blocks" list should reference `src/payload/block-schemas/`
- "Page rendering" → reference to `src/components/blocks/render-blocks.tsx`

### Task 13: Update project memory

**Files:**
- Modify: `/Users/jordanburch/.claude/projects/-Users-jordanburch-Documents-work-files---nextjs---lumon-payload/memory/MEMORY.md`

- [ ] **Step 1: Update the Directory Structure section in MEMORY.md**

Replace the directory structure with the new layout reflecting `src/payload/`, `components/blocks/`, and `components/layout/` (navbar + footer only).

- [ ] **Step 2: Commit all documentation updates**

```bash
git add CLAUDE.md docs/superpowers/plans/2026-03-11-folder-restructure.md
git commit -m "docs: update project structure documentation for folder restructure"
```
