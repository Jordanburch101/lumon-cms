# SEO Plugin Integration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate `@payloadcms/plugin-seo` with a SiteSettings global, per-page overrides, auto-discoverable sitemap, robots.txt, and JSON-LD structured data.

**Architecture:** The SEO plugin adds admin UI (SERP preview, character counts, auto-generate) to the Pages collection. A SiteSettings global stores site-wide defaults. A metadata helper merges global + page data into Next.js `Metadata` objects. Sitemap auto-discovers collections via `custom.sitemap` config.

**Tech Stack:** `@payloadcms/plugin-seo`, Payload 3.x globals, Next.js `generateMetadata` / `sitemap.ts` / `robots.ts`, JSON-LD via `<script>` tag.

**Spec:** `docs/superpowers/specs/2026-03-18-seo-plugin-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/payload/globals/SiteSettings.ts` | Global config: site name, base URL, robots defaults, social, JSON-LD org data |
| `src/payload/hooks/revalidateOnChange/revalidate-global.ts` | `GlobalAfterChangeHook` that revalidates specified cache tags |
| `src/payload/lib/seo/generate-page-metadata.ts` | Merges page doc + site settings → Next.js `Metadata` object |
| `src/payload/lib/seo/extract-block-content.ts` | Extracts first text/image from layout blocks for auto-generate |
| `src/components/features/seo/json-ld.tsx` | Server component rendering `<script type="application/ld+json">` |
| `src/app/sitemap.ts` | Dynamic sitemap (auto-discovers collections with `custom.sitemap`) |
| `src/app/robots.ts` | Dynamic robots.txt |

### Modified Files

| File | Change |
|------|--------|
| `src/payload.config.ts` | Add `globals: [SiteSettings]`, add `seoPlugin` to plugins |
| `src/payload/collections/Pages.ts` | Remove manual `meta` group, add `custom.sitemap`, update revalidation tags |
| `src/payload/lib/cached-payload/index.ts` | Add `getCachedSiteSettings` function |
| `src/app/(frontend)/[[...slug]]/page.tsx` | Use `generatePageMetadata` helper, add `JsonLd`, filter drafts in `generateStaticParams` |
| `src/app/(frontend)/preview/[...slug]/page.tsx` | Use `generatePageMetadata` with forced `noindex` |
| `src/app/(frontend)/layout.tsx` | Convert static `metadata` to template |

---

## Task 1: Install Plugin & Create SiteSettings Global

**Files:**
- Create: `src/payload/globals/SiteSettings.ts`
- Create: `src/payload/hooks/revalidateOnChange/revalidate-global.ts`
- Modify: `src/payload/lib/cached-payload/index.ts`

- [ ] **Step 1: Install the SEO plugin**

```bash
bun add @payloadcms/plugin-seo
```

- [ ] **Step 2: Create the global revalidation hook**

Create `src/payload/hooks/revalidateOnChange/revalidate-global.ts`:

```ts
import { revalidateTag } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";

/**
 * Creates an afterChange hook for globals that revalidates the given cache tags.
 * Globals are singletons so no doc/collection-based tags are needed.
 */
export function revalidateGlobalOnChange(
  tags: string[],
): GlobalAfterChangeHook {
  return ({ global, req: { payload, context } }) => {
    if (context.disableRevalidate) return;

    try {
      for (const tag of tags) {
        revalidateTag(tag, "default");
      }
      payload.logger.info({ msg: `Revalidated global:${global.slug}` });
    } catch (err) {
      payload.logger.error({
        msg: `Cache revalidation failed for global:${global.slug}`,
        err,
      });
    }
  };
}
```

- [ ] **Step 3: Create the SiteSettings global**

Create `src/payload/globals/SiteSettings.ts`:

