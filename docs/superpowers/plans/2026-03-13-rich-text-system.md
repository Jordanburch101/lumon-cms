# Rich Text System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete rich text system with a configured Lexical editor, 5 custom inline blocks with editor previews, and a flexible `<RichText>` renderer.

**Architecture:** Hybrid approach — editor config and block schemas live in `src/payload/editor/`, all rendering components live in `src/components/features/rich-text/`. A standalone `RichTextContent` page block enables freeform content sections.

**Tech Stack:** Payload CMS 3.79 Lexical editor, `@payloadcms/richtext-lexical`, `@tailwindcss/typography`, shadcn Accordion, motion/react, Next.js Image.

**Spec:** `docs/superpowers/specs/2026-03-13-rich-text-system-design.md`

---

## File Map

### New Files

```
src/payload/editor/
  config.ts                          ← Lexical editor config with all features
  blocks/
    callout.ts                       ← Callout block schema
    button.ts                        ← Button (richTextButton) block schema
    media.ts                         ← Media (richTextMedia) block schema
    accordion.ts                     ← Accordion block schema
    embed.ts                         ← Embed block schema
    index.ts                         ← Re-exports all editor blocks

src/payload/block-schemas/
  RichTextContent.ts                 ← Page-level RichText content block

src/components/features/rich-text/
  rich-text.tsx                      ← <RichText> server component renderer
  converters/
    index.tsx                        ← Default converter map (merges custom + built-in)
    callout.tsx                      ← Callout → React
    button.tsx                       ← Button → React
    media.tsx                        ← Media → React (with credit badge)
    accordion.tsx                    ← Accordion → React (uses shadcn)
    embed.tsx                        ← Embed → React (provider detection + iframe)
    horizontal-rule.tsx              ← Styled HR
  editor-previews/
    callout-preview.tsx              ← Client component for admin editor
    button-preview.tsx               ← Client component for admin editor
    media-preview.tsx                ← Client component for admin editor
    accordion-preview.tsx            ← Client component for admin editor
    embed-preview.tsx                ← Client component for admin editor
  index.ts                           ← Public API re-exports

src/components/blocks/rich-text-content/
  rich-text-content.tsx              ← Page block component wrapping <RichText>
```

### Modified Files

```
src/payload.config.ts                ← No change needed (global editor stays default)
src/payload/collections/Pages.ts     ← Add RichTextContentBlock to layout blocks
src/components/blocks/render-blocks.tsx ← Add richTextContent case
src/types/block-types.ts             ← Add RichTextContentBlock type export
src/app/globals.css                  ← Add @tailwindcss/typography import
```

---

## Chunk 1: Dependencies & Editor Config

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Install @tailwindcss/typography**

```bash
bun add @tailwindcss/typography
```

- [ ] **Step 2: Add typography import to globals.css**

In `src/app/globals.css`, add the import after `tailwindcss` but before `tw-animate-css`. The file starts with:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
```

Add `@import "@tailwindcss/typography";` between the first two:

```css
@import "tailwindcss";
@import "@tailwindcss/typography";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
```

- [ ] **Step 3: Verify dev server still starts**

```bash
bun dev
```

Expected: Dev server starts without errors. The `prose` classes should now be available.

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lockb src/app/globals.css
git commit -m "chore: add @tailwindcss/typography for rich text prose styling"
```

---

### Task 2: Create editor inline block schemas

**Files:**
- Create: `src/payload/editor/blocks/callout.ts`
- Create: `src/payload/editor/blocks/button.ts`
- Create: `src/payload/editor/blocks/media.ts`
- Create: `src/payload/editor/blocks/accordion.ts`
- Create: `src/payload/editor/blocks/embed.ts`
- Create: `src/payload/editor/blocks/index.ts`

- [ ] **Step 1: Create callout block schema**

Create `src/payload/editor/blocks/callout.ts`:

```ts
import type { Block } from "payload";

export const CalloutBlock: Block = {
  slug: "callout",
  labels: { singular: "Callout", plural: "Callouts" },
  fields: [
    {
      name: "variant",
      type: "select",
      defaultValue: "info",
      options: [
        { label: "Info", value: "info" },
        { label: "Warning", value: "warning" },
        { label: "Tip", value: "tip" },
        { label: "Error", value: "error" },
      ],
    },
    { name: "title", type: "text" },
    { name: "content", type: "textarea", required: true },
  ],
};
```

- [ ] **Step 2: Create button block schema**

Create `src/payload/editor/blocks/button.ts`:

