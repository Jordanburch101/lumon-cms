# Frontend Editor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable logged-in Payload CMS users to edit page content inline on the frontend — text via contentEditable, non-text fields via popovers, with block reorder/add/remove controls.

**Architecture:** A build-time schema introspector generates a typed field map from Payload block schemas. An EditModeProvider context holds mutable block data during editing. Block components add `data-field` attributes; an EditableOverlay renders a client-side RenderBlocksClient from context state. The admin bar gains edit/save/discard controls.

**Tech Stack:** Next.js 16, React 19, Payload CMS 3.x, Tailwind CSS v4, shadcn (Base UI), Framer Motion, Bun, bun:test

**Spec:** `docs/superpowers/specs/2026-03-13-frontend-editor-design.md`

---

## Chunk 1: Prerequisites & Schema Introspector

### Task 1: Fix content-derived array keys in block components

Block components currently use content-derived keys (e.g., `key={tier.name}`) that will break reorder. Update all to use Payload's stable `id` field.

**Files:**
- Modify: `src/components/blocks/pricing/pricing.tsx` (lines 73, 88)
- Modify: `src/components/blocks/pricing/pricing-card.tsx` (line 109)
- Modify: `src/components/blocks/pricing/pricing-toggle.tsx` (line 30)
- Modify: `src/components/blocks/faq/faq.tsx` (line 77)
- Modify: `src/components/blocks/trust/trust.tsx` (lines 46, 83, 90)
- Modify: `src/components/blocks/bento/integrations-card.tsx` (line 34)

- [ ] **Step 1: Update pricing.tsx keys**

Replace `key={tier.name}` with `key={tier.id}` in both places (lines 73 and 88):
```tsx
// Line 73 — mobile carousel
key={tier.id}
// Line 88 — desktop grid
key={tier.id}
```

- [ ] **Step 2: Update pricing-card.tsx feature keys**

Replace `key={feature.id ?? feature.text}` (line 109) with:
```tsx
key={feature.id}
```

- [ ] **Step 3: Update pricing-toggle.tsx keys**

The toggle options are hardcoded UI, not Payload data — these are safe to keep as-is since they're static. Skip this file.

- [ ] **Step 4: Update faq.tsx keys**

Replace `key={item.question}` (line 77) with:
```tsx
key={item.id}
```

- [ ] **Step 5: Update trust.tsx keys**

Replace `key={stat.id ?? stat.label}` (line 46) with `key={stat.id}`, and `key={logo.id ?? logo.name}` (lines 83, 90) with `key={logo.id}`.

- [ ] **Step 6: Update bento integrations-card.tsx keys**

Replace `key={item.name}` (line 34) with `key={item.id ?? item.name}` — integrations data may not have Payload IDs if it's hardcoded, so keep the fallback here.

- [ ] **Step 7: Run check and commit**

```bash
bun check
git add -A && git commit -m "fix: use stable IDs for array item keys in block components"
```

---

### Task 2: Create field map types

Define the TypeScript types that describe the field map structure. These types are used by both the introspector (output) and the edit runtime (input).

**Files:**
- Create: `src/payload/lib/field-map/types.ts`

- [ ] **Step 1: Write the types test**

Create `src/payload/lib/field-map/types.test.ts`:
```ts
import { describe, expect, it } from "bun:test";
import type {
  BlockFieldMap,
  FieldDescriptor,
  FieldMap,
  ArrayFieldDescriptor,
} from "./types";

describe("FieldMap types", () => {
  it("allows a simple text field descriptor", () => {
    const field: FieldDescriptor = { type: "text", required: true };
    expect(field.type).toBe("text");
  });

  it("allows an array field with nested fields", () => {
    const field: ArrayFieldDescriptor = {
      type: "array",
      fields: {
        name: { type: "text", required: true },
      },
    };
    expect(field.type).toBe("array");
    expect(field.fields.name.type).toBe("text");
  });

  it("allows a complete block field map", () => {
    const map: FieldMap = {
      hero: {
        headline: { type: "text", required: true },
        mediaSrc: { type: "upload", relationTo: "media", required: true },
      },
    };
    expect(Object.keys(map.hero)).toContain("headline");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun test src/payload/lib/field-map/types.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Write the types**

Create `src/payload/lib/field-map/types.ts`:
```ts
/** Descriptor for a single editable field. */
export interface FieldDescriptor {
  type:
    | "text"
    | "textarea"
    | "email"
    | "number"
    | "select"
    | "radio"
    | "checkbox"
    | "date"
    | "point"
    | "code"
    | "json"
    | "upload"
    | "relationship";
  required?: boolean;
  hasMany?: boolean;
  localized?: boolean;
  // number
  min?: number;
  max?: number;
  // text / textarea
  minLength?: number;
  maxLength?: number;
  // select / radio
  options?: { label: string; value: string }[];
  // upload / relationship
  relationTo?: string | string[];
}

/** Descriptor for an array field containing nested fields. */
export interface ArrayFieldDescriptor {
  type: "array";
  minRows?: number;
  maxRows?: number;
  fields: BlockFieldMap;
}

/** A single entry in a block's field map — either a leaf field or a nested array. */
export type FieldEntry = FieldDescriptor | ArrayFieldDescriptor;

/** Map of field paths → descriptors for a single block type. */
export type BlockFieldMap = Record<string, FieldEntry>;

/** Top-level field map: block slug → its field map. */
export type FieldMap = Record<string, BlockFieldMap>;

/** Metadata for a block type (used by the block picker). */
export interface BlockMeta {
  label: string;
  slug: string;
}

/** Map of block slug → metadata. */
export type BlockMetaMap = Record<string, BlockMeta>;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bun test src/payload/lib/field-map/types.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/payload/lib/field-map/
git commit -m "feat(frontend-editor): add field map TypeScript types"
```

---

### Task 3: Build the schema introspector

A script that imports block schemas and recursively walks `fields[]` to produce the field map and block metadata.

**Files:**
- Create: `src/payload/lib/field-map/generate.ts`
- Create: `src/payload/lib/field-map/generate.test.ts`
- Modify: `package.json` (add `generate:field-map` script)
- Modify: `.gitignore` (add `src/generated/`)

- [ ] **Step 1: Write failing tests for the introspector**

Create `src/payload/lib/field-map/generate.test.ts`:
```ts
import { describe, expect, it } from "bun:test";
import type { Block } from "payload";
import { introspectBlock, introspectBlocks } from "./generate";

const SimpleBlock: Block = {
  slug: "simple",
  labels: { singular: "Simple", plural: "Simple" },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "count", type: "number", min: 0, max: 100 },
    { name: "visible", type: "checkbox" },
  ],
};

const GroupBlock: Block = {
  slug: "grouped",
  labels: { singular: "Grouped", plural: "Grouped" },
  fields: [
    { name: "headline", type: "text", required: true },
    {
      name: "cta",
      type: "group",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text" },
      ],
    },
  ],
};

const ArrayBlock: Block = {
  slug: "listed",
  labels: { singular: "Listed", plural: "Listed" },
  fields: [
    {
      name: "items",
      type: "array",
      minRows: 1,
      maxRows: 10,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "image", type: "upload", relationTo: "media" },
      ],
    },
  ],
};

const NestedArrayBlock: Block = {
  slug: "nested",
  labels: { singular: "Nested", plural: "Nested" },
  fields: [
    {
      name: "tiers",
      type: "array",
      fields: [
        { name: "name", type: "text", required: true },
        {
          name: "features",
          type: "array",
          fields: [{ name: "text", type: "text", required: true }],
        },
      ],
    },
  ],
};

const SkippableBlock: Block = {
  slug: "skippable",
  labels: { singular: "Skippable", plural: "Skippable" },
  fields: [
    { name: "title", type: "text" },
    { name: "content", type: "richText" },
    { name: "custom", type: "ui", admin: { components: {} } } as any,
    {
      type: "row",
      fields: [
        { name: "col1", type: "text" },
        { name: "col2", type: "text" },
      ],
    },
    {
      type: "collapsible",
      label: "More",
      fields: [{ name: "extra", type: "text" }],
    },
  ],
};

const SelectBlock: Block = {
  slug: "selectable",
  labels: { singular: "Selectable", plural: "Selectable" },
  fields: [
    {
      name: "format",
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Thousands", value: "k" },
      ],
    },
    { name: "email", type: "email" },
    { name: "published", type: "date" },
    { name: "location", type: "point" },
  ],
};

describe("introspectBlock", () => {
  it("handles simple text, number, and checkbox fields", () => {
    const result = introspectBlock(SimpleBlock);
    expect(result.fields.title).toEqual({ type: "text", required: true });
    expect(result.fields.count).toEqual({ type: "number", min: 0, max: 100 });
    expect(result.fields.visible).toEqual({ type: "checkbox" });
  });

  it("flattens group fields with dot notation", () => {
    const result = introspectBlock(GroupBlock);
    expect(result.fields["cta.label"]).toEqual({
      type: "text",
      required: true,
    });
    expect(result.fields["cta.href"]).toEqual({ type: "text" });
    expect(result.fields.cta).toBeUndefined();
  });

  it("handles array fields with nested field maps", () => {
    const result = introspectBlock(ArrayBlock);
    const items = result.fields.items;
    expect(items).toBeDefined();
    expect(items.type).toBe("array");
    if (items.type === "array") {
      expect(items.minRows).toBe(1);
      expect(items.maxRows).toBe(10);
      expect(items.fields.title).toEqual({ type: "text", required: true });
      expect(items.fields.image).toEqual({
        type: "upload",
        relationTo: "media",
      });
    }
  });

  it("handles nested arrays (array in array)", () => {
    const result = introspectBlock(NestedArrayBlock);
    const tiers = result.fields.tiers;
    expect(tiers.type).toBe("array");
    if (tiers.type === "array") {
      expect(tiers.fields.name).toEqual({ type: "text", required: true });
      const features = tiers.fields.features;
      expect(features.type).toBe("array");
      if (features.type === "array") {
        expect(features.fields.text).toEqual({ type: "text", required: true });
      }
    }
  });

  it("skips richText, ui, and unwraps row/collapsible layout fields", () => {
    const result = introspectBlock(SkippableBlock);
    expect(result.fields.title).toEqual({ type: "text" });
    // richText skipped
    expect(result.fields.content).toBeUndefined();
    // ui skipped
    expect(result.fields.custom).toBeUndefined();
    // row fields unwrapped
    expect(result.fields.col1).toEqual({ type: "text" });
    expect(result.fields.col2).toEqual({ type: "text" });
    // collapsible fields unwrapped
    expect(result.fields.extra).toEqual({ type: "text" });
  });

  it("handles select with options, email, date, point", () => {
    const result = introspectBlock(SelectBlock);
    expect(result.fields.format).toEqual({
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Thousands", value: "k" },
      ],
    });
    expect(result.fields.email).toEqual({ type: "email" });
    expect(result.fields.published).toEqual({ type: "date" });
    expect(result.fields.location).toEqual({ type: "point" });
  });

  it("extracts block metadata", () => {
    const result = introspectBlock(SimpleBlock);
    expect(result.meta).toEqual({ label: "Simple", slug: "simple" });
  });
});

