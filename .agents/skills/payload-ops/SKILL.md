---
name: payload-ops
description: >
  Project-specific Payload CMS operations: adding blocks, collections, and modifying existing schemas.
  Use when the user says "add block", "add collection", "create block", "create collection",
  "new block", "new collection", or any instruction to add/create/modify Payload CMS entities
  in this project. Also use when modifying existing block schemas or collection configs.
---

# Payload Ops — Project Recipes

Step-by-step recipes for adding blocks and collections to this codebase. Follow these exactly — they encode the project's naming conventions, file locations, and type system patterns.

## File Map

| Concern | Location |
|---------|----------|
| Block schemas | `src/payload/block-schemas/{PascalName}.ts` |
| Editor config | `src/payload/editor/config.ts` |
| Editor blocks | `src/payload/editor/blocks/{camelName}.ts` |
| Collections | `src/payload/collections/{PluralPascalName}.ts` |
| Hooks | `src/payload/hooks/{camelName}.ts` |
| Jobs | `src/payload/jobs/{kebab-name}.ts` (export as `{camelName}Task`) |
| Payload utilities | `src/payload/lib/{kebab-name}.ts` |
| Payload config | `src/payload.config.ts` |
| Generated types | `src/payload-types.ts` (auto-generated, never hand-edit) |
| Block type extraction | `src/types/block-types.ts` |
| Block components | `src/components/blocks/{kebab-name}/` |
| Block renderer | `src/components/blocks/render-blocks.tsx` |
| Storybook fixtures | `src/components/blocks/__fixtures__/block-fixtures.ts` |
| Rich text converters | `src/components/features/rich-text/converters/{kebab-name}.tsx` |
| Rich text converter index | `src/components/features/rich-text/converters/index.tsx` |
| Frontend pages | `src/app/(frontend)/` |

## Naming Conventions

### Blocks

For a block called "Feature Grid":

| Convention | Value | Where used |
|-----------|-------|------------|
| Schema file | `FeatureGrid.ts` | `src/payload/block-schemas/` |
| Schema export | `FeatureGridBlock` | const name in schema file |
| Slug | `featureGrid` | `slug` field, `blockType` discriminant |
| Labels | `{ singular: "Feature Grid", plural: "Feature Grids" }` | schema labels |
| Component folder | `feature-grid/` | `src/components/blocks/` |
| Component file | `feature-grid.tsx` | main component file |
| Component export | `FeatureGrid` | named export |
| Type export | `FeatureGridBlock` | `src/types/block-types.ts` |

> **Known exception:** The Bento block exports `BentoShowcase` (not `Bento`) as its component name. For all new blocks, match the component export to the PascalName.

### Collections

For a collection called "Blog Post":

| Convention | Value | Where used |
|-----------|-------|------------|
| Collection file | `BlogPosts.ts` | `src/payload/collections/` |
| Collection export | `BlogPosts` | const name, PascalCase **plural** |
| Slug | `blogPosts` | `slug` field, camelCase plural |
| Frontend route | `blog-posts/` | `src/app/(frontend)/` |

> Existing collections (`Users`, `Media`, `Pages`) are all single-word plurals. For multi-word names, use camelCase for the slug and PascalCase plural for the export.

## Cross-Cutting Concerns

- **Type generation**: Always run `bun generate:types` after any schema or collection change. This regenerates `src/payload-types.ts`.
- **Lint check**: Always run `bun check` at the end to verify.
- **Media fields**: Use `type: "upload"` with `relationTo: "media"` in schemas. In components, use `getMediaUrl()` and `getBlurDataURL()` from `@/core/lib/utils` to handle the `number | Media` union Payload returns.
- **Styling**: Use the `design-language` and `theme` skills when building component UI.
- **Field reference**: Use the `payload` skill for Payload field types, access control, hooks, and query patterns.
- **Not everything in `src/components/blocks/` is a Payload block** — some (like `mdr-terminal`) are standalone feature components that happen to live there.

---

## Recipe 1: Add a Block

### Prerequisites
- Know the block name and what fields it needs
- Know which collection(s) it should be available in

### Steps

**1. Create the block schema**

File: `src/payload/block-schemas/{PascalName}.ts`

```typescript
import type { Block } from "payload";

export const {PascalName}Block: Block = {
  slug: "{camelName}",
  labels: { singular: "{Human Name}", plural: "{Human Names}" },
  fields: [
    // Define fields here — use the `payload` skill for field type reference
  ],
};
```

