# SEO Plugin Integration Design

**Date**: 2026-03-18
**Status**: Draft

## Overview

Integrate `@payloadcms/plugin-seo` into the Pages collection with a SiteSettings global for site-wide defaults, per-page overrides, and comprehensive frontend metadata output including JSON-LD structured data, sitemap, and robots.txt.

## Goals

- Rich admin editing experience (SERP preview, character counts, auto-generate buttons)
- Site-wide SEO defaults manageable by editors (no code changes)
- Per-page overrides for robots, canonical, keywords
- Draft pages protected from indexing and public access
- Dynamic sitemap and robots.txt
- JSON-LD structured data on every page
- Integrated with existing cacheTag revalidation system

---

## 1. SiteSettings Global

New Payload global: `src/payload/globals/SiteSettings.ts`

### Fields

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `siteName` | text, required | — | Used in title generation and JSON-LD |
| `baseUrl` | text, required | — | Canonical URLs, sitemap, JSON-LD |
| `separator` | text | `" \| "` | Joins page title + site name |
| `defaultOgImage` | upload → media | — | Fallback social share image |
| `robots.index` | checkbox | `true` | Global default: allow indexing |
| `robots.follow` | checkbox | `true` | Global default: allow link following |
| `social.twitter` | text | — | @handle for twitter:site |
| `social.twitterCardType` | select | `summary_large_image` | Options: `summary`, `summary_large_image` |
| `jsonLd.organizationName` | text | — | Organization schema name |
| `jsonLd.organizationLogo` | upload → media | — | Organization schema logo |
| `jsonLd.organizationUrl` | text | — | Organization schema URL |

### Access Control

- `read`: public (frontend needs it for metadata generation)
- `update`: `isAdminOrEditor` (same pattern as Pages)

### Caching & Revalidation

- Cached via `"use cache"` + `cacheTag("site-settings")` + `cacheLife("hours")` in `src/payload/lib/cached-payload/`
- `afterChange` hook calls `revalidateTag("site-settings", "default")` so all pages using the global bust their metadata cache
- Pages depend on both their own cache tag AND `"site-settings"` — when either changes, metadata regenerates

**Global hook type**: The existing `revalidateOnChange()` utility returns `CollectionAfterChangeHook` / `CollectionAfterDeleteHook` — these are typed for collections, not globals. SiteSettings needs a separate `GlobalAfterChangeHook`. Create a lightweight `revalidateGlobalOnChange` helper in `src/payload/hooks/revalidateOnChange/` that takes a list of tags and calls `revalidateTag` for each. It does NOT need the doc/collection-based tag logic since globals are singletons.

```ts
import { revalidateTag } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";

export function revalidateGlobalOnChange(
  tags: string[],
): GlobalAfterChangeHook {
  return ({ global, req: { payload, context } }) => {
    if (context.disableRevalidate) return;
    for (const tag of tags) {
      revalidateTag(tag, "default");
    }
    payload.logger.info({ msg: `Revalidated global:${global.slug}` });
  };
}
```

### Unconfigured Fallback

On a fresh install, SiteSettings will have empty fields. The metadata helper must handle this gracefully:
- `siteName` and `baseUrl` are **required** fields — Payload enforces non-empty at save time
- Before an editor saves SiteSettings for the first time, `findGlobal` returns default values (empty strings for text, `true` for checkboxes)
- `generatePageMetadata` falls back to: title = `page.title`, canonical = omitted, OG image = omitted
- The auto-generate functions in the plugin guard with `settings.siteName || ''` and `settings.baseUrl || ''`

---

## 2. SEO Plugin Configuration

### Installation

```bash
bun add @payloadcms/plugin-seo
```

### Config Changes in `payload.config.ts`

This is the first global in the project. Add the `globals` array to `buildConfig`:

```ts
import { SiteSettings } from './payload/globals/SiteSettings'

export default buildConfig({
  // ... existing config
  globals: [SiteSettings],
  plugins: [
    // ... existing plugins
    seoPlugin({ /* see below */ }),
  ],
})
```

### SEO Plugin Config

