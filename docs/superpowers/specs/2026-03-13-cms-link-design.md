# CMS Link — Reusable Link Field & Component

## Problem

Every block independently defines its own `{ label, href }` link pattern. There's no internal page picker, no shared `newTab` option (Hero hardcodes `target="_blank"`), no reusable appearance config, and no shared frontend component. This leads to inconsistency, duplication, and no way for editors to link to internal pages by relationship.

## Solution

A reusable `link()` Payload field function and accompanying `<CMSLink>` React component that standardize link handling across all blocks, the rich text editor, and any future link usage.

## Architecture

### File Structure

```
src/payload/fields/link/
  link.ts                    — link() field function → GroupField
  link-label.tsx             — custom Payload admin Label component
  linkable-collections.ts    — shared registry of linkable collection slugs

src/components/ui/
  cms-link.tsx               — React component composing Button + Link primitives
```

### Data Flow

```
link() field function
  → imports linkable collections from shared registry
  → returns GroupField with conditional fields
  → blocks consume via link({ name, appearance }) in their fields array

<CMSLink> component
  → receives populated link data
  → resolves href (external url or internal reference slug)
  → renders via <Button> / <Link> primitives based on appearance
```

## Field Schema — `link()`

### Location

`src/payload/fields/link/link.ts`

### Signature

```ts
export function link(opts?: LinkFieldOptions): GroupField
```

### Config Interface

```ts
interface LinkFieldOptions {
  name?: string           // defaults to 'link'
  label?: string          // defaults to prettified name
  required?: boolean
  appearance?: {
    type: ('button' | 'link')[]
    button?: {
      variants?: ButtonVariant[]   // 'default' | 'outline' | 'secondary' | 'ghost' | 'link'
      sizes?: ButtonSize[]         // 'xs' | 'sm' | 'default' | 'lg'
    }
    link?: {
      variants?: LinkVariant[]     // 'plain' | 'underline' | 'arrow'
    }
  }
}
```

### Core Fields (always present)

| Field | Payload Type | Notes |
|-------|-------------|-------|
| `type` | select | `internal` / `external` — defaults to `external` |
| `label` | text | Display text for the link |
| `url` | text | Shown when `type === 'external'` via `admin.condition` |
| `reference` | relationship | Shown when `type === 'internal'` via `admin.condition`. `relationTo` imported from `linkable-collections.ts` registry |
| `newTab` | checkbox | Default false |

### Appearance Fields (conditional on config)

Only included when `appearance` option is provided to `link()`.

| Field | Condition | Type |
|-------|-----------|------|
| `appearanceType` | `appearance.type` provided | select — subset of `button` / `link` from config |
| `buttonVariant` | `appearanceType === 'button'` | select — from `button.variants` config |
| `buttonSize` | `appearanceType === 'button'` | select — from `button.sizes` config |
| `linkVariant` | `appearanceType === 'link'` | select — from `link.variants` config |

Appearance fields cascade via `admin.condition`: `appearanceType` scopes which variant/size selects are visible. This is standard Payload conditional field behavior.

### Defaults

When appearance is configured and only one option exists for a given field (e.g., `sizes: ['lg']`), that value should be the default. When multiple options exist, the first in the array is the default.

## Admin Label Component

### Location

`src/payload/fields/link/link-label.tsx`

### Purpose

Custom Payload admin `Label` component that renders the field name. Used via the group field's `admin.components.Label` config. Keeps the admin UI clean when multiple link fields exist on a block (e.g., `primaryCta`, `secondaryCta`).

## Linkable Collections Registry

### Location

`src/payload/fields/link/linkable-collections.ts`

### Problem

Block schemas are evaluated *before* `buildConfig()` runs, so the `link()` function cannot scan a finished config object. The relationship field's `relationTo` must be known at import time.

### Solution

A shared manifest that both collections and the link field import:

```ts
// src/payload/fields/link/linkable-collections.ts
export const linkableCollections = ['pages'] as const
export type LinkableCollection = (typeof linkableCollections)[number]
```

The `link()` function imports this array for the `relationTo` value. When a new collection becomes linkable, add its slug to this array and add `custom: { linkable: true }` to the collection config (for documentation/discoverability, even though the array is the source of truth).

### Collection Opt-In

1. Add the slug to `linkableCollections` array
2. Add `custom: { linkable: true }` to the collection config for discoverability:

```ts
export const Pages: CollectionConfig = {
  slug: 'pages',
  custom: { linkable: true },
  // ...existing config
}
```

Initially only `Pages` is linkable. Future collections (Articles, Products, etc.) add themselves to both places.

## React Component — `<CMSLink>`

### Location

`src/components/ui/cms-link.tsx`

### Props

```ts
interface CMSLinkProps {
  link: LinkData              // populated link field data
  className?: string          // override/extend styles
  children?: React.ReactNode  // overrides label text
}
```