```ts
import type { GlobalConfig } from "payload";
import { isAdminOrEditor } from "../access";
import { revalidateGlobalOnChange } from "../hooks/revalidateOnChange/revalidate-global";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateGlobalOnChange(["site-settings", "sitemap"])],
  },
  fields: [
    { name: "siteName", type: "text", required: true, label: "Site Name" },
    { name: "baseUrl", type: "text", required: true, label: "Base URL",
      admin: { description: "Full URL without trailing slash (e.g. https://lumon.dev)" },
    },
    { name: "separator", type: "text", defaultValue: " | ", label: "Title Separator",
      admin: { description: "Character(s) between page title and site name" },
    },
    { name: "defaultOgImage", type: "upload", relationTo: "media", label: "Default OG Image",
      admin: { description: "Fallback social share image when a page has no meta image" },
    },
    {
      name: "robots",
      type: "group",
      label: "Robots Defaults",
      fields: [
        { name: "index", type: "checkbox", defaultValue: true, label: "Allow indexing" },
        { name: "follow", type: "checkbox", defaultValue: true, label: "Allow link following" },
      ],
    },
    {
      name: "social",
      type: "group",
      label: "Social",
      fields: [
        { name: "twitter", type: "text", label: "Twitter Handle",
          admin: { description: "@handle for twitter:site tag" },
        },
        { name: "twitterCardType", type: "select", defaultValue: "summary_large_image",
          label: "Twitter Card Type",
          options: [
            { label: "Summary", value: "summary" },
            { label: "Summary Large Image", value: "summary_large_image" },
          ],
        },
      ],
    },
    {
      name: "jsonLd",
      type: "group",
      label: "Structured Data (JSON-LD)",
      fields: [
        { name: "organizationName", type: "text", label: "Organization Name" },
        { name: "organizationLogo", type: "upload", relationTo: "media", label: "Organization Logo" },
        { name: "organizationUrl", type: "text", label: "Organization URL" },
      ],
    },
  ],
};
```

- [ ] **Step 4: Add `getCachedSiteSettings` to cached-payload**

Add to `src/payload/lib/cached-payload/index.ts` after the existing functions:

```ts
/**
 * Fetch SiteSettings global with caching.
 * Uses Next.js `'use cache'` — invalidated when SiteSettings changes.
 */
export async function getCachedSiteSettings() {
  "use cache";
  cacheLife("hours");
  cacheTag("site-settings");

  const payload = await getPayload({ config });
  return payload.findGlobal({ slug: "site-settings" });
}
```

- [ ] **Step 5: Commit**

```bash
git add src/payload/globals/SiteSettings.ts src/payload/hooks/revalidateOnChange/revalidate-global.ts src/payload/lib/cached-payload/index.ts
git commit -m "feat(seo): add SiteSettings global with caching and revalidation"
```

---

## Task 2: Configure SEO Plugin & Update Pages Collection

**Files:**
- Create: `src/payload/lib/seo/extract-block-content.ts`
- Modify: `src/payload.config.ts`
- Modify: `src/payload/collections/Pages.ts`

- [ ] **Step 1: Create block content extraction utilities**

Create `src/payload/lib/seo/extract-block-content.ts`:

