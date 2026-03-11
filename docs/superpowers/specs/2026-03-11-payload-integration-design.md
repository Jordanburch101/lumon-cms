# Core Payload CMS Integration — Design Spec

## Overview

Integrate Payload CMS into the Lumon template so every homepage section is a CMS-editable block. Clients fork the template, open the admin panel, and swap content without touching code.

## Scope

**In scope:**
- Payload installation with SQLite, S3 storage, Lexical rich text
- Pages, Media, Users collections
- 10 block types matching existing homepage sections
- SSR page rendering via catch-all route
- MCP plugin for Claude-driven content management
- Route groups: `(frontend)` for site, `(payload)` for admin

**Out of scope:**
- Blog/article pages (future cycle)
- Navbar/Footer as Payload Globals (future cycle)
- Seed scripts
- Inner pages beyond catch-all routing
- MdrTerminal section (currently commented out in page.tsx — revisit when reintroduced)

## Hosting Target

Railway with:
- App service running Next.js + Payload
- SQLite on persistent volume (no separate DB service)
- S3-compatible bucket for media uploads

## Architecture

Monolithic page builder. One `Pages` collection with a `layout` blocks field. Each page document contains an ordered array of blocks that the frontend renders in sequence.

## Collections

### Users

Payload built-in auth collection. Admin access only.

| Field | Type    | Notes    |
|-------|---------|----------|
| email | email   | required |
| name  | text    |          |

### Media

Upload collection backed by S3 storage adapter.

| Field | Type | Notes    |
|-------|------|----------|
| alt   | text | required |

Payload auto-generates: url, filename, mimeType, filesize, width, height.

### Pages

| Field  | Type     | Notes                                |
|--------|----------|--------------------------------------|
| title  | text     | required, useAsTitle                  |
| slug   | text     | unique, indexed                       |
| layout | blocks[] | 10 block types (see below)           |
| meta   | group    | { title: text, description: textarea, image: upload (Media) } |
| status | —        | versions with drafts enabled          |

Pages are publicly readable (no auth required for `find`). Create/update/delete require admin auth.

Homepage is a Pages document with slug `"home"`. The catch-all route resolves an empty slug array to `"home"`:
```ts
const slug = params.slug?.join('/') || 'home'
```

## Block Schemas

### HeroBlock

| Field        | Type   | Notes         |
|--------------|--------|---------------|
| mediaSrc     | upload | Media (video/image) |
| headline     | text   |               |
| subtext      | text   |               |
| primaryCta   | group  | { label, href } |
| secondaryCta | group  | { label, href } |

### BentoBlock

The Bento section has 7 sub-cards. Only some are content-driven; the rest are decorative/interactive demos that stay hardcoded in the component.

**CMS-editable fields:**

| Field     | Type  | Notes                              |
|-----------|-------|------------------------------------|
| headline  | text  | Section heading                    |
| subtext   | text  | Section description                |
| image     | group | { src: upload, alt, title, description, badge } — maps to ImageCard |
| chartData | array | [{ month: text, visitors: number }] — maps to ChartCard |

**Hardcoded sub-cards (not CMS-driven):**
- **GlobeCard** — interactive MapLibre globe with CDN nodes. No data file, entirely visual demo.
- **ShowcaseCard** — hardcoded video/text demo.
- **StatsCard** — Lighthouse-style performance ring, decorative.
- **NotificationsCard** — hardcoded notification items with Hugeicons.
- **IntegrationsCard** — hardcoded integration list with SVG icons.
- **ThemeCard** — interactive theme toggle demo, no content.
- **FormCard** / **CodeCard** — interactive demos, no content.

These sub-cards are template showcase elements. Clients typically replace the entire Bento section or keep it as-is for demo purposes.

### SplitMediaBlock

| Field | Type  | Notes |
|-------|-------|-------|
| rows  | array | [{ headline, body, mediaLabel, mediaSrc: upload, mediaAlt, cta: { label, href }, mediaOverlay: { title, badge, description } }] |

### TestimonialsBlock

| Field        | Type  | Notes |
|--------------|-------|-------|
| headline     | text  |       |
| subtext      | text  |       |
| testimonials | array | [{ name, role, department, quote: textarea, avatar: upload, featured: checkbox, featuredQuote: textarea }] |

### ImageGalleryBlock

| Field | Type  | Notes |
|-------|-------|-------|
| items | array | [{ label, caption, image: upload, imageAlt }] |

### LatestArticlesBlock

| Field    | Type  | Notes |
|----------|-------|-------|
| headline | text  |       |
| subtext  | text  |       |
| articles | array | [{ title, excerpt: textarea, category, image: upload, imageAlt, author: { name, avatar: upload }, readTime, href, publishedAt: date }] |

### CinematicCtaBlock

| Field    | Type   | Notes |
|----------|--------|-------|
| videoSrc | upload | Media |
| label    | text   |       |
| headline | text   |       |
| subtext  | text   |       |
| cta      | group  | { label, href } — the call to action link |

### PricingBlock

| Field               | Type  | Notes |
|---------------------|-------|-------|
| headline            | text  |       |
| subtext             | text  |       |
| footnote            | text  |       |
| footnoteAttribution | text  |       |
| tiers               | array | [{ name, description, monthlyPrice: number, annualPrice: number, features: array [{ text }], cta: { label, href }, badge, recommended: checkbox }] |

### FaqBlock

