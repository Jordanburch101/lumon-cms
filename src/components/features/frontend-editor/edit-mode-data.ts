/**
 * Pure, immutable data helpers for edit mode operations.
 * These do not depend on React — they transform plain objects.
 */

// biome-ignore lint/suspicious/noExplicitAny: Dynamic path traversal over arbitrary block shapes requires any.
type BlockRecord = Record<string, any>;

/** Read a value from a block at a dot-notation path. */
export function getFieldValue(block: BlockRecord, path: string): unknown {
  const segments = path.split(".");
  let current: unknown = block;
  for (const seg of segments) {
    if (current == null) {
      return undefined;
    }
    const index = Number(seg);
    const rec = current as BlockRecord;
    current = Number.isNaN(index) ? rec[seg] : rec[index];
  }
  return current;
}

/** Immutably set a value on a block at a dot-notation path. */
export function setFieldValue<T extends BlockRecord>(
  block: T,
  path: string,
  value: unknown
): T {
  const segments = path.split(".");
  if (segments.length === 0) {
    return block;
  }

  const clone = structuredClone(block);
  let current: BlockRecord = clone;

  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    const index = Number(seg);
    const key = Number.isNaN(index) ? seg : index;

    // Create missing intermediary objects/arrays along the path
    if (current[key] == null || typeof current[key] !== "object") {
      const nextSeg = segments[i + 1];
      current[key] = Number.isNaN(Number(nextSeg)) ? {} : [];
    }

    current = current[key] as BlockRecord;
  }

  const lastSeg = segments.at(-1) as string;
  const lastIndex = Number(lastSeg);
  if (Number.isNaN(lastIndex)) {
    current[lastSeg] = value;
  } else {
    current[lastIndex] = value;
  }

  return clone;
}

/** Move a block from one index to another. Returns a new array. */
export function moveBlock<T>(blocks: T[], from: number, to: number): T[] {
  if (to < 0 || to >= blocks.length || from === to) {
    return blocks;
  }
  const copy = [...blocks];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

/** Remove a block by index. Returns a new array. */
export function removeBlock<T>(blocks: T[], index: number): T[] {
  return blocks.filter((_, i) => i !== index);
}

/** Duplicate a block at the given index, inserting the clone after it. */
export function duplicateBlock(
  blocks: BlockRecord[],
  index: number
): BlockRecord[] {
  const copy = [...blocks];
  const original = blocks[index];
  const clone = structuredClone(original);
  clone.id = crypto.randomUUID();
  copy.splice(index + 1, 0, clone);
  return copy;
}

/** Move an item within a block's array field. */
export function moveArrayItem<T extends BlockRecord>(
  block: T,
  arrayPath: string,
  from: number,
  to: number
): T {
  const arr = getFieldValue(block, arrayPath);
  if (!Array.isArray(arr) || to < 0 || to >= arr.length) {
    return block;
  }
  const moved = moveBlock(arr, from, to);
  return setFieldValue(block, arrayPath, moved);
}

/** Remove an item from a block's array field. */
export function removeArrayItem<T extends BlockRecord>(
  block: T,
  arrayPath: string,
  index: number
): T {
  const arr = getFieldValue(block, arrayPath);
  if (!Array.isArray(arr)) {
    return block;
  }
  return setFieldValue(block, arrayPath, removeBlock(arr, index));
}

/** Add an item to a block's array field. */
export function addArrayItem<T extends BlockRecord>(
  block: T,
  arrayPath: string,
  item: BlockRecord
): T {
  const arr = getFieldValue(block, arrayPath);
  if (!Array.isArray(arr)) {
    return block;
  }
  return setFieldValue(block, arrayPath, [...arr, item]);
}

/** Matches common video file extensions. */
export const RE_VIDEO_EXT = /\.(mp4|webm|mov|avi|mkv)(\?|$)/i;

const RE_HUMANIZE_CAMEL = /([a-z])([A-Z])/g;
const RE_HUMANIZE_FIRST = /^./;
const RE_DIGITS_ONLY = /^\d+$/;

/** Humanize a single camelCase segment into title case. */
function humanizeSegment(segment: string): string {
  return segment
    .replace(RE_HUMANIZE_CAMEL, "$1 $2")
    .replace(RE_HUMANIZE_FIRST, (c) => c.toUpperCase());
}

/** Convert a dot-path like "primaryCta.label" to a short readable label (last segment only). */
export function humanizeFieldPath(path: string): string {
  const parts = path.split(".");
  let label = parts.at(-1) ?? path;
  if (RE_DIGITS_ONLY.test(label) && parts.length > 1) {
    label = parts.at(-2) ?? label;
  }
  return humanizeSegment(label);
}

/** Convert a dot-path to a full breadcrumb like "Primary Cta > Label", skipping numeric indices. */
export function humanizeFullPath(path: string): string {
  return path
    .split(".")
    .filter((s) => !RE_DIGITS_ONLY.test(s))
    .map(humanizeSegment)
    .join(" \u203A ");
}