```ts
import type { Page } from "@/payload-types";

type LayoutBlock = NonNullable<Page["layout"]>[number];

/**
 * Walks layout blocks in order, returns the first non-empty plain text string.
 * Checks: Hero subtext, SplitMedia first row body, CinematicCta subtext,
 * Bento subtext, RichTextContent (skipped — rich text extraction is complex).
 * Returns max 160 chars trimmed to last complete sentence, or undefined.
 */
export function extractFirstTextFromBlocks(
  layout: LayoutBlock[] | null | undefined,
): string | undefined {
  if (!layout?.length) return undefined;

  for (const block of layout) {
    let text: string | undefined;

    switch (block.blockType) {
      case "hero":
        text = block.subtext;
        break;
      case "splitMedia":
        text = block.rows?.[0]?.body;
        break;
      case "cinematicCta":
        text = block.subtext;
        break;
      case "bento":
        text = block.subtext;
        break;
    }

    if (text?.trim()) {
      const trimmed = text.trim();
      if (trimmed.length <= 160) return trimmed;
      // Trim to last complete sentence within 160 chars
      const truncated = trimmed.slice(0, 160);
      const lastPeriod = truncated.lastIndexOf(".");
      return lastPeriod > 80 ? truncated.slice(0, lastPeriod + 1) : `${truncated.trimEnd()}…`;
    }
  }

  return undefined;
}

/**
 * Walks layout blocks in order, returns the first media ID found.
 * Checks: Hero mediaSrc, SplitMedia first row mediaSrc, Bento image.src,
 * ImageGallery first item image.
 */
export function extractFirstImageFromBlocks(
  layout: LayoutBlock[] | null | undefined,
): number | undefined {
  if (!layout?.length) return undefined;

  for (const block of layout) {
    switch (block.blockType) {
      case "hero": {
        const id = typeof block.mediaSrc === "object" ? block.mediaSrc?.id : block.mediaSrc;
        if (id) return id;
        break;
      }
      case "splitMedia": {
        const row = block.rows?.[0];
        if (row) {
          const id = typeof row.mediaSrc === "object" ? row.mediaSrc?.id : row.mediaSrc;
          if (id) return id;
        }
        break;
      }
      case "bento": {
        const id = typeof block.image?.src === "object" ? block.image.src?.id : block.image?.src;
        if (id) return id;
        break;
      }
      case "imageGallery": {
        const item = block.items?.[0];
        if (item) {
          const id = typeof item.image === "object" ? item.image?.id : item.image;
          if (id) return id;
        }
        break;
      }
    }
  }

  return undefined;
}
```

- [ ] **Step 2: Add SEO plugin to Payload config**

Modify `src/payload.config.ts`. Add imports at the top:

```ts
import { seoPlugin } from "@payloadcms/plugin-seo";
import { SiteSettings } from "./payload/globals/SiteSettings";
import { extractFirstImageFromBlocks, extractFirstTextFromBlocks } from "./payload/lib/seo/extract-block-content";
```

Add `globals` to `buildConfig` (after `collections`):

```ts
globals: [SiteSettings],
```

Add `seoPlugin` to the `plugins` array (after the `mcpPlugin` block):

```ts
seoPlugin({
  collections: ["pages"],
  uploadsCollection: "media",
  tabbedUI: true,
  generateTitle: async ({ doc, payload }) => {
    const settings = await payload.findGlobal({ slug: "site-settings" });
    const separator = settings.separator || " | ";
    const siteName = settings.siteName || "";
    return `${doc.title}${separator}${siteName}`;
  },
  generateDescription: async ({ doc }) => {
    return extractFirstTextFromBlocks((doc as { layout?: unknown[] }).layout as any) || "";
  },
  generateURL: async ({ doc, payload }) => {
    const settings = await payload.findGlobal({ slug: "site-settings" });
    const slug = doc.slug === "home" ? "" : doc.slug;
    return `${settings.baseUrl || ""}/${slug}`;
  },
  generateImage: async ({ doc }) => {
    return extractFirstImageFromBlocks((doc as { layout?: unknown[] }).layout as any);
  },
  fields: ({ defaultFields }) => [
    ...defaultFields,
    {
      name: "canonicalUrl",
      type: "text",
      label: "Canonical URL",
      admin: {
        description: "Override the auto-generated canonical URL. Leave blank to use the default.",
      },
    },
    {
      name: "robots",
      type: "group",
      label: "Robots",
      fields: [
        {
          name: "override",
          type: "checkbox",
          defaultValue: false,
          label: "Override global robots settings",
          admin: {
            description: "Enable to set custom robots directives for this page.",
          },
        },
        {
          name: "index",
          type: "checkbox",
          defaultValue: true,
          label: "Allow indexing",
          admin: {
            condition: (_, siblingData) => siblingData?.override === true,
          },
        },
        {
          name: "follow",
          type: "checkbox",
          defaultValue: true,
          label: "Allow link following",
          admin: {
            condition: (_, siblingData) => siblingData?.override === true,
          },
        },
      ],
    },
    {
      name: "keywords",
      type: "text",
      label: "Keywords",
      admin: {
        description: "Comma-separated keywords (optional).",
      },
    },
    {
      name: "excludeFromSitemap",
      type: "checkbox",
      defaultValue: false,
      label: "Exclude from sitemap",
      admin: {
        description: "Hide this page from the sitemap. It can still be indexed if linked to externally.",
      },
    },
  ],
}),
```