```ts
import { seoPlugin } from '@payloadcms/plugin-seo'

seoPlugin({
  collections: ['pages'],
  uploadsCollection: 'media',
  tabbedUI: true,

  generateTitle: async ({ doc, payload }) => {
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    return `${doc.title}${settings.separator || ' | '}${settings.siteName}`
  },

  generateDescription: async ({ doc }) => {
    // Extract first text content from layout blocks if available
    // Returns empty string if no extractable text — editor fills manually
    return extractFirstTextFromBlocks(doc.layout) || ''
  },

  generateURL: async ({ doc, payload }) => {
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    const slug = doc.slug === 'home' ? '' : doc.slug
    return `${settings.baseUrl}/${slug}`
  },

  generateImage: async ({ doc }) => {
    // Return first image found in layout blocks, or undefined for global fallback
    return extractFirstImageFromBlocks(doc.layout)
  },

  fields: ({ defaultFields }) => [
    ...defaultFields,
    {
      name: 'canonicalUrl',
      type: 'text',
      label: 'Canonical URL',
      admin: {
        description: 'Override the auto-generated canonical URL. Leave blank to use the default.',
      },
    },
    {
      name: 'robots',
      type: 'group',
      label: 'Robots',
      fields: [
        {
          name: 'override',
          type: 'checkbox',
          defaultValue: false,
          label: 'Override global robots settings',
          admin: {
            description: 'Enable to set custom robots directives for this page.',
          },
        },
        {
          name: 'index',
          type: 'checkbox',
          defaultValue: true,
          label: 'Allow indexing',
          admin: {
            condition: (_, siblingData) => siblingData?.override === true,
          },
        },
        {
          name: 'follow',
          type: 'checkbox',
          defaultValue: true,
          label: 'Allow link following',
          admin: {
            condition: (_, siblingData) => siblingData?.override === true,
          },
        },
      ],
    },
    {
      name: 'keywords',
      type: 'text',
      label: 'Keywords',
      admin: {
        description: 'Comma-separated keywords (optional).',
      },
    },
    {
      name: 'excludeFromSitemap',
      type: 'checkbox',
      defaultValue: false,
      label: 'Exclude from sitemap',
      admin: {
        description: 'Hide this page from the sitemap. It can still be indexed if linked to externally.',
      },
    },
  ],
})
```

### Per-Page SEO Tab Layout (as rendered by plugin)

The Overview and SERP Preview are built-in plugin UI components — no custom implementation needed. They render automatically when the plugin is configured.

```
SEO Tab
├── Overview widget ("X of 3 checks passing" — built-in plugin UI)
├── Meta Title (with character count 50-60, auto-generate button)
├── Meta Description (with character count 100-150, auto-generate button)
├── Meta Image (with auto-generate button)
├── SERP Preview card
├── Canonical URL (text, optional override)
├── Robots
│   ├── Override global checkbox
│   ├── Allow indexing (conditional)
│   └── Allow link following (conditional)
├── Keywords (text, optional)
└── Exclude from sitemap (checkbox)
```

---

## 3. Frontend Metadata Generation

### Helper: `src/payload/lib/seo/generate-page-metadata.ts`

Single function that takes a page doc + site settings and returns a complete Next.js `Metadata` object.

**Resolution order per field:**

| Field | Primary | Fallback |
|-------|---------|----------|
| `title` | `page.meta.title` | `"{page.title}{separator}{siteName}"` |
| `description` | `page.meta.description` | omitted |
| `og:image` | `page.meta.image` | `global.defaultOgImage` |
| `canonical` | `page.meta.canonicalUrl` | `"{baseUrl}/{slug}"` |
| `robots` | `page.meta.robots` (if override) | global robots values |
| `twitter:card` | — | `global.social.twitterCardType` |
| `twitter:site` | — | `global.social.twitter` |
| `keywords` | `page.meta.keywords` | omitted |

**Draft protection:**
- Draft pages (`_status === 'draft'`) always get `noindex, nofollow` regardless of any settings
- This is enforced in the metadata helper, not dependent on editor action

### Updated `[[...slug]]/page.tsx`

```ts
export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const slug = (await params).slug?.join('/') || 'home'
  const page = await getCachedPage(slug)
  const settings = await getCachedSiteSettings()

  if (!page) return {}

  return generatePageMetadata(page, settings)
}
```

### JSON-LD Component: `src/components/features/seo/json-ld.tsx`

Server component that renders `<script type="application/ld+json">`.

**Schemas generated:**

