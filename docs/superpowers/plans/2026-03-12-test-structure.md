# Test Structure Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add unit tests for the revalidation system (relationship walker + hook factory) using Bun's built-in test runner.

**Architecture:** Extract the relationship walker into its own module for testability (cached-payload.ts uses `'use cache'` which can't run in tests). Mock `next/cache` with `mock.module()` to intercept `cacheTag`/`revalidateTag` calls. Two colocated test files.

**Tech Stack:** Bun test runner, `mock.module()` for mocking, no additional dependencies.

**Spec:** `docs/superpowers/specs/2026-03-12-test-structure-design.md`

---

## Chunk 1: Infrastructure + Extraction

### Task 1: Add test scripts to package.json

**Files:**
- Modify: `package.json:5-13` (scripts section)

- [ ] **Step 1: Add test and test:watch scripts**

Add after the existing `generate:types` script:

```json
"test": "bun test",
"test:watch": "bun test --watch"
```

- [ ] **Step 2: Verify bun test runs (no tests yet)**

Run: `bun test`
Expected: "0 pass, 0 fail" or similar empty result.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add test and test:watch scripts"
```

---

### Task 2: Extract relationship walker from cached-payload.ts

**Files:**
- Create: `src/payload/lib/relationship-walker.ts`
- Modify: `src/payload/lib/cached-payload.ts`

The walker is currently embedded in `cached-payload.ts` which uses `'use cache'` — a Next.js runtime directive that cannot run in unit tests. Extract the walker into its own module.

- [ ] **Step 1: Create `src/payload/lib/relationship-walker.ts`**

Move from `cached-payload.ts`: `AnyObject` type, `isObject`, `resolveCollection`, `walkNode`, `tagResolvedRelationships`. Export only `tagResolvedRelationships`.

```typescript
import { cacheTag } from "next/cache";

type AnyObject = Record<string, unknown>;

function isObject(value: unknown): value is AnyObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Detect the collection name for a populated relationship or upload object. */
function resolveCollection(obj: AnyObject): string | undefined {
  if (typeof obj.id !== "number") {
    return undefined;
  }
  if (typeof obj.relationTo === "string") {
    return obj.relationTo;
  }
  if (typeof obj.url === "string" && typeof obj.mimeType === "string") {
    return "media";
  }
  return undefined;
}

/** Walk one node, tagging any resolved relation, then recurse into children. */
function walkNode(
  value: unknown,
  seen: WeakSet<object>,
  counts: { tags: number },
): void {
  if (value === null || value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      walkNode(item, seen, counts);
    }
    return;
  }

  if (!isObject(value)) {
    return;
  }

  if (seen.has(value)) {
    return;
  }
  seen.add(value);

  const collection = resolveCollection(value);
  if (collection) {
    cacheTag(`doc:${collection}:${value.id}`);
    counts.tags++;
  }

  for (const key of Object.keys(value)) {
    walkNode(value[key], seen, counts);
  }
}

/**
 * Walk a resolved Payload document and call `cacheTag` for every
 * populated relationship or upload found.
 *
 * Detection:
 * - Relationship fields: objects with numeric `id` + string `relationTo`
 * - Upload fields (Media): objects with numeric `id` + string `url` + string `mimeType`
 */
export function tagResolvedRelationships(doc: unknown): void {
  const counts = { tags: 0 };
  walkNode(doc, new WeakSet<object>(), counts);

  if (counts.tags > 100) {
    console.warn(
      `[revalidation] High tag count (${counts.tags}) — approaching 128 limit`,
    );
  }
}
```

- [ ] **Step 2: Update `cached-payload.ts`**

Remove the walker code (lines 46-122) and import from the new module. The file should become:

```typescript
import config from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import { tagResolvedRelationships } from "./relationship-walker";

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
    cacheTag("collection:pages", `doc:pages:${page.id}`);
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
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Verify lint passes**

Run: `bun check`
Expected: No new errors in `src/payload/lib/`.

- [ ] **Step 5: Commit**

```bash
git add src/payload/lib/relationship-walker.ts src/payload/lib/cached-payload.ts
git commit -m "refactor: extract relationship walker into its own module"
```

---

## Chunk 2: Unit Tests

### Task 3: Write relationship walker tests

**Files:**
- Create: `src/payload/lib/relationship-walker.test.ts`

**Important:** `mock.module()` must be called before importing the module under test. Use `await import(...)` for the module under test, not a static import.