Reference existing schemas for complexity:
- **Simple**: `Hero.ts` — text fields + upload + groups
- **Medium**: `Pricing.ts` — arrays with nested groups, checkbox
- **Complex**: `Bento.ts` — groups with nested objects, arrays, multiple sub-component data

**2. Register in target collection**

File: `src/payload/collections/{Collection}.ts`

- Add import: `import { {PascalName}Block } from "../block-schemas/{PascalName}";`
- Add `{PascalName}Block` to the `blocks` array in the `layout` field

**3. Regenerate types**

```bash
bun generate:types
```

This updates `src/payload-types.ts` with the new block's discriminated union member.

**4. Add type extraction**

File: `src/types/block-types.ts`

Add a new type export:
```typescript
export type {PascalName}Block = ExtractBlock<"{camelName}">;
```

> If the block belongs to a collection other than Pages, you may need a new extraction pattern. The existing `LayoutBlock` type is derived from `Page["layout"]`. See Recipe 2 Step 5 for the collection-specific pattern.

**5. Create the component**

Directory: `src/components/blocks/{kebab-name}/`

Main file: `{kebab-name}.tsx`

```typescript
import type { {PascalName}Block } from "@/types/block-types";

export function {PascalName}({ field1, field2 }: {PascalName}Block) {
  return (
    <section>
      {/* Use design-language + theme skills for markup */}
    </section>
  );
}
```

For media fields:
```typescript
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";

const url = getMediaUrl(mediaSrc);
const blurDataURL = getBlurDataURL(mediaSrc);
```

For blocks with repeating items (cards, rows), split into sub-components — each in its own file within the folder. Use indexed access types for sub-component props:
```typescript
// In the sub-component file
import type { {PascalName}Block } from "@/types/block-types";

type {ItemName}Props = {PascalName}Block["{arrayField}"][number];

export function {ItemName}({ field1, field2 }: {ItemName}Props) {
  // ...
}
```

**6. Register in the block renderer**

File: `src/components/blocks/render-blocks.tsx`

- Add import: `import { {PascalName} } from "./{kebab-name}/{kebab-name}";`
- Add switch case (the `key` prop is handled by the parent `RenderBlocks` wrapper):
  ```typescript
  case "{camelName}":
    return <{PascalName} {...block} />;
  ```

> If the block belongs to a collection other than Pages that has its own renderer, add the case there instead.

**7. Add Storybook fixture**

File: `src/components/blocks/__fixtures__/block-fixtures.ts`

Add an entry to `blockFixtures` with sample props for the new block. Use the existing `mockMedia()` and `mockCta()` helpers for media and CTA fields.

```typescript
{camelName}: {
  blockType: "{camelName}",
  // Add all required props with sample values
  headline: "Sample headline",
  // For media fields:
  mediaSrc: mockMedia("{Human Name}", 800, 600),
  // For CTA fields:
  primaryCta: mockCta("Get Started"),
},
```

If the block has select/variant fields, also add control definitions to `blockArgTypes`:

```typescript
{camelName}: {
  variant: {
    control: "select",
    options: ["option1", "option2"],
    description: "Description of the field",
  },
},
```

The story will appear automatically on next `bun storybook`. No manual story file needed.

**8. Verify**

```bash
bun check
```

---

## Recipe 2: Add a Collection

### Prerequisites
- Know the collection name, purpose, and fields
- Know if it needs a layout/blocks field
- Know if it needs a frontend route

### Steps

**1. Create the collection file**

File: `src/payload/collections/{PluralPascalName}.ts`

```typescript
import type { CollectionConfig } from "payload";

export const {PluralPascalName}: CollectionConfig = {
  slug: "{pluralCamelName}",
  admin: {
    useAsTitle: "{titleField}",
    defaultColumns: ["{titleField}", "slug", "updatedAt"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "{titleField}",
      type: "text",
      required: true,
    },
    // Use the `payload` skill for field type reference
  ],
};
```

**Optional field patterns** (add as needed):

Slug field (for content with public URLs):
```typescript
{
  name: "slug",
  type: "text",
  required: true,
  unique: true,
  index: true,
  admin: { position: "sidebar" },
},
```

Versioning/drafts:
```typescript
versions: {
  drafts: true,
},
```

Layout blocks field (same pattern as Pages):
```typescript
{
  name: "layout",
  type: "blocks",
  blocks: [
    // Import and list block schemas
  ],
},
```