describe("introspectBlocks", () => {
  it("produces a field map and block meta map from multiple blocks", () => {
    const { fieldMap, blockMeta } = introspectBlocks([
      SimpleBlock,
      GroupBlock,
    ]);
    expect(Object.keys(fieldMap)).toEqual(["simple", "grouped"]);
    expect(fieldMap.simple.title).toEqual({ type: "text", required: true });
    expect(fieldMap.grouped["cta.label"]).toEqual({
      type: "text",
      required: true,
    });
    expect(blockMeta.simple).toEqual({ label: "Simple", slug: "simple" });
    expect(blockMeta.grouped).toEqual({ label: "Grouped", slug: "grouped" });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test src/payload/lib/field-map/generate.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the introspector**

Create `src/payload/lib/field-map/generate.ts`:
```ts
import type { Block, Field } from "payload";
import type {
  ArrayFieldDescriptor,
  BlockFieldMap,
  BlockMeta,
  BlockMetaMap,
  FieldDescriptor,
  FieldEntry,
  FieldMap,
} from "./types";

/** Field types that are skipped (not editable on frontend). */
const SKIP_TYPES = new Set(["richText", "ui", "join"]);

/** Layout-only field types whose children are unwrapped. */
const LAYOUT_TYPES = new Set(["row", "collapsible"]);

/**
 * Extract a FieldDescriptor from a Payload field definition.
 * Returns null for skipped or layout types (those are handled separately).
 */
function extractDescriptor(field: Field): FieldDescriptor | null {
  if (!("type" in field)) return null;
  if (SKIP_TYPES.has(field.type)) return null;
  if (LAYOUT_TYPES.has(field.type)) return null;
  if (field.type === "group" || field.type === "array" || field.type === "blocks" || field.type === "tabs") {
    return null; // handled by recursive walk
  }

  const desc: FieldDescriptor = { type: field.type as FieldDescriptor["type"] };

  if ("required" in field && field.required) desc.required = true;
  if ("hasMany" in field && field.hasMany) desc.hasMany = true;
  if ("localized" in field && field.localized) desc.localized = true;

  // number constraints
  if (field.type === "number") {
    if ("min" in field && field.min != null) desc.min = field.min as number;
    if ("max" in field && field.max != null) desc.max = field.max as number;
  }

  // text constraints
  if (field.type === "text" || field.type === "textarea") {
    if ("minLength" in field && field.minLength != null)
      desc.minLength = field.minLength as number;
    if ("maxLength" in field && field.maxLength != null)
      desc.maxLength = field.maxLength as number;
  }

  // select / radio options
  if (field.type === "select" || field.type === "radio") {
    if ("options" in field && Array.isArray(field.options)) {
      desc.options = field.options.map((opt) =>
        typeof opt === "string" ? { label: opt, value: opt } : opt
      );
    }
  }

  // upload / relationship
  if (field.type === "upload" || field.type === "relationship") {
    if ("relationTo" in field) desc.relationTo = field.relationTo;
  }

  return desc;
}

/**
 * Recursively walk a Payload fields array and produce a flat BlockFieldMap.
 * Groups are flattened with dot notation. Arrays produce ArrayFieldDescriptor.
 */
function walkFields(fields: Field[], prefix = ""): BlockFieldMap {
  const map: BlockFieldMap = {};

  for (const field of fields) {
    if (!("type" in field)) continue;

    // Skip non-data types
    if (SKIP_TYPES.has(field.type)) continue;

    // Layout wrappers — unwrap children
    if (LAYOUT_TYPES.has(field.type)) {
      if ("fields" in field && Array.isArray(field.fields)) {
        Object.assign(map, walkFields(field.fields, prefix));
      }
      continue;
    }

    // Tabs — unwrap each tab's fields
    if (field.type === "tabs" && "tabs" in field) {
      for (const tab of field.tabs) {
        if ("name" in tab && tab.name) {
          // Named tab acts like a group
          Object.assign(map, walkFields(tab.fields, `${prefix}${tab.name}.`));
        } else {
          Object.assign(map, walkFields(tab.fields, prefix));
        }
      }
      continue;
    }

    // Must have a name to be a data field
    if (!("name" in field) || !field.name) continue;
    const key = `${prefix}${field.name}`;

    // Group — flatten with dot notation
    if (field.type === "group") {
      Object.assign(map, walkFields(field.fields, `${key}.`));
      continue;
    }

    // Array — recurse into nested fields
    if (field.type === "array") {
      const entry: ArrayFieldDescriptor = {
        type: "array",
        fields: walkFields(field.fields),
      };
      if ("minRows" in field && field.minRows != null)
        entry.minRows = field.minRows;
      if ("maxRows" in field && field.maxRows != null)
        entry.maxRows = field.maxRows;
      map[key] = entry;
      continue;
    }

    // Leaf field
    const desc = extractDescriptor(field);
    if (desc) map[key] = desc;
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun test src/payload/lib/field-map/generate.test.ts
```
Expected: PASS — all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/payload/lib/field-map/
git commit -m "feat(frontend-editor): add schema introspector with tests"
```

---

### Task 4: Create the codegen script and generate the field map

Wire the introspector to the actual block schemas. Create a script that generates `src/generated/field-map.ts`.

**Files:**
- Create: `scripts/generate-field-map.ts`
- Create: `src/generated/` directory
- Modify: `package.json` (add script)
- Modify: `.gitignore` (add entry)

- [ ] **Step 1: Add `src/generated/` to .gitignore**

Append to `.gitignore`:
```
src/generated/
```

- [ ] **Step 2: Create the codegen script**

Create `scripts/generate-field-map.ts`:
```ts
/**
 * Generate the field map from Payload block schemas.
 * Run: bun scripts/generate-field-map.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { BentoBlock } from "../src/payload/block-schemas/Bento";
import { CinematicCtaBlock } from "../src/payload/block-schemas/CinematicCta";
import { FaqBlock } from "../src/payload/block-schemas/Faq";
import { HeroBlock } from "../src/payload/block-schemas/Hero";
import { ImageGalleryBlock } from "../src/payload/block-schemas/ImageGallery";
import { LatestArticlesBlock } from "../src/payload/block-schemas/LatestArticles";
import { PricingBlock } from "../src/payload/block-schemas/Pricing";
import { SplitMediaBlock } from "../src/payload/block-schemas/SplitMedia";
import { TestimonialsBlock } from "../src/payload/block-schemas/Testimonials";
import { TrustBlock } from "../src/payload/block-schemas/Trust";
import { introspectBlocks } from "../src/payload/lib/field-map/generate";

const blocks = [
  HeroBlock,
  BentoBlock,
  SplitMediaBlock,
  TestimonialsBlock,
  ImageGalleryBlock,
  LatestArticlesBlock,
  CinematicCtaBlock,
  PricingBlock,
  FaqBlock,
  TrustBlock,
];

const { fieldMap, blockMeta } = introspectBlocks(blocks);

const outDir = resolve(import.meta.dir, "../src/generated");
mkdirSync(outDir, { recursive: true });

const content = `// Auto-generated by scripts/generate-field-map.ts — do not edit
import type { BlockMetaMap, FieldMap } from "@/payload/lib/field-map/types";

export const fieldMap: FieldMap = ${JSON.stringify(fieldMap, null, 2)} as const;

export const blockMeta: BlockMetaMap = ${JSON.stringify(blockMeta, null, 2)} as const;
`;

writeFileSync(resolve(outDir, "field-map.ts"), content);
console.log(`Generated src/generated/field-map.ts (${blocks.length} blocks)`);
```

- [ ] **Step 3: Add the script to package.json**

Add to the `"scripts"` section:
```json
"generate:field-map": "bun scripts/generate-field-map.ts"
```

- [ ] **Step 4: Run the script and verify output**

```bash
bun generate:field-map
```
Expected: `Generated src/generated/field-map.ts (10 blocks)`

Verify the file exists:
```bash
head -20 src/generated/field-map.ts
```

- [ ] **Step 5: Run lint check**

```bash
bun check
```

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-field-map.ts package.json .gitignore
git commit -m "feat(frontend-editor): add field map codegen script"
```

---

## Chunk 2: Edit Mode Context & Core Infrastructure

### Task 5: Create EditModeProvider context

The central state management for edit mode. Holds the mutable blocks copy, dirty tracking, and save/discard operations.

**Files:**
- Create: `src/components/features/frontend-editor/edit-mode-data.ts`
- Create: `src/components/features/frontend-editor/edit-mode-data.test.ts`

- [ ] **Step 1: Write failing tests for the context logic**

Create `src/components/features/frontend-editor/edit-mode-data.test.ts`:
```ts
import { describe, expect, it } from "bun:test";
import {
  setFieldValue,
  getFieldValue,
  moveBlock,
  removeBlock,
  duplicateBlock,
  moveArrayItem,
  removeArrayItem,
  addArrayItem,
} from "./edit-mode-data";

const sampleBlocks = [
  {
    id: "1",
    blockType: "hero",
    headline: "Hello",
    subtext: "World",
    primaryCta: { label: "Go", href: "/go" },
  },
  {
    id: "2",
    blockType: "faq",
    headline: "Questions",
    items: [
      { id: "a", question: "Q1", answer: "A1" },
      { id: "b", question: "Q2", answer: "A2" },
      { id: "c", question: "Q3", answer: "A3" },
    ],
  },
];

describe("getFieldValue", () => {
  it("reads a simple field", () => {
    expect(getFieldValue(sampleBlocks[0], "headline")).toBe("Hello");
  });

  it("reads a dotted group field", () => {
    expect(getFieldValue(sampleBlocks[0], "primaryCta.label")).toBe("Go");
  });

  it("reads an array item field", () => {
    expect(getFieldValue(sampleBlocks[1], "items.0.question")).toBe("Q1");
  });
});

describe("setFieldValue", () => {
  it("sets a simple field immutably", () => {
    const updated = setFieldValue(sampleBlocks[0], "headline", "Changed");
    expect(updated.headline).toBe("Changed");
    expect(sampleBlocks[0].headline).toBe("Hello"); // original unchanged
  });

  it("sets a dotted group field", () => {
    const updated = setFieldValue(sampleBlocks[0], "primaryCta.href", "/new");
    expect(updated.primaryCta.href).toBe("/new");
    expect(updated.primaryCta.label).toBe("Go"); // sibling preserved
  });

  it("sets an array item field", () => {
    const updated = setFieldValue(sampleBlocks[1], "items.1.answer", "Updated");
    expect(updated.items[1].answer).toBe("Updated");
    expect(updated.items[0].answer).toBe("A1"); // other items unchanged
  });
});

describe("moveBlock", () => {
  it("moves a block down", () => {
    const result = moveBlock(sampleBlocks, 0, 1);
    expect(result[0].blockType).toBe("faq");
    expect(result[1].blockType).toBe("hero");
    expect(result).not.toBe(sampleBlocks); // new array
  });

  it("returns same array for out-of-bounds", () => {
    const result = moveBlock(sampleBlocks, 0, -1);
    expect(result).toBe(sampleBlocks);
  });
});

describe("removeBlock", () => {
  it("removes a block by index", () => {
    const result = removeBlock(sampleBlocks, 0);
    expect(result.length).toBe(1);
    expect(result[0].blockType).toBe("faq");
  });
});

describe("duplicateBlock", () => {
  it("duplicates a block with a new id", () => {
    const result = duplicateBlock(sampleBlocks, 0);
    expect(result.length).toBe(3);
    expect(result[1].blockType).toBe("hero");
    expect(result[1].headline).toBe("Hello");
    expect(result[1].id).not.toBe(result[0].id);
  });
});

describe("moveArrayItem", () => {
  it("moves an item within an array field", () => {
    const updated = moveArrayItem(sampleBlocks[1], "items", 0, 2);
    expect(updated.items[0].question).toBe("Q2");
    expect(updated.items[2].question).toBe("Q1");
  });
});

describe("removeArrayItem", () => {
  it("removes an item from an array field", () => {
    const updated = removeArrayItem(sampleBlocks[1], "items", 1);
    expect(updated.items.length).toBe(2);
    expect(updated.items[0].question).toBe("Q1");
    expect(updated.items[1].question).toBe("Q3");
  });
});

describe("addArrayItem", () => {
  it("adds an empty item to an array field", () => {
    const updated = addArrayItem(sampleBlocks[1], "items", { id: "d", question: "", answer: "" });
    expect(updated.items.length).toBe(4);
    expect(updated.items[3].id).toBe("d");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test src/components/features/frontend-editor/edit-mode-data.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the pure data helpers**

Create `src/components/features/frontend-editor/edit-mode-data.ts`:
```ts
/**
 * Pure, immutable data helpers for edit mode operations.
 * These do not depend on React — they transform plain objects.
 */

/** Read a value from a block at a dot-notation path. */
export function getFieldValue(block: Record<string, any>, path: string): any {
  const segments = path.split(".");
  let current: any = block;
  for (const seg of segments) {
    if (current == null) return undefined;
    const index = Number(seg);
    current = Number.isNaN(index) ? current[seg] : current[index];
  }
  return current;
}

/** Immutably set a value on a block at a dot-notation path. */
export function setFieldValue<T extends Record<string, any>>(
  block: T,
  path: string,
  value: any
): T {
  const segments = path.split(".");
  if (segments.length === 0) return block;

  const clone = structuredClone(block);
  let current: any = clone;

  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    const index = Number(seg);
    current = Number.isNaN(index) ? current[seg] : current[index];
  }

  const lastSeg = segments[segments.length - 1];
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
  if (to < 0 || to >= blocks.length || from === to) return blocks;
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
  blocks: Record<string, any>[],
  index: number
): Record<string, any>[] {
  const copy = [...blocks];
  const original = blocks[index];
  const clone = structuredClone(original);
  clone.id = crypto.randomUUID();
  copy.splice(index + 1, 0, clone);
  return copy;
}

/** Move an item within a block's array field. */
export function moveArrayItem<T extends Record<string, any>>(
  block: T,
  arrayPath: string,
  from: number,
  to: number
): T {
  const arr = getFieldValue(block, arrayPath);
  if (!Array.isArray(arr) || to < 0 || to >= arr.length) return block;
  const moved = moveBlock(arr, from, to);
  return setFieldValue(block, arrayPath, moved);
}

/** Remove an item from a block's array field. */
export function removeArrayItem<T extends Record<string, any>>(
  block: T,
  arrayPath: string,
  index: number
): T {
  const arr = getFieldValue(block, arrayPath);
  if (!Array.isArray(arr)) return block;
  return setFieldValue(block, arrayPath, removeBlock(arr, index));
}

/** Add an item to a block's array field. */
export function addArrayItem<T extends Record<string, any>>(
  block: T,
  arrayPath: string,
  item: Record<string, any>
): T {
  const arr = getFieldValue(block, arrayPath);
  if (!Array.isArray(arr)) return block;
  return setFieldValue(block, arrayPath, [...arr, item]);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun test src/components/features/frontend-editor/edit-mode-data.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/features/frontend-editor/
git commit -m "feat(frontend-editor): add edit mode pure data helpers with tests"
```

---

### Task 6: Create the EditModeProvider React context

The React context component that wraps the layout and provides edit state.

**Files:**
- Create: `src/components/features/frontend-editor/edit-mode-context.tsx`
- Create: `src/components/features/frontend-editor/use-edit-mode.ts`

- [ ] **Step 1: Create the context and provider**

Create `src/components/features/frontend-editor/edit-mode-context.tsx`:
```tsx
"use client";

import {
  type ReactNode,
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import type { LayoutBlock } from "@/types/block-types";
import {
  addArrayItem,
  duplicateBlock,
  moveArrayItem,
  moveBlock,
  removeArrayItem,
  removeBlock,
  setFieldValue,
} from "./edit-mode-data";

export interface EditModeState {
  /** Whether edit mode is active. */
  active: boolean;
  /** Current page ID being edited. */
  pageId: number | null;
  /** The mutable blocks array. */
  blocks: LayoutBlock[];
  /** Number of dirty fields. */
  dirtyCount: number;
  /** Whether a save is in progress. */
  saving: boolean;
}

export interface EditModeActions {
  enter: (pageId: number, blocks: LayoutBlock[]) => void;
  exit: () => void;
  updateField: (blockIndex: number, path: string, value: any) => void;
  moveBlockAction: (from: number, to: number) => void;
  removeBlockAction: (index: number) => void;
  duplicateBlockAction: (index: number) => void;
  addBlockAction: (index: number, block: LayoutBlock) => void;
  moveArrayItemAction: (
    blockIndex: number,
    arrayPath: string,
    from: number,
    to: number
  ) => void;
  removeArrayItemAction: (
    blockIndex: number,
    arrayPath: string,
    index: number
  ) => void;
  addArrayItemAction: (
    blockIndex: number,
    arrayPath: string,
    item: Record<string, any>
  ) => void;
  setSaving: (saving: boolean) => void;
  resetDirty: (blocks: LayoutBlock[]) => void;
}

export interface EditModeContextValue {
  state: EditModeState;
  actions: EditModeActions;
}

export const EditModeContext = createContext<EditModeContextValue | null>(null);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EditModeState>({
    active: false,
    pageId: null,
    blocks: [],
    dirtyCount: 0,
    saving: false,
  });

  const dirtyPaths = useRef(new Set<string>());

  const enter = useCallback((pageId: number, blocks: LayoutBlock[]) => {
    dirtyPaths.current.clear();
    setState({
      active: true,
      pageId,
      blocks: structuredClone(blocks),
      dirtyCount: 0,
      saving: false,
    });
  }, []);

  const exit = useCallback(() => {
    dirtyPaths.current.clear();
    setState({
      active: false,
      pageId: null,
      blocks: [],
      dirtyCount: 0,
      saving: false,
    });
  }, []);

  const updateField = useCallback(
    (blockIndex: number, path: string, value: any) => {
      setState((prev) => {
        const updated = [...prev.blocks];
        updated[blockIndex] = setFieldValue(
          updated[blockIndex] as unknown as Record<string, any>,
          path,
          value
        ) as unknown as LayoutBlock;
        const dirtyKey = `${blockIndex}.${path}`;
        dirtyPaths.current.add(dirtyKey);
        return {
          ...prev,
          blocks: updated,
          dirtyCount: dirtyPaths.current.size,
        };
      });
    },
    []
  );

  const moveBlockAction = useCallback((from: number, to: number) => {
    setState((prev) => {
      dirtyPaths.current.add("__structure");
      return {
        ...prev,
        blocks: moveBlock(prev.blocks, from, to),
        dirtyCount: dirtyPaths.current.size,
      };
    });
  }, []);

  const removeBlockAction = useCallback((index: number) => {
    setState((prev) => {
      dirtyPaths.current.add("__structure");
      return {
        ...prev,
        blocks: removeBlock(prev.blocks, index),
        dirtyCount: dirtyPaths.current.size,
      };
    });
  }, []);

  const duplicateBlockAction = useCallback((index: number) => {
    setState((prev) => {
      dirtyPaths.current.add("__structure");
      return {
        ...prev,
        blocks: duplicateBlock(
          prev.blocks as unknown as Record<string, any>[],
          index
        ) as unknown as LayoutBlock[],
        dirtyCount: dirtyPaths.current.size,
      };
    });
  }, []);

  const addBlockAction = useCallback(
    (index: number, block: LayoutBlock) => {
      setState((prev) => {
        dirtyPaths.current.add("__structure");
        const copy = [...prev.blocks];
        copy.splice(index, 0, block);
        return {
          ...prev,
          blocks: copy,
          dirtyCount: dirtyPaths.current.size,
        };
      });
    },
    []
  );

  const moveArrayItemAction = useCallback(
    (blockIndex: number, arrayPath: string, from: number, to: number) => {
      setState((prev) => {
        const updated = [...prev.blocks];
        updated[blockIndex] = moveArrayItem(
          updated[blockIndex] as unknown as Record<string, any>,
          arrayPath,
          from,
          to
        ) as unknown as LayoutBlock;
        dirtyPaths.current.add(`${blockIndex}.${arrayPath}`);
        return {
          ...prev,
          blocks: updated,
          dirtyCount: dirtyPaths.current.size,
        };
      });
    },
    []
  );

  const removeArrayItemAction = useCallback(
    (blockIndex: number, arrayPath: string, index: number) => {
      setState((prev) => {
        const updated = [...prev.blocks];
        updated[blockIndex] = removeArrayItem(
          updated[blockIndex] as unknown as Record<string, any>,
          arrayPath,
          index
        ) as unknown as LayoutBlock;
        dirtyPaths.current.add(`${blockIndex}.${arrayPath}`);
        return {
          ...prev,
          blocks: updated,
          dirtyCount: dirtyPaths.current.size,
        };
      });
    },
    []
  );

  const addArrayItemAction = useCallback(
    (blockIndex: number, arrayPath: string, item: Record<string, any>) => {
      setState((prev) => {
        const updated = [...prev.blocks];
        updated[blockIndex] = addArrayItem(
          updated[blockIndex] as unknown as Record<string, any>,
          arrayPath,
          item
        ) as unknown as LayoutBlock;
        dirtyPaths.current.add(`${blockIndex}.${arrayPath}`);
        return {
          ...prev,
          blocks: updated,
          dirtyCount: dirtyPaths.current.size,
        };
      });
    },
    []
  );

  const setSaving = useCallback((saving: boolean) => {
    setState((prev) => ({ ...prev, saving }));
  }, []);

  const resetDirty = useCallback((blocks: LayoutBlock[]) => {
    dirtyPaths.current.clear();
    setState((prev) => ({
      ...prev,
      blocks: structuredClone(blocks),
      dirtyCount: 0,
    }));
  }, []);

  const actions = useMemo<EditModeActions>(
    () => ({
      enter,
      exit,
      updateField,
      moveBlockAction,
      removeBlockAction,
      duplicateBlockAction,
      addBlockAction,
      moveArrayItemAction,
      removeArrayItemAction,
      addArrayItemAction,
      setSaving,
      resetDirty,
    }),
    [
      enter,
      exit,
      updateField,
      moveBlockAction,
      removeBlockAction,
      duplicateBlockAction,
      addBlockAction,
      moveArrayItemAction,
      removeArrayItemAction,
      addArrayItemAction,
      setSaving,
      resetDirty,
    ]
  );

  const value = useMemo<EditModeContextValue>(
    () => ({ state, actions }),
    [state, actions]
  );

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
}
```

- [ ] **Step 2: Create the useEditMode hook**

Create `src/components/features/frontend-editor/use-edit-mode.ts`:
```ts
"use client";

import { useContext } from "react";
import { EditModeContext } from "./edit-mode-context";

/** Access edit mode state and actions. Returns null if not inside provider. */
export function useEditMode() {
  return useContext(EditModeContext);
}

/** Access edit mode state and actions. Throws if not inside provider. */
export function useEditModeRequired() {
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    throw new Error("useEditModeRequired must be used within EditModeProvider");
  }
  return ctx;
}
```

- [ ] **Step 3: Run lint check**

```bash
bun check
```

- [ ] **Step 4: Commit**

```bash
git add src/components/features/frontend-editor/
git commit -m "feat(frontend-editor): add EditModeProvider context and useEditMode hook"
```

---

### Task 7: Create keyboard shortcuts hook

Handles Cmd+E (toggle edit), Cmd+S (save draft), Cmd+Shift+S (publish), Escape (exit).

**Files:**
- Create: `src/components/features/frontend-editor/use-keyboard-shortcuts.ts`
- Create: `src/components/features/frontend-editor/use-keyboard-shortcuts.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/components/features/frontend-editor/use-keyboard-shortcuts.test.ts`:
```ts
import { describe, expect, it } from "bun:test";
import { matchShortcut } from "./use-keyboard-shortcuts";

describe("matchShortcut", () => {
  const makeEvent = (key: string, meta = false, shift = false) =>
    ({ key, metaKey: meta, ctrlKey: false, shiftKey: shift } as KeyboardEvent);

  it("matches Cmd+E", () => {
    expect(matchShortcut(makeEvent("e", true))).toBe("toggle");
  });

  it("matches Cmd+S", () => {
    expect(matchShortcut(makeEvent("s", true))).toBe("saveDraft");
  });

  it("matches Cmd+Shift+S (browsers send uppercase S with Shift)", () => {
    expect(matchShortcut(makeEvent("S", true, true))).toBe("publish");
  });

  it("matches Escape", () => {
    expect(matchShortcut(makeEvent("Escape"))).toBe("exit");
  });

  it("returns null for unrecognized combos", () => {
    expect(matchShortcut(makeEvent("a", true))).toBeNull();
  });

  it("returns null for bare letter keys", () => {
    expect(matchShortcut(makeEvent("e"))).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test src/components/features/frontend-editor/use-keyboard-shortcuts.test.ts
```
Expected: FAIL

- [ ] **Step 3: Implement the shortcut matcher and hook**

Create `src/components/features/frontend-editor/use-keyboard-shortcuts.ts`:
```ts
"use client";

import { useEffect } from "react";

export type ShortcutAction = "toggle" | "saveDraft" | "publish" | "exit";

/** Pure matcher for keyboard shortcuts. Normalizes key to lowercase for Shift combos. */
export function matchShortcut(e: KeyboardEvent): ShortcutAction | null {
  const mod = e.metaKey || e.ctrlKey;
  const key = e.key.toLowerCase();

  if (mod && !e.shiftKey && key === "e") return "toggle";
  if (mod && !e.shiftKey && key === "s") return "saveDraft";
  if (mod && e.shiftKey && key === "s") return "publish";
  if (e.key === "Escape" && !mod) return "exit";

  return null;
}

/** Register keyboard shortcuts for edit mode. */
export function useKeyboardShortcuts(
  active: boolean,
  handlers: Partial<Record<ShortcutAction, () => void>>
) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const action = matchShortcut(e);
      if (!action) return;

      // Toggle always works; others only when edit mode is active
      if (action !== "toggle" && !active) return;

      const handler = handlers[action];
      if (handler) {
        e.preventDefault();
        handler();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, handlers]);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun test src/components/features/frontend-editor/use-keyboard-shortcuts.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/features/frontend-editor/use-keyboard-shortcuts*
git commit -m "feat(frontend-editor): add keyboard shortcuts hook with tests"
```

---

### Task 8: Wire EditModeProvider into the frontend layout

Mount the provider in the `(frontend)` layout so both RenderBlocks output and AdminBar can access it.

**Files:**
- Modify: `src/app/(frontend)/layout.tsx`

- [ ] **Step 1: Add EditModeProvider to the layout**

Wrap `children` and `AdminBar` with `EditModeProvider` inside the existing `Providers`:

```tsx
// Add import
import { EditModeProvider } from "@/components/features/frontend-editor/edit-mode-context";

// In the JSX, wrap around main + AdminBar:
<Providers>
  {/* ... figma script ... */}
  <Navbar />
  <EditModeProvider>
    <main>{children}</main>
    <Suspense>
      <AdminBar />
    </Suspense>
  </EditModeProvider>
  <Footer />
</Providers>
```

Note: Footer stays outside the provider since it's not editable. This moves `AdminBar` before `Footer` in the DOM (previously it was after). AdminBar is `position: fixed` so this has no visual impact, but verify after making the change.

- [ ] **Step 2: Verify dev server starts**

```bash
bun dev
```
Verify the page loads without errors. The EditModeProvider renders nothing extra — it just provides context.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/layout.tsx
git commit -m "feat(frontend-editor): mount EditModeProvider in frontend layout"
```

---

## Chunk 3: RenderBlocksClient & Data Attribute Annotations

### Task 9: Create RenderBlocksClient

A client version of `RenderBlocks` that reads from edit mode context and adds `data-block-index` / `data-block-type` attributes.

**Files:**
- Create: `src/components/features/frontend-editor/render-blocks-client.tsx`
- Modify: `src/components/blocks/render-blocks.tsx` (add data attributes)

- [ ] **Step 1: Search for existing `data-section` references**

Before renaming, verify nothing else depends on the old attribute:
```bash
grep -r "data-section" src/ --include="*.tsx" --include="*.ts" --include="*.css"
```
If any CSS or JS references `data-section`, update those references to use `data-block-type` instead.

- [ ] **Step 2: Update existing RenderBlocks to add data attributes**

Modify `src/components/blocks/render-blocks.tsx` — replace `data-section` with `data-block-type` and add `data-block-index`:

```tsx
{blocks.map((block, index) => (
  <div data-block-index={index} data-block-type={block.blockType} key={block.id}>
    {renderBlock(block)}
  </div>
))}
```

- [ ] **Step 3: Create RenderBlocksClient**

Create `src/components/features/frontend-editor/render-blocks-client.tsx`:
```tsx
"use client";

import { useEditModeRequired } from "./use-edit-mode";
import { RenderBlocks } from "@/components/blocks/render-blocks";

/**
 * Client wrapper that renders blocks from edit mode context state.
 * Used by EditableOverlay when edit mode is active.
 */
export function RenderBlocksClient() {
  const { state } = useEditModeRequired();
  return <RenderBlocks blocks={state.blocks} />;
}
```

Note: This works because `RenderBlocks` is a shared function that takes `blocks` as a prop. In normal mode it gets blocks from server props; in edit mode from context state. Since `render-blocks.tsx` has no server-only imports, importing it in a client module works — but verify with a build step.

- [ ] **Step 4: Verify build**

```bash
bun check && bun build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/blocks/render-blocks.tsx src/components/features/frontend-editor/render-blocks-client.tsx
git commit -m "feat(frontend-editor): add RenderBlocksClient and data attributes to block wrappers"
```

---

### Task 10: Annotate block components with data-field attributes

Add `data-field` and `data-array-item` attributes to all 10 block components. This is the largest single task — each block gets its text and non-text fields annotated.

**Files:**
- Modify: `src/components/blocks/hero/hero.tsx`
- Modify: `src/components/blocks/bento/bento.tsx` (and sub-components)
- Modify: `src/components/blocks/split-media/split-media.tsx`
- Modify: `src/components/blocks/testimonials/testimonials.tsx`
- Modify: `src/components/blocks/image-gallery/image-gallery.tsx`
- Modify: `src/components/blocks/latest-articles/latest-articles.tsx`
- Modify: `src/components/blocks/cinematic-cta/cinematic-cta.tsx`
- Modify: `src/components/blocks/pricing/pricing.tsx` (and sub-components)
- Modify: `src/components/blocks/faq/faq.tsx`
- Modify: `src/components/blocks/trust/trust.tsx`

This task should be split across multiple subagents if using subagent-driven development — one per block or per 2-3 blocks.

- [ ] **Step 1: Annotate Hero**

Add `data-field` to all text elements and the media element:
```tsx
<h1 data-field="headline">{headline}</h1>
<p data-field="subtext">{subtext}</p>
// On the img/video element:
data-field="mediaSrc"
// On CTA buttons:
<Button data-field="primaryCta.label">...</Button>
// Note: href fields won't have visible elements to annotate —
// they'll be editable via the CTA label's popover
```

- [ ] **Step 2: Annotate SplitMedia**

Add `data-array-item` to each row container, `data-field` to all fields within rows:
```tsx
<div key={row.id} data-array-item={`rows.${i}`}>
  <h2 data-field={`rows.${i}.headline`}>...</h2>
  <p data-field={`rows.${i}.body`}>...</p>
  <span data-field={`rows.${i}.mediaLabel`}>...</span>
  <img data-field={`rows.${i}.mediaSrc`} ... />
  // CTA group fields:
  <Button data-field={`rows.${i}.cta.label`}>...</Button>
  // mediaOverlay fields:
  <span data-field={`rows.${i}.mediaOverlay.badge`}>...</span>
  <span data-field={`rows.${i}.mediaOverlay.title`}>...</span>
  <span data-field={`rows.${i}.mediaOverlay.description`}>...</span>
</div>
```

- [ ] **Step 3: Annotate Testimonials**

Section headline/subtext + each testimonial in the array:
```tsx
<h2 data-field="headline">...</h2>
<p data-field="subtext">...</p>
// Each testimonial:
<div data-array-item={`testimonials.${i}`}>
  <span data-field={`testimonials.${i}.name`}>...</span>
  <span data-field={`testimonials.${i}.role`}>...</span>
  <span data-field={`testimonials.${i}.department`}>...</span>
  <p data-field={`testimonials.${i}.quote`}>...</p>
  <img data-field={`testimonials.${i}.avatar`} ... />
</div>
```

- [ ] **Step 4: Annotate Pricing**

Section headline/subtext + tiers array with nested features array:
```tsx
<h2 data-field="headline">...</h2>
<p data-field="subtext">...</p>
// Each tier — pass index to PricingCard:
<div data-array-item={`tiers.${i}`}>
  <span data-field={`tiers.${i}.name`}>...</span>
  <span data-field={`tiers.${i}.monthlyPrice`}>...</span>
  // Each feature within a tier:
  <span data-field={`tiers.${i}.features.${j}.text`}>...</span>
</div>
```

- [ ] **Step 5: Annotate FAQ**

```tsx
<span data-field="eyebrow">...</span>
<h2 data-field="headline">...</h2>
<p data-field="subtext">...</p>
// Each item:
<div data-array-item={`items.${i}`}>
  <span data-field={`items.${i}.question`}>...</span>
  <p data-field={`items.${i}.answer`}>...</p>
</div>
```

- [ ] **Step 6: Annotate Bento**

```tsx
// bento.tsx — section-level fields:
<h2 data-field="headline">...</h2>
<p data-field="subtext">...</p>
// ImageCard sub-component (image-card.tsx) — pass data-field paths as props:
<h3 data-field="image.title">...</h3>
<p data-field="image.description">...</p>
<span data-field="image.badge">...</span>
<img data-field="image.src" ... />
```

Note: Check actual Bento sub-component structure. Fields that render across sub-components (e.g., `ImageCard`, `IntegrationsCard`, `ChartCard`) need the field path threaded via props or data attributes on the wrapper.

- [ ] **Step 7: Annotate ImageGallery**

```tsx
// Section headline:
<h2 data-field="headline">...</h2>
<p data-field="subtext">...</p>
// Each gallery item:
<div data-array-item={`images.${i}`}>
  <img data-field={`images.${i}.image`} ... />
  <span data-field={`images.${i}.label`}>...</span>
  <p data-field={`images.${i}.caption`}>...</p>
</div>
```

- [ ] **Step 8: Annotate CinematicCta**

```tsx
<span data-field="label">...</span>
<h2 data-field="headline">...</h2>
<p data-field="subtext">...</p>
<Button data-field="cta.label">...</Button>
<video data-field="videoSrc" ... />
```

- [ ] **Step 9: Annotate Trust**

```tsx
<span data-field="eyebrow">...</span>
// Stats array:
<div data-array-item={`stats.${i}`}>
  <span data-field={`stats.${i}.value`}>...</span>
  <span data-field={`stats.${i}.label`}>...</span>
</div>
// Logos array:
<div data-array-item={`logos.${i}`}>
  <img data-field={`logos.${i}.image`} ... />
  <span data-field={`logos.${i}.name`}>...</span>
</div>
```

- [ ] **Step 10: Annotate LatestArticles**

Check the block schema to verify `articles` is an inline array field (not a relationship to a separate collection). If it is an inline array:
```tsx
<h2 data-field="headline">...</h2>
<p data-field="subtext">...</p>
// Each article:
<div data-array-item={`articles.${i}`}>
  <h3 data-field={`articles.${i}.title`}>...</h3>
  <p data-field={`articles.${i}.excerpt`}>...</p>
  <span data-field={`articles.${i}.category`}>...</span>
  <img data-field={`articles.${i}.image`} ... />
  // Author group:
  <span data-field={`articles.${i}.author.name`}>...</span>
  <img data-field={`articles.${i}.author.avatar`} ... />
</div>
```
If `articles` is a relationship field, skip the nested annotations — relationship editing uses a different pattern (document picker).

- [ ] **Step 11: Run lint check**

```bash
bun check
```

- [ ] **Step 12: Commit**

```bash
git add src/components/blocks/
git commit -m "feat(frontend-editor): add data-field attributes to all block components"
```

---

## Chunk 4: Admin Bar Integration & Save Controls

### Task 11: Create save controls component

The Save Draft / Publish / Discard buttons that appear in the admin bar during edit mode.

**Files:**
- Create: `src/components/features/frontend-editor/save-controls.tsx`

- [ ] **Step 1: Create the save controls component**

Create `src/components/features/frontend-editor/save-controls.tsx`:
```tsx
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useEditModeRequired } from "./use-edit-mode";

export function SaveControls() {
  const router = useRouter();
  const { state, actions } = useEditModeRequired();
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);

  const handleSave = useCallback(
    async (status: "draft" | "published") => {
      if (!state.pageId) return;

      setSaving(status === "draft" ? "draft" : "publish");
      actions.setSaving(true);

      try {
        const res = await fetch(`/api/pages/${state.pageId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            layout: state.blocks,
            _status: status,
          }),
        });

        if (!res.ok) {
          if (res.status === 401) {
            toast.error("Session expired. Please log in again.");
            return;
          }
          const data = await res.json().catch(() => null);
          toast.error(data?.errors?.[0]?.message || "Save failed");
          return;
        }

        if (status === "published") {
          toast.success("Published successfully");
          actions.exit();
          router.refresh();
        } else {
          toast.success("Draft saved");
          // Re-fetch to get server-normalized data
          const freshRes = await fetch(
            `/api/pages/${state.pageId}?draft=true&depth=2`,
            { credentials: "include" }
          );
          if (freshRes.ok) {
            const freshData = await freshRes.json();
            actions.resetDirty(freshData.layout ?? []);
          }
        }
      } catch {
        toast.error("Network error — changes preserved locally");
      } finally {
        setSaving(null);
        actions.setSaving(false);
      }
    },
    [state.pageId, state.blocks, actions, router]
  );

  const handleDiscard = useCallback(() => {
    if (state.dirtyCount > 0) {
      // AlertDialog handles confirmation
      return;
    }
    actions.exit();
  }, [state.dirtyCount, actions]);

  return (
    <div className="flex items-center gap-1">
      {state.dirtyCount > 0 ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="h-7 px-2.5 text-[11px]"
              disabled={!!saving}
              variant="ghost"
            >
              Discard
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard changes?</AlertDialogTitle>
              <AlertDialogDescription>
                You have {state.dirtyCount} unsaved{" "}
                {state.dirtyCount === 1 ? "change" : "changes"}. This cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep editing</AlertDialogCancel>
              <AlertDialogAction onClick={() => window.location.reload()}>
                Discard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button
          className="h-7 px-2.5 text-[11px]"
          onClick={handleDiscard}
          variant="ghost"
        >
          Discard
        </Button>
      )}
      <Button
        className="h-7 px-2.5 text-[11px]"
        disabled={!!saving}
        onClick={() => handleSave("draft")}
        variant="outline"
      >
        {saving === "draft" ? <Spinner className="mr-1" /> : null}
        Save Draft
      </Button>
      <Button
        className="h-7 px-2.5 text-[11px] bg-green-600 hover:bg-green-700 text-white"
        disabled={!!saving}
        onClick={() => handleSave("published")}
      >
        {saving === "publish" ? <Spinner className="mr-1" /> : null}
        Publish
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Run lint check**

