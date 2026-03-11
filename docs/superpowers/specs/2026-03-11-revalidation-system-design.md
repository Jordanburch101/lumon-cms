# Revalidation System — Design Spec

## Goal

Build a reusable, tag-based cache invalidation system for Payload CMS collections. When any document changes, all cached pages that depend on it are automatically revalidated — including through relationships (e.g., updating a Team Member invalidates every Page that references them).

## Architecture

Three layers working together:

1. **Cached fetch layer** — wraps Payload Local API calls in `'use cache'` functions with `cacheTag()` tagging. Tags every document ID encountered during resolution.
2. **Hook factory** — a single `revalidateOnChange()` function that generates `afterChange` and `afterDelete` hooks for any collection. Calls `revalidateTag()` to invalidate the document and its collection.
3. **Config plumbing** — `cacheComponents: true` in `next.config.ts`, draft mode bypass, and tag conventions.

No dependency tracking table. No query-time scanning. The tag system IS the dependency graph — tags are planted at render time, invalidated at mutation time.

## Tag Conventions

| Tag pattern | Example | Meaning |
|-------------|---------|---------|
| `collection:{slug}` | `collection:pages` | All documents in a collection |
| `doc:{collection}:{id}` | `doc:pages:1` | A specific document |
| `global:{slug}` | `global:header` | A Payload global (future) |

These are the only tag shapes. Keeping them simple avoids naming collisions and makes debugging straightforward.

**Limits:** Next.js allows max 128 tags per cache entry, max 256 chars per tag. A page with 50 resolved relationships is well within bounds.

## Layer 1: Cached Fetch

### Data-fetching function

File: `src/payload/lib/cached-payload.ts`

A `'use cache'` function that wraps Payload Local API queries:

```typescript
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";

export async function getCachedPage(slug: string) {
  "use cache";
  cacheLife("hours");

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    draft: false,
    limit: 1,
  });

  const page = result.docs[0] ?? null;

  if (page) {
    cacheTag(`collection:pages`, `doc:pages:${page.id}`);
    tagResolvedRelationships(page);
  }

  return page;
}
```

### Relationship tagging

The `tagResolvedRelationships` utility walks a resolved Payload document and tags every populated relationship it encounters. Payload has two kinds of populated references:

1. **Relationship fields** — populated objects have a `relationTo` property indicating the collection.
2. **Upload fields** — populated as plain collection objects (e.g., `Media`) with NO `relationTo`. Currently all upload fields in this project point to `media`.

The walker handles both:

```typescript
function tagResolvedRelationships(doc: unknown) {
  let tagCount = 0;

  walkDocument(doc, (value) => {
    if (!isObject(value) || typeof value.id !== "number") return;

    let collection: string | undefined;

    if (typeof value.relationTo === "string") {
      // Explicit relationship field
      collection = value.relationTo;
    } else if (typeof value.url === "string" && typeof value.mimeType === "string") {
      // Populated upload field (Media document)
      collection = "media";
    }

    if (collection) {
      cacheTag(`doc:${collection}:${value.id}`);
      tagCount++;
    }
  });

  if (tagCount > 100) {
    console.warn(`[revalidation] High tag count (${tagCount}) — approaching 128 limit`);
  }
}
```

The walker recurses through objects and arrays, skipping primitives. The Media detection heuristic (`url` + `mimeType`) is specific to this project's single upload collection. If additional upload collections are added, extend the detection logic or add a `relationTo`-style marker.

> **Note on new references:** When a Page is updated to reference a new document (e.g., a new team member), the Page itself changes — triggering `doc:pages:{id}` revalidation. The next render picks up the new reference and tags it. So "new dependency" cases are handled by the Page's own tag, not the new document's tag.

### Generic `getCachedCollection` helper

For non-page collections that may be fetched directly:

```typescript
export async function getCachedDocument<T extends keyof Collections>(
  collection: T,
  slug: string,
) {
  "use cache";
  cacheLife("hours");

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    draft: false,
    limit: 1,
  });

  const doc = result.docs[0] ?? null;

  if (doc) {
    cacheTag(`collection:${collection}`, `doc:${collection}:${doc.id}`);
    tagResolvedRelationships(doc);
  }

  return doc;
}
```

