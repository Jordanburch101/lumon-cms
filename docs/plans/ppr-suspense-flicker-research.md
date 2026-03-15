# PPR Suspense Flicker Research

> Research date: 2026-03-15 | Next.js 16.1.6 with `cacheComponents: true`

## The Problem

The `(frontend)/layout.tsx` wraps `<main>{children}</main>` in `<Suspense>` with no fallback (defaults to `null`). The catch-all `[[...slug]]/page.tsx` calls `draftMode()` (a dynamic API) and `await params` (runtime data), requiring a Suspense boundary. This produces a visible flicker: navbar + empty main + footer renders first, then page content streams in.

## Root Cause Analysis

Two things make this route "dynamic" under `cacheComponents`:

1. **`await params`** — catch-all `[[...slug]]` params are runtime data unless `generateStaticParams` provides sample values
2. **`draftMode()`** — a request-scoped dynamic API that forces the route into the Suspense boundary

Even though `getCachedPage()` uses `"use cache"`, the Page component itself is not cached — it calls `draftMode()` and `await params` before invoking the cached function.

---

## Approach 1: `generateStaticParams` + Move `draftMode()` Deeper (RECOMMENDED)

**How it works:**

Per the [official docs](https://nextjs.org/docs/messages/blocking-route#generatestaticparams), providing `generateStaticParams` with at least one sample param lets Next.js validate the route at build time. This allows `await params` **directly** without a Suspense boundary.

The remaining problem is `draftMode()`. Move it into a child component wrapped in its own tight Suspense, or restructure so that draft mode is checked via a separate mechanism (cookie read in a child component).

**Implementation plan:**

```tsx
// [[...slug]]/page.tsx

export async function generateStaticParams() {
  // Return known pages for build-time validation + prerendering
  // Must return at least 1 param (empty array causes build error)
  return [{ slug: undefined }]; // homepage — optional catch-all maps undefined to /
}

export default async function Page({ params }: Args) {
  const { slug: slugSegments } = await params; // OK — validated by generateStaticParams
  const slug = slugSegments?.join("/") || "home";

  // Option A: Always use cached, handle draft in a child component
  const page = await getCachedPage(slug);

  if (!page) notFound();

  return (
    <>
      <RenderBlocks blocks={page.layout ?? []} />
      {/* Draft overlay only streams when in draft mode */}
      <Suspense fallback={null}>
        <DraftModeOverlay slug={slug} />
      </Suspense>
    </>
  );
}
```

**Key insight:** `generateStaticParams` removes the Suspense requirement for `params`. Moving `draftMode()` into a child component (wrapped in its own Suspense) means the main page content renders immediately from cache, and only the tiny draft-mode check streams in.

**Tradeoff:** Draft mode previews will show the cached version first, then swap to the draft version. This could be acceptable if draft mode is rare (admin-only). Alternatively, use the layout-level draft detection approach below.

**Important caveat from docs:** `generateStaticParams` must return at least one param. Empty arrays cause a build error with `cacheComponents`. The build only validates code paths that execute with your sample params — if runtime params trigger branches accessing `cookies()`/`headers()` without Suspense, those cause runtime errors.

---

## Approach 2: `loading.tsx` with a Meaningful Skeleton

**How it works:**

Instead of eliminating the Suspense boundary, make the fallback useful. A `loading.tsx` file in the `[[...slug]]` directory acts as the Suspense fallback for that page segment. This is explicitly recommended in the [dynamic routes docs](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes#with-cache-components):

> "You can also use `loading.tsx` for page-level fallback UI."

The `loading.tsx` content becomes part of the static shell — it's baked into the prerendered HTML. Users see a skeleton instead of empty space.

**Implementation:**

```tsx
// [[...slug]]/loading.tsx
export default function Loading() {
  return (
    <main>
      <div className="animate-pulse">
        {/* Hero skeleton */}
        <div className="h-[70vh] bg-muted/30 rounded-xl" />
        {/* Content skeleton */}
        <div className="container mx-auto py-16 space-y-4">
          <div className="h-8 w-1/3 bg-muted/30 rounded" />
          <div className="h-4 w-2/3 bg-muted/30 rounded" />
          <div className="h-4 w-1/2 bg-muted/30 rounded" />
        </div>
      </div>
    </main>
  );
}
```

**Pros:** Simple, no architectural changes. The skeleton is part of the static shell.
**Cons:** Still shows a loading state — the flicker becomes a skeleton flash instead of empty space. On fast connections with warm cache, the skeleton may flash for <100ms.

---

## Approach 3: Remove Layout-Level Suspense, Use Page-Level Architecture

**How it works:**

Remove `<Suspense>` from the layout entirely. Instead, restructure the page so that:
- The page component itself is synchronous (no dynamic APIs at the top level)
- Dynamic data is fetched in child components wrapped in granular Suspense boundaries
- `"use cache"` is used on the data-fetching functions

This is the "push dynamic APIs deeper" pattern from the [blocking-route docs](https://nextjs.org/docs/messages/blocking-route#headers).

**Challenge:** With `cacheComponents`, even `await params` in the Page component without `generateStaticParams` requires Suspense. So this approach still needs either `generateStaticParams` (Approach 1) or a `loading.tsx` (Approach 2) to work.

---

## Approach 4: Disable PPR for This Route (`experimental_ppr = false`)

**Status: NOT COMPATIBLE with `cacheComponents`**

When `cacheComponents: true` is set in `next.config.ts`, it replaces the old `experimental.ppr` flag. The [migration docs](https://nextjs.org/docs/app/getting-started/cache-components#migrating-route-segment-configs) indicate that several route segment configs (including `dynamic`) are no longer supported with `cacheComponents`. The `experimental_ppr` per-route export was designed for `ppr: 'incremental'` mode, not for `cacheComponents: true`.

**Verdict:** This approach likely won't work. `cacheComponents` is all-or-nothing per the current docs.

---

## Approach 5: Stale-While-Revalidate at the UI Level

**Status: NOT AVAILABLE (no built-in mechanism)**

There is no Next.js API to render "the last cached version" as a Suspense fallback. The Suspense fallback must be a static React tree. React Server Components don't have a built-in stale-while-revalidate for UI shells.

The closest thing is `cacheLife` profiles with `stale` durations — but those apply to data caching, not to the Suspense fallback UI. With `revalidateTag(tag, "max")`, the data layer does SWR, but the initial page load still needs a Suspense boundary for the first visit.

---

## Known Bugs Affecting This

1. **`"use cache"` ignored in dynamic routes in production** ([#85240](https://github.com/vercel/next.js/issues/85240)) — Confirmed by Next.js team, labeled `linear: next`. In dev, `"use cache"` works on dynamic routes; in production builds, every request re-executes the component. This may affect Approach 1 if `"use cache"` is placed at the page level.

2. **Multi-tenant / runtime params with cache components** ([#85239](https://github.com/vercel/next.js/discussions/85239)) — Runtime params can't be passed into `"use cache"` functions. However, this doesn't affect our case since `getCachedPage(slug)` receives a plain string, not a dynamic API value.

---

## Recommended Strategy

**Combine Approaches 1 + 2 for defense-in-depth:**

1. Add `generateStaticParams` returning known page slugs (at minimum `[{ slug: undefined }]` for homepage). This removes the Suspense requirement for `await params` and prebuilds the homepage.

2. Move `draftMode()` out of the Page component and into a child component with its own Suspense boundary. The main render path uses only `getCachedPage()` (which has `"use cache"`).

3. Add a `loading.tsx` as a safety net — if any request is genuinely uncached (first visit to a new slug), users see a skeleton instead of empty space.

4. Optionally, populate `generateStaticParams` with all known page slugs from Payload at build time for full prerendering:
   ```tsx
   export async function generateStaticParams() {
     const payload = await getPayload({ config });
     const pages = await payload.find({ collection: 'pages', limit: 100 });
     const params = pages.docs.map(p => ({
       slug: p.slug === 'home' ? undefined : p.slug.split('/'),
     }));
     // Ensure at least one param
     return params.length > 0 ? params : [{ slug: undefined }];
   }
   ```

This combination means:
- **Known pages** (from `generateStaticParams`): Fully prerendered at build, zero flicker, instant load
- **Unknown pages** (first visit): `loading.tsx` skeleton flashes briefly, then content streams in and is cached
- **Draft mode**: Only the draft overlay streams; main content renders immediately from cache
- **Subsequent visits to any page**: Cached by `getCachedPage`, no Suspense flash

---

## Sources

- [Next.js: Uncached data outside Suspense](https://nextjs.org/docs/messages/blocking-route)
- [Next.js: Cache Components](https://nextjs.org/docs/app/getting-started/cache-components)
- [Next.js: Dynamic Routes with Cache Components](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes#with-cache-components)
- [Next.js: Empty generateStaticParams error](https://nextjs.org/docs/messages/empty-generate-static-params)
- [GitHub #85240: "use cache" ignored in dynamic routes](https://github.com/vercel/next.js/issues/85240)
- [GitHub #85608: Top-level data fetching with cacheComponents](https://github.com/vercel/next.js/discussions/85608)
- [GitHub #83445: Dynamic routes and PPR](https://github.com/vercel/next.js/discussions/83445)
- [GitHub #85239: Cache Components with params](https://github.com/vercel/next.js/discussions/85239)
- [Next.js: cacheLife function](https://nextjs.org/docs/app/api-reference/functions/cacheLife)
- [Next.js: loading.js convention](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
