import config from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
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

/**
 * Fetch any collection document by slug with caching and relationship tagging.
 * For collections other than pages that need cached frontend fetching.
 */
export async function getCachedDocument(collection: string, slug: string) {
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
  counts: { tags: number }
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
function tagResolvedRelationships(doc: unknown): void {
  const counts = { tags: 0 };
  walkNode(doc, new WeakSet<object>(), counts);

  if (counts.tags > 100) {
    console.warn(
      `[revalidation] High tag count (${counts.tags}) — approaching 128 limit`
    );
  }
}
