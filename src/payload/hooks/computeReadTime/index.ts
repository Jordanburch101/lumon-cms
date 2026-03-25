import type { CollectionBeforeChangeHook } from "payload";

const WHITESPACE_RE = /\s+/;

/**
 * Walk Lexical editor JSON to extract all text content, then
 * compute read time at ~200 words per minute.
 */
function countWords(node: unknown): number {
  if (!node || typeof node !== "object") {
    return 0;
  }

  const n = node as Record<string, unknown>;
  let count = 0;

  // Lexical text nodes have a "text" property
  if (typeof n.text === "string") {
    count += n.text.split(WHITESPACE_RE).filter(Boolean).length;
  }

  // Recurse into children
  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      count += countWords(child);
    }
  }

  // Lexical root has children under root.children
  if (n.root && typeof n.root === "object") {
    count += countWords(n.root);
  }

  return count;
}

export const computeReadTime: CollectionBeforeChangeHook = ({ data }) => {
  if (!data?.body) {
    return data;
  }

  const words = countWords(data.body);
  const minutes = Math.max(1, Math.ceil(words / 200));

  return {
    ...data,
    readTime: minutes,
  };
};
