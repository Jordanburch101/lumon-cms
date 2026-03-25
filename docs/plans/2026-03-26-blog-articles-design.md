# Blog & Articles — Design Spec

## Overview

Add a dynamic blog system with an Articles collection, Categories taxonomy, archive page at `/blog`, and individual article pages at `/blog/[slug]`. Refactor the existing LatestArticles block to query from the collection instead of using inline hardcoded data.

## Collections

### Categories

Lightweight taxonomy collection.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | text | yes | useAsTitle |
| slug | text | yes | auto from title, unique, indexed, sidebar |

- No drafts, no SEO
- Revalidation hook with tags: `collection:categories`, `doc:categories:{id}`

### Articles

Main blog content collection.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | text | yes | useAsTitle |
| slug | text | yes | auto from title, unique, indexed, sidebar |
| heroImage | upload (media) | yes | |
| excerpt | textarea | yes | For cards and SEO fallback |
| body | richText (Lexical) | yes | Full editor config (callouts, media, buttons, accordions, embeds) |
| category | relationship (categories) | yes | hasMany: false |
| author | relationship (users) | yes | hasMany: false |
| showAuthorOverride | checkbox | no | sidebar, toggles override group visibility |
| authorOverride | group (conditional) | no | Only visible when showAuthorOverride is true |
| authorOverride.displayName | text | no | |
| authorOverride.avatar | upload (media) | no | |
| authorOverride.bio | textarea | no | |
| publishedAt | date | yes | sidebar |
| readTime | number | no | Auto-calculated beforeChange hook, read-only in admin |

**Admin config:**
- `useAsTitle: "title"`
- `defaultColumns: ["title", "category", "author", "publishedAt", "updatedAt"]`
- `drafts: true` (versioning enabled)
- Two tabs: "Content" (heroImage, excerpt, body) and "SEO" (via seoPlugin)
- Category, author, publishedAt, slug, readTime, showAuthorOverride in sidebar
- Live preview URL pattern: `{baseUrl}/blog/{slug}`

**Hooks:**
- `beforeChange`: compute `readTime` from body word count (walk Lexical nodes, count text, divide by 200 wpm, round up to nearest minute)
- `afterChange` / `afterDelete`: `revalidateOnChange` with tags `collection:articles`, `doc:articles:{id}`, `sitemap`

**SEO plugin** enabled for Articles:
- `generateTitle`: `{article.title}{separator}{siteName}`
- `generateDescription`: falls back to `excerpt`
- `generateURL`: `{baseUrl}/blog/{slug}`
- `generateImage`: uses `heroImage`

## Frontend Routes

### Blog Archive — `/blog`

**Route:** `src/app/(frontend)/blog/page.tsx`

Server component with `"use cache"`.

**Data fetching:**
- `getCachedArticles(page, limit, category?)` — paginated query, sorted by `publishedAt` desc
- `getCachedCategories()` — all categories for filter tabs
- Default: 9 articles per page

**Layout:**
- Mono eyebrow: "Department Archives"
- Heading + subtext inline with category filter tabs
- Featured card: first article (latest) displayed large with hero image overlay, gradient, category badge, date, read time, title, excerpt, author
- 3-column grid of remaining article cards (1-col mobile, 2-col sm, 3-col lg)
- Each card: image, category, date, title, excerpt (2-line clamp), author avatar + name, read time
- Numbered pagination at bottom

**Category filtering:**
- URL param: `/blog?category=engineering`
- "All" tab shows all articles
- Active tab styled with filled background

**Static generation:**
- `generateStaticParams` not needed (dynamic route with search params)
- `generateMetadata` returns generic blog archive meta

### Article Detail — `/blog/[slug]`

**Route:** `src/app/(frontend)/blog/[slug]/page.tsx`

Server component with `"use cache"`.

**Data fetching:**
- `getCachedArticle(slug)` — single article by slug with depth for category and author
- 404 if not found

**Layout:**
- Full-width hero image with gradient fade into page background
- Article header (overlaps hero): category badge, date, read time
- Title (32px, semibold)
- Author row: avatar + name + role (uses authorOverride fields if showAuthorOverride is true, otherwise pulls from Users collection)
- Border divider
- Centered 680px prose column: `<RichText>` component rendering the Lexical body
- Gradient divider
- Author bio section: avatar, "Written by" eyebrow, name, bio
- "Back to all articles" link
- JSON-LD Article schema

**Static generation:**
- `generateStaticParams` fetches all published article slugs
- `generateMetadata` uses SEO fields with fallbacks

**Live preview:**
- Registered in payload config alongside Pages
- Preview URL: `{baseUrl}/blog/{slug}`
- `getArticleDirect(slug, draft)` bypasses cache for draft mode

## Caching

### New cached functions in `src/payload/lib/cached-payload/`

- `getCachedArticle(slug)` — `"use cache"` + `cacheLife("hours")` + tags: `collection:articles`, `doc:articles:{id}`, walks relationships
- `getCachedArticles(page, limit, category?)` — `"use cache"` + `cacheLife("hours")` + tags: `collection:articles`, `collection:categories`
- `getCachedCategories()` — `"use cache"` + `cacheLife("hours")` + tags: `collection:categories`
- `getArticleDirect(slug, draft)` — uncached, for live preview / draft mode

### Sitemap

Articles included in `getCachedSitemapData()` — add `articles` to the sitemap-enabled collections list with URL prefix `/blog/`.

## LatestArticles Block Refactor

### Schema changes

Remove all inline article fields. New schema:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| headline | text | yes | Section heading |
| subtext | text | yes | Section description |
| limit | number | no | Default 5, max 10. How many articles to show |

### Component changes

- Becomes a server component (remove `"use client"` — move animations to a client wrapper)
- Queries latest published articles via `getCachedArticles(1, limit)`
- Maps article data to the existing card layout (featured + supporting grid)
- "View all articles" links to `/blog`
- Falls back gracefully if no articles exist

### Storybook

Update fixture to match new schema (headline, subtext, limit). The Storybook version will need mock data passed as a prop since it can't query Payload.

## Migration

Single migration covering:
- `categories` table
- `articles` table with all fields
- `articles_rels` for category and author relationships
- SEO fields on articles
- Schema change to `latestArticles` block (remove inline fields, add limit)

## MCP

Register both collections in mcpPlugin:
- `articles: { enabled: true, description: "Blog articles" }`
- `categories: { enabled: true, description: "Article categories" }`

## User Fields

Add the following fields to the Users collection for author display:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| avatar | upload (media) | no | Profile photo |
| bio | textarea | no | Short author bio |
| role | text | no | Job title / role for display |

These are used as defaults on article pages when `showAuthorOverride` is false.
