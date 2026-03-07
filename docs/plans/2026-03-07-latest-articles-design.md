# Latest Articles Section — Design

## Overview

A "Latest Articles" section for the home page, placed between ImageGallery and the footer. Displays recent blog posts in an asymmetric editorial layout. Assumes the blog/article system already exists — this component just renders the showcase.

## Layout

### Desktop (lg+)

```
┌─────────────────────────────┬──────────────────┐
│                             │   Small Card 1   │
│      Featured Card          │  img + title +   │
│   (large image, overlay     │  excerpt + meta  │
│    title + category badge)  ├──────────────────┤
│                             │   Small Card 2   │
│                             │  img + title +   │
│                             │  excerpt + meta  │
└─────────────────────────────┴──────────────────┘
                    View all articles →
```

- Featured card: `lg:col-span-3` of a 5-column grid (60%)
- Supporting cards: `lg:col-span-2` stacked (40%)

### Mobile

- Single column stack: featured card full-width, then supporting cards full-width below

## Section Header

Standard pattern matching Bento/Testimonials:
- h2 headline (e.g. "Latest from the blog")
- Subtext paragraph
- Left-aligned, max-w-2xl, mb-10/14

## Featured Card

- Tall aspect ratio (`aspect-[3/2]` or similar)
- Image fills card with `object-cover`
- Gradient overlay at bottom (transparent → black/70) — matches hero/split-media pattern
- Content overlaid at bottom-left:
  - Category `<Badge>` (existing component)
  - Title — white, semibold, text-2xl
  - Metadata row: author avatar (small circle) + author name + read time — white/60, text-sm
- Hover: image scales to 1.02, brightness shift — CSS transition, no JS
- Rounded corners (`rounded-2xl`)
- Entire card is a link

## Supporting Cards

- Image on top, content below (standard card layout)
- Image: `aspect-[16/9]`, rounded-xl, object-cover
- Below image:
  - Category `<Badge>`
  - Title — foreground, font-semibold, text-lg, line-clamp-2
  - Excerpt — muted-foreground, text-sm, line-clamp-2
  - Metadata row: author avatar + name + read time
- Hover: image scales 1.02 (overflow hidden on container)
- Entire card is a link

## "View all" Link

- Below the grid, right-aligned or left-aligned
- Text link with arrow icon (ArrowRight01Icon from hugeicons)
- `group` hover: arrow translates right — matches split-media CTA pattern
- font-medium text-sm

## Animation

- Section uses `useInView` + `motion` for scroll-reveal (matching existing sections)
- Staggered fade-up: header first, then cards with slight delay offsets

## Data

- `latest-articles-data.ts` — static mock data with:
  - `id`, `title`, `excerpt`, `category`, `imageSrc`, `imageAlt`
  - `author: { name, avatarSrc }`
  - `readTime` (string, e.g. "5 min read")
  - `href` (link to article)
  - `publishedAt` (date string)

## File Structure

```
src/components/layout/latest-articles/
  latest-articles.tsx       — main section component
  latest-articles-data.ts   — mock article data
  article-card.tsx          — shared card component (renders both featured and supporting variants via prop)
```

## Integration

- Add to `src/app/page.tsx` after `<ImageGallery />` and before the closing fragment
- Light background section (default bg), contrasts with the dark ImageGallery above

## Dependencies

- `motion/react` (already installed)
- `@hugeicons/core-free-icons` (already installed)
- `next/image`, `next/link`
- `@/components/ui/badge`
