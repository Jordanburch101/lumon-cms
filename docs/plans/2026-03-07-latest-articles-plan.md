# Latest Articles Section — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an editorial "Latest Articles" section to the home page between ImageGallery and the footer.

**Architecture:** A `"use client"` section component with scroll-reveal animations (motion/react), rendering an asymmetric featured + supporting cards grid. Data lives in a static mock file. A shared `ArticleCard` component handles both featured and supporting variants via a `variant` prop.

**Tech Stack:** React 19, Next.js (Image/Link), motion/react, Tailwind CSS v4, Hugeicons, shadcn Badge + Avatar

---

### Task 1: Create mock article data

**Files:**
- Create: `src/components/layout/latest-articles/latest-articles-data.ts`

**Step 1: Create the data file with types and mock content**

```ts
export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  imageSrc: string;
  imageAlt: string;
  author: {
    name: string;
    avatarSrc: string;
  };
  readTime: string;
  href: string;
  publishedAt: string;
}

export const latestArticlesSectionData = {
  headline: "Latest from the blog",
  subtext:
    "Insights, updates, and dispatches from the severed floor and beyond.",
} as const;

export const latestArticles: Article[] = [
  {
    id: "severance-protocol",
    title: "Understanding the Severance Protocol: A New Era of Work-Life Balance",
    excerpt:
      "How Lumon's revolutionary procedure is redefining what it means to leave work at the office. A deep dive into the science and philosophy behind the split.",
    category: "Research",
    imageSrc: "/gallery/gallery-1.jpg",
    imageAlt: "Lumon severance research facility",
    author: {
      name: "Harmony Cobel",
      avatarSrc: "/testimonials/cobel.jpg",
    },
    readTime: "8 min read",
    href: "/blog/severance-protocol",
    publishedAt: "2026-03-01",
  },
  {
    id: "waffle-party",
    title: "Inside the Waffle Party: Lumon's Most Coveted Incentive",
    excerpt:
      "What makes the waffle party the ultimate reward? We explore the history, the ritual, and why top refiners will do anything to earn one.",
    category: "Culture",
    imageSrc: "/gallery/gallery-2.jpg",
    imageAlt: "Lumon waffle party celebration",
    author: {
      name: "Seth Milchick",
      avatarSrc: "/testimonials/milchick.png",
    },
    readTime: "5 min read",
    href: "/blog/waffle-party",
    publishedAt: "2026-02-22",
  },
  {
    id: "perpetuity-wing",
    title: "The Perpetuity Wing: Walking with Kier",
    excerpt:
      "A guided tour through nine floors of founder legacy, preserved in wax and devotion.",
    category: "Heritage",
    imageSrc: "/gallery/gallery-3.jpg",
    imageAlt: "The Perpetuity Wing at Lumon Industries",
    author: {
      name: "Irving B.",
      avatarSrc: "/testimonials/irving.webp",
    },
    readTime: "6 min read",
    href: "/blog/perpetuity-wing",
    publishedAt: "2026-02-15",
  },
];

export const featuredArticle = latestArticles[0];
export const supportingArticles = latestArticles.slice(1);
```

**Step 2: Verify no type errors**

Run: `bunx tsc --noEmit --pretty`
Expected: No errors related to latest-articles-data

**Step 3: Commit**

```bash
git add src/components/layout/latest-articles/latest-articles-data.ts
git commit -m "feat(latest-articles): add mock article data and types"
```

---

### Task 2: Create the ArticleCard component

**Files:**
- Create: `src/components/layout/latest-articles/article-card.tsx`

**Step 1: Build the shared card component with featured and supporting variants**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/core/lib/utils";
import type { Article } from "./latest-articles-data";

interface ArticleCardProps {
  article: Article;
  variant: "featured" | "supporting";
}

