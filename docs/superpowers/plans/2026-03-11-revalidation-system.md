# Revalidation System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable, tag-based cache invalidation system so that updating any Payload document automatically revalidates all cached pages that depend on it — including through relationships.

**Architecture:** Three layers — (1) cached fetch functions using `'use cache'` + `cacheTag` that tag every resolved document, (2) a `revalidateOnChange` hook factory that calls `revalidateTag` on any document mutation, (3) config plumbing (`cacheComponents: true`, draft mode bypass). The tag system IS the dependency graph.

**Tech Stack:** Next.js 16 (`'use cache'`, `cacheTag`, `cacheLife`, `revalidateTag`, `draftMode`), Payload CMS 3.x hooks (`CollectionAfterChangeHook`, `CollectionAfterDeleteHook`)

**Spec:** `docs/superpowers/specs/2026-03-11-revalidation-system-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `next.config.ts` | Modify | Add `cacheComponents: true` |
| `src/payload/hooks/revalidateOnChange.ts` | Create | Hook factory — generates afterChange/afterDelete hooks for any collection |
| `src/payload/lib/cached-payload.ts` | Create | Cached fetch layer — `'use cache'` + `cacheTag` + relationship walker |
| `src/payload/collections/Pages.ts` | Modify | Wire revalidation hooks |
| `src/payload/collections/Media.ts` | Modify | Wire revalidation hooks (after existing optimizeVideo hook) |
| `src/app/(frontend)/[[...slug]]/page.tsx` | Modify | Use cached fetch, add draft mode bypass |

---

## Chunk 1: Config + Hook Factory

### Task 1: Enable cacheComponents in next.config.ts

**Files:**
- Modify: `next.config.ts:4`

- [ ] **Step 1: Add `cacheComponents: true` to the Next.js config**

Add `cacheComponents: true` as the first property in the `nextConfig` object. Do NOT change the `withPayload` import or the `export default withPayload(nextConfig)` line — those are required for Payload CMS.

The full file should look like:

```typescript
import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

// Enables 'use cache' + cacheTag for tag-based revalidation
const nextConfig: NextConfig = {
  cacheComponents: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.railway.app",
      },
    ],
  },
};

export default withPayload(nextConfig);
```

- [ ] **Step 2: Verify the dev server starts without errors**

Run: `bun dev` (or restart if already running)
Expected: Server starts. No errors about `cacheComponents`.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "chore: enable cacheComponents for use cache support"
```

---

### Task 2: Create the revalidateOnChange hook factory

**Files:**
- Create: `src/payload/hooks/revalidateOnChange.ts`

- [ ] **Step 1: Create the hook factory**

File: `src/payload/hooks/revalidateOnChange.ts`

```typescript
import { revalidateTag } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";

interface RevalidateOptions {
  /** Additional static tags to invalidate on every change */
  tags?: string[];
}

/**
 * Creates afterChange and afterDelete hooks that invalidate cache tags
 * for a document and its collection. Attach to any Payload collection.
 *
 * Tag conventions:
 *  - `doc:{collection}:{id}` — specific document
 *  - `collection:{collection}` — all documents in a collection
 *
 * Set `context.disableRevalidate = true` to skip (loop prevention).
 */
export function revalidateOnChange(options: RevalidateOptions = {}): {
  afterChange: CollectionAfterChangeHook;
  afterDelete: CollectionAfterDeleteHook;
} {
  const afterChange: CollectionAfterChangeHook = ({
    doc,
    collection,
    req: { payload, context },
  }) => {
    if (context.disableRevalidate) {
      return doc;
    }

    const collectionSlug = collection.slug;

    payload.logger.info({
      msg: `Revalidating doc:${collectionSlug}:${doc.id}`,
    });

    revalidateTag(`doc:${collectionSlug}:${doc.id}`);
    revalidateTag(`collection:${collectionSlug}`);

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
    if (context.disableRevalidate) {
      return doc;
    }

    const collectionSlug = collection.slug;

    payload.logger.info({
      msg: `Revalidating (delete) doc:${collectionSlug}:${doc.id}`,
    });

    revalidateTag(`doc:${collectionSlug}:${doc.id}`);
    revalidateTag(`collection:${collectionSlug}`);

    for (const tag of options.tags ?? []) {
      revalidateTag(tag);
    }

    return doc;
  };

  return { afterChange, afterDelete };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/payload/hooks/revalidateOnChange.ts
git commit -m "feat: add revalidateOnChange hook factory for tag-based cache invalidation"
```