```ts
import type { Block } from "payload";

export const RichTextButtonBlock: Block = {
  slug: "richTextButton",
  labels: { singular: "Button", plural: "Buttons" },
  fields: [
    { name: "label", type: "text", required: true },
    { name: "href", type: "text", required: true },
    {
      name: "variant",
      type: "select",
      defaultValue: "primary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Outline", value: "outline" },
      ],
    },
    {
      name: "size",
      type: "select",
      defaultValue: "md",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    { name: "newTab", type: "checkbox", defaultValue: false },
  ],
};
```

- [ ] **Step 3: Create media block schema**

Create `src/payload/editor/blocks/media.ts`:

```ts
import type { Block } from "payload";

export const RichTextMediaBlock: Block = {
  slug: "richTextMedia",
  labels: { singular: "Media", plural: "Media" },
  fields: [
    { name: "mediaSrc", type: "upload", relationTo: "media", required: true },
    { name: "caption", type: "text" },
    { name: "credit", type: "text" },
    { name: "creditUrl", type: "text" },
    {
      name: "size",
      type: "select",
      defaultValue: "full",
      options: [
        { label: "Full", value: "full" },
        { label: "Large", value: "large" },
        { label: "Medium", value: "medium" },
        { label: "Small", value: "small" },
      ],
    },
    {
      name: "alignment",
      type: "select",
      defaultValue: "center",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    { name: "rounded", type: "checkbox", defaultValue: true },
  ],
};
```

- [ ] **Step 4: Create accordion block schema**

Create `src/payload/editor/blocks/accordion.ts`:

```ts
import type { Block } from "payload";

export const AccordionBlock: Block = {
  slug: "accordion",
  labels: { singular: "Accordion", plural: "Accordions" },
  fields: [
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "content", type: "textarea", required: true },
      ],
    },
  ],
};
```

- [ ] **Step 5: Create embed block schema**

Create `src/payload/editor/blocks/embed.ts`:

```ts
import type { Block } from "payload";

export const EmbedBlock: Block = {
  slug: "embed",
  labels: { singular: "Embed", plural: "Embeds" },
  fields: [
    { name: "url", type: "text", required: true },
    {
      name: "aspectRatio",
      type: "select",
      defaultValue: "16:9",
      options: [
        { label: "16:9", value: "16:9" },
        { label: "4:3", value: "4:3" },
        { label: "1:1", value: "1:1" },
      ],
    },
    {
      name: "maxWidth",
      type: "select",
      defaultValue: "large",
      options: [
        { label: "Full", value: "full" },
        { label: "Large", value: "large" },
        { label: "Medium", value: "medium" },
      ],
    },
  ],
};
```

- [ ] **Step 6: Create index barrel file**

Create `src/payload/editor/blocks/index.ts`:

```ts
export { AccordionBlock } from "./accordion";
export { CalloutBlock } from "./callout";
export { RichTextButtonBlock } from "./button";
export { EmbedBlock } from "./embed";
export { RichTextMediaBlock } from "./media";
```

- [ ] **Step 7: Commit**

```bash
git add src/payload/editor/
git commit -m "feat: add editor inline block schemas for rich text system"
```

---

### Task 3: Create Lexical editor config

**Files:**
- Create: `src/payload/editor/config.ts`

- [ ] **Step 1: Create the editor config**

Create `src/payload/editor/config.ts`:

```ts
import {
  AlignFeature,
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  ChecklistFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import {
  AccordionBlock,
  CalloutBlock,
  EmbedBlock,
  RichTextButtonBlock,
  RichTextMediaBlock,
} from "./blocks";

export const richTextEditor = lexicalEditor({
  features: () => [
    // Toolbars
    FixedToolbarFeature(),
    InlineToolbarFeature(),
    // Text formatting
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    SubscriptFeature(),
    SuperscriptFeature(),
    InlineCodeFeature(),
    // Structure
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
    BlockquoteFeature(),
    HorizontalRuleFeature(),
    AlignFeature(),
    IndentFeature(),
    // Lists
    OrderedListFeature(),
    UnorderedListFeature(),
    ChecklistFeature(),
    // Links & media
    LinkFeature({ enabledCollections: ["pages"] }),
    UploadFeature({ collections: { media: { fields: [] } } }),
    // Tables
    EXPERIMENTAL_TableFeature(),
    // Custom blocks
    BlocksFeature({
      blocks: [
        CalloutBlock,
        RichTextButtonBlock,
        RichTextMediaBlock,
        AccordionBlock,
        EmbedBlock,
      ],
    }),
  ],
});
```

- [ ] **Step 2: Verify build passes**

```bash
bun check
```

Expected: No lint errors in the new files.

- [ ] **Step 3: Commit**

```bash
git add src/payload/editor/config.ts
git commit -m "feat: add configured Lexical editor with custom blocks"
```

---

## Chunk 2: Editor Preview Components

### Task 4: Create editor preview components