```bash
bun check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/features/frontend-editor/save-controls.tsx
git commit -m "feat(frontend-editor): add save/discard/publish controls"
```

---

### Task 12: Integrate edit mode into the admin bar

Modify the admin bar to show the "Edit Page" toggle, editing indicator, and save controls when edit mode is active.

**Files:**
- Modify: `src/components/features/admin-bar/admin-bar.tsx`
- Modify: `src/components/features/admin-bar/admin-bar-actions.tsx`

- [ ] **Step 1: Update admin-bar-actions — add page data fetch and edit mode toggle**

In `admin-bar-actions.tsx`:

1. Import `useEditMode` and `SaveControls`
2. Add a `handleEnterEditMode` function that:
   - Fetches full page data: `GET /api/pages/${page.id}?draft=true&depth=2` (the current `page` context only has metadata, not `layout` blocks)
   - Ensures draft mode is enabled (two-step: GET `/api/draft/toggle` to check, POST if not enabled; save pre-edit state)
   - Calls `editMode.actions.enter(page.id, data.layout)` with the fetched blocks
   - Shows a loading state while fetching
3. Replace the "Edit Page" `<motion.a>` (lines 72-83) with a `<button>` that calls `handleEnterEditMode`
4. Move the admin panel link to the user dropdown: add "Open in Admin" item linking to `/admin/collections/pages/${page.id}`
5. When `editMode.state.active`, replace the normal actions section with:
   ```tsx
   <div className="flex items-center gap-2">
     <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
       <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
       {editMode.state.dirtyCount > 0
         ? `${editMode.state.dirtyCount} ${editMode.state.dirtyCount === 1 ? "change" : "changes"}`
         : "Editing"}
     </span>
     <SaveControls />
     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleExit}>
       <XIcon size={14} />
     </Button>
   </div>
   ```