- [ ] **Step 1: Write the test file**

```typescript
import { mock, describe, it, expect, beforeEach, spyOn } from "bun:test";

const taggedValues: string[] = [];

mock.module("next/cache", () => ({
  cacheTag: (...tags: string[]) => {
    taggedValues.push(...tags);
  },
  cacheLife: (_profile: string) => {},
}));

const { tagResolvedRelationships } = await import("./relationship-walker");

describe("tagResolvedRelationships", () => {
  beforeEach(() => {
    taggedValues.length = 0;
  });

  it("tags a simple relationship field", () => {
    tagResolvedRelationships({
      id: 1,
      relationTo: "team-members",
      name: "Irving",
    });
    expect(taggedValues).toEqual(["doc:team-members:1"]);
  });

  it("tags a media upload field", () => {
    tagResolvedRelationships({
      id: 5,
      url: "/media/photo.jpg",
      mimeType: "image/jpeg",
      alt: "Photo",
    });
    expect(taggedValues).toEqual(["doc:media:5"]);
  });

  it("tags nested relations inside blocks", () => {
    tagResolvedRelationships({
      id: 10,
      title: "Page",
      layout: [
        {
          blockType: "hero",
          image: {
            id: 3,
            url: "/media/hero.jpg",
            mimeType: "image/jpeg",
          },
        },
      ],
    });
    expect(taggedValues).toContain("doc:media:3");
  });

  it("tags multiple relations", () => {
    tagResolvedRelationships({
      id: 10,
      title: "Page",
      hero: { id: 1, url: "/a.jpg", mimeType: "image/jpeg" },
      author: { id: 2, relationTo: "users" },
      gallery: [
        { id: 3, url: "/b.jpg", mimeType: "image/png" },
        { id: 4, url: "/c.jpg", mimeType: "image/jpeg" },
      ],
      reviewer: { id: 5, relationTo: "users" },
    });
    expect(taggedValues).toHaveLength(5);
    expect(taggedValues).toContain("doc:media:1");
    expect(taggedValues).toContain("doc:users:2");
    expect(taggedValues).toContain("doc:media:3");
    expect(taggedValues).toContain("doc:media:4");
    expect(taggedValues).toContain("doc:users:5");
  });

  it("handles circular references without infinite loop", () => {
    const a: Record<string, unknown> = {
      id: 1,
      relationTo: "nodes",
    };
    const b: Record<string, unknown> = {
      id: 2,
      relationTo: "nodes",
      ref: a,
    };
    a.ref = b;

    tagResolvedRelationships({ root: a });
    expect(taggedValues).toContain("doc:nodes:1");
    expect(taggedValues).toContain("doc:nodes:2");
    expect(taggedValues).toHaveLength(2);
  });

  it("does not tag objects without relationTo or url+mimeType", () => {
    tagResolvedRelationships({
      id: 99,
      title: "Just a page",
      slug: "home",
      nested: { id: 50, name: "plain object" },
    });
    expect(taggedValues).toEqual([]);
  });

  it("tags array of relations", () => {
    tagResolvedRelationships({
      members: [
        { id: 1, relationTo: "users" },
        { id: 2, relationTo: "users" },
      ],
    });
    expect(taggedValues).toEqual(["doc:users:1", "doc:users:2"]);
  });

  it("tags deeply nested relations", () => {
    tagResolvedRelationships({
      a: { b: { c: { d: { e: { id: 7, relationTo: "deep" } } } } },
    });
    expect(taggedValues).toEqual(["doc:deep:7"]);
  });

  it("warns when tag count exceeds 100", () => {
    const warnSpy = spyOn(console, "warn").mockImplementation(() => {});

    const relations: Record<string, unknown> = {};
    for (let i = 0; i < 101; i++) {
      relations[`rel${i}`] = { id: i, relationTo: "items" };
    }
    tagResolvedRelationships(relations);

    expect(taggedValues).toHaveLength(101);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain("High tag count");

    warnSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `bun test src/payload/lib/relationship-walker.test.ts`
Expected: 9 pass, 0 fail.

- [ ] **Step 3: Run lint on test file**

Run: `bunx biome check src/payload/lib/relationship-walker.test.ts`
Expected: No errors. If lint issues, fix them.

- [ ] **Step 4: Commit**

```bash
git add src/payload/lib/relationship-walker.test.ts
git commit -m "test: add relationship walker unit tests"
```

---

### Task 4: Write revalidateOnChange hook tests

**Files:**
- Create: `src/payload/hooks/revalidateOnChange.test.ts`

**Important:** Same `mock.module()` + dynamic import pattern. The hook calls `revalidateTag(tag, "default")` — assertions must check both arguments.

- [ ] **Step 1: Write the test file**

```typescript
import { mock, describe, it, expect, beforeEach } from "bun:test";

