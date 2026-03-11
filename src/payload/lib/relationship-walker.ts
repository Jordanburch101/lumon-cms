import { cacheTag } from "next/cache";

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
export function tagResolvedRelationships(doc: unknown): void {
  const counts = { tags: 0 };
  walkNode(doc, new WeakSet<object>(), counts);

  if (counts.tags > 100) {
    console.warn(
      `[revalidation] High tag count (${counts.tags}) — approaching 128 limit`
    );
  }
}
