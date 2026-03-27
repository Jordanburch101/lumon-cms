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

/** Check if a media value is a populated raster image object. */
function isPopulatedImage(
  value: unknown
): value is MediaLike & { id: number; url: string; mimeType: string } {
  if (!value || typeof value !== "object" || typeof value === "number") {
    return false;
  }
  const media = value as Record<string, unknown>;
  return (
    typeof media.mimeType === "string" &&
    IMAGE_MIME_RE.test(media.mimeType) &&
    typeof media.url === "string"
  );
}

/**
 * Resolve a media relation to its ID, but only if it's a raster image.
 * Skips videos, SVGs, and unpopulated relations (raw number IDs without
 * mimeType info are skipped since we can't verify they're images).
 */
function resolveImageMediaId(value: MediaLike | undefined): number | undefined {
  if (isPopulatedImage(value)) {
    return value.id;
  }
  return undefined;
}

/** Field names that typically hold media upload references. */
const MEDIA_FIELDS = ["mediaSrc", "image", "avatar", "icon"] as const;

type MediaLike =
  | number
  | {
      id: number;
      mimeType?: string | null;
      url?: string | null;
      width?: number | null;
      height?: number | null;
    }
  | null;

/** Populated image media with the fields needed for OG tags. */
export interface PopulatedImageMedia {
  height?: number | null;
  id: number;
  mimeType: string;
  url: string;
  width?: number | null;
}

/**
 * Generically find the first populated raster image from a block by scanning
 * common media field names. Returns the full media object (not just ID).
 */
function getBlockImage(block: AnyBlock): PopulatedImageMedia | undefined {
  const data = block as Record<string, unknown>;

  // Check top-level media fields
  for (const field of MEDIA_FIELDS) {
    const val = data[field];
    if (isPopulatedImage(val)) {
      return val;
    }
    // Check nested .src (e.g. bento.image.src)
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const nested = (val as Record<string, unknown>).src;
      if (isPopulatedImage(nested)) {
        return nested;
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
      if (isPopulatedImage(nested)) {
        return nested;
      }
    }
  }

  return undefined;
}

/**
 * Walks blocks in order, returns the first **raster image** media ID.
 * Skips videos, SVGs, and unpopulated relations.
 */
export function extractFirstImageFromBlocks(
  blocks: AnyBlock[] | null | undefined
): number | undefined {
  return extractFirstImageMediaFromBlocks(blocks)?.id;
}

/**
 * Walks blocks in order, returns the first populated raster image media object.
 * Use this when you need the full media (url, width, height) — e.g. for OG tags.
 */
export function extractFirstImageMediaFromBlocks(
  blocks: AnyBlock[] | null | undefined
): PopulatedImageMedia | undefined {
  if (!blocks?.length) {
    return undefined;
  }

  for (const block of blocks) {
    const media = getBlockImage(block);
    if (media) {
      return media;
    }
  }

  return undefined;
}
