# Rich Text System Design

A full rich text system for the Lumon Payload project: Lexical editor config with custom inline blocks, editor preview components, and a flexible `<RichText>` renderer with Tailwind Typography + theme integration.

## Goals

- Provide a fully-featured Lexical editor config reusable across any block or collection
- Ship 5 custom blocks (Callout, Button, Media, Accordion, Embed) with in-editor previews
- Build a `<RichText>` renderer with sensible defaults, override support, and size variants
- Deliver a standalone RichText content block for freeform page sections
- Style prose output to match the Lumon/Severance aesthetic

## Architecture

**Approach: Hybrid — config in Payload, feature module for UI.**

```
src/payload/
  editor/
    config.ts              ← Lexical editor config with all features
    blocks/
      callout.ts           ← Callout block schema
      button.ts            ← Button block schema
      media.ts             ← Media block schema
      accordion.ts         ← Accordion block schema
      embed.ts             ← Embed block schema
      index.ts             ← Re-exports all blocks
src/components/features/rich-text/
  rich-text.tsx            ← <RichText> server component renderer
  converters/
    index.ts               ← Default converter map (custom + built-in merged)
    callout.tsx
    button.tsx
    media.tsx
    accordion.tsx
    embed.tsx
    horizontal-rule.tsx
  editor-previews/
    callout-preview.tsx    ← Client component for admin editor
    button-preview.tsx
    media-preview.tsx
    accordion-preview.tsx
    embed-preview.tsx
  index.ts                 ← Public API: re-exports RichText + editor config
```

## Editor Config

`src/payload/editor/config.ts` exports `richTextEditor` — a configured `lexicalEditor()` instance.

### Features enabled

**Toolbars:**
- `FixedToolbarFeature()` — persistent toolbar above editor
- `InlineToolbarFeature()` — floating toolbar on text selection

**Headings:**
- `HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] })` — H1 excluded (page title comes from parent)

**Links:**
- `LinkFeature({ enabledCollections: ['pages'] })` — internal link picker for Pages collection

**Uploads:**
- `UploadFeature({ collections: { media: { fields: [] } } })` — wired to Media collection. The built-in Upload node has no extra inline fields; all rich media with captions/credits uses the custom `richTextMedia` block instead.

**Tables:**
- `EXPERIMENTAL_TableFeature()` — stable enough in 3.79

**Custom blocks (via `BlocksFeature`):**
- Callout, Button (richTextButton), Media (richTextMedia), Accordion, Embed

**Format features:** All defaults (bold, italic, underline, strikethrough, subscript, superscript, inline code)

**List features:** All defaults (ordered, unordered, checklist)

**Other:** `HorizontalRuleFeature()`, `AlignFeature()`, `IndentFeature()`, `ParagraphFeature()`, `BlockquoteFeature()`

## Custom Block Schemas

Editor inline block schemas use lowercase filenames (e.g., `callout.ts`, `button.ts`) to distinguish them from PascalCase page-level block schemas in `block-schemas/` (e.g., `Hero.ts`, `Bento.ts`).

### Callout (`src/payload/editor/blocks/callout.ts`)

| Field | Type | Options/Default | Required |
|-------|------|-----------------|----------|
| `variant` | select | `info`, `warning`, `tip`, `error` / default: `info` | no |
| `title` | text | — | no |
| `content` | textarea | — | yes |

### Button (`src/payload/editor/blocks/button.ts`)

Slug: `richTextButton` (prefixed to avoid collision with UI button).

| Field | Type | Options/Default | Required |
|-------|------|-----------------|----------|
| `label` | text | — | yes |
| `href` | text | — | yes |
| `variant` | select | `primary`, `secondary`, `outline` / default: `primary` | no |
| `size` | select | `sm`, `md`, `lg` / default: `md` | no |
| `newTab` | checkbox | default: `false` | no |

### Media (`src/payload/editor/blocks/media.ts`)

Slug: `richTextMedia` (prefixed to avoid collision with Media collection).

| Field | Type | Options/Default | Required |
|-------|------|-----------------|----------|
| `mediaSrc` | upload (→ media) | — | yes |
| `caption` | text | — | no |
| `credit` | text | — | no |
| `creditUrl` | text | — | no |
| `size` | select | `full`, `large`, `medium`, `small` / default: `full` | no |
| `alignment` | select | `left`, `center`, `right` / default: `center` | no |
| `rounded` | checkbox | default: `true` | no |

