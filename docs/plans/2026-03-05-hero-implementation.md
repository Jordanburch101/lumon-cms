# Hero Section Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-viewport, photo-backed hero section with a B&W landscape background, gradient overlay, and bottom-left anchored headline + two CTAs.

**Architecture:** A server component at `src/components/layout/hero/` following the same folder pattern as navbar and footer. Static copy lives in `hero-data.ts`. The component is dropped into `src/app/page.tsx` above any existing content.

**Tech Stack:** Next.js App Router, Tailwind CSS v4, shadcn Button (`@/components/ui/button`), Next.js `<Image>`

---

### Task 1: Create hero-data.ts

**Files:**
- Create: `src/components/layout/hero/hero-data.ts`

**Step 1: Create the file**

```ts
export const heroData = {
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

**Step 2: Commit**

```bash
git add src/components/layout/hero/hero-data.ts
git commit -m "feat(hero): add hero copy data"
```

---

### Task 2: Create hero.tsx

**Files:**
- Create: `src/components/layout/hero/hero.tsx`

**Step 1: Write the component**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { heroData } from "./hero-data";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] w-full">
      {/* Background photo */}
      <Image
        alt="Hero background"
        className="object-cover"
        fill
        priority
        src="/hero-bg.jpg"
      />

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
          <Button asChild size="lg">
            <Link href={heroData.primaryCta.href}>
              {heroData.primaryCta.label}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
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

**Step 2: Verify the file lints clean**

```bash
bun check
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/components/layout/hero/hero.tsx
git commit -m "feat(hero): add hero component"
```

---

### Task 3: Wire hero into the homepage

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Check the current page**

Read `src/app/page.tsx` — it currently renders `<ComponentExample />`.

**Step 2: Update the page**

Replace the content so Hero renders first:

```tsx
import { Hero } from "@/components/layout/hero/hero";
import { ComponentExample } from "@/components/component-example";

export default function Page() {
  return (
    <>
      <Hero />
      <ComponentExample />
    </>
  );
}
```

**Step 3: Run the dev server and verify visually**

```bash
bun dev
```

Open `http://localhost:3000`. Check:
- [ ] Photo fills the full viewport height
- [ ] Gradient is visible — darker at the bottom, transparent at the top
- [ ] Navbar floats over the photo (transparent on load)
- [ ] Headline and subtext appear bottom-left, white text
- [ ] Both CTA buttons render and are legible
- [ ] Scrolling down reveals the rest of the page beneath the hero
- [ ] No layout shift on load (priority image)

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(hero): integrate hero into homepage"
```

---

### Task 4: Final lint pass

**Step 1: Run full check**

```bash
bun check
```

Expected: no errors or warnings.

**Step 2: Fix any issues**

```bash
bun fix
```

**Step 3: Commit if any fixes were applied**

```bash
git add -A
git commit -m "chore: lint fixes after hero integration"
```

---

## Notes

- The image file is at `public/hero-bg.jpg` — confirm the exact extension before running. If it's `.png` or `.webp`, update the `src` in `hero.tsx` accordingly.
- The outline button styles override shadcn defaults to work on dark backgrounds — this is intentional.
- Do not add animations or parallax — out of scope per design doc.