- [ ] **Step 3: Update Pages collection**

Modify `src/payload/collections/Pages.ts`:

1. Remove the manual `meta` group (the last field in the `fields` array — lines 108–114). The SEO plugin injects its own.

2. Add `sitemap` to the `custom` property:
```ts
custom: { linkable: true, sitemap: { enabled: true, urlPrefix: "" } },
```

3. Update `revalidateOnChange` to include sitemap tag:
```ts
const { afterChange, afterDelete } = revalidateOnChange({ tags: ["sitemap"] });
```

- [ ] **Step 4: Generate migration**

**Warning**: In local dev without `DATABASE_AUTH_TOKEN` set, `push: true` is active (`payload.config.ts` line 45). Drizzle push could auto-apply schema changes and mask migration issues. Before running `migrate:create`, either set a dummy `DATABASE_AUTH_TOKEN=dummy` in your shell or verify the generated migration SQL manually before applying.

```bash
bun run migrate:create
```

**Review the generated migration file in `src/migrations/`.**

Verify:
- `meta_title`, `meta_description`, `meta_image_id` columns in `pages` are NOT dropped
- Same columns in `_pages_v` are NOT dropped
- New columns are added: `meta_canonicalUrl`, `meta_robots_override`, `meta_robots_index`, `meta_robots_follow`, `meta_keywords`, `meta_excludeFromSitemap` (plus their `_pages_v` equivalents)

- [ ] **Step 5: Apply migration and regenerate types**

```bash
bun run migrate && bun generate:types
```

- [ ] **Step 6: Commit**

```bash
git add src/payload.config.ts src/payload/collections/Pages.ts src/payload/lib/seo/extract-block-content.ts src/migrations/
git commit -m "feat(seo): configure SEO plugin on Pages, remove manual meta group"
```

---

## Task 3: Frontend Metadata Helper & JSON-LD

**Files:**
- Create: `src/payload/lib/seo/generate-page-metadata.ts`
- Create: `src/components/features/seo/json-ld.tsx`

- [ ] **Step 1: Create the metadata generation helper**

Create `src/payload/lib/seo/generate-page-metadata.ts`:

```ts
import type { Metadata } from "next";
import type { Media, Page, SiteSetting } from "@/payload-types";

/**
 * Merges page SEO fields + SiteSettings into a complete Next.js Metadata object.
 * Draft pages always get noindex/nofollow regardless of settings.
 */
export function generatePageMetadata(
  page: Page,
  settings: SiteSetting,
): Metadata {
  const isDraft = (page as { _status?: string })._status === "draft";

  // Title: page meta → fallback to "{title}{separator}{siteName}"
  const separator = settings.separator || " | ";
  const title =
    page.meta?.title || `${page.title}${separator}${settings.siteName || ""}`;

  // Description
  const description = page.meta?.description || undefined;

  // Image: page meta → fallback to global default
  const metaImage = page.meta?.image as Media | null | undefined;
  const defaultImage = settings.defaultOgImage as Media | null | undefined;
  const ogImage = metaImage?.url || defaultImage?.url || undefined;

  // Canonical: custom override → fallback to baseUrl/slug
  const slug = page.slug === "home" ? "" : page.slug;
  const canonical =
    (page.meta as any)?.canonicalUrl ||
    (settings.baseUrl ? `${settings.baseUrl}/${slug}` : undefined);

  // Robots: drafts always noindex; then per-page override; then global
  let robots: Metadata["robots"];
  if (isDraft) {
    robots = { index: false, follow: false };
  } else if ((page.meta as any)?.robots?.override) {
    robots = {
      index: (page.meta as any).robots.index ?? true,
      follow: (page.meta as any).robots.follow ?? true,
    };
  } else {
    robots = {
      index: settings.robots?.index ?? true,
      follow: settings.robots?.follow ?? true,
    };
  }

  // Keywords
  const keywords = (page.meta as any)?.keywords || undefined;

  return {
    title,
    description,
    keywords,
    alternates: canonical ? { canonical } : undefined,
    robots,
    openGraph: {
      title,
      description: description || undefined,
      url: canonical || undefined,
      siteName: settings.siteName || undefined,
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                ...(metaImage?.width ? { width: metaImage.width } : {}),
                ...(metaImage?.height ? { height: metaImage.height } : {}),
              },
            ],
          }
        : {}),
      type: "website",
    },
    twitter: {
      card: (settings.social?.twitterCardType as "summary" | "summary_large_image") || "summary_large_image",
      ...(settings.social?.twitter ? { site: settings.social.twitter } : {}),
      title,
      description: description || undefined,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
```

