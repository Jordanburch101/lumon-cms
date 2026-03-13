import { fieldMap } from "@/generated/field-map";
import type {
  ArrayFieldDescriptor,
  FieldEntry,
} from "@/payload/lib/field-map/types";
import type { LayoutBlock } from "@/types/block-types";

/**
 * Produce a default empty value for a single field entry.
 * Arrays recurse to produce a single empty item with the array's field defaults.
 */
function defaultValue(entry: FieldEntry): unknown {
  if (entry.type === "array") {
    return [];
  }
  switch (entry.type) {
    case "number":
      return 0;
    case "checkbox":
      return false;
    case "date":
      return null;
    case "upload":
    case "relationship":
      return null;
    default:
      // text, textarea, email, select, radio, code, json, point
      return "";
  }
}

/**
 * Recursively set a nested value at a dot-notation path in an object.
 */
function setNested(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const parts = path.split(".");
  let cursor: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof cursor[part] !== "object" || cursor[part] === null) {
      cursor[part] = {};
    }
    cursor = cursor[part] as Record<string, unknown>;
  }
  const last = parts.at(-1);
  if (!last) {
    return;
  }
  // Only set if not already defined (first-key-wins for nested conflicts)
  if (!(last in cursor)) {
    cursor[last] = value;
  }
}

/**
 * Build a correctly-shaped empty block for the given block slug.
 *
 * - text fields → ""
 * - number fields → 0
 * - checkbox fields → false
 * - array fields → []
 * - upload/relationship → null
 * - Always includes `id` (UUID) and `blockType` (slug)
 */
export function createDefaultBlock(slug: string): LayoutBlock {
  const fields = fieldMap[slug as keyof typeof fieldMap];

  const payload: Record<string, unknown> = {
    id: crypto.randomUUID(),
    blockType: slug,
  };

  if (!fields) {
    return payload as unknown as LayoutBlock;
  }

  for (const [key, entry] of Object.entries(fields)) {
    if ((entry as ArrayFieldDescriptor).type === "array") {
      // Array fields map directly
      payload[key] = [];
    } else if (key.includes(".")) {
      // Dot-notation path — expand into nested object
      setNested(payload, key, defaultValue(entry));
    } else if (!(key in payload)) {
      payload[key] = defaultValue(entry);
    }
  }

  return payload as unknown as LayoutBlock;
}