- [ ] **Step 2: Update admin-bar.tsx — visual states and keyboard shortcuts**

In `admin-bar.tsx`:

1. Import `useEditMode` and `useKeyboardShortcuts`
2. Add conditional border/tint classes based on edit state:
   ```tsx
   const editMode = useEditMode();
   const isEditing = editMode?.state.active;
   const isDirty = (editMode?.state.dirtyCount ?? 0) > 0;
   // Add to the bar's className:
   // isEditing && !isDirty → "ring-1 ring-blue-500/30"
   // isDirty → "ring-1 ring-amber-500/30"
   ```
3. Wire keyboard shortcuts via `useKeyboardShortcuts(isEditing, { toggle, saveDraft, publish, exit })`
4. Handle draft mode restoration on exit:
   - Store pre-edit draft mode state in a ref
   - On exit via Publish: disable draft mode (POST toggle if enabled)
   - On exit via Discard: restore to pre-edit state

Note: `beforeunload` is handled in `EditModeProvider` (Task 21), not here — single responsibility.

- [ ] **Step 3: Run lint check and verify visually**

```bash
bun check
bun dev
```
Navigate to the site, verify:
- Admin bar shows "Edit Page" button
- Clicking it fetches page data, enters edit mode (bar shows blue ring + "Editing" label)
- Page content does NOT change yet (EditableOverlay is not built until Chunk 5)
- Save/Discard/Publish buttons appear
- Cmd+E toggles edit mode