SEO meta group (for content with public URLs — follows Pages pattern):
```typescript
{
  name: "meta",
  type: "group",
  fields: [
    { name: "title", type: "text" },
    { name: "description", type: "textarea" },
    { name: "image", type: "upload", relationTo: "media" },
  ],
},
```

**2. Register in Payload config**

File: `src/payload.config.ts`

- Add import: `import { {PluralPascalName} } from "./payload/collections/{PluralPascalName}";`
- Add to `collections` array: `[Users, Media, Pages, {PluralPascalName}]`

**3. Optionally register in MCP plugin**

If the collection should be available via MCP tooling, add to the `mcpPlugin` config in `payload.config.ts`:

```typescript
{pluralCamelName}: { enabled: true, description: "..." },
```

**4. Regenerate types**

```bash
bun generate:types
```

**5. If collection has a layout/blocks field — add type extraction**

File: `src/types/block-types.ts` (or a new file like `src/types/{collection}-block-types.ts`)

```typescript
import type { {SingularPascalName} } from "@/payload-types";

export type {SingularPascalName}LayoutBlock = NonNullable<{SingularPascalName}["layout"]>[number];

export type Extract{SingularPascalName}Block<T extends {SingularPascalName}LayoutBlock["blockType"]> = Extract<
  {SingularPascalName}LayoutBlock,
  { blockType: T }
>;
```

Also create a renderer component following the pattern in `src/components/blocks/render-blocks.tsx`.

**6. If collection has public URLs — create frontend route**

For a catch-all route (like Pages):

File: `src/app/(frontend)/{plural-kebab-name}/[[...slug]]/page.tsx`

Follow the pattern in `src/app/(frontend)/[[...slug]]/page.tsx`:
- Fetch via Payload Local API
- Render blocks if applicable
- Export `generateMetadata` for SEO using the collection's `meta` group fields

For static listing routes:

File: `src/app/(frontend)/{plural-kebab-name}/page.tsx`

**7. Verify**

```bash
bun check
```

---

## Recipe 3: Modify an Existing Block

When adding, changing, or removing fields on an existing block:

1. Edit the block schema in `src/payload/block-schemas/{PascalName}.ts`
2. Run `bun generate:types` to update the generated types
3. Update the component(s) in `src/components/blocks/{kebab-name}/` to use the new/changed fields
4. Run `bun check` to verify

No changes needed to `block-types.ts`, `render-blocks.tsx`, or the collection file — those only change when adding or removing entire blocks.

---

## Recipe 4: Add a Rich Text Editor Block

Rich text editor blocks appear inside the Lexical editor (callout boxes, media embeds, buttons, etc.) — different from layout blocks which are top-level page sections.

### Steps

**1. Create the editor block definition**

File: `src/payload/editor/blocks/{camelName}.ts`

```typescript
import type { Block } from "payload";

export const {PascalName}Block: Block = {
  slug: "{camelName}",
  labels: { singular: "{Human Name}", plural: "{Human Names}" },
  fields: [
    // Define fields here
  ],
};
```

**2. Register in editor config**

File: `src/payload/editor/config.ts`

- Add import: `import { {PascalName}Block } from "./blocks/{camelName}";`
- Add to the `blocks` array in `BlocksFeature.configure()`

**3. Create the frontend converter**

File: `src/components/features/rich-text/converters/{kebab-name}.tsx`

```typescript
export function {PascalName}Converter({
  node,
}: {
  node: {
    fields: { /* match your block fields */ };
  };
}) {
  return (
    <div className="not-prose my-6">
      {/* Render the block — use theme skill for styling */}
    </div>
  );
}
```

Key patterns:
- Use `not-prose` class to escape Tailwind Typography
- Use `my-6` or `my-8` for vertical spacing
- Server-renderable only — no client components, no Radix/Hugeicons (causes Suspense errors)
- Use pure HTML/SVG for icons

**4. Register the converter**

File: `src/components/features/rich-text/converters/index.tsx`

- Add import: `import { {PascalName}Converter } from "./{kebab-name}";`
- Add to `customBlockConverters`: `{camelName}: {PascalName}Converter,`

**5. Verify**

```bash
bun check
```

> **Important**: Rich text converters run in a server component context. Do not import `"use client"` components (shadcn, Radix, Hugeicons). Use inline SVG for icons and pure CSS for styling.