---

### Task 3: Wire revalidation hooks into Pages and Media collections

**Files:**
- Modify: `src/payload/collections/Pages.ts`
- Modify: `src/payload/collections/Media.ts`

- [ ] **Step 1: Add revalidation hooks to Pages collection**

In `src/payload/collections/Pages.ts`, add the import and hooks config:

```typescript
import type { CollectionConfig } from "payload";
import { revalidateOnChange } from "../hooks/revalidateOnChange";
// ... existing block imports ...

const { afterChange, afterDelete } = revalidateOnChange();

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
  versions: {
    drafts: true,
  },
  fields: [
    // ... existing fields unchanged ...
  ],
};
```

Changes:
- Add `import { revalidateOnChange } from "../hooks/revalidateOnChange";`
- Add `const { afterChange, afterDelete } = revalidateOnChange();` before the export
- Add `hooks: { afterChange: [afterChange], afterDelete: [afterDelete] }` to the collection config

- [ ] **Step 2: Add revalidation hooks to Media collection**

In `src/payload/collections/Media.ts`, add revalidation after the existing hooks:

```typescript
import type { CollectionBeforeValidateHook, CollectionConfig } from "payload";
import { generateBlurDataURL } from "../hooks/generateBlurDataURL";
import { optimizeVideo } from "../hooks/optimizeVideo";
import { revalidateOnChange } from "../hooks/revalidateOnChange";

const revalidate = revalidateOnChange();

// ... validateFileSize unchanged ...

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [validateFileSize],
    beforeChange: [generateBlurDataURL],
    afterChange: [optimizeVideo, revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
  // ... rest unchanged ...
};
```

Changes:
- Add `import { revalidateOnChange } from "../hooks/revalidateOnChange";`
- Add `const revalidate = revalidateOnChange();` before the `MAX_FILE_SIZE` const
- Change `afterChange: [optimizeVideo]` → `afterChange: [optimizeVideo, revalidate.afterChange]`
- Add `afterDelete: [revalidate.afterDelete]`

- [ ] **Step 3: Verify TypeScript compiles**

Run: `bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Verify lint passes**

Run: `bun check`
Expected: No new errors.

- [ ] **Step 5: Commit**

```bash
git add src/payload/collections/Pages.ts src/payload/collections/Media.ts
git commit -m "feat: wire revalidation hooks into Pages and Media collections"
```

---

## Chunk 2: Cached Fetch Layer + Page Route

### Task 4: Create the cached fetch layer

**Files:**
- Create: `src/payload/lib/cached-payload.ts`

- [ ] **Step 1: Create the cached fetch module with relationship walker**

File: `src/payload/lib/cached-payload.ts`

```typescript
import { cacheLife, cacheTag } from "next/cache";
import config from "@payload-config";
import { getPayload } from "payload";

/**
 * Fetch a page by slug with caching and relationship tagging.
 * Uses Next.js `'use cache'` — invalidated via `revalidateTag`.
 */
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

/**
 * Fetch a page by slug WITHOUT caching. Used for draft/preview mode.
 */
export async function getPageDirect(slug: string, draft = false) {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    draft,
    limit: 1,
  });

  return result.docs[0] ?? null;
}

/**
 * Fetch any collection document by slug with caching and relationship tagging.
 * For collections other than pages that need cached frontend fetching.
 */