const revalidatedTags: Array<{ tag: string; profile: string }> = [];

mock.module("next/cache", () => ({
  revalidateTag: (tag: string, profile: string) => {
    revalidatedTags.push({ tag, profile });
  },
}));

const { revalidateOnChange } = await import("./revalidateOnChange");

/** Minimal stub matching what the hook destructures */
function makeHookArgs(
  overrides: {
    id?: number;
    collectionSlug?: string;
    disableRevalidate?: boolean;
  } = {},
) {
  const doc = { id: overrides.id ?? 1 };
  return {
    doc,
    collection: { slug: overrides.collectionSlug ?? "pages" },
    req: {
      payload: {
        logger: { info: () => {} },
      },
      context: {
        disableRevalidate: overrides.disableRevalidate ?? false,
      },
    },
  } as Parameters<ReturnType<typeof revalidateOnChange>["afterChange"]>[0];
}

describe("revalidateOnChange", () => {
  beforeEach(() => {
    revalidatedTags.length = 0;
  });

  describe("afterChange", () => {
    it("fires doc and collection tags", () => {
      const { afterChange } = revalidateOnChange();
      afterChange(makeHookArgs({ id: 42, collectionSlug: "pages" }));

      expect(revalidatedTags).toEqual([
        { tag: "doc:pages:42", profile: "default" },
        { tag: "collection:pages", profile: "default" },
      ]);
    });

    it("skips revalidation when disableRevalidate is true", () => {
      const { afterChange } = revalidateOnChange();
      afterChange(makeHookArgs({ disableRevalidate: true }));

      expect(revalidatedTags).toHaveLength(0);
    });

    it("fires custom static tags", () => {
      const { afterChange } = revalidateOnChange({ tags: ["nav", "footer"] });
      afterChange(makeHookArgs({ id: 1, collectionSlug: "pages" }));

      expect(revalidatedTags).toEqual([
        { tag: "doc:pages:1", profile: "default" },
        { tag: "collection:pages", profile: "default" },
        { tag: "nav", profile: "default" },
        { tag: "footer", profile: "default" },
      ]);
    });

    it("returns the document", () => {
      const { afterChange } = revalidateOnChange();
      const args = makeHookArgs({ id: 1 });
      const result = afterChange(args);

      expect(result).toEqual({ id: 1 });
    });
  });

  describe("afterDelete", () => {
    it("fires doc and collection tags", () => {
      const { afterDelete } = revalidateOnChange();
      afterDelete(
        makeHookArgs({ id: 7, collectionSlug: "media" }) as Parameters<
          ReturnType<typeof revalidateOnChange>["afterDelete"]
        >[0],
      );

      expect(revalidatedTags).toEqual([
        { tag: "doc:media:7", profile: "default" },
        { tag: "collection:media", profile: "default" },
      ]);
    });

    it("skips revalidation when disableRevalidate is true", () => {
      const { afterDelete } = revalidateOnChange();
      afterDelete(
        makeHookArgs({ disableRevalidate: true }) as Parameters<
          ReturnType<typeof revalidateOnChange>["afterDelete"]
        >[0],
      );

      expect(revalidatedTags).toHaveLength(0);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `bun test src/payload/hooks/revalidateOnChange.test.ts`
Expected: 6 pass, 0 fail.

- [ ] **Step 3: Run all tests together**

Run: `bun test`
Expected: 15 pass, 0 fail (9 walker + 6 hook).

- [ ] **Step 4: Run lint on test file**

Run: `bunx biome check src/payload/hooks/revalidateOnChange.test.ts`
Expected: No errors. If lint issues, fix them.

- [ ] **Step 5: Commit**

```bash
git add src/payload/hooks/revalidateOnChange.test.ts
git commit -m "test: add revalidateOnChange hook unit tests"
```

---

### Task 5: Final verification

- [ ] **Step 1: Run full test suite**

Run: `bun test`
Expected: All 15 tests pass.

- [ ] **Step 2: Run TypeScript check**

Run: `bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Run lint**

Run: `bun check`
Expected: No new errors.