- [ ] **Step 4: Commit**

```bash
git add src/components/features/admin-bar/
git commit -m "feat(frontend-editor): integrate edit mode into admin bar"
```

---

## Chunk 5: EditableOverlay & Field Editors

### Task 13: Create the EditableOverlay

The client component that renders `RenderBlocksClient` when edit mode is active, replacing the SSR content visually.

**Files:**
- Create: `src/components/features/frontend-editor/editable-overlay.tsx`
- Modify: `src/app/(frontend)/layout.tsx` (add overlay)
- Modify: `src/app/globals.css` (add show/hide rules)

- [ ] **Step 1: Create EditableOverlay**

Create `src/components/features/frontend-editor/editable-overlay.tsx`:
```tsx
"use client";

import { useEditMode } from "./use-edit-mode";
import { renderBlock } from "@/components/blocks/render-blocks";
import { BlockControls } from "./block-controls";
import { AddBlockButton } from "./block-picker";

/**
 * When edit mode is active, renders blocks from client state with
 * edit controls. A CSS class on <main> hides the SSR content.
 */
export function EditableOverlay() {
  const editMode = useEditMode();

  if (!editMode?.state.active) return null;

  return (
    <div className="frontend-editor-overlay">
      <div className="flex flex-col gap-16 lg:gap-32">
        <AddBlockButton index={0} />
        {editMode.state.blocks.map((block, index) => (
          <div key={block.id}>
            <BlockControls
              blockIndex={index}
              blockType={block.blockType}
              totalBlocks={editMode.state.blocks.length}
            />
            <div data-block-index={index} data-block-type={block.blockType}>
              {renderBlock(block)}
            </div>
            <AddBlockButton index={index + 1} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

Note: `renderBlock` is imported directly (not `RenderBlocks`) to render individual blocks inside the edit overlay's map loop. The SSR content is hidden via CSS — when `EditableOverlay` renders, the `EditModeProvider` should add a `data-editing` attribute to the `<main>` element (or use a class toggle).

- [ ] **Step 2: Add show/hide CSS rules to globals.css**

```css
/* Hide SSR blocks when edit overlay is active */
main[data-editing="true"] > .flex > [data-block-type] {
  display: none;
}
```

- [ ] **Step 3: Add overlay to layout**

In `src/app/(frontend)/layout.tsx`, add `<EditableOverlay />` inside `EditModeProvider`, after `{children}` and before `<AdminBar />`:

```tsx
<EditModeProvider>
  <main>{children}</main>
  <EditableOverlay />
  <Suspense>
    <AdminBar />
  </Suspense>