Note: The `as any` casts for extended meta fields (`canonicalUrl`, `robots`, `keywords`, `excludeFromSitemap`) are needed because Payload's generated types may not include plugin-injected fields until types are regenerated after the plugin is configured. After `bun generate:types` in Task 2, these types will be available and the casts can be cleaned up. If the generated `Page` type includes the full meta shape, replace casts with proper typing.

- [ ] **Step 2: Create JSON-LD component**

Create `src/components/features/seo/json-ld.tsx`:

```tsx
import type { Media, Page, SiteSetting } from "@/payload-types";

interface JsonLdProps {
  page: Page;
  settings: SiteSetting;
}

export function JsonLd({ page, settings }: JsonLdProps) {
  const slug = page.slug === "home" ? "" : page.slug;
  const pageUrl = settings.baseUrl ? `${settings.baseUrl}/${slug}` : undefined;
  const isHome = page.slug === "home";

  const schemas: Record<string, unknown>[] = [];

  // WebPage — every page
  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.meta?.title || page.title,
    ...(page.meta?.description ? { description: page.meta.description } : {}),
    ...(pageUrl ? { url: pageUrl } : {}),
  });

  // Organization — home page only
  if (isHome && settings.jsonLd?.organizationName) {
    const orgLogo = settings.jsonLd.organizationLogo as Media | null | undefined;
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: settings.jsonLd.organizationName,
      ...(settings.jsonLd.organizationUrl
        ? { url: settings.jsonLd.organizationUrl }
        : {}),
      ...(orgLogo?.url ? { logo: orgLogo.url } : {}),
    });
  }

  // BreadcrumbList — non-home pages
  if (!isHome && pageUrl && settings.baseUrl) {
    const segments = page.slug.split("/");
    const items = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: settings.baseUrl,
      },
      ...segments.map((segment, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        item: `${settings.baseUrl}/${segments.slice(0, i + 1).join("/")}`,
      })),
    ];

    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items,
    });
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/payload/lib/seo/generate-page-metadata.ts src/components/features/seo/json-ld.tsx
git commit -m "feat(seo): add metadata helper and JSON-LD component"
```

---

## Task 4: Update Frontend Pages

**Files:**
- Modify: `src/app/(frontend)/[[...slug]]/page.tsx`
- Modify: `src/app/(frontend)/preview/[...slug]/page.tsx`
- Modify: `src/app/(frontend)/layout.tsx`

- [ ] **Step 1: Update the catch-all page**

Modify `src/app/(frontend)/[[...slug]]/page.tsx`:

Add imports:
```ts
import { getCachedSiteSettings } from "@/payload/lib/cached-payload";
import { generatePageMetadata } from "@/payload/lib/seo/generate-page-metadata";
import { JsonLd } from "@/components/features/seo/json-ld";
```

Update `generateStaticParams` to filter drafts — add `draft: false` to the `payload.find` call:
```ts
const pages = await payload.find({
  collection: "pages",
  limit: 100,
  select: { slug: true },
  draft: false,
});
```