### Draft mode bypass

When Next.js `draftMode()` is active (for previews), the cached functions must be bypassed. The catch-all page route checks draft mode and calls the Payload API directly (uncached) when active:

```typescript
// In the page route
import { draftMode } from "next/headers";

const { isEnabled: isDraft } = await draftMode();

const page = isDraft
  ? await getPayloadPageDirect(slug, true)  // uncached, draft: true
  : await getCachedPage(slug);              // cached
```

This keeps the cache layer clean — cached content never includes draft documents.

## Layer 2: Hook Factory

### `revalidateOnChange`

File: `src/payload/hooks/revalidateOnChange.ts`

A factory function that returns `afterChange` and `afterDelete` hooks for any collection:

```typescript
import { revalidateTag } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";

interface RevalidateOptions {
  /** Additional static tags to invalidate */
  tags?: string[];
}

export function revalidateOnChange(options: RevalidateOptions = {}): {
  afterChange: CollectionAfterChangeHook;
  afterDelete: CollectionAfterDeleteHook;
} {
  const afterChange: CollectionAfterChangeHook = ({
    doc,
    collection,
    req: { payload, context },
  }) => {
    if (context.disableRevalidate) return doc;

    const slug = collection.slug;

    payload.logger.info({ msg: `Revalidating doc:${slug}:${doc.id}` });

    revalidateTag(`doc:${slug}:${doc.id}`);
    revalidateTag(`collection:${slug}`);

    for (const tag of options.tags ?? []) {
      revalidateTag(tag);
    }

    return doc;
  };

  const afterDelete: CollectionAfterDeleteHook = ({
    doc,
    collection,
    req: { payload, context },
  }) => {
    if (context.disableRevalidate) return doc;

    const slug = collection.slug;

    payload.logger.info({ msg: `Revalidating (delete) doc:${slug}:${doc.id}` });

    revalidateTag(`doc:${slug}:${doc.id}`);
    revalidateTag(`collection:${slug}`);

    for (const tag of options.tags ?? []) {
      revalidateTag(tag);
    }

    return doc;
  };

  return { afterChange, afterDelete };
}
```

### Usage in collections

```typescript
// Pages.ts
const { afterChange, afterDelete } = revalidateOnChange();

export const Pages: CollectionConfig = {
  slug: "pages",
  hooks: {
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
  // ...
};

// Media.ts — no public path, but pages reference media via uploads
const revalidate = revalidateOnChange();

export const Media: CollectionConfig = {
  slug: "media",
  hooks: {
    // Order: optimizeVideo queues the job first, then revalidation fires.
    // For non-video uploads, optimizeVideo returns early — revalidation still runs.
    afterChange: [optimizeVideo, revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
  // ...
};

// Future: Team.ts — no public path, but blocks reference team members
const { afterChange, afterDelete } = revalidateOnChange();
```

### How cascade works

The cascade requires NO special logic in the hook. It works through the tag graph:

1. Page `/about` is rendered. During render, `getCachedPage("about")` tags with `doc:pages:1`, `collection:pages`.
2. The page includes a Team block that resolves team member #5. `tagResolvedRelationships` adds `doc:team:5`.
3. That team member has a Media avatar #12. The walker adds `doc:media:12`.
4. The cache entry for `/about` now has tags: `[doc:pages:1, collection:pages, doc:team:5, doc:media:12]`.
5. Someone updates team member #5 in the admin panel.
6. The `revalidateOnChange` hook fires `revalidateTag("doc:team:5")`.
7. Next.js invalidates every cache entry tagged with `doc:team:5` — including the `/about` page.
8. Next request to `/about` re-renders fresh.

No reverse-relationship queries. No dependency table. Tags ARE the graph.

### Loop prevention

Payload hooks can trigger other hooks (e.g., `update` in a hook triggers `afterChange` again). The `context.disableRevalidate` flag prevents infinite loops. The existing video optimization hook already uses this pattern (`context.skipVideoOptimization`).