**Credit rendering:** Badge overlay at bottom-right of image with `bg-black/60 text-white/80 text-[11px] backdrop-blur-sm`. Camera icon + credit name. Links to `creditUrl` if set.

**Caption rendering:** Below image in `text-muted-foreground`.

### Accordion (`src/payload/editor/blocks/accordion.ts`)

| Field | Type | Options/Default | Required |
|-------|------|-----------------|----------|
| `items` | array | — | yes |
| `items.*.title` | text | — | yes |
| `items.*.content` | textarea | — | yes |

### Embed (`src/payload/editor/blocks/embed.ts`)

| Field | Type | Options/Default | Required |
|-------|------|-----------------|----------|
| `url` | text | — | yes |
| `aspectRatio` | select | `16:9`, `4:3`, `1:1` / default: `16:9` | no |
| `maxWidth` | select | `full`, `large`, `medium` / default: `large` | no |

Provider auto-detection from URL: YouTube, Vimeo, X/Twitter, generic iframe fallback. Generic iframe fallback validates URLs against an allowlist of trusted domains and uses the `sandbox` attribute on iframes for security.

## Editor Preview Components

Client-side (`'use client'`) React components that render inside the Payload admin Lexical editor. Authors see styled previews inline with their prose.

| Block | Preview behavior |
|-------|-----------------|
| **Callout** | Colored left border + variant icon + label + content text. Four color variants: info (blue), warning (amber), tip (green), error (red). |
| **Button** | Rendered as a styled pill showing label and variant. Non-interactive in editor. |
| **Media** | Thumbnail of selected media with caption below and credit badge overlay. Size/alignment shown as badge. |
| **Accordion** | Collapsed rows with chevron icons. Item count label. Non-expandable in editor. |
| **Embed** | Provider icon (auto-detected) + truncated URL + aspect ratio label. No live embed. |

All preview components use Tailwind classes and receive block field data as props from Lexical.

**Wiring:** Each block schema in `src/payload/editor/blocks/` registers its preview via the block's `admin.components.Block` path pointing to the corresponding client component in `src/components/features/rich-text/editor-previews/`.

## `<RichText>` Renderer

`src/components/features/rich-text/rich-text.tsx` — a server component.

### Props

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `data` | `SerializedEditorState` | required | Lexical JSON from Payload |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Controls prose typography scale |
| `converters` | `JSXConverters` | `{}` | Override any node type's renderer (deep-merged) |
| `disableBlocks` | `string[]` | `[]` | Skip rendering specific block types (filters block slugs from converter map) |
| `className` | `string` | `''` | Additional classes on wrapper |

### Usage examples

```tsx
// Basic — sensible defaults, Lumon prose styling
<RichText data={page.content} />

// Size variant
<RichText data={page.content} size="sm" />

// Converter overrides (block converters nest under `blocks` key)
<RichText
  data={page.content}
  converters={{
    blocks: {
      richTextButton: ({ node }) => <CustomButton {...node.fields} />,
    },
  }}
/>

// Disable specific blocks in compact contexts
<RichText data={faq.answer} disableBlocks={['accordion', 'embed']} />
```

### Implementation

Uses `@payloadcms/richtext-lexical/react`'s `RichText` component internally. Converter merge strategy (deep merge, not shallow spread):

```ts
{
  ...defaultJSXConverters,
  ...customConverters,
  blocks: {
    ...defaultJSXConverters.blocks,
    ...customConverters.blocks,
    ...consumerOverrides.blocks,
  },
}
```

Consumer overrides take highest priority. `disableBlocks` is implemented by removing matching block slugs from the `blocks` converter map before passing to the upstream component.

### Edge cases

- `data` is `null` or `undefined` → render nothing (return `null`)
- Empty editor state (valid JSON, no content nodes) → render nothing
- Malformed data → render nothing, log warning in development

## Prose Styling

Tailwind Typography (`@tailwindcss/typography`) with Lumon theme overrides.

### Size mapping

| `size` prop | Prose class |
|---|---|
| `sm` | `prose prose-sm` |
| `md` | `prose prose-base` |
| `lg` | `prose prose-lg` |