| Field    | Type  | Notes |
|----------|-------|-------|
| eyebrow  | text  |       |
| headline | text  |       |
| subtext  | text  |       |
| items    | array | [{ question, answer: textarea }] |
| cta      | group | { text, label, href } — optional bottom CTA (e.g. "Still have questions?") |

### TrustBlock

| Field   | Type  | Notes |
|---------|-------|-------|
| eyebrow | text  |       |
| stats   | array | [{ label, value: number, decimals: number, format: select, suffix }] |
| logos   | array | [{ name, logo: upload }] — component currently renders names as text; migration upgrades to display uploaded logos |

## Page Rendering

SSR catch-all route at `src/app/(frontend)/[[...slug]]/page.tsx`.

```
Request → resolve slug → Payload Local API query → block renderer → section components
```

- Server Component fetches page data via `getPayload()` + `payload.find()`
- `generateMetadata()` returns SEO fields from page's `meta` group
- `generateStaticParams()` available for static generation at build time
- `notFound()` for missing slugs

Block renderer (`src/components/blocks/render-blocks.tsx`) maps `blockType` string to the corresponding section component and passes block data as props.

Each section component stays `"use client"` for animations. They receive data as props instead of importing from `-data.ts` files. The `-data.ts` files can be removed once blocks are wired up.

## MCP Plugin

`@payloadcms/plugin-mcp` added to `payload.config.ts`.

Enables:
- CRUD tools for Pages and Media collections (`findPages`, `createPages`, `updatePages`, `deletePages`, etc.)
- Experimental schema tools in development mode (collection definition CRUD, config modification)
- API keys managed in admin panel with per-collection permission toggles

Connection: `claude mcp add --transport http Payload http://127.0.0.1:3000/api/mcp --header "Authorization: Bearer <key>"`

This lets Claude create pages and populate blocks directly during development.

## File Structure

```
src/
  payload.config.ts
  payload-types.ts                      (auto-generated)
  collections/
    Pages.ts
    Media.ts
    Users.ts
  blocks/                               (Payload block schema definitions)
    Hero.ts
    Bento.ts
    SplitMedia.ts
    Testimonials.ts
    ImageGallery.ts
    LatestArticles.ts
    CinematicCta.ts
    Pricing.ts
    Faq.ts
    Trust.ts
  app/
    layout.tsx                          (root: html/body, fonts, suppressHydrationWarning)
    (payload)/
      admin/[[...segments]]/
        page.tsx                        (Payload admin imports)
        not-found.tsx
    (frontend)/
      layout.tsx                        (Providers, Navbar, Footer, Figma capture script)
      [[...slug]]/
        page.tsx                        (SSR catch-all)
  components/
    blocks/
      render-blocks.tsx                 (blockType → component map)
    layout/                             (existing section components, unchanged)
      hero/
      bento/
      split-media/
      testimonials/
      image-gallery/
      latest-articles/
      cinematic-cta/
      pricing/
      faq/
      trust/
```

Block schemas (`src/blocks/`) define Payload field structures.
Block renderers (`src/components/layout/`) are the existing React components.
`render-blocks.tsx` connects the two.

## Environment Variables

Required environment variables (document in `.env.example`):

```
PAYLOAD_SECRET=             # Random string for Payload encryption
S3_BUCKET=                  # Railway bucket name
S3_REGION=                  # Railway bucket region
S3_ACCESS_KEY_ID=           # Railway bucket access key
S3_SECRET_ACCESS_KEY=       # Railway bucket secret
S3_ENDPOINT=                # Railway S3-compatible endpoint URL
DATABASE_URI=               # SQLite path (e.g. file:./payload.db)
```

## Type Generation

Payload auto-generates `src/payload-types.ts` when the dev server starts. Add a script for manual generation:

```json
"generate:types": "payload generate:types"
```

## Component Migration

Each section component currently imports data from a colocated `-data.ts` file. Migration:

1. Add props interface matching the block schema fields
2. Replace data imports with props
3. Map Payload Media objects (with `url` field) where components currently use string paths
4. Keep all animation logic, styling, and interactivity unchanged

**Key field name changes during migration:**

| Component        | Current field   | Payload field    | Notes                          |
|------------------|-----------------|------------------|--------------------------------|
| Testimonials     | `avatarSrc`     | `avatar.url`     | string → Media upload          |
| Testimonials     | `id`            | `id` (auto)      | Payload auto-generates on arrays |
| ImageGallery     | `imageSrc`      | `image.url`      | string → Media upload          |
| ImageGallery     | `id`            | `id` (auto)      | Payload auto-generates on arrays |
| LatestArticles   | `author.avatarSrc` | `author.avatar.url` | string → Media upload     |
| LatestArticles   | `imageSrc`      | `image.url`      | string → Media upload          |
| Pricing          | `features[i]`   | `features[i].text` | string[] → array of objects  |
| Hero             | `mediaSrc`      | `mediaSrc.url`   | string → Media upload          |
| SplitMedia       | `mediaSrc`      | `mediaSrc.url`   | string → Media upload          |
| CinematicCta     | `videoSrc`      | `videoSrc.url`   | string → Media upload          |
| Trust (logos)    | `name` (text render) | `logo.url`  | upgrade from text to image     |

The `-data.ts` files remain during migration for reference, then get deleted.

## Future Work (Not This Cycle)

- Navbar and Footer as Payload Globals
- Blog/Articles collection with `/blog/[slug]` pages
- Seed script for demo content on first deploy
- Railway template configuration
- Live preview in admin panel