**Files:**
- Create: `src/components/features/rich-text/editor-previews/callout-preview.tsx`
- Create: `src/components/features/rich-text/editor-previews/button-preview.tsx`
- Create: `src/components/features/rich-text/editor-previews/media-preview.tsx`
- Create: `src/components/features/rich-text/editor-previews/accordion-preview.tsx`
- Create: `src/components/features/rich-text/editor-previews/embed-preview.tsx`

These are client components rendered inside the Payload admin Lexical editor. They are registered via `admin.components.Block` on the block schema and rendered inside a Payload `Form` context. Field values are accessed via `useFormFields()` from `@payloadcms/ui`, **not** via direct props.

- [ ] **Step 1: Create callout preview**

Create `src/components/features/rich-text/editor-previews/callout-preview.tsx`:

```tsx
"use client";

import { useFormFields } from "@payloadcms/ui";
import { cn } from "@/core/lib/utils";

const variantStyles = {
  info: { border: "border-l-blue-500", bg: "bg-blue-500/5", text: "text-blue-500", label: "Info" },
  warning: { border: "border-l-amber-500", bg: "bg-amber-500/5", text: "text-amber-500", label: "Warning" },
  tip: { border: "border-l-green-500", bg: "bg-green-500/5", text: "text-green-500", label: "Tip" },
  error: { border: "border-l-red-500", bg: "bg-red-500/5", text: "text-red-500", label: "Error" },
} as const;

type CalloutVariant = keyof typeof variantStyles;

export function CalloutPreview() {
  const fields = useFormFields(([f]) => ({
    variant: f.variant?.value as CalloutVariant | undefined,
    title: f.title?.value as string | undefined,
    content: f.content?.value as string | undefined,
  }));

  const variant = fields.variant ?? "info";
  const style = variantStyles[variant];

  return (
    <div className={cn("rounded border-l-[3px] px-3.5 py-3", style.border, style.bg)}>
      <div className="mb-1 flex items-center gap-1.5">
        <span className={cn("text-[11px] font-semibold uppercase tracking-[0.05em]", style.text)}>
          {style.label}
        </span>
      </div>
      {fields.title && (
        <p className="mb-1 text-sm font-medium text-foreground">{fields.title}</p>
      )}
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        {fields.content || "Callout content..."}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create button preview**

Create `src/components/features/rich-text/editor-previews/button-preview.tsx`:

```tsx
"use client";

import { useFormFields } from "@payloadcms/ui";
import { cn } from "@/core/lib/utils";

const variantClasses = {
  primary: "bg-primary text-primary-foreground",
  secondary: "border border-border bg-transparent text-foreground",
  outline: "border border-border bg-transparent text-muted-foreground",
} as const;

const sizeClasses = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-5 py-2 text-sm",
  lg: "px-6 py-2.5 text-sm",
} as const;

type ButtonVariant = keyof typeof variantClasses;
type ButtonSize = keyof typeof sizeClasses;

export function ButtonPreview() {
  const fields = useFormFields(([f]) => ({
    label: f.label?.value as string | undefined,
    variant: f.variant?.value as ButtonVariant | undefined,
    size: f.size?.value as ButtonSize | undefined,
  }));

  const variant = fields.variant ?? "primary";
  const size = fields.size ?? "md";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-semibold",
        variantClasses[variant],
        sizeClasses[size],
      )}
    >
      {fields.label || "Button"}
    </span>
  );
}
```

- [ ] **Step 3: Create media preview**

Create `src/components/features/rich-text/editor-previews/media-preview.tsx`:

```tsx
"use client";

import { useFormFields } from "@payloadcms/ui";
import { cn } from "@/core/lib/utils";