### Theme overrides

```
prose dark:prose-invert max-w-none
prose-headings:font-semibold prose-headings:leading-tight prose-headings:tracking-tight
prose-p:text-muted-foreground
prose-a:text-foreground prose-a:underline-offset-4 prose-a:decoration-border hover:prose-a:decoration-foreground
prose-blockquote:border-border prose-blockquote:text-muted-foreground
prose-code:font-mono prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.875em]
prose-hr:border-border
prose-img:hidden
```

Key decisions:
- `max-w-none` — width controlled by parent, not prose
- `prose-img:hidden` — media handled by custom Media converter with caption/credit
- Font inherits Nunito Sans from page
- Dark mode via `dark:prose-invert`

## RichText Content Block

`src/payload/block-schemas/RichTextContent.ts` — a standalone page-level block for freeform content sections.

Slug: `richTextContent`

### Fields

| Field | Type | Options/Default | Required |
|-------|------|-----------------|----------|
| `content` | richText (uses `richTextEditor`) | — | yes |
| `maxWidth` | select | `narrow`, `default`, `wide` / default: `default` | no |

### Width mapping

| `maxWidth` | Container classes |
|---|---|
| `narrow` | `max-w-2xl mx-auto` |
| `default` | `max-w-4xl mx-auto` |
| `wide` | `max-w-7xl mx-auto` |

Registered in Pages layout blocks alongside Hero, Bento, etc. Rendered via `render-blocks.tsx` mapper.

## Custom Converter Details

### Callout converter

Renders as a `<div>` with colored left border, icon, optional title, and content. Variant determines border color and icon:
- `info` — blue, info circle icon
- `warning` — amber, triangle icon
- `tip` — green, lightbulb icon
- `error` — red, x-circle icon

### Button converter

Renders as an `<a>` styled with the project's button patterns. Maps `variant` and `size` to classes. `newTab` adds `target="_blank" rel="noopener noreferrer"`.

### Media converter

Renders as a `<figure>` with:
- Image/video from Media collection (Next.js Image for images)
- Credit badge overlay (bottom-right, `bg-black/60 backdrop-blur-sm`) with optional link
- `<figcaption>` for caption text below
- Size/alignment classes on the figure container

### Accordion converter

Uses shadcn `Accordion` component (`@/components/ui/accordion`). Maps `items` array to `AccordionItem` with `AccordionTrigger` + `AccordionContent`.

### Embed converter

Provider detection from URL pattern:
- `youtube.com` / `youtu.be` → YouTube oEmbed iframe
- `vimeo.com` → Vimeo iframe
- `x.com` / `twitter.com` → X embed script
- Fallback → generic iframe

Wrapped in aspect-ratio container based on `aspectRatio` field. Max-width applied from `maxWidth` field.

### Horizontal rule converter

Styled `<hr>` with `border-border` to match the Lumon divider pattern.

## Future Integration Points

These are **not** part of the initial build but enabled by the system:

- FAQ `answer` field → swap textarea for richText
- SplitMedia `body` field → swap textarea for richText
- Testimonial `featuredQuote` → swap textarea for richText
- Blog/Articles collection → use richText for post body
- Any new block that needs prose content → import `richTextEditor`

## Dependencies

- `@payloadcms/richtext-lexical` — already installed at ^3.79.0
- `@tailwindcss/typography` — needs to be installed (`bun add @tailwindcss/typography`) and imported in `src/app/globals.css` via `@import "@tailwindcss/typography"` (after `@import "tailwindcss"`) — this is the Tailwind v4 integration path (no config file needed)
- `@/components/ui/accordion` — shadcn accordion for the Accordion converter (install if not present)

## Scope Boundaries

**In scope (initial build):**
- Editor config with all features + 5 custom blocks
- Block schemas for custom blocks
- Editor preview components (client-side)
- `<RichText>` renderer with converters, overrides, size variants
- RichTextContent page-level block
- Prose styling with Lumon theme
- Registration in `render-blocks.tsx`

**Out of scope:**
- Migrating existing textarea fields to richText (future)
- Blog/Articles collection (separate project)
- Custom Lexical plugins beyond BlocksFeature
- Collaborative editing / real-time features
- Rich text search/indexing