| Schema | When | Data Source |
|--------|------|-------------|
| `WebPage` | Every page | Page title, description, URL |
| `Organization` | Home page only | Global `jsonLd` group |
| `BreadcrumbList` | All non-home pages | Derived from slug segments |

Rendered in the **page component** (not the layout — layouts don't receive page-specific data in App Router). The `JsonLd` component receives the page doc and site settings as props and renders the appropriate schemas based on the slug.

---

## 4. Sitemap & Robots.txt

### Collection-Level Sitemap Discovery

Collections opt into the sitemap via the `custom` property (same pattern as the existing `custom: { linkable: true }` on Pages):

```ts
// Pages collection
custom: {
  linkable: true,
  sitemap: { enabled: true, urlPrefix: '' },  // → /{slug}
}

// Future blog collection example
custom: {
  sitemap: { enabled: true, urlPrefix: '/blog' },  // → /blog/{slug}
}
```

The sitemap generator **auto-discovers** all collections with `custom.sitemap.enabled === true` at runtime — no hardcoded collection list. Adding a new collection to the sitemap is a one-line config change.

### Per-Item Sitemap Exclusion

Separate from robots `noindex`, an explicit `excludeFromSitemap` checkbox lets editors hide individual items from the sitemap while still allowing them to be indexed if linked to. This is added via the SEO plugin's `fields` extension (see Section 2):

```ts
{
  name: 'excludeFromSitemap',
  type: 'checkbox',
  defaultValue: false,
  label: 'Exclude from sitemap',
  admin: {
    description: 'Hide this page from the sitemap. It can still be indexed if linked to externally.',
  },
}
```

**Sitemap exclusion logic** (item is excluded if ANY of these are true):
1. Item has `_status === 'draft'`
2. Item has `meta.excludeFromSitemap === true`
3. Item has robots `noindex` (either per-item override or global default applies)

### `src/app/sitemap.ts`

Dynamic sitemap using Next.js file convention. This file lives at the app root, **outside both route groups** (`(frontend)` and `(payload)`) — this is intentional, as Next.js sitemap/robots conventions are handled at the app directory level.

**Generator logic:**
1. Read `payload.config.collections`, filter for `custom.sitemap.enabled === true`
2. Load SiteSettings global for `baseUrl` and global robots defaults
3. For each sitemap-enabled collection:
   - Query published docs (`draft: false`)
   - Exclude docs where `meta.excludeFromSitemap === true`
   - Exclude docs where resolved robots = `noindex` (per-item override or global default)
   - Build URLs: `${baseUrl}${collection.custom.sitemap.urlPrefix}/${doc.slug}`
   - Set `lastModified` from `updatedAt`
4. Return combined array of all sitemap entries

- Cached with `"use cache"` + `cacheTag("sitemap")` — revalidated when any page changes

### `src/app/robots.ts`

Dynamic robots.txt using Next.js file convention. Also at the app root, outside route groups.

- Points to sitemap: `Sitemap: {baseUrl}/sitemap.xml`
- Uses global robots settings for default `User-agent: *` rules
- Cached with SiteSettings

### Revalidation Integration

Any collection with `custom.sitemap.enabled` should include `"sitemap"` in its `revalidateOnChange({ tags: ["sitemap"] })` call so the sitemap stays current when items are published, unpublished, or deleted.

---

## 5. Draft Page Protection

Draft pages are already gated by Payload's `versions: { drafts: true }` — `getCachedPage` already uses `draft: false` (verified in current code).

Additionally:
- **`generateStaticParams`** must add `draft: false` to its query — currently it fetches all pages including drafts, which wastes build time and leaks draft slug names in build output
- `generateMetadata` returns `robots: { index: false, follow: false }` for any draft page
- Sitemap excludes all draft pages
- Preview route (`/preview/[...slug]`) always gets `noindex, nofollow` — preview pages must never be indexed regardless of page settings
- Preview/draft access requires authentication via `draftMode()` + Payload `auth()` (existing access control handles this)

---

## 6. Migration Plan

### Data Compatibility

Existing `meta` group field names match the plugin's output:
- `meta.title` → stays `meta.title`
- `meta.description` → stays `meta.description`
- `meta.image` → stays `meta.image`

**No data migration needed for existing fields.** The plugin replaces the manual group definition with its own enhanced version.

### Schema Migration

1. Remove manual `meta` group from `Pages.ts` (plugin injects its own)
2. Run `bun run migrate:create` — generates migration adding new columns: `meta_canonicalUrl`, `meta_robots_override`, `meta_robots_index`, `meta_robots_follow`, `meta_keywords`, `meta_excludeFromSitemap`
3. **Review migration carefully** — verify:
   - Existing `meta_title`, `meta_description`, `meta_image_id` columns in the `pages` table are NOT dropped
   - The **`_pages_v` (versions) table** is also checked — drafts are enabled, so every meta field has a corresponding `version_meta_*` column. Verify no destructive changes to existing version columns either.
   - Both `text` and `textarea` Payload types map to `text` in SQLite, so `meta_description` (originally `textarea`) is compatible with the plugin's `textarea` field
4. Run `bun run migrate`
5. Run `bun generate:types`

**Warning**: In local dev without `DATABASE_AUTH_TOKEN` set, `push: true` is active (see `payload.config.ts` line 45). Drizzle push could auto-apply schema changes and mask migration issues. When authoring migrations, either set a dummy `DATABASE_AUTH_TOKEN` or verify the migration file manually before applying.

### Risk Mitigation

- **Before applying**: inspect the generated migration SQL to confirm no destructive column drops in both `pages` and `_pages_v` tables
- **Rollback**: migration only adds columns — reverting means removing the plugin and re-adding the manual meta group (columns remain harmlessly)
- **If image field differs**: the plugin uses `upload` with `relationTo` matching `uploadsCollection` — same as our current config, so existing FK references should be preserved

---

## 7. New Files

| File | Purpose |
|------|---------|
| `src/payload/globals/SiteSettings.ts` | Global config with SEO defaults |
| `src/payload/hooks/revalidateOnChange/revalidate-global.ts` | Global-specific revalidation hook (`GlobalAfterChangeHook`) |
| `src/payload/lib/seo/generate-page-metadata.ts` | Metadata resolution helper |
| `src/payload/lib/seo/extract-block-content.ts` | Utilities to extract text/image from layout blocks (see below) |
| `src/components/features/seo/json-ld.tsx` | JSON-LD structured data component |
| `src/app/sitemap.ts` | Dynamic sitemap (at app root, outside route groups) |
| `src/app/robots.ts` | Dynamic robots.txt (at app root, outside route groups) |

#### `extract-block-content.ts` Specification

Two utility functions for the auto-generate callbacks:

- **`extractFirstTextFromBlocks(layout)`**: Walks block array in order, returns the first non-empty plain text string found. Checks: Hero subtitle/description, SplitMedia description, RichTextContent body (strip formatting), CinematicCta description. Returns first 160 characters max, trimmed to last complete sentence. Returns `undefined` if no text found.
- **`extractFirstImageFromBlocks(layout)`**: Walks block array in order, returns the first media ID found. Checks: Hero backgroundImage, SplitMedia media, Bento showcase images, ImageGallery first image. Returns `undefined` if no image found.

### Modified Files

| File | Change |
|------|--------|
| `src/payload.config.ts` | Add `globals: [SiteSettings]`, add seoPlugin to plugins array |
| `src/payload/collections/Pages.ts` | Remove manual `meta` group, add `custom: { sitemap: { enabled: true, urlPrefix: '' } }`, update `revalidateOnChange({ tags: ["sitemap"] })` |
| `src/app/(frontend)/[[...slug]]/page.tsx` | Use `generatePageMetadata` helper, add `JsonLd` component, filter drafts in `generateStaticParams` |
| `src/app/(frontend)/preview/[...slug]/page.tsx` | Use `generatePageMetadata` helper with forced `noindex, nofollow` |
| `src/app/(frontend)/layout.tsx` | Convert static `metadata` to template: `{ title: { template: '%s', default: siteName }, description: undefined }` — per-page metadata takes over |
| `src/payload/lib/cached-payload/index.ts` | Add `getCachedSiteSettings` function |

---

## 8. Out of Scope

- Localization/hreflang (no i18n currently)
- Per-collection SEO for non-Pages collections (extensible later — add slug to seoPlugin `collections` array + `custom.sitemap` to the collection config)
- Social preview images (auto-generated OG images via Satori/`@vercel/og`)
- Search console integration
- SEO scoring/audit beyond the plugin's character count checks