export async function getCachedDocument(
  collection: string,
  slug: string,
) {
  "use cache";
  cacheLife("hours");

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: collection as "pages",
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

// ── Relationship walker ──────────────────────────────────────────────

type AnyObject = Record<string, unknown>;

function isObject(value: unknown): value is AnyObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Walk a resolved Payload document and call `cacheTag` for every
 * populated relationship or upload found.
 *
 * Detection:
 * - Relationship fields: objects with numeric `id` + string `relationTo`
 * - Upload fields (Media): objects with numeric `id` + string `url` + string `mimeType`
 */
function tagResolvedRelationships(doc: unknown): void {
  let tagCount = 0;
  const seen = new WeakSet<object>();

  function walk(value: unknown): void {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        walk(item);
      }
      return;
    }

    if (!isObject(value)) {
      return;
    }

    // Prevent circular reference loops
    if (seen.has(value)) {
      return;
    }
    seen.add(value);

    // Check if this object is a populated relation
    if (typeof value.id === "number") {
      let collection: string | undefined;

      if (typeof value.relationTo === "string") {
        collection = value.relationTo;
      } else if (
        typeof value.url === "string" &&
        typeof value.mimeType === "string"
      ) {
        // Populated upload field (Media document)
        collection = "media";
      }

      if (collection) {
        cacheTag(`doc:${collection}:${value.id}`);
        tagCount++;
      }
    }

    // Recurse into nested objects
    for (const key of Object.keys(value)) {
      walk(value[key]);
    }
  }

  walk(doc);

  if (tagCount > 100) {
    console.warn(
      `[revalidation] High tag count (${tagCount}) — approaching 128 limit`
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Verify lint passes**

Run: `bun check`
Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add src/payload/lib/cached-payload.ts
git commit -m "feat: add cached fetch layer with relationship tagging for cache invalidation"
```

---

### Task 5: Update the catch-all page route to use cached fetch

**Files:**
- Modify: `src/app/(frontend)/[[...slug]]/page.tsx`

- [ ] **Step 1: Rewrite the page route to use cached fetch with draft bypass**

Replace the entire contents of `src/app/(frontend)/[[...slug]]/page.tsx`:

```typescript
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { RenderBlocks } from "@/components/blocks/render-blocks";
import { getCachedPage, getPageDirect } from "@/payload/lib/cached-payload";

interface Args {
  params: Promise<{ slug?: string[] }>;
}

async function getPage(slug: string) {
  const { isEnabled: isDraft } = await draftMode();

  return isDraft ? getPageDirect(slug, true) : getCachedPage(slug);
}

export default async function Page({ params }: Args) {
  const { slug: slugSegments } = await params;
  const slug = slugSegments?.join("/") || "home";

  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return <RenderBlocks blocks={page.layout ?? []} />;
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: slugSegments } = await params;
  const slug = slugSegments?.join("/") || "home";

  const page = await getPage(slug);

  if (!page) {
    return {};
  }

  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description || undefined,
  };
}
```

Changes from the previous version:
- Removed direct `getPayload`/`payload.find` calls
- Added `draftMode()` import and `getPage()` helper that switches between cached and direct fetch
- Both `Page` component and `generateMetadata` use the same `getPage()` helper
- Removed `select: { meta: true, title: true }` optimization from metadata — the full document is cached, so extracting meta from it is free
- Removed `@payload-config` and `payload` imports (now in cached-payload.ts)

- [ ] **Step 2: Verify TypeScript compiles**

Run: `bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Verify lint passes**

Run: `bun check`
Expected: No new errors.

- [ ] **Step 4: Manual verification**

1. Start/restart the dev server: `bun dev`
2. Visit `http://localhost:3000` — page should render normally
3. Check the terminal for Payload logs — should see no revalidation errors
4. Edit a page in the admin panel (`http://localhost:3000/admin`)
5. After saving, check terminal — should see `Revalidating doc:pages:{id}` log
6. Refresh the frontend page — should show updated content

- [ ] **Step 5: Commit**

```bash
git add "src/app/(frontend)/[[...slug]]/page.tsx"
git commit -m "feat: use cached fetch with draft bypass in page route"
```

---

### Task 6: Final verification

- [ ] **Step 1: Run full type check**

Run: `bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 2: Run full lint check**

Run: `bun check`
Expected: No new errors (pre-existing issues only).

- [ ] **Step 3: Test the cascade**

1. Open `http://localhost:3000` in a browser
2. In the admin panel, upload a new image to Media collection
3. Check terminal — should see `Revalidating doc:media:{id}` log
4. Assign that image to a block in a page
5. Save the page — should see `Revalidating doc:pages:{id}` log
6. Refresh frontend — new image should appear

- [ ] **Step 4: Verify environment variable for debug (optional)**

Run: `NEXT_PRIVATE_DEBUG_CACHE=1 bun dev`
Expected: Verbose cache logging shows `cacheTag` calls and cache hits/misses.