Update `generateMetadata`:
```ts
export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: slugSegments } = await params;
  const slug = slugSegments?.join("/") || "home";

  const page = await getCachedPage(slug);
  const settings = await getCachedSiteSettings();

  if (!page) return {};

  return generatePageMetadata(page, settings);
}
```

Update the `Page` component to include JSON-LD:
```tsx
export default async function Page({ params }: Args) {
  const { slug: slugSegments } = await params;
  const slug = slugSegments?.join("/") || "home";

  const page = await getCachedPage(slug);

  if (!page) {
    notFound();
  }

  const settings = await getCachedSiteSettings();

  return (
    <>
      <JsonLd page={page} settings={settings} />
      <RenderBlocks blocks={page.layout ?? []} />
    </>
  );
}
```

Remove the `config` import from `@payload-config` and the `getPayload` import from `payload` if they were only used in `generateStaticParams`. Actually, `generateStaticParams` still uses them — keep those imports.

- [ ] **Step 2: Update the preview page**

Modify `src/app/(frontend)/preview/[...slug]/page.tsx`:

Add imports:
```ts
import { getCachedSiteSettings } from "@/payload/lib/cached-payload";
import { generatePageMetadata } from "@/payload/lib/seo/generate-page-metadata";
```

Update `generateMetadata`:
```ts
export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: slugSegments } = await params;
  const slug = slugSegments.join("/") || "home";

  const isAuthorized = await authenticate();
  if (!isAuthorized) return {};

  const page = await getPageDirect(slug, true);
  if (!page) return {};

  const settings = await getCachedSiteSettings();
  const metadata = generatePageMetadata(page, settings);

  // Preview pages always noindex/nofollow
  return {
    ...metadata,
    title: `Preview: ${page.meta?.title || page.title}`,
    robots: { index: false, follow: false },
  };
}
```

- [ ] **Step 3: Update frontend layout metadata**

Modify `src/app/(frontend)/layout.tsx`:

Replace the static `metadata` export:
```ts
export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "Lumon",
  },
};
```

This makes per-page `title` pass through directly (via `%s` template). The `default: "Lumon"` is used when a page has no title. Remove the `description` since per-page metadata handles it.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(frontend\)/\[\[...slug\]\]/page.tsx src/app/\(frontend\)/preview/\[...slug\]/page.tsx src/app/\(frontend\)/layout.tsx
git commit -m "feat(seo): wire metadata helper and JSON-LD into frontend pages"
```

---

## Task 5: Sitemap & Robots.txt

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

- [ ] **Step 1: Add `getCachedSitemapData` helper to cached-payload**

Add to `src/payload/lib/cached-payload/index.ts`:

```ts
/**
 * Fetch all sitemap entries from auto-discovered collections.
 * Cached and tagged with "sitemap" — revalidated when any page changes.
 */