export function MediaPreview() {
  const fields = useFormFields(([f]) => ({
    mediaSrc: f.mediaSrc?.value as { url?: string } | number | undefined,
    caption: f.caption?.value as string | undefined,
    credit: f.credit?.value as string | undefined,
    size: f.size?.value as string | undefined,
    alignment: f.alignment?.value as string | undefined,
  }));

  const mediaUrl =
    fields.mediaSrc && typeof fields.mediaSrc === "object" ? fields.mediaSrc.url : null;

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="relative flex h-32 items-center justify-center bg-muted">
        {mediaUrl ? (
          <img alt="" className="h-full w-full object-cover" src={mediaUrl} />
        ) : (
          <span className="text-sm text-muted-foreground">No media selected</span>
        )}
        {fields.credit && (
          <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white/80 backdrop-blur-sm">
            {fields.credit}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between px-2.5 py-2">
        <span className="text-xs text-muted-foreground">
          {fields.caption || "No caption"}
        </span>
        <span className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground")}>
          {fields.size ?? "full"} · {fields.alignment ?? "center"}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create accordion preview**

Create `src/components/features/rich-text/editor-previews/accordion-preview.tsx`:

```tsx
"use client";

import { useFormFields } from "@payloadcms/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

export function AccordionPreview() {
  const fields = useFormFields(([f]) => ({
    items: f.items?.value as Array<{ title?: string; content?: string; id?: string }> | undefined,
  }));

  const items = fields.items ?? [];

  return (
    <div className="overflow-hidden rounded-md border border-border">
      {items.length === 0 ? (
        <div className="px-3.5 py-2.5 text-sm text-muted-foreground">No items added</div>
      ) : (
        items.map((item, i) => (
          <div
            className="flex items-center justify-between border-b border-border px-3.5 py-2.5 last:border-b-0"
            key={item.id ?? i}
          >
            <span className="text-[13px] font-medium text-foreground">
              {item.title || "Untitled"}
            </span>
            <HugeiconsIcon icon={ArrowDown01Icon} size={12} className="text-muted-foreground" />
          </div>
        ))
      )}
      {items.length > 0 && (
        <div className="border-t border-border px-3.5 py-1.5 text-center text-[10px] italic text-muted-foreground">
          {items.length} item{items.length !== 1 ? "s" : ""} · Collapsed in editor
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create embed preview**

Create `src/components/features/rich-text/editor-previews/embed-preview.tsx`:

```tsx
"use client";

import { useFormFields } from "@payloadcms/ui";
import { cn } from "@/core/lib/utils";

function detectProvider(url: string): { name: string; color: string } {
  if (/youtube\.com|youtu\.be/.test(url)) return { name: "YouTube", color: "bg-red-600" };
  if (/vimeo\.com/.test(url)) return { name: "Vimeo", color: "bg-sky-500" };
  if (/x\.com|twitter\.com/.test(url)) return { name: "X", color: "bg-foreground" };
  return { name: "Embed", color: "bg-muted-foreground" };
}

export function EmbedPreview() {
  const fields = useFormFields(([f]) => ({
    url: f.url?.value as string | undefined,
    aspectRatio: f.aspectRatio?.value as string | undefined,
  }));

  const url = fields.url ?? "";
  const provider = detectProvider(url);

  return (
    <div className="flex items-center gap-2.5 rounded-md border border-border p-3.5">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", provider.color)}>
        <span className="text-xs font-bold text-white">▶</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">
          {url || "No URL entered"}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {provider.name} · {fields.aspectRatio ?? "16:9"}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/features/rich-text/editor-previews/
git commit -m "feat: add editor preview components for rich text inline blocks"
```

---

### Task 5: Wire editor previews to block schemas

**Files:**
- Modify: `src/payload/editor/blocks/callout.ts`
- Modify: `src/payload/editor/blocks/button.ts`
- Modify: `src/payload/editor/blocks/media.ts`
- Modify: `src/payload/editor/blocks/accordion.ts`
- Modify: `src/payload/editor/blocks/embed.ts`

Each block schema needs an `admin.components.Block` path pointing to its preview component. Payload resolves these as import paths.

- [ ] **Step 1: Add preview component path to each block schema**

Add the `admin` property to each block. The pattern for each:

**callout.ts** — add after `labels`:
```ts
admin: {
  components: {
    Block: "@/components/features/rich-text/editor-previews/callout-preview#CalloutPreview",
  },
},
```

**button.ts** — add after `labels`:
```ts
admin: {
  components: {
    Block: "@/components/features/rich-text/editor-previews/button-preview#ButtonPreview",
  },
},
```

**media.ts** — add after `labels`:
```ts
admin: {
  components: {
    Block: "@/components/features/rich-text/editor-previews/media-preview#MediaPreview",
  },
},
```

**accordion.ts** — add after `labels`:
```ts
admin: {
  components: {
    Block: "@/components/features/rich-text/editor-previews/accordion-preview#AccordionPreview",
  },
},
```

**embed.ts** — add after `labels`:
```ts
admin: {
  components: {
    Block: "@/components/features/rich-text/editor-previews/embed-preview#EmbedPreview",
  },
},
```

- [ ] **Step 2: Verify build passes**

```bash
bun check
```

- [ ] **Step 3: Commit**

```bash
git add src/payload/editor/blocks/
git commit -m "feat: wire editor preview components to inline block schemas"
```

---

## Chunk 3: Frontend Converters & RichText Renderer

### Task 6: Create JSX converters for custom blocks

**Files:**
- Create: `src/components/features/rich-text/converters/callout.tsx`
- Create: `src/components/features/rich-text/converters/button.tsx`
- Create: `src/components/features/rich-text/converters/media.tsx`
- Create: `src/components/features/rich-text/converters/accordion.tsx`
- Create: `src/components/features/rich-text/converters/embed.tsx`
- Create: `src/components/features/rich-text/converters/horizontal-rule.tsx`
- Create: `src/components/features/rich-text/converters/index.ts`

Each converter is a function that receives a Lexical node and returns JSX. Block converters receive `{ node }` where `node.fields` contains the block's field data.

- [ ] **Step 1: Create callout converter**

Create `src/components/features/rich-text/converters/callout.tsx`:

```tsx
import { cn } from "@/core/lib/utils";

const variantConfig = {
  info: { border: "border-l-blue-500", bg: "bg-blue-500/5", text: "text-blue-500", label: "Info" },
  warning: { border: "border-l-amber-500", bg: "bg-amber-500/5", text: "text-amber-500", label: "Warning" },
  tip: { border: "border-l-green-500", bg: "bg-green-500/5", text: "text-green-500", label: "Tip" },
  error: { border: "border-l-red-500", bg: "bg-red-500/5", text: "text-red-500", label: "Error" },
} as const;

type CalloutVariant = keyof typeof variantConfig;

export function CalloutConverter({
  node,
}: {
  node: { fields: { variant?: CalloutVariant; title?: string; content?: string } };
}) {
  const variant = node.fields.variant ?? "info";
  const style = variantConfig[variant];

  return (
    <div className={cn("not-prose my-6 rounded-md border-l-[3px] px-4 py-3", style.border, style.bg)}>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className={cn("text-[11px] font-semibold uppercase tracking-[0.05em]", style.text)}>
          {style.label}
        </span>
      </div>
      {node.fields.title && (
        <p className="mb-1 font-semibold text-foreground">{node.fields.title}</p>
      )}
      <p className="text-sm leading-relaxed text-muted-foreground">{node.fields.content}</p>
    </div>
  );
}
```

- [ ] **Step 2: Create button converter**

Create `src/components/features/rich-text/converters/button.tsx`:

```tsx
import { cn } from "@/core/lib/utils";

const variantClasses = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "border border-border bg-transparent text-foreground hover:bg-muted",
  outline: "border border-border bg-transparent text-muted-foreground hover:text-foreground",
} as const;

const sizeClasses = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-5 py-2 text-sm",
  lg: "px-6 py-2.5 text-sm",
} as const;

type ButtonVariant = keyof typeof variantClasses;
type ButtonSize = keyof typeof sizeClasses;

export function ButtonConverter({
  node,
}: {
  node: {
    fields: {
      label: string;
      href: string;
      variant?: ButtonVariant;
      size?: ButtonSize;
      newTab?: boolean;
    };
  };
}) {
  const variant = node.fields.variant ?? "primary";
  const size = node.fields.size ?? "md";

  return (
    <a
      className={cn(
        "not-prose my-4 inline-flex items-center rounded-md font-semibold transition-colors",
        variantClasses[variant],
        sizeClasses[size],
      )}
      href={node.fields.href}
      {...(node.fields.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {node.fields.label}
    </a>
  );
}
```

- [ ] **Step 3: Create media converter**

Create `src/components/features/rich-text/converters/media.tsx`:

```tsx
import Image from "next/image";
import { cn, getMediaUrl, getBlurDataURL } from "@/core/lib/utils";

const sizeClasses = {
  full: "max-w-full",
  large: "max-w-4xl",
  medium: "max-w-2xl",
  small: "max-w-md",
} as const;

const alignClasses = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
} as const;

type MediaSize = keyof typeof sizeClasses;
type MediaAlignment = keyof typeof alignClasses;

export function MediaConverter({
  node,
}: {
  node: {
    fields: {
      mediaSrc: { url?: string; width?: number; height?: number; blurDataURL?: string; alt?: string; mimeType?: string } | number;
      caption?: string;
      credit?: string;
      creditUrl?: string;
      size?: MediaSize;
      alignment?: MediaAlignment;
      rounded?: boolean;
    };
  };
}) {
  const { mediaSrc, caption, credit, creditUrl, size = "full", alignment = "center", rounded = true } =
    node.fields;

  const url = getMediaUrl(mediaSrc);
  if (!url) return null;

  const isVideo = typeof mediaSrc === "object" && mediaSrc.mimeType?.startsWith("video/");
  const blurDataURL = getBlurDataURL(mediaSrc);
  const width = typeof mediaSrc === "object" ? mediaSrc.width ?? 1200 : 1200;
  const height = typeof mediaSrc === "object" ? mediaSrc.height ?? 675 : 675;
  const alt = typeof mediaSrc === "object" ? mediaSrc.alt ?? "" : "";

  const creditElement = credit ? (
    <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white/80 backdrop-blur-sm">
      {credit}
    </span>
  ) : null;

  return (
    <figure className={cn("not-prose my-8", sizeClasses[size], alignClasses[alignment])}>
      <div className={cn("relative overflow-hidden", rounded && "rounded-lg")}>
        {isVideo ? (
          <video className="w-full" controls src={url} />
        ) : (
          <Image
            alt={alt}
            blurDataURL={blurDataURL}
            height={height}
            placeholder={blurDataURL ? "blur" : "empty"}
            src={url}
            width={width}
            className="w-full"
          />
        )}
        {creditUrl ? (
          <a href={creditUrl} target="_blank" rel="noopener noreferrer">
            {creditElement}
          </a>
        ) : (
          creditElement
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
```

- [ ] **Step 4: Create accordion converter**

Create `src/components/features/rich-text/converters/accordion.tsx`:

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function AccordionConverter({
  node,
}: {
  node: {
    fields: {
      items: Array<{ title: string; content: string; id?: string }>;
    };
  };
}) {
  const { items } = node.fields;

  if (!items || items.length === 0) return null;

  return (
    <div className="not-prose my-6">
      <Accordion type="multiple">
        {items.map((item, i) => (
          <AccordionItem key={item.id ?? i} value={item.id ?? `item-${i}`}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.content}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
```

- [ ] **Step 5: Create embed converter**

Create `src/components/features/rich-text/converters/embed.tsx`:

```tsx
import { cn } from "@/core/lib/utils";

const TRUSTED_DOMAINS = [
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "vimeo.com",
  "player.vimeo.com",
  "x.com",
  "twitter.com",
  "codepen.io",
  "codesandbox.io",
];

const aspectClasses = {
  "16:9": "aspect-video",
  "4:3": "aspect-4/3",
  "1:1": "aspect-square",
} as const;

const maxWidthClasses = {
  full: "max-w-full",
  large: "max-w-4xl",
  medium: "max-w-2xl",
} as const;

type AspectRatio = keyof typeof aspectClasses;
type MaxWidth = keyof typeof maxWidthClasses;

function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, "");

    if (!TRUSTED_DOMAINS.some((d) => parsed.hostname === d)) {
      return null;
    }

    if (domain === "youtube.com" && parsed.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }
    if (domain === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (domain === "vimeo.com") {
      return `https://player.vimeo.com/video${parsed.pathname}`;
    }

    return url;
  } catch {
    return null;
  }
}

export function EmbedConverter({
  node,
}: {
  node: {
    fields: {
      url: string;
      aspectRatio?: AspectRatio;
      maxWidth?: MaxWidth;
    };
  };
}) {
  const { url, aspectRatio = "16:9", maxWidth = "large" } = node.fields;
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="not-prose my-6 rounded-md border border-border p-4 text-center text-sm text-muted-foreground">
        Embed unavailable: URL not from a trusted provider.
      </div>
    );
  }

  return (
    <div className={cn("not-prose my-8 mx-auto", maxWidthClasses[maxWidth])}>
      <div className={cn("overflow-hidden rounded-lg", aspectClasses[aspectRatio])}>
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
          sandbox="allow-scripts allow-same-origin allow-popups"
          src={embedUrl}
          title="Embedded content"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create horizontal rule converter**

Create `src/components/features/rich-text/converters/horizontal-rule.tsx`:

```tsx
export function HorizontalRuleConverter() {
  return <hr className="my-8 border-border" />;
}
```

- [ ] **Step 7: Create converter index with merge logic**

Create `src/components/features/rich-text/converters/index.tsx` (note: `.tsx` because it contains JSX):

```tsx
import type { JSXConverter } from "@payloadcms/richtext-lexical/react";
import { AccordionConverter } from "./accordion";
import { ButtonConverter } from "./button";
import { CalloutConverter } from "./callout";
import { EmbedConverter } from "./embed";
import { HorizontalRuleConverter } from "./horizontal-rule";
import { MediaConverter } from "./media";

export const customBlockConverters: Record<string, JSXConverter<any>> = {
  callout: CalloutConverter,
  richTextButton: ButtonConverter,
  richTextMedia: MediaConverter,
  accordion: AccordionConverter,
  embed: EmbedConverter,
};

export const customNodeConverters = {
  horizontalrule: () => <HorizontalRuleConverter />,
};
```

- [ ] **Step 8: Commit**

```bash
git add src/components/features/rich-text/converters/
git commit -m "feat: add JSX converters for all custom rich text blocks"
```

Note: The converter index file is `index.tsx` (not `.ts`) because it contains JSX.

---

### Task 7: Create the `<RichText>` renderer component

**Files:**
- Create: `src/components/features/rich-text/rich-text.tsx`
- Create: `src/components/features/rich-text/index.ts`

- [ ] **Step 1: Create the RichText server component**

Create `src/components/features/rich-text/rich-text.tsx`:

```tsx
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import {
  RichText as PayloadRichText,
  defaultJSXConverters,
} from "@payloadcms/richtext-lexical/react";
import type { JSXConverters } from "@payloadcms/richtext-lexical/react";
import { cn } from "@/core/lib/utils";
import { customBlockConverters, customNodeConverters } from "./converters";

const sizeClasses = {
  sm: "prose-sm",
  md: "prose-base",
  lg: "prose-lg",
} as const;

const proseClasses = [
  "prose dark:prose-invert max-w-none",
  "prose-headings:font-semibold prose-headings:leading-tight prose-headings:tracking-tight",
  "prose-p:text-muted-foreground",
  "prose-a:text-foreground prose-a:underline-offset-4 prose-a:decoration-border hover:prose-a:decoration-foreground",
  "prose-blockquote:border-border prose-blockquote:text-muted-foreground",
  "prose-code:font-mono prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.875em]",
  "prose-hr:border-border",
  "prose-img:hidden",
].join(" ");

type RichTextSize = keyof typeof sizeClasses;

export interface RichTextProps {
  data: SerializedEditorState | null | undefined;
  size?: RichTextSize;
  converters?: Partial<JSXConverters>;
  disableBlocks?: string[];
  className?: string;
}

function hasContent(data: SerializedEditorState): boolean {
  const children = data?.root?.children;
  if (!children || children.length === 0) return false;
  // Empty editor has a single empty paragraph
  if (
    children.length === 1 &&
    children[0].type === "paragraph" &&
    (!("children" in children[0]) || (children[0] as any).children?.length === 0)
  ) {
    return false;
  }
  return true;
}

export function RichText({
  data,
  size = "md",
  converters: consumerConverters = {},
  disableBlocks = [],
  className,
}: RichTextProps) {
  // Edge cases: null, undefined, empty, or malformed data
  if (!data) return null;
  if (!data.root?.children) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[RichText] Malformed data: missing root.children", data);
    }
    return null;
  }
  if (!hasContent(data)) return null;

  // Build block converters: custom defaults + consumer overrides - disabled blocks
  const blockConverters = {
    ...customBlockConverters,
    ...(consumerConverters as any)?.blocks,
  };

  for (const slug of disableBlocks) {
    delete blockConverters[slug];
  }

  // Deep merge: default JSX converters + custom node converters + consumer overrides
  const mergedConverters: JSXConverters = {
    ...defaultJSXConverters,
    ...customNodeConverters,
    ...consumerConverters,
    blocks: blockConverters,
  };

  return (
    <div className={cn(proseClasses, sizeClasses[size], className)}>
      <PayloadRichText converters={mergedConverters} data={data} />
    </div>
  );
}
```

- [ ] **Step 2: Create public API barrel file**

Create `src/components/features/rich-text/index.ts`:

```ts
export { RichText } from "./rich-text";
export type { RichTextProps } from "./rich-text";
```

Note: Also export `RichTextProps` — add `export` to the interface in `rich-text.tsx`.

- [ ] **Step 3: Verify build passes**

```bash
bun check
```

- [ ] **Step 4: Commit**

```bash
git add src/components/features/rich-text/rich-text.tsx src/components/features/rich-text/index.ts
git commit -m "feat: add <RichText> renderer with prose styling and converter merging"
```

---

## Chunk 4: Page Block & Integration

### Task 8: Create RichTextContent page-level block

**Files:**
- Create: `src/payload/block-schemas/RichTextContent.ts`
- Create: `src/components/blocks/rich-text-content/rich-text-content.tsx`

- [ ] **Step 1: Create the block schema**

Create `src/payload/block-schemas/RichTextContent.ts`:

```ts
import type { Block } from "payload";
import { richTextEditor } from "@/payload/editor/config";

export const RichTextContentBlock: Block = {
  slug: "richTextContent",
  labels: { singular: "Rich Text", plural: "Rich Text" },
  fields: [
    {
      name: "content",
      type: "richText",
      editor: richTextEditor,
      required: true,
    },
    {
      name: "maxWidth",
      type: "select",
      defaultValue: "default",
      options: [
        { label: "Narrow", value: "narrow" },
        { label: "Default", value: "default" },
        { label: "Wide", value: "wide" },
      ],
    },
  ],
};
```

- [ ] **Step 2: Create the block component**

Create `src/components/blocks/rich-text-content/rich-text-content.tsx`:

```tsx
import { cn } from "@/core/lib/utils";
import { RichText } from "@/components/features/rich-text";
import type { RichTextContentBlock } from "@/types/block-types";

const maxWidthClasses = {
  narrow: "max-w-2xl",
  default: "max-w-4xl",
  wide: "max-w-7xl",
} as const;

type MaxWidth = keyof typeof maxWidthClasses;

export function RichTextContent({ content, maxWidth = "default" }: RichTextContentBlock) {
  return (
    <section>
      <div className={cn("mx-auto px-4 lg:px-6", maxWidthClasses[maxWidth as MaxWidth])}>
        <RichText data={content} />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify lint passes**

```bash
bun check
```

- [ ] **Step 4: Commit**

```bash
git add src/payload/block-schemas/RichTextContent.ts src/components/blocks/rich-text-content/
git commit -m "feat: add RichTextContent page-level block"
```

---

### Task 9: Register block in Pages collection and render-blocks

**Files:**
- Modify: `src/payload/collections/Pages.ts`
- Modify: `src/components/blocks/render-blocks.tsx`
- Modify: `src/types/block-types.ts`

- [ ] **Step 1: Add RichTextContentBlock to Pages collection**

In `src/payload/collections/Pages.ts`:
- Add import after the last block import (after the `TrustBlock` import): `import { RichTextContentBlock } from "@/payload/block-schemas/RichTextContent";`
- Add `RichTextContentBlock` to the end of the `blocks` array in the `layout` field (after the last existing block entry)

- [ ] **Step 2: Add case to render-blocks**

In `src/components/blocks/render-blocks.tsx`:
- Add import after the last block import: `import { RichTextContent } from "./rich-text-content/rich-text-content";`
- Add case before the `default:` case in the switch statement:

```tsx
case "richTextContent":
  return <RichTextContent {...block} />;
```

- [ ] **Step 3: Add type export to block-types**

In `src/types/block-types.ts`, add after the last `ExtractBlock` type export:

```ts
export type RichTextContentBlock = ExtractBlock<"richTextContent">;
```

- [ ] **Step 4: Regenerate Payload types**

```bash
bun run generate:types
```

This updates `src/payload-types.ts` to include the new block type in the `Page` layout union.

- [ ] **Step 5: Verify build passes**

```bash
bun check && bun build
```

Expected: Clean build with no errors. The new block type should be available in the Payload admin.

- [ ] **Step 6: Commit**

```bash
git add src/payload/collections/Pages.ts src/components/blocks/render-blocks.tsx src/types/block-types.ts src/payload-types.ts
git commit -m "feat: register RichTextContent block in pages and render pipeline"
```

---

### Task 10: Smoke test in Payload admin

**Files:** None (manual verification)

- [ ] **Step 1: Start dev server**

```bash
bun dev
```

- [ ] **Step 2: Navigate to Payload admin**

Open `http://localhost:3000/admin` and log in with `jordanburch.dev@gmail.com` / `meta1234`.

- [ ] **Step 3: Edit the Home page and add a Rich Text block**

1. Go to Pages → Home → Edit
2. Click "Add Block" at the bottom of the layout
3. Select "Rich Text" from the block picker
4. Verify the Lexical editor loads with the fixed + inline toolbars
5. Test formatting: bold, italic, headings (h2-h4), lists, blockquote, links
6. Test inserting custom blocks via the toolbar (+ button):
   - Insert a **Callout** → verify the preview renders with colored border
   - Insert a **Button** → verify it shows as a styled pill
   - Insert a **richTextMedia** (Media) → verify image thumbnail + caption + credit badge
   - Insert an **Accordion** → verify collapsed rows appear
   - Insert an **Embed** → verify provider detection works
7. Test Upload feature — insert an image via the upload button (separate from richTextMedia block)
8. Insert a **horizontal rule** — verify it appears in the editor
9. Insert a **table** — verify the table UI renders
10. Test the **maxWidth** select field — change between narrow/default/wide
11. Save the page

- [ ] **Step 4: Verify frontend rendering**

Navigate to `http://localhost:3000` and verify the rich text block renders with:
- Prose styling (Tailwind Typography) with correct heading sizes, body text color
- All 5 custom block converters rendering correctly
- Horizontal rule styled with `border-border`
- Media block with caption below and credit badge overlay (bottom-right)
- Embed with iframe in correct aspect ratio
- Accordion using shadcn accordion component
- Button links working with correct variant styling
- maxWidth field affecting container width (narrow vs default vs wide)

- [ ] **Step 5: Verify dark mode**

Toggle to dark mode (via theme switcher or browser preference) and verify:
- `prose-invert` applies correctly
- Custom blocks maintain readable contrast
- Credit badge overlay still legible

- [ ] **Step 6: Verify empty/null data edge case**

Temporarily render `<RichText data={null} />` in a test page or component — verify it returns nothing (no errors, no empty wrapper).

- [ ] **Step 7: Commit any fixes discovered during testing**

If any adjustments were needed during smoke testing, commit them:

```bash
git add -A
git commit -m "fix: address issues found during rich text smoke testing"
```
