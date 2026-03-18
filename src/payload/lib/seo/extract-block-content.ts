import type { Page } from "@/payload-types";

type LayoutBlock = NonNullable<Page["layout"]>[number];

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

function getBlockText(block: LayoutBlock): string | undefined {
  switch (block.blockType) {
    case "hero":
      return block.subtext;
    case "splitMedia":
      return block.rows?.[0]?.body;
    case "cinematicCta":
      return block.subtext;
    case "bento":
      return block.subtext;
    default:
      return undefined;
  }
}

/**
 * Walks layout blocks in order, returns the first non-empty plain text string.
 * Checks: Hero subtext, SplitMedia first row body, CinematicCta subtext,
 * Bento subtext, RichTextContent (skipped — rich text extraction is complex).
 * Returns max 160 chars trimmed to last complete sentence, or undefined.
 */
export function extractFirstTextFromBlocks(
  layout: LayoutBlock[] | null | undefined
): string | undefined {
  if (!layout?.length) {
    return undefined;
  }

  for (const block of layout) {
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

function getBlockImageId(block: LayoutBlock): number | undefined {
  switch (block.blockType) {
    case "hero":
      return resolveImageMediaId(
        block.mediaSrc as
          | number
          | { id: number; mimeType?: string | null }
          | null
      );
    case "splitMedia": {
      const row = block.rows?.[0];
      return row
        ? resolveImageMediaId(
            row.mediaSrc as
              | number
              | { id: number; mimeType?: string | null }
              | null
          )
        : undefined;
    }
    case "bento":
      return resolveImageMediaId(
        block.image?.src as
          | number
          | { id: number; mimeType?: string | null }
          | null
      );
    case "imageGallery": {
      const item = block.items?.[0];
      return item
        ? resolveImageMediaId(
            item.image as
              | number
              | { id: number; mimeType?: string | null }
              | null
          )
        : undefined;
    }
    default:
      return undefined;
  }
}

/**
 * Walks layout blocks in order, returns the first **raster image** media ID.
 * Skips videos and SVGs. Requires populated media relations (with mimeType).
 * Checks: Hero mediaSrc, SplitMedia first row mediaSrc, Bento image.src,
 * ImageGallery first item image.
 */
export function extractFirstImageFromBlocks(
  layout: LayoutBlock[] | null | undefined
): number | undefined {
  if (!layout?.length) {
    return undefined;
  }

  for (const block of layout) {
    const id = getBlockImageId(block);
    if (id) {
      return id;
    }
  }

  return undefined;
}