export function ArticleCard({ article, variant }: ArticleCardProps) {
  if (variant === "featured") {
    return (
      <Link
        className="group relative block h-full overflow-hidden rounded-2xl"
        href={article.href}
      >
        {/* Image */}
        <div className="relative aspect-[3/2] w-full lg:aspect-auto lg:h-full">
          <Image
            alt={article.imageAlt}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            src={article.imageSrc}
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 lg:p-8">
          <Badge className="mb-3 bg-white/20 text-[10px] text-white">
            {article.category}
          </Badge>
          <h3 className="max-w-lg font-semibold text-xl text-white leading-snug sm:text-2xl">
            {article.title}
          </h3>
          <div className="mt-3 flex items-center gap-2.5">
            <Avatar className="size-6">
              <AvatarImage alt={article.author.name} src={article.author.avatarSrc} />
              <AvatarFallback className="text-[10px]">
                {article.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-white/60 text-sm">
              {article.author.name}
            </span>
            <span className="text-white/30">&middot;</span>
            <span className="text-white/60 text-sm">{article.readTime}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Supporting variant
  return (
    <Link className="group block" href={article.href}>
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
        <Image
          alt={article.imageAlt}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          src={article.imageSrc}
        />
      </div>

      {/* Content */}
      <div className="mt-4">
        <Badge variant="secondary" className="text-[10px]">
          {article.category}
        </Badge>
        <h3 className="mt-2 font-semibold text-lg leading-snug line-clamp-2">
          {article.title}
        </h3>
        <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {article.excerpt}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Avatar className="size-5">
            <AvatarImage alt={article.author.name} src={article.author.avatarSrc} />
            <AvatarFallback className="text-[9px]">
              {article.author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground text-xs">
            {article.author.name}
          </span>
          <span className="text-muted-foreground/50">&middot;</span>
          <span className="text-muted-foreground text-xs">
            {article.readTime}
          </span>
        </div>
      </div>
    </Link>
  );
}
```

**Step 2: Verify no type errors**

Run: `bunx tsc --noEmit --pretty`
Expected: No errors related to article-card

**Step 3: Commit**

```bash
git add src/components/layout/latest-articles/article-card.tsx
git commit -m "feat(latest-articles): add ArticleCard component with featured/supporting variants"
```

---

### Task 3: Create the LatestArticles section component

**Files:**
- Create: `src/components/layout/latest-articles/latest-articles.tsx`

**Step 1: Build the section with scroll-reveal animations and asymmetric grid**

```tsx
"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import { useRef } from "react";

import { ArticleCard } from "./article-card";
import {
  featuredArticle,
  latestArticlesSectionData,
  supportingArticles,
} from "./latest-articles-data";

const EASE = [0.16, 1, 0.3, 1] as const;

export function LatestArticles() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section className="w-full py-16 lg:py-24" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Section header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-10 max-w-2xl lg:mb-14"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
            {latestArticlesSectionData.headline}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {latestArticlesSectionData.subtext}
          </p>
        </motion.div>

        {/* Article grid */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-6"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          {/* Featured card — 3 of 5 columns */}
          <div className="lg:col-span-3">
            <ArticleCard article={featuredArticle} variant="featured" />
          </div>

          {/* Supporting cards — 2 of 5 columns, stacked */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {supportingArticles.map((article) => (
              <ArticleCard
                article={article}
                key={article.id}
                variant="supporting"
              />
            ))}
          </div>
        </motion.div>

        {/* View all link */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mt-8 lg:mt-10"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
        >
          <Link
            className="group inline-flex items-center gap-2 font-medium text-foreground text-sm transition-colors hover:text-foreground/70"
            href="/blog"
          >
            View all articles
            <HugeiconsIcon
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
              icon={ArrowRight01Icon}
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
```

**Step 2: Verify no type errors**

Run: `bunx tsc --noEmit --pretty`
Expected: No errors related to latest-articles

**Step 3: Commit**

```bash
git add src/components/layout/latest-articles/latest-articles.tsx
git commit -m "feat(latest-articles): add LatestArticles section component"
```

---

### Task 4: Integrate into the home page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Add LatestArticles to page.tsx after ImageGallery**

Add import at top:
```ts
import { LatestArticles } from "@/components/layout/latest-articles/latest-articles";
```

Add `<LatestArticles />` after `<ImageGallery />`:
```tsx
<ImageGallery />
<LatestArticles />
```

**Step 2: Run lint check**

Run: `bun check`
Expected: No errors

**Step 3: Run dev server and verify visually**

Run: `bun dev`
Navigate to `http://localhost:3000`, scroll to bottom.
Expected: Latest Articles section visible between ImageGallery (dark) and footer, with:
- Section header with headline + subtext
- Featured card (large, image with overlay text) on left
- Two supporting cards stacked on right
- "View all articles" link below
- Scroll-reveal animations fire on scroll into view
- Hover states work (image scale on cards, arrow translate on link)

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add LatestArticles section to home page"
```

---

### Task 5: Visual polish and responsive check

**Step 1: Check mobile layout**

Resize browser to mobile width (375px).
Expected:
- Cards stack vertically: featured full-width, then supporting cards full-width
- Featured card shows aspect-[3/2] (not collapsed)
- All text is readable, no overflow

**Step 2: Check dark mode**

Toggle theme to dark.
Expected:
- Supporting cards adapt (foreground/muted-foreground follow theme)
- Featured card overlay text stays white (hardcoded, not theme-dependent)
- Badges look correct in both themes

**Step 3: Run final lint**

Run: `bun check`
Expected: Clean

**Step 4: Final commit if any adjustments were made**

```bash
git add -A
git commit -m "fix(latest-articles): responsive and dark mode polish"
```