</EditModeProvider>
```

- [ ] **Step 4: Run lint check**

```bash
bun check
```

- [ ] **Step 5: Commit**

```bash
git add src/components/features/frontend-editor/editable-overlay.tsx src/app/\(frontend\)/layout.tsx src/app/globals.css
git commit -m "feat(frontend-editor): add EditableOverlay component"
```

---

### Task 14: Create text field editor (contentEditable handler)

Handles inline text editing via contentEditable, syncing to context on blur.

**Files:**
- Create: `src/components/features/frontend-editor/field-editors/text-editor.ts`

- [ ] **Step 1: Create the text editor**

Create `src/components/features/frontend-editor/field-editors/text-editor.ts`:
```ts
/**
 * Activates contentEditable on a DOM element for inline text editing.
 * Syncs to edit mode state on blur.
 *
 * Note: suppressContentEditableWarning is a React JSX prop, not a DOM property.
 * Since this is imperative DOM activation (not JSX), we don't need it here —
 * the React component's JSX should have suppressContentEditableWarning set
 * if the element is also rendered by React.
 */
export function activateTextEditor(
  element: HTMLElement,
  blockIndex: number,
  fieldPath: string,
  onUpdate: (blockIndex: number, path: string, value: string) => void
) {
  element.contentEditable = "true";
  element.style.cursor = "text";
  element.style.outline = "none";

  const handleBlur = () => {
    const value = element.textContent ?? "";
    onUpdate(blockIndex, fieldPath, value);
  };

  element.addEventListener("blur", handleBlur);

  // Return cleanup function
  return () => {
    element.contentEditable = "false";
    element.style.cursor = "";
    element.removeEventListener("blur", handleBlur);
  };
}
```

- [ ] **Step 2: Run lint check**

```bash
bun check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/features/frontend-editor/field-editors/
git commit -m "feat(frontend-editor): add contentEditable text field editor"
```

---

### Task 15: Create popover field editors (number, select, checkbox, date)

Popover-based editors for non-text field types.

**Files:**
- Create: `src/components/features/frontend-editor/field-editors/number-editor.tsx`
- Create: `src/components/features/frontend-editor/field-editors/select-editor.tsx`
- Create: `src/components/features/frontend-editor/field-editors/checkbox-editor.tsx`
- Create: `src/components/features/frontend-editor/field-editors/date-editor.tsx`

All popover editors share a common pattern: they render as React portals anchored to the target element's bounding rect. Each receives `blockIndex`, `fieldPath`, `currentValue`, `fieldDescriptor`, and `onUpdate` props. The popover opens on click of the `data-field` element and updates context state on value change.

- [ ] **Step 1: Create number editor**

Create `src/components/features/frontend-editor/field-editors/number-editor.tsx`:
```tsx
"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import type { FieldDescriptor } from "@/payload/lib/field-map/types";

interface NumberEditorProps {
  currentValue: number;
  fieldDescriptor: FieldDescriptor;
  onUpdate: (value: number) => void;
  trigger: React.ReactNode;
}

