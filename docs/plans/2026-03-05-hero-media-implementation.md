# Hero Media Detection Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the hero to auto-detect whether a media URL is a video or image and render the correct element.

**Architecture:** A single inline utility function in `hero.tsx` checks the file extension. `hero-data.ts` gets a `mediaSrc` field replacing the hardcoded image path. The component conditionally renders `<video>` or `<Image>` — everything else (gradient, content) stays unchanged.

**Tech Stack:** Next.js App Router, Next.js `<Image>`, native `<video>` element, Tailwind CSS v4

---

### Task 1: Update hero-data.ts

**Files:**
- Modify: `src/components/layout/hero/hero-data.ts`

**Step 1: Read the current file**

Read `src/components/layout/hero/hero-data.ts`. It currently has no media field — the image src is hardcoded in `hero.tsx`.

**Step 2: Add mediaSrc field**

Replace the file content with:

```ts
export const heroData = {
  mediaSrc: "/hero-vid.mp4",
  headline: "Build without limits.",
  subtext:
    "A Next.js + Payload CMS template designed for teams who ship. Everything you need, nothing you don't.",
  primaryCta: {
    label: "Get Started",
    href: "/docs",
  },
  secondaryCta: {
    label: "View on GitHub",
    href: "https://github.com",
  },
} as const;
```

**Step 3: Run lint check**

```bash
bun check
```

Expected: no errors in hero files.

**Step 4: Commit**

```bash
git add src/components/layout/hero/hero-data.ts
git commit -m "feat(hero): add mediaSrc field to hero data"
```

---

### Task 2: Update hero.tsx with media detection

**Files:**
- Modify: `src/components/layout/hero/hero.tsx`

**Step 1: Read the current file**

Read `src/components/layout/hero/hero.tsx` in full before making any changes.

**Step 2: Replace the file content**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { heroData } from "./hero-data";

function getMediaType(src: string): "video" | "image" {
  return /\.(mp4|webm|ogg)$/i.test(src) ? "video" : "image";
}

export function Hero() {
  const mediaType = getMediaType(heroData.mediaSrc);

  return (
    <section className="relative min-h-[calc(100svh-56px)] w-full">
      {/* Background media */}
      {mediaType === "video" ? (
        <video
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          src={heroData.mediaSrc}
        />
      ) : (
        <Image
          alt="Hero background"
          className="object-cover"
          fill
          priority
          src={heroData.mediaSrc}
        />
      )}

      {/* Gradient overlay: transparent at top → black/65 at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />

      {/* Content: bottom-left anchored */}
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-16 lg:px-6">
        <h1 className="max-w-2xl font-semibold text-4xl text-white leading-tight sm:text-5xl lg:text-6xl">
          {heroData.headline}
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/70">
          {heroData.subtext}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            asChild
            className="bg-white text-black hover:bg-white/90"
            size="lg"
          >
            <Link href={heroData.primaryCta.href}>
              {heroData.primaryCta.label}
            </Link>
          </Button>
          <Button
            asChild
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            size="lg"
            variant="outline"
          >
            <a
              href={heroData.secondaryCta.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {heroData.secondaryCta.label}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

**Step 3: Run lint check**

```bash
bun check
```

Expected: no errors in hero files. Run `bun fix` if there are auto-fixable issues, then re-check.

**Step 4: Commit**

```bash
git add src/components/layout/hero/hero.tsx
git commit -m "feat(hero): add video/image media detection"
```

---

## Notes

- `mediaSrc` is currently set to `/hero-vid.mp4` to exercise the video path. To test the image path, temporarily change it to `/hero-bg.jpg` and confirm `<Image>` renders.
- The `<video>` element uses `autoPlay muted loop playsInline` — all four are required for inline autoplay to work across browsers (especially iOS Safari requires `playsInline`).
- `muted` is required for `autoPlay` to work in Chrome.
- Do not add a `poster` attribute — out of scope per design doc.
