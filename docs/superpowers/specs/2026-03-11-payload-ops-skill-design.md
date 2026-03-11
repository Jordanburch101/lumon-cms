# Payload Ops Skill — Design Spec

## Goal

Create a project-specific skill (`payload-ops`) that gives AI agents step-by-step recipes for adding blocks and collections to this Payload CMS + Next.js codebase. The user should be able to say "add X block to Y collection" and the agent follows the recipe without needing to explore the codebase first.

## Architecture

Single skill file at `.agents/skills/payload-ops/SKILL.md`, symlinked to `.claude/skills/payload-ops`. Contains two operation recipes (Add Block, Add Collection) preceded by a shared context section (file map, naming conventions). References the generic `payload` skill for field type documentation and the `design-language` + `theme` skills for component styling.

## Skill Metadata

```yaml
name: payload-ops
description: >
  Project-specific Payload CMS operations: adding blocks and collections.
  Use when the user says "add block", "add collection", "create block",
  "create collection", "new block", "new collection", or any instruction
  to add/create Payload CMS entities in this project. Also use when
  modifying existing block schemas or collection configs.
```

## Shared Context Section

### File Map

| Concern | Location |
|---------|----------|
| Block schemas | `src/payload/block-schemas/{PascalName}.ts` |
| Collections | `src/payload/collections/{PascalName}.ts` |
| Hooks | `src/payload/hooks/{camelName}.ts` |
| Jobs | `src/payload/jobs/{kebab-name}.ts` (export as `{camelName}Task`) |
| Payload utilities | `src/payload/lib/{kebab-name}.ts` |
| Payload config | `src/payload.config.ts` |
| Generated types | `src/payload-types.ts` (auto-generated, do not edit) |
| Block type extraction | `src/types/block-types.ts` |
| Block components | `src/components/blocks/{kebab-name}/` |
| Block renderer | `src/components/blocks/render-blocks.tsx` |
| Frontend pages | `src/app/(frontend)/` |

### Block Naming Conventions

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

> **Known exception:** The Bento block exports `BentoShowcase` (not `Bento`) as its component name. For new blocks, always match the component export to the PascalName.

### Collection Naming Conventions

For a collection called "Blog Post":

| Convention | Value | Where used |
|-----------|-------|------------|
| Collection file | `BlogPosts.ts` | `src/payload/collections/` |
| Collection export | `BlogPosts` | const name, PascalCase **plural** |
| Slug | `blogPosts` | `slug` field, camelCase plural |
| Frontend route | `blog-posts/` | `src/app/(frontend)/` |

> **Note:** Existing collections (`Users`, `Media`, `Pages`) are all single-word plurals. For multi-word names, use camelCase for the slug and PascalCase plural for the export.

### Cross-Cutting Concerns

- **Type generation**: Always run `bun generate:types` after any schema or collection change. This regenerates `src/payload-types.ts`.
- **Lint check**: Always run `bun check` at the end to verify.
- **Media fields**: Use `type: "upload"` with `relationTo: "media"`. In components, use `getMediaUrl()` and `getBlurDataURL()` from `@/core/lib/utils` to handle the `number | Media` union Payload returns.
- **Styling**: Use the `design-language` and `theme` skills when building the component UI.
- **Field reference**: Use the `payload` skill for Payload field types, access control, hooks, and query patterns.

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

Reference existing schemas for patterns:
- Simple: `Hero.ts` (text + upload + groups)
- Medium: `Pricing.ts` (arrays with nested groups)
- Complex: `Bento.ts` (groups with nested objects, arrays, sub-components)

**2. Register in target collection**

File: `src/payload/collections/{Collection}.ts`

- Add import: `import { {PascalName}Block } from "../block-schemas/{PascalName}";`
- Add `{PascalName}Block` to the `blocks` array in the `layout` field (or equivalent blocks field)

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

Note: If the block belongs to a collection other than Pages, you may need to create a new extraction pattern based on that collection's type. The existing `LayoutBlock` type is derived from `Page["layout"]`.

**5. Create the component**

Directory: `src/components/blocks/{kebab-name}/`

Main file: `{kebab-name}.tsx`

```typescript
import type { {PascalName}Block } from "@/types/block-types";

export function {PascalName}({ field1, field2 }: {PascalName}Block) {
  return (
    <section>
      {/* Component markup — use design-language + theme skills */}
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

Split into sub-components when a block has repeating items (cards, rows, etc.) — each in its own file within the folder.

**6. Register in the block renderer**

File: `src/components/blocks/render-blocks.tsx`

- Add import: `import { {PascalName} } from "./{kebab-name}/{kebab-name}";`
- Add switch case:
  ```typescript
  case "{camelName}":
    return <{PascalName} {...block} />;
  ```

Note: If the block belongs to a collection other than Pages that has its own renderer, add the case there instead.

**7. Verify**

```bash
bun check
```

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
    // Add slug field if content has public URLs
    // Add other fields — use the `payload` skill for field type reference
  ],
};
```

If the collection needs a slug field:
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

If the collection needs versioning/drafts:
```typescript
versions: {
  drafts: true,
},
```

If the collection needs a layout blocks field, add blocks the same way Pages does:
```typescript
{
  name: "layout",
  type: "blocks",
  blocks: [
    // Import and list block schemas
  ],
},
```

If the collection has public URLs, add a `meta` group for SEO (follows the Pages pattern):
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

If the collection should be available via MCP tooling, add to the `mcpPlugin` config:

```typescript
mcpPlugin({
  collections: {
    // ... existing
    {pluralCamelName}: { enabled: true, description: "..." },
  },
  // ...
})
```

**4. Regenerate types**

```bash
bun generate:types
```

**5. If collection has a layout/blocks field — add type extraction**

File: `src/types/block-types.ts` (or a new file like `src/types/{collection}-block-types.ts`)

```typescript
import type { {PascalName} } from "@/payload-types";

export type {PascalName}LayoutBlock = NonNullable<{PascalName}["layout"]>[number];

export type Extract{PascalName}Block<T extends {PascalName}LayoutBlock["blockType"]> = Extract<
  {PascalName}LayoutBlock,
  { blockType: T }
>;
```

Also create a renderer component following the pattern in `src/components/blocks/render-blocks.tsx`.

**6. If collection has public URLs — create frontend route**

For a catch-all route (like Pages):

File: `src/app/(frontend)/{pluralKebabName}/[[...slug]]/page.tsx`

Follow the pattern in `src/app/(frontend)/[[...slug]]/page.tsx` — fetch via Payload Local API, render blocks if applicable. Include a `generateMetadata` export for SEO using the collection's `meta` group fields.

For static routes:

File: `src/app/(frontend)/{pluralKebabName}/page.tsx`

**7. Verify**

```bash
bun check
```

## Recipe 3: Modify an Existing Block

When adding or changing fields on an existing block:

1. Edit the block schema in `src/payload/block-schemas/{PascalName}.ts`
2. Run `bun generate:types` to update the generated types
3. Update the component(s) in `src/components/blocks/{kebab-name}/` to use the new/changed fields
4. Run `bun check` to verify

No changes needed to `block-types.ts`, `render-blocks.tsx`, or the collection — those only change when adding or removing entire blocks.

## Deliverables

1. `.agents/skills/payload-ops/SKILL.md` — The skill file
2. `.claude/skills/payload-ops` — Symlink to the above
3. `CLAUDE.md` — Brief reference to the skill in the Payload CMS section