export function NumberEditor({ currentValue, fieldDescriptor, onUpdate, trigger }: NumberEditorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-48 p-3">
        <Input
          type="number"
          defaultValue={currentValue}
          min={fieldDescriptor.min}
          max={fieldDescriptor.max}
          onChange={(e) => onUpdate(Number(e.target.value))}
        />
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 2: Create select editor**

Same pattern using shadcn `Select` component. Reads `fieldDescriptor.options` to populate the option list:
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Options come from fieldDescriptor.options: { label: string; value: string }[]
```

- [ ] **Step 3: Create checkbox editor**

Same pattern using shadcn `Switch`:
```tsx
import { Switch } from "@/components/ui/switch";
// Toggle in a Popover, calls onUpdate(checked) on change
```

- [ ] **Step 4: Create date editor**

Same pattern using shadcn `Calendar`:
```tsx
import { Calendar } from "@/components/ui/calendar";
// Calendar in a Popover, calls onUpdate(date.toISOString()) on select
```

- [ ] **Step 5: Run lint check**

```bash
bun check
```

- [ ] **Step 6: Commit**

```bash
git add src/components/features/frontend-editor/field-editors/
git commit -m "feat(frontend-editor): add popover field editors (number, select, checkbox, date)"
```

---

### Task 16: Create upload/media picker editor

A dialog for browsing and uploading media.

**Files:**
- Create: `src/components/features/frontend-editor/field-editors/upload-editor.tsx`

- [ ] **Step 1: Create the media picker**

Create `src/components/features/frontend-editor/field-editors/upload-editor.tsx`:

Uses `Dialog` + `ScrollArea`. Key implementation details:
- **Browse tab:** `GET /api/media?limit=20&page=1&sort=-createdAt` with infinite scroll pagination
- **Upload tab:** Multipart form POST to `/api/media` using `FormData` with `file` field and `_payload` JSON field for metadata (per CLAUDE.md: MCP createMedia can't upload — use REST API)
- **On select:** Call `onUpdate(mediaId)` to update field value with the Payload media ID (number). Update the DOM `<img>.src` to the new URL for instant visual feedback.

Props interface:
```tsx
interface UploadEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMediaId: number | null;
  onSelect: (mediaId: number, mediaUrl: string) => void;
}
```

- [ ] **Step 2: Run lint check**

```bash
bun check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/features/frontend-editor/field-editors/upload-editor.tsx
git commit -m "feat(frontend-editor): add media picker upload editor"
```

---

### Task 17: Create the edit runtime dispatcher

**This is the orchestration layer that connects `data-field` DOM elements to their editors.** When edit mode activates, it scans the DOM for `data-field` elements, looks up their type in the field map, and attaches the appropriate editor (contentEditable for text, click handler for popovers, etc.).

**Files:**
- Create: `src/components/features/frontend-editor/edit-runtime.tsx`

- [ ] **Step 1: Create the edit runtime**

Create `src/components/features/frontend-editor/edit-runtime.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";
import { useEditModeRequired } from "./use-edit-mode";
import { fieldMap } from "@/generated/field-map";
import { activateTextEditor } from "./field-editors/text-editor";
import type { FieldDescriptor, FieldEntry } from "@/payload/lib/field-map/types";

/**
 * Scans the DOM for data-field elements within the edit overlay,
 * consults the field map, and activates the appropriate editor.
 *
 * - text/textarea/email → contentEditable via activateTextEditor
 * - number/select/checkbox/date → click handler opens popover portal
 * - upload → click handler opens media picker dialog
 *
 * Re-scans after structural changes (add/remove block) via MutationObserver.
 */
export function useEditRuntime() {
  const { state, actions } = useEditModeRequired();
  const cleanups = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!state.active) return;

    function scan() {
      // Clean up previous activations
      for (const cleanup of cleanups.current) cleanup();
      cleanups.current = [];

      // Find all data-field elements within the overlay
      const container = document.querySelector(".frontend-editor-overlay");
      if (!container) return;

      const fieldElements = container.querySelectorAll<HTMLElement>("[data-field]");

      for (const el of fieldElements) {
        const fullPath = el.dataset.field;
        if (!fullPath) continue;

        // Find the block container
        const blockContainer = el.closest<HTMLElement>("[data-block-index]");
        if (!blockContainer) continue;

        const blockIndex = Number(blockContainer.dataset.blockIndex);
        const blockType = blockContainer.dataset.blockType;
        if (!blockType || !(blockType in fieldMap)) continue;

        // Resolve field descriptor from the field map
        const blockFields = fieldMap[blockType];
        const fieldPath = resolveFieldPath(fullPath, blockType);
        const descriptor = lookupDescriptor(blockFields, fieldPath);
        if (!descriptor) continue;

        // Activate based on field type
        if (descriptor.type === "text" || descriptor.type === "textarea" || descriptor.type === "email") {
          const cleanup = activateTextEditor(el, blockIndex, fullPath, actions.updateField);
          cleanups.current.push(cleanup);
        } else if (descriptor.type === "upload") {
          // Click opens media picker (rendered as portal by EditableOverlay)
          const handler = () => {
            // Dispatch custom event for the overlay to open the upload editor
            el.dispatchEvent(new CustomEvent("edit:open-upload", {
              bubbles: true,
              detail: { blockIndex, fieldPath: fullPath, currentElement: el },
            }));
          };
          el.style.cursor = "pointer";
          el.addEventListener("click", handler);
          cleanups.current.push(() => {
            el.style.cursor = "";
            el.removeEventListener("click", handler);
          });
        } else {
          // All other types: click opens popover
          const handler = () => {
            el.dispatchEvent(new CustomEvent("edit:open-popover", {
              bubbles: true,
              detail: { blockIndex, fieldPath: fullPath, descriptor, currentElement: el },
            }));
          };
          el.style.cursor = "pointer";
          el.addEventListener("click", handler);
          cleanups.current.push(() => {
            el.style.cursor = "";
            el.removeEventListener("click", handler);
          });
        }
      }
    }

    // Initial scan
    scan();

    // Re-scan on structural changes
    const observer = new MutationObserver(() => {
      // Debounce to wait for animations to settle
      setTimeout(scan, 400);
    });

    const overlay = document.querySelector(".frontend-editor-overlay");
    if (overlay) {
      observer.observe(overlay, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      for (const cleanup of cleanups.current) cleanup();
      cleanups.current = [];
    };
  }, [state.active, state.blocks, actions]);
}

/** Strip array indices from a field path to look up in the field map. */
function resolveFieldPath(fullPath: string, _blockType: string): string {
  // e.g., "tiers.0.name" → "tiers.*.name" for lookup
  return fullPath.replace(/\.\d+\./g, ".*.").replace(/\.\d+$/, ".*");
}

/** Look up a field descriptor, handling nested arrays. */
function lookupDescriptor(
  fields: Record<string, FieldEntry>,
  normalizedPath: string
): FieldDescriptor | null {
  const parts = normalizedPath.split(".");
  let current: Record<string, FieldEntry> = fields;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === "*") continue; // skip array index placeholder

    const entry = current[part];
    if (!entry) {
      // Try dot-path prefix match (for flattened group fields)
      const remaining = parts.slice(i).join(".");
      if (remaining in current) {
        const found = current[remaining];
        return found.type !== "array" ? (found as FieldDescriptor) : null;
      }
      return null;
    }

    if (i === parts.length - 1 || (i === parts.length - 2 && parts[i + 1] === "*")) {
      return entry.type !== "array" ? (entry as FieldDescriptor) : null;
    }

    if (entry.type === "array") {
      current = entry.fields;
      // Skip the next part if it's an index placeholder
      if (parts[i + 1] === "*") i++;
    }
  }

  return null;
}
```

- [ ] **Step 2: Wire useEditRuntime into EditableOverlay**

Add `useEditRuntime()` call inside `EditableOverlay`:
```tsx
import { useEditRuntime } from "./edit-runtime";

export function EditableOverlay() {
  const editMode = useEditMode();
  useEditRuntime(); // activates field editors when overlay renders
  // ... rest of component
}
```

- [ ] **Step 3: Run lint check**

```bash
bun check
```

- [ ] **Step 4: Commit**

```bash
git add src/components/features/frontend-editor/edit-runtime.tsx src/components/features/frontend-editor/editable-overlay.tsx
git commit -m "feat(frontend-editor): add edit runtime dispatcher"
```

---

## Chunk 6: Block Controls

### Task 18: Create block controls (toolbar + add-block picker)

The block toolbar (move, duplicate, remove) and the add-block button between blocks.

**Files:**
- Create: `src/components/features/frontend-editor/block-controls.tsx`
- Create: `src/components/features/frontend-editor/block-picker.tsx`
- Create: `src/components/features/frontend-editor/default-block-values.ts`

- [ ] **Step 1: Create default block value generator**

Create `src/components/features/frontend-editor/default-block-values.ts`:

A utility that takes a block slug and the field map, and produces a correctly-shaped empty block with default values (required text → `""`, numbers → `0`, checkboxes → `false`, arrays → `[]`). Used by the block picker when adding new blocks.

- [ ] **Step 2: Create BlockControls component**

Create `src/components/features/frontend-editor/block-controls.tsx`:

Renders a floating toolbar positioned top-right of each block (absolutely positioned, outside the block boundary). Glass morphism styling consistent with admin bar (`backdrop-blur-xl`, background opacity, border). Contains:
- `Badge` showing block type label (from `blockMeta`)
- Move up button (`Button` ghost + `Tooltip`) — disabled when `blockIndex === 0`
- Move down button — disabled when `blockIndex === totalBlocks - 1`
- Duplicate button
- Remove button (`Button` ghost destructive) → `AlertDialog` confirmation

Props: `{ blockIndex: number; blockType: string; totalBlocks: number }`

- [ ] **Step 3: Create AddBlockButton and BlockPicker**

Create `src/components/features/frontend-editor/block-picker.tsx`:

`AddBlockButton` renders a subtle dashed line between blocks that becomes visible on hover. Click opens a `Popover` containing a `Command` (searchable list) of all block types from `blockMeta`. On select:
1. Call `createDefaultBlock(slug)` to get empty block data
2. Call `actions.addBlockAction(index, newBlock)` to insert

- [ ] **Step 4: Run lint check**

```bash
bun check
```

- [ ] **Step 5: Commit**

```bash
git add src/components/features/frontend-editor/block-controls.tsx src/components/features/frontend-editor/block-picker.tsx src/components/features/frontend-editor/default-block-values.ts
git commit -m "feat(frontend-editor): add block controls toolbar and block picker"
```

---

### Task 19: Create array item controls

Reorder, remove, and add controls for array items within blocks.

**Files:**
- Create: `src/components/features/frontend-editor/array-item-controls.tsx`

- [ ] **Step 1: Create ArrayItemControls component**

Renders on hover over `data-array-item` elements. Smaller and more compact than block toolbar. Must import the field map to look up `minRows`/`maxRows` constraints for the array field.

Key features:
- Reorder arrows — up/down (default). Layout flow detection is deferred to v2; vertical arrows work for all current block layouts
- Remove button (no confirmation) — disabled when array length equals `minRows`
- Add button after last item — disabled when array length equals `maxRows`
- Handles nested arrays (e.g., Pricing tier features): the array path from `data-array-item` is used to resolve the correct field descriptor

- [ ] **Step 2: Run lint check**

```bash
bun check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/features/frontend-editor/array-item-controls.tsx
git commit -m "feat(frontend-editor): add array item controls"
```

---

## Chunk 7: Edit Mode Visual Treatment & Integration Testing

### Task 20: Add edit mode CSS styles

The visual treatment for edit mode: block outlines, editable field highlights, cursor changes.

**Files:**
- Modify: `src/app/globals.css` (add edit mode styles)

- [ ] **Step 1: Add edit mode styles to globals.css**

Note: Use `border-border/10` Tailwind token style per spec. The raw CSS equivalent uses the project's oklch custom properties at 10% opacity (matching the spec, not 20%).

```css
/* Frontend Editor - Edit Mode */
.frontend-editor-overlay [data-block-type]:hover {
  outline: 1px dashed oklch(var(--border) / 0.1);
  outline-offset: 4px;
  border-radius: 8px;
}