```typescript
if (context.disableRevalidate) return doc;
```

### Jobs Queue consideration

Payload Jobs (like video optimization) run in a cron context. `revalidateTag` from `next/cache` relies on the Next.js request context and may not be available during cron execution.

**Solution:** The video optimization hook already calls `payload.update()` to save the optimized file. That update triggers the Media collection's `afterChange` hook, which runs in a proper request context. So the cascade naturally flows:

1. Job optimizes video → calls `payload.update({ collection: "media", ... })`
2. Media `afterChange` fires → `revalidateOnChange` invalidates `doc:media:{id}`
3. All pages using that media are revalidated

No special handling needed — the existing `context.skipVideoOptimization` flag prevents the re-optimization loop, but the revalidation hook still fires. Do NOT add a `context.isJobTask` guard — that would prevent the revalidation we want.

## Layer 3: Config Plumbing

### next.config.ts

Enable `cacheComponents`:

```typescript
const nextConfig: NextConfig = {
  cacheComponents: true,
  reactStrictMode: true,
  images: { /* existing */ },
};
```

### Cache lifetime

Use `cacheLife("hours")` as the default profile for CMS content. This means:
- **Stale**: 5 minutes — clients may serve stale content for up to 5 minutes
- **Revalidate**: 1 hour — server revalidates in background (stale-while-revalidate)
- **Expire**: 1 day — cache entry is evicted entirely after 24 hours without traffic
- **On-demand**: `revalidateTag` immediately invalidates regardless of TTL

This is a safety net — if a hook fails to fire, content still refreshes within an hour. Low-traffic pages expire after 24 hours and re-render fresh on next visit.

### Catch-all page route changes

The existing `src/app/(frontend)/[[...slug]]/page.tsx` needs to:

1. Import and call `getCachedPage` instead of calling `getPayload()` directly
2. Check `draftMode()` for preview bypass
3. The `generateMetadata` export should share the same `getCachedPage` call — both the page component and `generateMetadata` receive the same slug argument, so they share the same `'use cache'` entry. The current `select: { meta: true, title: true }` optimization in `generateMetadata` can be removed since the full page document is already cached and the metadata extraction is trivial from the cached result.

## File Plan

| File | Action |
|------|--------|
| `src/payload/lib/cached-payload.ts` | **Create** — cached fetch layer with `'use cache'`, `cacheTag`, relationship walker |
| `src/payload/hooks/revalidateOnChange.ts` | **Create** — hook factory |
| `src/payload/collections/Pages.ts` | **Modify** — add revalidation hooks |
| `src/payload/collections/Media.ts` | **Modify** — add revalidation hooks |
| `src/app/(frontend)/[[...slug]]/page.tsx` | **Modify** — use cached fetch, add draft mode bypass |
| `next.config.ts` | **Modify** — add `cacheComponents: true` |

## Out of Scope

- **Preview/draft mode implementation** — the draft bypass is included in this spec, but the full preview system (live preview URL, draft authentication, preview toolbar) is a separate feature.
- **Global revalidation** — Payload globals (header, footer) will follow the same pattern when added, using `global:{slug}` tags.
- **ISR fallback** — the `cacheLife("hours")` provides a time-based safety net. No additional ISR config needed.
- **Sitemap revalidation** — can be added later as an extra tag (`sitemap`) in the `revalidateOnChange` options.

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| `revalidateTag` not available in Jobs Queue context | Jobs trigger `payload.update()` which fires hooks in request context — cascade flows naturally |
| Missing relationship tags → stale data | The document walker is recursive and handles nested objects/arrays. Integration test with a deeply nested page validates coverage |
| Too many tags per cache entry (>128 limit) | A page with 128+ unique relationship references is extreme. Log a warning if tag count exceeds 100 |
| `cacheComponents` breaks existing client components | `'use cache'` only applies to functions/components that opt in. Existing `"use client"` components are unaffected |
| Draft content leaking into cache | Explicit `draftMode()` check before calling cached fetch. Cached functions always pass `draft: false` |
