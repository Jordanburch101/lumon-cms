import type { Block, Field } from "payload";
import type {
  ArrayFieldDescriptor,
  BlockFieldMap,
  BlockMeta,
  BlockMetaMap,
  FieldDescriptor,
  FieldMap,
} from "./types";

/** Field types that are skipped (not editable on frontend). */
const SKIP_TYPES = new Set(["richText", "ui", "join"]);

/** Layout-only field types whose children are unwrapped. */
const LAYOUT_TYPES = new Set(["row", "collapsible"]);

/** Structural types handled by recursive walk — not leaf descriptors. */
const STRUCTURAL_TYPES = new Set(["group", "array", "blocks", "tabs"]);

/** Apply common boolean flags (required, hasMany, localized) to a descriptor. */
function applyFlags(desc: FieldDescriptor, field: Field): void {
  if ("required" in field && field.required) {
    desc.required = true;
  }
  if ("hasMany" in field && field.hasMany) {
    desc.hasMany = true;
  }
  if ("localized" in field && field.localized) {
    desc.localized = true;
  }
}

/** Apply number-specific constraints (min, max). */
function applyNumberConstraints(desc: FieldDescriptor, field: Field): void {
  if ("min" in field && field.min != null) {
    desc.min = field.min as number;
  }
  if ("max" in field && field.max != null) {
    desc.max = field.max as number;
  }
}

/** Apply text/textarea length constraints. */
function applyTextConstraints(desc: FieldDescriptor, field: Field): void {
  if ("minLength" in field && field.minLength != null) {
    desc.minLength = field.minLength as number;
  }
  if ("maxLength" in field && field.maxLength != null) {
    desc.maxLength = field.maxLength as number;
  }
}

/** Apply select/radio options. */
function applyOptions(desc: FieldDescriptor, field: Field): void {
  if (!("options" in field && Array.isArray(field.options))) {
    return;
  }
  desc.options = field.options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );
}

/**
 * Extract a FieldDescriptor from a Payload field definition.
 * Returns null for skipped or structural types (those are handled elsewhere).
 */
function extractDescriptor(field: Field): FieldDescriptor | null {
  if (!("type" in field)) {
    return null;
  }
  if (SKIP_TYPES.has(field.type)) {
    return null;
  }
  if (LAYOUT_TYPES.has(field.type)) {
    return null;
  }
  if (STRUCTURAL_TYPES.has(field.type)) {
    return null;
  }

  const desc: FieldDescriptor = { type: field.type as FieldDescriptor["type"] };

  applyFlags(desc, field);

  if (field.type === "number") {
    applyNumberConstraints(desc, field);
  }
  if (field.type === "text" || field.type === "textarea") {
    applyTextConstraints(desc, field);
  }
  if (field.type === "select" || field.type === "radio") {
    applyOptions(desc, field);
  }
  if (
    (field.type === "upload" || field.type === "relationship") &&
    "relationTo" in field
  ) {
    desc.relationTo = field.relationTo;
  }

  return desc;
}

/** Walk tabs field, unwrapping named tabs as group prefixes. */
function walkTabs(
  field: Field & { type: "tabs" },
  prefix: string,
  map: BlockFieldMap
): void {
  if (!("tabs" in field)) {
    return;
  }
  for (const tab of field.tabs) {
    const tabPrefix =
      "name" in tab && tab.name ? `${prefix}${tab.name}.` : prefix;
    Object.assign(map, walkFields(tab.fields, tabPrefix));
  }
}

/** Build an ArrayFieldDescriptor from a Payload array field. */
function buildArrayDescriptor(
  field: Field & { type: "array" }
): ArrayFieldDescriptor {
  const entry: ArrayFieldDescriptor = {
    type: "array",
    fields: walkFields(field.fields),
  };
  if ("minRows" in field && field.minRows != null) {
    entry.minRows = field.minRows;
  }
  if ("maxRows" in field && field.maxRows != null) {
    entry.maxRows = field.maxRows;
  }
  return entry;
}

/**
 * Process a single named field and merge the result into map.
 * Handles group (dot-flatten), array (descriptor), and leaf fields.
 */
function processNamedField(
  field: Field,
  key: string,
  map: BlockFieldMap
): void {
  if (field.type === "group") {
    Object.assign(map, walkFields(field.fields, `${key}.`));
    return;
  }
  if (field.type === "array") {
    map[key] = buildArrayDescriptor(field);
    return;
  }
  const desc = extractDescriptor(field);
  if (desc) {
    map[key] = desc;
  }
}

/**
 * Recursively walk a Payload fields array and produce a flat BlockFieldMap.
 * Groups are flattened with dot notation. Arrays produce ArrayFieldDescriptor.
 */
function walkFields(fields: Field[], prefix = ""): BlockFieldMap {
  const map: BlockFieldMap = {};

  for (const field of fields) {
    if (!("type" in field)) {
      continue;
    }
    if (SKIP_TYPES.has(field.type)) {
      continue;
    }

    if (LAYOUT_TYPES.has(field.type)) {
      if ("fields" in field && Array.isArray(field.fields)) {
        Object.assign(map, walkFields(field.fields, prefix));
      }
      continue;
    }

    if (field.type === "tabs") {
      walkTabs(field, prefix, map);
      continue;
    }

    if (!("name" in field && field.name)) {
      continue;
    }
    processNamedField(field, `${prefix}${field.name}`, map);
  }

  return map;
}

/** Introspect a single Payload block. */
export function introspectBlock(block: Block): {
  fields: BlockFieldMap;
  meta: BlockMeta;
} {
  return {
    fields: walkFields(block.fields),
    meta: {
      label:
        typeof block.labels?.singular === "string"
          ? block.labels.singular
          : block.slug,
      slug: block.slug,
    },
  };
}

/** Introspect multiple blocks into a FieldMap and BlockMetaMap. */
export function introspectBlocks(blocks: Block[]): {
  fieldMap: FieldMap;
  blockMeta: BlockMetaMap;
} {
  const fieldMap: FieldMap = {};
  const blockMeta: BlockMetaMap = {};

  for (const block of blocks) {
    const result = introspectBlock(block);
    fieldMap[block.slug] = result.fields;
    blockMeta[block.slug] = result.meta;
  }

  return { fieldMap, blockMeta };
}