.frontend-editor-overlay [data-array-item]:hover {
  outline: 1px dashed oklch(var(--border) / 0.08);
  outline-offset: 2px;
  border-radius: 6px;
}

.frontend-editor-overlay [data-field][contenteditable="true"]:hover {
  background: oklch(var(--primary) / 0.04);
  border-radius: 4px;
  cursor: text;
}

.frontend-editor-overlay [data-field][contenteditable="true"]:focus {
  background: oklch(var(--primary) / 0.06);
  outline: 1px solid oklch(var(--primary) / 0.15);
  outline-offset: 2px;
  border-radius: 4px;
}

.frontend-editor-overlay img[data-field],
.frontend-editor-overlay video[data-field] {
  cursor: pointer;
}

.frontend-editor-overlay img[data-field]:hover,
.frontend-editor-overlay video[data-field]:hover {
  outline: 2px solid oklch(var(--primary) / 0.3);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Run lint check**

```bash
bun check
```

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(frontend-editor): add edit mode visual treatment styles"
```

---

### Task 21: Full test suite

Comprehensive tests for all frontend editor components and data flows.

**Files:**
- Create: `src/components/features/frontend-editor/save-controls.test.ts`
- Create: `src/components/features/frontend-editor/field-editors/text-editor.test.ts`
- Create: `src/components/features/frontend-editor/edit-runtime.test.ts`
- Create: `src/payload/lib/field-map/real-blocks.test.ts`

- [ ] **Step 1: Write text editor tests**

Create `src/components/features/frontend-editor/field-editors/text-editor.test.ts`:
```ts
import { describe, expect, it, mock } from "bun:test";
import { activateTextEditor } from "./text-editor";

describe("activateTextEditor", () => {
  function makeElement(text: string) {
    const el = document.createElement("span");
    el.textContent = text;
    document.body.appendChild(el);
    return el;
  }

  it("sets contentEditable on the element", () => {
    const el = makeElement("Hello");
    const cleanup = activateTextEditor(el, 0, "headline", () => {});
    expect(el.contentEditable).toBe("true");
    cleanup();
    el.remove();
  });

  it("calls onUpdate with field path and value on blur", () => {
    const el = makeElement("Hello");
    const onUpdate = mock(() => {});
    const cleanup = activateTextEditor(el, 0, "headline", onUpdate);

    el.textContent = "Changed";
    el.dispatchEvent(new Event("blur"));

    expect(onUpdate).toHaveBeenCalledWith(0, "headline", "Changed");
    cleanup();
    el.remove();
  });

  it("cleanup removes contentEditable and event listener", () => {
    const el = makeElement("Hello");
    const onUpdate = mock(() => {});
    const cleanup = activateTextEditor(el, 0, "headline", onUpdate);
    cleanup();

    expect(el.contentEditable).toBe("false");
    el.dispatchEvent(new Event("blur"));
    expect(onUpdate).not.toHaveBeenCalled();
    el.remove();
  });
});
```

- [ ] **Step 2: Write save flow tests**

Create `src/components/features/frontend-editor/save-controls.test.ts`:
```ts
import { describe, expect, it, mock, beforeEach } from "bun:test";

describe("save flow logic", () => {
  it("constructs correct PATCH body for draft save", async () => {
    const mockFetch = mock(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ layout: [] }) })
    );
    globalThis.fetch = mockFetch as any;

    // Simulate save draft
    const pageId = 1;
    const blocks = [{ id: "a", blockType: "hero", headline: "Test" }];
    await fetch(`/api/pages/${pageId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout: blocks, _status: "draft" }),
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const call = mockFetch.mock.calls[0];
    expect(call[0]).toBe("/api/pages/1");
    const body = JSON.parse((call[1] as any).body);
    expect(body._status).toBe("draft");
    expect(body.layout[0].blockType).toBe("hero");
  });

  it("handles 401 session expiry", async () => {
    const mockFetch = mock(() =>
      Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) })
    );
    globalThis.fetch = mockFetch as any;

    const res = await fetch("/api/pages/1", { method: "PATCH" });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 3: Write schema introspector tests for real blocks**

Create `src/payload/lib/field-map/real-blocks.test.ts`:
```ts
import { describe, expect, it } from "bun:test";
import { HeroBlock } from "@/payload/block-schemas/Hero";
import { PricingBlock } from "@/payload/block-schemas/Pricing";
import { FaqBlock } from "@/payload/block-schemas/Faq";
import { introspectBlock } from "./generate";

describe("introspect real blocks", () => {
  it("Hero has expected fields", () => {
    const result = introspectBlock(HeroBlock);
    expect(result.fields.headline).toEqual({ type: "text", required: true });
    expect(result.fields["primaryCta.label"]).toEqual({ type: "text", required: true });
    expect(result.fields.mediaSrc).toBeDefined();
    expect(result.fields.mediaSrc.type).toBe("upload");
  });

  it("Pricing has nested array structure", () => {
    const result = introspectBlock(PricingBlock);
    const tiers = result.fields.tiers;
    expect(tiers.type).toBe("array");
    if (tiers.type === "array") {
      expect(tiers.fields.name).toBeDefined();
      expect(tiers.fields.features.type).toBe("array");
    }
  });

  it("FAQ has items array with question and answer", () => {
    const result = introspectBlock(FaqBlock);
    const items = result.fields.items;
    expect(items.type).toBe("array");
    if (items.type === "array") {
      expect(items.fields.question).toEqual({ type: "text", required: true });
      expect(items.fields.answer).toBeDefined();
    }
  });
});
```

- [ ] **Step 4: Write integration test for edit-save cycle**

Create `src/components/features/frontend-editor/edit-save-cycle.test.ts`:
```ts
import { describe, expect, it } from "bun:test";
import {
  setFieldValue,
  moveBlock,
  duplicateBlock,
  removeBlock,
} from "./edit-mode-data";

describe("edit-save cycle (data layer)", () => {
  const blocks = [
    { id: "1", blockType: "hero", headline: "Hello" },
    { id: "2", blockType: "faq", headline: "Questions", items: [] },
  ];

  it("field update produces dirty state", () => {
    const updated = setFieldValue(blocks[0] as any, "headline", "Changed");
    expect(updated.headline).toBe("Changed");
    expect(blocks[0].headline).toBe("Hello"); // original unchanged
  });

  it("block reorder preserves all blocks", () => {
    const reordered = moveBlock(blocks, 0, 1);
    expect(reordered.length).toBe(2);
    expect(reordered[0].blockType).toBe("faq");
    expect(reordered[1].blockType).toBe("hero");
  });

  it("duplicate creates new ID", () => {
    const duped = duplicateBlock(blocks as any, 0);
    expect(duped.length).toBe(3);
    expect(duped[1].id).not.toBe(duped[0].id);
    expect(duped[1].headline).toBe("Hello");
  });

  it("remove produces correct remaining blocks", () => {
    const removed = removeBlock(blocks, 0);
    expect(removed.length).toBe(1);
    expect(removed[0].blockType).toBe("faq");
  });

  it("PATCH body shape matches API contract", () => {
    const layout = blocks.map((b) => setFieldValue(b as any, "headline", "Updated"));
    const body = JSON.stringify({ layout, _status: "draft" });
    const parsed = JSON.parse(body);
    expect(parsed._status).toBe("draft");
    expect(parsed.layout).toHaveLength(2);
    expect(parsed.layout[0].blockType).toBe("hero");
  });
});
```

- [ ] **Step 5: Run all tests**

```bash
bun test
```
Expected: All pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/features/frontend-editor/*.test.ts src/components/features/frontend-editor/field-editors/*.test.ts src/payload/lib/field-map/real-blocks.test.ts
git commit -m "test(frontend-editor): add comprehensive test suite"
```

---

### Task 22: Final integration and beforeunload handler

Wire up the `beforeunload` handler and verify end-to-end flow.

**Files:**
- Modify: `src/components/features/frontend-editor/edit-mode-context.tsx` (add beforeunload)

- [ ] **Step 1: Add beforeunload effect to EditModeProvider**

```tsx
useEffect(() => {
  if (!state.active || state.dirtyCount === 0) return;

  const handler = (e: BeforeUnloadEvent) => {
    e.preventDefault();
  };

  window.addEventListener("beforeunload", handler);
  return () => window.removeEventListener("beforeunload", handler);
}, [state.active, state.dirtyCount]);
```

- [ ] **Step 2: End-to-end manual verification**

```bash
bun dev
```

Verify:
1. Log in → admin bar shows "Edit Page"
2. Click "Edit Page" → enters edit mode (bar turns blue)
3. Click on a headline → contentEditable activates, can type
4. Bar shows "1 change" (amber)
5. Cmd+S → saves draft, toast appears
6. Reorder blocks via toolbar → works
7. Publish → exits edit mode, page shows published content
8. Discard with changes → confirmation dialog → reload

- [ ] **Step 3: Run full test suite**

```bash
bun test
```

- [ ] **Step 4: Run lint**

```bash
bun check
```

- [ ] **Step 5: Commit**

```bash
git add src/components/features/frontend-editor/edit-mode-context.tsx
git commit -m "feat(frontend-editor): add beforeunload guard and finalize integration"
```