export async function getCachedSitemapData() {
  "use cache";
  cacheLife("hours");
  cacheTag("sitemap", "site-settings");

  const payload = await getPayload({ config });
  const settings = await payload.findGlobal({ slug: "site-settings" });
  const baseUrl = (settings.baseUrl || "").replace(/\/$/, "");
  const globalNoIndex = settings.robots?.index === false;

  // Auto-discover collections with sitemap enabled
  const sitemapCollections = payload.config.collections.filter(
    (c) => (c.custom as any)?.sitemap?.enabled === true,
  );

  const entries: Array<{ url: string; lastModified?: Date }> = [];

  for (const collection of sitemapCollections) {
    const urlPrefix = (collection.custom as any)?.sitemap?.urlPrefix ?? "";

    const result = await payload.find({
      collection: collection.slug,
      draft: false,
      limit: 1000,
      pagination: false,
      select: { slug: true, updatedAt: true, meta: true },
    });

    for (const doc of result.docs) {
      const meta = (doc as any).meta;

      // Skip if explicitly excluded from sitemap
      if (meta?.excludeFromSitemap) continue;

      // Skip if noindex (per-item override or global default)
      if (meta?.robots?.override && meta.robots.index === false) continue;
      if (!meta?.robots?.override && globalNoIndex) continue;

      const slug = (doc as any).slug;
      const path = slug === "home" ? "" : slug;

      entries.push({
        url: `${baseUrl}${urlPrefix}/${path}`.replace(/\/$/, ""),
        lastModified: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
      });
    }
  }

  return entries;
}
```

- [ ] **Step 2: Create dynamic sitemap**

Create `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { getCachedSitemapData } from "@/payload/lib/cached-payload";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getCachedSitemapData();
}
```

- [ ] **Step 3: Create dynamic robots.txt**

Create `src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { getCachedSiteSettings } from "@/payload/lib/cached-payload";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getCachedSiteSettings();
  const baseUrl = (settings.baseUrl || "").replace(/\/$/, "");
  const globalIndex = settings.robots?.index ?? true;

  // robots.txt only controls crawl access (Allow/Disallow).
  // The "follow" directive is a per-page <meta> concern, not robots.txt.
  return {
    rules: {
      userAgent: "*",
      ...(globalIndex ? { allow: "/" } : { disallow: "/" }),
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/payload/lib/cached-payload/index.ts src/app/sitemap.ts src/app/robots.ts
git commit -m "feat(seo): add dynamic sitemap and robots.txt with caching"
```

---

## Task 6: Verify & Clean Up

- [ ] **Step 1: Run lint check**

```bash
bun check
```

Fix any issues that come up, then run `bun fix` if auto-fixable.

- [ ] **Step 2: Restart dev server and verify admin panel**

Tell the user to restart the dev server (Payload config changes require a restart). Then verify:

1. Open `http://localhost:3100/admin` → navigate to a Page
2. Confirm the "SEO" tab appears with title, description, image fields, SERP preview, character counts
3. Confirm the extended fields (canonical, robots, keywords, exclude from sitemap) appear below the preview
4. Confirm the "Auto-generate" buttons work on title, description, URL, image

- [ ] **Step 3: Verify SiteSettings global**

1. Open `http://localhost:3100/admin/globals/site-settings`
2. Fill in: site name, base URL, default OG image
3. Save and confirm no errors

- [ ] **Step 4: Verify frontend metadata**

Visit a page on `http://localhost:3100` and check the HTML source:
- `<title>` contains the page title + site name
- `<meta name="description">` present
- `og:image`, `og:title`, `og:description` present
- `<link rel="canonical">` present
- `<script type="application/ld+json">` with WebPage schema present
- Home page has Organization schema

- [ ] **Step 5: Verify sitemap and robots**

- Visit `http://localhost:3100/sitemap.xml` — should list published, non-excluded pages
- Visit `http://localhost:3100/robots.txt` — should show User-agent rules and sitemap URL

- [ ] **Step 6: Verify draft protection**

Create a draft page in admin, confirm:
- Not listed in sitemap
- Has `noindex, nofollow` in source when viewed via preview route

- [ ] **Step 7: Final commit with any cleanup**

```bash
bun check
```

Stage only the files that were modified by lint fixes, then commit:

```bash
git commit -m "chore(seo): lint fixes and cleanup"
```

---

## Task 7: Type Cleanup (Post-Generation)

After `bun generate:types` in Task 2, the generated `Page` type should include the plugin's meta fields plus extended fields. If it does:

- [ ] **Step 1: Remove `as any` casts in `generate-page-metadata.ts`**

Replace `(page.meta as any)?.canonicalUrl` etc. with proper typed access: `page.meta?.canonicalUrl`.

- [ ] **Step 2: Remove `as any` casts in `sitemap.ts`**

Replace `(doc as any).meta` with proper typed access.

- [ ] **Step 3: Run type check and commit**

```bash
bun check
git add src/payload/lib/seo/generate-page-metadata.ts src/app/sitemap.ts
git commit -m "refactor(seo): replace type casts with generated types"
```
