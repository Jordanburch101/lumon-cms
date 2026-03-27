import type { Page } from "@/payload-types";

type HeroBlock = NonNullable<Page["hero"]>[number];
type LayoutBlock = NonNullable<Page["layout"]>[number];
type AnyBlock = HeroBlock | LayoutBlock;

function truncateToSentence(text: string): string {
  if (text.length <= 160) {
    return text;
  }
  const truncated = text.slice(0, 160);
  const lastPeriod = truncated.lastIndexOf(".");
  return lastPeriod > 80
    ? truncated.slice(0, lastPeriod + 1)
    : `${truncated.trimEnd()}…`;
}

/** Field names to check for descriptive text, in priority order. */
const TEXT_FIELDS = ["subtext", "description", "body"] as const;

/**
 * Generically extract the first non-empty text string from a block by scanning
 * common field names. Also checks the first item of array fields (e.g. rows).
 * No switch statement — works automatically for any current or future block.
 */
function getBlockText(block: AnyBlock): string | undefined {
  const data = block as Record<string, unknown>;

  // Check top-level text fields
  for (const field of TEXT_FIELDS) {
    const val = data[field];
    if (typeof val === "string" && val.trim()) {
      return val;
    }
  }

  // Check first item of array fields (e.g. splitMedia.rows[0].body)
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (!Array.isArray(val) || val.length === 0) {
      continue;
    }
    const first = val[0] as Record<string, unknown> | undefined;
    if (!first || typeof first !== "object") {
      continue;
    }
    for (const field of TEXT_FIELDS) {
      const nested = first[field];
      if (typeof nested === "string" && nested.trim()) {
        return nested;
      }
    }
  }

  return undefined;
}

/**
 * Walks blocks in order, returns the first non-empty plain text string.
 * Generically scans common field names (subtext, description, body) on each
 * block and first items of array fields. No per-block-type switch needed.
 * Returns max 160 chars trimmed to last complete sentence, or undefined.
 */
export function extractFirstTextFromBlocks(
  blocks: AnyBlock[] | null | undefined
): string | undefined {
  if (!blocks?.length) {
    return undefined;
  }

  for (const block of blocks) {
    const text = getBlockText(block);
    if (text?.trim()) {
      return truncateToSentence(text.trim());
    }
  }

  return undefined;
}

const IMAGE_MIME_RE = /^image\/(?!svg\+xml)/;

/**
 * Resolve a media relation to its ID, but only if it's a raster image.
 * Skips videos, SVGs, and unpopulated relations (raw number IDs without
 * mimeType info are skipped since we can't verify they're images).
 */
function resolveImageMediaId(
  value: number | { id: number; mimeType?: string | null } | null | undefined
): number | undefined {
  if (!value) {
    return undefined;
  }
  if (typeof value === "number") {
    // Unpopulated — can't verify mimeType, skip to be safe
    return undefined;
  }
  if (!(value.mimeType && IMAGE_MIME_RE.test(value.mimeType))) {
    return undefined;
  }
  return value.id;
}

/** Field names that typically hold media upload references. */
const MEDIA_FIELDS = ["mediaSrc", "image", "avatar", "icon"] as const;

type MediaLike = number | { id: number; mimeType?: string | null } | null;

/**
 * Generically extract the first raster image ID from a block by scanning
 * common media field names. Checks top-level fields, nested `.src`, and
 * first items of array fields. No switch statement.
 */
function getBlockImageId(block: AnyBlock): number | undefined {
  const data = block as Record<string, unknown>;

  // Check top-level media fields
  for (const field of MEDIA_FIELDS) {
    const val = data[field];
    const resolved = resolveImageMediaId(val as MediaLike);
    if (resolved) {
      return resolved;
    }
    // Check nested .src (e.g. bento.image.src)
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const nested = (val as Record<string, unknown>).src;
      const nestedResolved = resolveImageMediaId(nested as MediaLike);
      if (nestedResolved) {
        return nestedResolved;
      }
    }
  }

  // Check first item of array fields
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (!Array.isArray(val) || val.length === 0) {
      continue;
    }
    const first = val[0] as Record<string, unknown> | undefined;
    if (!first || typeof first !== "object") {
      continue;
    }
    for (const field of MEDIA_FIELDS) {
      const nested = first[field];
      const resolved = resolveImageMediaId(nested as MediaLike);
      if (resolved) {
        return resolved;
      }
    }
  }

  return undefined;
}

/**
 * Walks blocks in order, returns the first **raster image** media ID.
 * Generically scans common media field names (mediaSrc, image, avatar, icon)
 * including nested .src and first items of array fields.
 * Skips videos, SVGs, and unpopulated relations.
 */
export function extractFirstImageFromBlocks(
  blocks: AnyBlock[] | null | undefined
): number | undefined {
  if (!blocks?.length) {
    return undefined;
  }

  for (const block of blocks) {
    const id = getBlockImageId(block);
    if (id) {
      return id;
    }
  }

  return undefined;
}
