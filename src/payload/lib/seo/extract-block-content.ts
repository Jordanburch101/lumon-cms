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

function resolveMediaId(
  value: number | { id: number } | null | undefined
): number | undefined {
  if (!value) {
    return undefined;
  }
  if (typeof value === "object") {
    return value.id;
  }
  return value;
}

function getBlockImageId(block: LayoutBlock): number | undefined {
  switch (block.blockType) {
    case "hero":
      return resolveMediaId(block.mediaSrc as number | { id: number } | null);
    case "splitMedia": {
      const row = block.rows?.[0];
      return row
        ? resolveMediaId(row.mediaSrc as number | { id: number } | null)
        : undefined;
    }
    case "bento":
      return resolveMediaId(block.image?.src as number | { id: number } | null);
    case "imageGallery": {
      const item = block.items?.[0];
      return item
        ? resolveMediaId(item.image as number | { id: number } | null)
        : undefined;
    }
    default:
      return undefined;
  }
}

/**
 * Walks layout blocks in order, returns the first media ID found.
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