### Rendering Logic

1. **Resolve href:**
   - `external` → `url` field directly
   - `internal` → build path from populated `reference` slug (`/` for home, `/${slug}` for others)

2. **Determine element:**
   - `newTab === true` → `<a>` with `target="_blank"` `rel="noopener noreferrer"`
   - `internal` → Next.js `<Link>`
   - `external` without `newTab` → `<a>`

3. **Apply appearance:**
   - No appearance data → plain `<Link>` / `<a>` with just `className`
   - `appearanceType === 'button'` → `<Button asChild variant={buttonVariant} size={buttonSize}><Link/a>{content}</Link/a></Button>`
   - `appearanceType === 'link'` → styled `<Link>` / `<a>` with variant-specific classes (underline, arrow icon, etc.)

4. **Content:** `children ?? label`

### Dependencies

Imports from existing UI primitives:
- `<Button>` from `@/components/ui/button`
- `<Link>` from `next/link`
- Arrow icon from `@hugeicons/react` (for `arrow` link variant)

## Block Migration

### Strategy

Clean break — delete existing page data and re-seed with the new field structure. This is a template/demo site, so no production data migration needed.

### Blocks to Refactor

Each block replaces its ad-hoc link fields with `link()` calls. Appearance defaults match the current visual style so blocks look identical after migration.

| Block | Current Fields | New Fields | Appearance Config |
|-------|---------------|------------|-------------------|
| **Hero** | `primaryCta: { label, href }`, `secondaryCta: { label, href }` | `link({ name: 'primaryCta', appearance: { type: ['button'], button: { variants: ['default', 'outline'], sizes: ['lg'] } } })`, `link({ name: 'secondaryCta', appearance: { type: ['button'], button: { variants: ['default', 'outline'], sizes: ['lg'] } } })` | Primary defaults: `button` / `default` / `lg`. Secondary defaults: `button` / `outline` / `lg` |
| **CinematicCta** | `cta: { label, href }` | `link({ name: 'cta', appearance: { type: ['button'], button: { variants: ['default', 'outline'], sizes: ['lg'] } } })` | Defaults: `button` / `default` / `lg` |
| **Pricing** | `tiers[].cta: { label, href }` | `link({ name: 'cta', required: true, appearance: { type: ['button'], button: { variants: ['default', 'outline'], sizes: ['lg'] } } })` inside tiers array | Defaults: `button` / `default` / `lg` |
| **SplitMedia** | `rows[].cta: { label, href }` | `link({ name: 'cta', appearance: { type: ['link'], link: { variants: ['arrow', 'plain'] } } })` inside rows array | Defaults: `link` / `arrow` |
| **Faq** | `cta: { text, label, href }` | `link({ name: 'cta' })` + `text` remains a sibling text field outside the link group | No appearance — plain link |
| **LatestArticles** | `articles[].href` | Keep as-is — these are card-level links, not CMS links. The whole card is the link. | N/A |

### Rich Text Button Block

`src/payload/editor/blocks/button.ts` — refactored to use the shared link field with appearance config. The current block uses `primary`/`secondary`/`outline` variants and `sm`/`md`/`lg` sizes. These map to the shared system as:

| Current | Shared |
|---------|--------|
| `primary` | `default` (shadcn Button default variant) |
| `secondary` | `secondary` |
| `outline` | `outline` |
| `sm` | `sm` |
| `md` | `default` |
| `lg` | `lg` |

The converter (`button.tsx`) updated to use `<CMSLink>` instead of its custom styled `<a>` tag.

### Block-Specific Style Overrides

Some blocks apply custom className overrides on top of the standard appearance variants. The `<CMSLink>` component's `className` prop handles this — blocks pass additional classes that merge with the variant styles via `cn()`.

Notable cases:
- **Hero primary CTA**: `className="bg-white text-black hover:bg-white/90"` — overrides the default variant colors because the hero sits on a dark image background
- **Hero secondary CTA**: `className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"` — outline variant with light-on-dark colors
- **Pricing recommended tier**: `className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"` — inverted color scheme for emphasis

These overrides stay in the block components, not in the link data. The link field stores the semantic variant (`default`, `outline`), and the block component adds contextual styling.

## Type Safety

The `link()` function returns a standard Payload `GroupField`. Types for the link data shape used by `<CMSLink>` should be defined alongside the component or in `src/types/`. These types should match the field structure produced by `link()` so populated data flows cleanly from Payload queries to the React component.

## Out of Scope

- Custom admin UI beyond the Label component — standard Payload fields and conditional logic
- Navigation/navbar/footer links — these are currently hardcoded data, not CMS-managed. Could adopt `<CMSLink>` later but not part of this work.
- Frontend editor integration — the frontend editor can pick up CMS link fields via the existing field map system once the core field is in place
