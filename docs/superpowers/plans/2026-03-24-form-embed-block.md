# FormEmbed Block Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a versatile FormEmbed page-builder block that renders forms created with `@payloadcms/plugin-form-builder` using existing shadcn UI components, supporting stacked, split, and map layout variants.

**Architecture:** Install the form builder plugin (creates `forms` + `form-submissions` collections), add a `FormEmbed` block schema to the Pages layout field, and build a server/client component split — server component handles layout/heading/richtext, client components handle form interaction and optional map.

**Tech Stack:** Payload CMS 3.79.1, @payloadcms/plugin-form-builder, shadcn/ui form primitives, MapLibre GL (existing), motion/react for animations.

**Spec:** `docs/superpowers/specs/2026-03-24-form-embed-block-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/payload/block-schemas/FormEmbed.ts` | Create | Block schema definition |
| `src/payload/collections/Pages.ts` | Modify | Register FormEmbedBlock in layout blocks |
| `src/payload.config.ts` | Modify | Add formBuilderPlugin to plugins array |
| `src/types/block-types.ts` | Modify | Add FormEmbedBlock type extraction |
| `src/components/blocks/form-embed/form-embed.tsx` | Create | Server component: section wrapper, heading, RichText, variant layout |
| `src/components/blocks/form-embed/form-renderer.tsx` | Create | Client component: form state, validation, submission |
| `src/components/blocks/form-embed/field-mapper.tsx` | Create | Maps plugin field types to shadcn components |
| `src/components/blocks/form-embed/map-panel.tsx` | Create | Client component: Map wrapper for map variant |
| `src/components/blocks/render-blocks.tsx` | Modify | Add formEmbed case to switch |
| `src/components/blocks/__fixtures__/block-fixtures.ts` | Modify | Add fixture data for all three variants |
| `src/components/blocks/block-categories.ts` | Modify | Register formEmbed in Storybook category map |

---

### Task 1: Install plugin and configure Payload

**Files:**
- Modify: `package.json`
- Modify: `src/payload.config.ts:1-10` (imports), `src/payload.config.ts:114` (plugins array)

- [ ] **Step 1: Install the form builder plugin**

Run: `bun add @payloadcms/plugin-form-builder@3.79.1`

- [ ] **Step 2: Add plugin to payload.config.ts**

Add import at top of `src/payload.config.ts`:
```ts
import { formBuilderPlugin } from "@payloadcms/plugin-form-builder";
```

Add to the `plugins` array (after the `mcpPlugin` block, before `seoPlugin`):
```ts
formBuilderPlugin({
  fields: {
    text: true,
    textarea: true,
    select: true,
    radio: true,
    email: true,
    state: true,
    country: true,
    checkbox: true,
    number: true,
    message: true,
    date: true,
    payment: false,
  },
  redirectRelationships: ["pages"],
  formOverrides: {
    admin: {
      group: "Forms",
    },
  },
  formSubmissionOverrides: {
    admin: {
      group: "Forms",
    },
  },
}),
```

- [ ] **Step 3: Run lint check**

Run: `bun check`
Expected: PASS (no errors related to this change)

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock src/payload.config.ts
git commit -m "feat(forms): install @payloadcms/plugin-form-builder and configure plugin"
```

---

### Task 2: Create FormEmbed block schema

**Files:**
- Create: `src/payload/block-schemas/FormEmbed.ts`
- Modify: `src/payload/collections/Pages.ts:14-37` (imports), `src/payload/collections/Pages.ts:106-127` (blocks array)

- [ ] **Step 1: Create the block schema**

Create `src/payload/block-schemas/FormEmbed.ts`:

```ts
import type { Block } from "payload";
import { richTextEditor } from "../editor/config";

export const FormEmbedBlock: Block = {
  slug: "formEmbed",
  labels: { singular: "Form Embed", plural: "Form Embeds" },
  admin: {
    group: "Content",
    images: {
      thumbnail: "/block-thumbnails/form-embed.png",
    },
    custom: {
      description:
        "Embed a form built in the admin panel. Supports stacked, split (content + form), and map (form + location) layouts.",
    },
  },
  fields: [
    {
      name: "variant",
      type: "select",
      required: true,
      defaultValue: "stacked",
      options: [
        { label: "Stacked", value: "stacked" },
        { label: "Split", value: "split" },
        { label: "Map", value: "map" },
      ],
    },
    { name: "heading", type: "text" },
    {
      name: "content",
      type: "richText",
      editor: richTextEditor,
    },
    {
      name: "form",
      type: "relationship",
      relationTo: "forms",
      required: true,
    },
    {
      name: "mapCenter",
      type: "group",
      admin: {
        condition: (_, siblingData) => siblingData?.variant === "map",
      },
      fields: [
        {
          name: "latitude",
          type: "number",
          required: true,
          admin: { step: 0.000001 },
        },
        {
          name: "longitude",
          type: "number",
          required: true,
          admin: { step: 0.000001 },
        },
      ],
    },
    {
      name: "mapZoom",
      type: "number",
      defaultValue: 14,
      min: 1,
      max: 20,
      admin: {
        condition: (_, siblingData) => siblingData?.variant === "map",
      },
    },
    {
      name: "mapMarkerLabel",
      type: "text",
      admin: {
        condition: (_, siblingData) => siblingData?.variant === "map",
        description: "Popup text shown when the map pin is clicked",
      },
    },
  ],
};
```

- [ ] **Step 2: Register in Pages collection**

In `src/payload/collections/Pages.ts`, add import:
```ts
import { FormEmbedBlock } from "../block-schemas/FormEmbed";
```

Add `FormEmbedBlock` to the `layout` blocks array (after `JobListingsBlock`):
```ts
JobListingsBlock,
FormEmbedBlock,
```

- [ ] **Step 3: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/payload/block-schemas/FormEmbed.ts src/payload/collections/Pages.ts
git commit -m "feat(forms): add FormEmbed block schema and register in Pages"
```

---

### Task 3: Generate migration and types

**Files:**
- Create: `src/migrations/XXXXXXXX_*.ts` (auto-generated)
- Modify: `src/payload-types.ts` (auto-generated)
- Modify: `src/types/block-types.ts:53` (add type extraction)

**Important:** This task requires the dev server to be **stopped** so migrations don't conflict. Tell the user to stop it if running.

- [ ] **Step 1: Generate migration**

Run: `bun run migrate:create`

Review the generated file in `src/migrations/`. It should create tables for:
- `forms` collection (plugin)
- `form_submissions` collection (plugin)
- `formEmbed` block columns in pages layout

- [ ] **Step 2: Apply migration**

Run: `bun run migrate`
Expected: Migration applied successfully

- [ ] **Step 3: Regenerate types**

Run: `bun generate:types`
Expected: `src/payload-types.ts` updated with `Form`, `FormSubmission`, and `formEmbed` block type

- [ ] **Step 4: Add type extraction**

In `src/types/block-types.ts`, add after the `JobListingsBlock` line:
```ts
export type FormEmbedBlock = ExtractBlock<"formEmbed">;
```

- [ ] **Step 5: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/migrations/ src/payload-types.ts src/types/block-types.ts
git commit -m "feat(forms): add migration for form-builder plugin and FormEmbed block"
```

---

### Task 4: Build field-mapper component

**Files:**
- Create: `src/components/blocks/form-embed/field-mapper.tsx`

This is the core mapping layer — takes a plugin form field definition and returns the matching shadcn UI component.

- [ ] **Step 1: Create field-mapper.tsx**

Create `src/components/blocks/form-embed/field-mapper.tsx`:

```tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/core/lib/utils";

type FormFieldBlock = {
  blockType: string;
  name?: string;
  label?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  width?: string;
  options?: { label: string; value: string }[];
  // Rich text for message blocks
  message?: unknown;
};

type FieldMapperProps = {
  field: FormFieldBlock;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
};

/** Convert plugin width percentages to Tailwind grid column classes */
function widthToClass(width?: string): string {
  if (!width) return "col-span-full";
  const n = Number.parseInt(width, 10);
  if (n <= 25) return "col-span-full sm:col-span-1";
  if (n <= 50) return "col-span-full sm:col-span-1";
  if (n <= 75) return "col-span-full sm:col-span-2";
  return "col-span-full";
}

export function FormField({ field, value, onChange, error }: FieldMapperProps) {
  const { blockType, name, label, required, placeholder } = field;
  const fieldName = name ?? "";

  // Message blocks are display-only rich text — no input
  if (blockType === "message") {
    return null; // Rich text message rendering can be added later
  }

  const handleChange = (val: string) => onChange(fieldName, val);

  return (
    <div className={cn(widthToClass(field.width))}>
      <Field>
        {label && (
          <FieldLabel>
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </FieldLabel>
        )}
        <FieldContent>
          {renderInput(blockType, {
            value,
            onChange: handleChange,
            placeholder,
            required,
            options: field.options,
            defaultValue: field.defaultValue,
          })}
        </FieldContent>
        {error && <FieldError>{error}</FieldError>}
      </Field>
    </div>
  );
}

function renderInput(
  blockType: string,
  props: {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: string }[];
    defaultValue?: string;
  }
) {
  switch (blockType) {
    case "text":
      return (
        <Input
          type="text"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          required={props.required}
        />
      );

    case "email":
      return (
        <Input
          type="email"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          required={props.required}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          required={props.required}
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          required={props.required}
        />
      );

    case "textarea":
      return (
        <Textarea
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          required={props.required}
        />
      );

    case "select":
    case "country":
    case "state":
      return (
        <Select value={props.value} onValueChange={props.onChange}>
          <SelectTrigger>
            <SelectValue placeholder={props.placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {(props.options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "radio":
      return (
        <RadioGroup value={props.value} onValueChange={props.onChange}>
          {(props.options ?? []).map((opt) => (
            <div className="flex items-center gap-2" key={opt.value}>
              <RadioGroupItem id={opt.value} value={opt.value} />
              <Label htmlFor={opt.value}>{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      );

    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={props.value === "true"}
            onCheckedChange={(checked) =>
              props.onChange(checked ? "true" : "false")
            }
          />
        </div>
      );

    default:
      return (
        <Input
          type="text"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
        />
      );
  }
}
```

- [ ] **Step 2: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/form-embed/field-mapper.tsx
git commit -m "feat(forms): add field-mapper component mapping plugin fields to shadcn UI"
```

---

### Task 5: Build form-renderer component

**Files:**
- Create: `src/components/blocks/form-embed/form-renderer.tsx`

Handles form state, client-side validation, submission, and success/error states.

- [ ] **Step 1: Create form-renderer.tsx**

Create `src/components/blocks/form-embed/form-renderer.tsx`:

```tsx
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import { FormField } from "./field-mapper";

type FormFieldBlock = {
  blockType: string;
  name?: string;
  label?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  width?: string;
  options?: { label: string; value: string }[];
  message?: unknown;
};

type FormConfig = {
  id: number;
  fields?: FormFieldBlock[] | null;
  confirmationType?: "message" | "redirect" | null;
  confirmationMessage?: Record<string, unknown> | null;
  redirect?: { url?: string } | null;
  submitButtonLabel?: string | null;
};

type FormRendererProps = {
  form: FormConfig;
  /** Pre-rendered confirmation message (server component RichText passed as prop) */
  confirmationNode?: ReactNode;
};

const EASE = [0.16, 1, 0.3, 1] as const;

export function FormRenderer({ form, confirmationNode }: FormRendererProps) {
  const router = useRouter();
  const fields = form.fields ?? [];

  // Initialize field values from defaults
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      if (field.name) {
        initial[field.name] = field.defaultValue ?? "";
      }
    }
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.required && field.name) {
        const val = values[field.name]?.trim();
        if (!val) {
          newErrors[field.name] = `${field.label || field.name} is required`;
        }
      }
      // Basic email validation
      if (field.blockType === "email" && field.name && values[field.name]) {
        const emailVal = values[field.name].trim();
        if (emailVal && !emailVal.includes("@")) {
          newErrors[field.name] = "Please enter a valid email address";
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, values]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError(null);

    try {
      const submissionData = Object.entries(values).map(([field, value]) => ({
        field,
        value,
      }));

      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form: form.id, submissionData }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.errors?.[0]?.message ?? "Something went wrong. Please try again."
        );
      }

      // Handle confirmation
      if (
        form.confirmationType === "redirect" &&
        form.redirect?.url
      ) {
        router.push(form.redirect.url);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="confirmation"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {confirmationNode ? (
            confirmationNode
          ) : (
            <p className="text-muted-foreground">
              Thank you! Your submission has been received.
            </p>
          )}
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {fields.map((field, i) => (
            <FormField
              key={field.name ?? `field-${i}`}
              field={field}
              value={values[field.name ?? ""] ?? ""}
              onChange={handleChange}
              error={errors[field.name ?? ""]}
            />
          ))}

          {serverError && (
            <div className="col-span-full">
              <p className="text-sm text-destructive">{serverError}</p>
            </div>
          )}

          <div className="col-span-full">
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting
                ? "Submitting..."
                : form.submitButtonLabel || "Submit"}
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/form-embed/form-renderer.tsx
git commit -m "feat(forms): add form-renderer client component with validation and submission"
```

---

### Task 6: Build map-panel component

**Files:**
- Create: `src/components/blocks/form-embed/map-panel.tsx`

Thin client wrapper around the existing `Map` component.

- [ ] **Step 1: Create map-panel.tsx**

Create `src/components/blocks/form-embed/map-panel.tsx`:

```tsx
"use client";

import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";

type MapPanelProps = {
  latitude: number;
  longitude: number;
  zoom?: number;
  markerLabel?: string | null;
};

export function MapPanel({
  latitude,
  longitude,
  zoom = 14,
  markerLabel,
}: MapPanelProps) {
  return (
    <div className="min-h-[400px] overflow-hidden rounded-lg border border-border/50">
      <Map
        className="h-full min-h-[400px] w-full"
        viewport={{ center: [longitude, latitude], zoom }}
      >
        <MapMarker longitude={longitude} latitude={latitude}>
          <MarkerContent />
          {markerLabel && <MarkerPopup>{markerLabel}</MarkerPopup>}
        </MapMarker>
      </Map>
    </div>
  );
}
```

- [ ] **Step 2: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/form-embed/map-panel.tsx
git commit -m "feat(forms): add map-panel client component for map variant"
```

---

### Task 7: Build form-embed server component and register block

**Files:**
- Create: `src/components/blocks/form-embed/form-embed.tsx`
- Modify: `src/components/blocks/render-blocks.tsx:1-25` (imports), `src/components/blocks/render-blocks.tsx:51-96` (switch)

- [ ] **Step 1: Create form-embed.tsx**

Create `src/components/blocks/form-embed/form-embed.tsx`. This is a **server component** — no `"use client"`. Use `@design-language` and `@theme` skills for styling.

```tsx
import type { ReactNode } from "react";
import type { FormEmbedBlock as FormEmbedBlockType } from "@/types/block-types";
import { RichText } from "@/components/features/rich-text/rich-text";
import { FormRenderer } from "./form-renderer";
import { MapPanel } from "./map-panel";

type FormConfig = {
  id: number;
  fields?: unknown[] | null;
  confirmationType?: "message" | "redirect" | null;
  confirmationMessage?: Record<string, unknown> | null;
  redirect?: { url?: string } | null;
  submitButtonLabel?: string | null;
};

export function FormEmbed(props: FormEmbedBlockType) {
  const { variant, heading, content, form, mapCenter, mapZoom, mapMarkerLabel } =
    props;

  // Guard: form must be a populated object, not just an ID
  if (!form || typeof form === "number") return null;
  const formData = form as unknown as FormConfig;

  // Pre-render confirmation message as a server component so RichText stays on the server
  const confirmationNode = formData.confirmationMessage ? (
    <RichText data={formData.confirmationMessage} />
  ) : undefined;

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {variant === "stacked" && (
          <StackedLayout
            heading={heading}
            content={content}
            form={formData}
            confirmationNode={confirmationNode}
          />
        )}

        {variant === "split" && (
          <SplitLayout
            heading={heading}
            content={content}
            form={formData}
            confirmationNode={confirmationNode}
          />
        )}

        {variant === "map" && (
          <MapLayout
            heading={heading}
            content={content}
            form={formData}
            confirmationNode={confirmationNode}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            mapMarkerLabel={mapMarkerLabel}
          />
        )}
      </div>
    </section>
  );
}

function SectionHeading({ heading }: { heading?: string | null }) {
  if (!heading) return null;
  return (
    <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
      {heading}
    </h2>
  );
}

function SectionContent({ content }: { content?: Record<string, unknown> | null }) {
  if (!content) return null;
  return <RichText data={content} />;
}

function StackedLayout({
  heading,
  content,
  form,
  confirmationNode,
}: {
  heading?: string | null;
  content?: unknown;
  form: FormConfig;
  confirmationNode?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="flex max-w-2xl flex-col gap-4">
        <SectionHeading heading={heading} />
        <SectionContent content={content as Record<string, unknown>} />
      </div>
      <div className="w-full max-w-xl text-left">
        <FormRenderer form={form} confirmationNode={confirmationNode} />
      </div>
    </div>
  );
}

function SplitLayout({
  heading,
  content,
  form,
  confirmationNode,
}: {
  heading?: string | null;
  content?: unknown;
  form: FormConfig;
  confirmationNode?: ReactNode;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-4">
        <SectionHeading heading={heading} />
        <SectionContent content={content as Record<string, unknown>} />
      </div>
      <div>
        <FormRenderer form={form} confirmationNode={confirmationNode} />
      </div>
    </div>
  );
}

function MapLayout({
  heading,
  content,
  form,
  confirmationNode,
  mapCenter,
  mapZoom,
  mapMarkerLabel,
}: {
  heading?: string | null;
  content?: unknown;
  form: FormConfig;
  confirmationNode?: ReactNode;
  mapCenter?: { latitude?: number | null; longitude?: number | null } | null;
  mapZoom?: number | null;
  mapMarkerLabel?: string | null;
}) {
  const hasMap =
    mapCenter?.latitude != null && mapCenter?.longitude != null;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <SectionHeading heading={heading} />
          <SectionContent content={content as Record<string, unknown>} />
        </div>
        <FormRenderer form={form} confirmationNode={confirmationNode} />
      </div>
      {hasMap && (
        <div className="order-last">
          <MapPanel
            latitude={mapCenter.latitude!}
            longitude={mapCenter.longitude!}
            zoom={mapZoom ?? 14}
            markerLabel={mapMarkerLabel}
          />
        </div>
      )}
    </div>
  );
}
```

> **Note:** The exact types for `form`, `content`, etc. will come from Payload's generated types. The implementer should adjust the type assertions based on what `payload-types.ts` generates after Task 3. The `as unknown as FormConfig` cast bridges the gap between Payload's generated union type and our component's props.

- [ ] **Step 2: Register in render-blocks.tsx**

In `src/components/blocks/render-blocks.tsx`, add import:
```ts
import { FormEmbed } from "./form-embed/form-embed";
```

Add case before `default:` in the `renderBlock` function:
```ts
case "formEmbed":
  return <FormEmbed {...block} />;
```

- [ ] **Step 3: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/blocks/form-embed/form-embed.tsx src/components/blocks/render-blocks.tsx
git commit -m "feat(forms): add FormEmbed server component and register in render-blocks"
```

---

### Task 8: Add Storybook fixture

**Files:**
- Modify: `src/components/blocks/__fixtures__/block-fixtures.ts`

- [ ] **Step 1: Add fixture and argTypes**

In `src/components/blocks/__fixtures__/block-fixtures.ts`, add a `formEmbed` entry to `blockFixtures`. The `form` field must be a mock populated form object.

Add to `blockFixtures`:
```ts
formEmbed: {
  blockType: "formEmbed",
  variant: "stacked",
  heading: "Get in Touch",
  content: {
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", text: "Fill out the form below and we'll get back to you within 24 hours." }],
        },
      ],
    },
  },
  form: {
    id: 1,
    title: "Contact Form",
    fields: [
      { blockType: "text", name: "name", label: "Full Name", required: true, width: "50" },
      { blockType: "email", name: "email", label: "Email Address", required: true, width: "50" },
      { blockType: "text", name: "company", label: "Company", width: "100" },
      { blockType: "textarea", name: "message", label: "Message", required: true, width: "100", placeholder: "Tell us about your project..." },
    ],
    confirmationType: "message",
    confirmationMessage: {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "Thank you! We'll be in touch shortly." }],
          },
        ],
      },
    },
    submitButtonLabel: "Send Message",
  },
  mapCenter: { latitude: 40.7128, longitude: -74.006 },
  mapZoom: 14,
  mapMarkerLabel: "Our Office",
},
```

Register in `src/components/blocks/block-categories.ts`:
```ts
formEmbed: "Content",
```

Add to `blockArgTypes`:
```ts
formEmbed: {
  variant: {
    control: "select",
    options: ["stacked", "split", "map"],
    description: "Layout variant — stacked (centered), split (content + form), or map (form + location)",
  },
},
```

- [ ] **Step 2: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 3: Verify Storybook renders**

Run: `bun storybook` (if Storybook is running, it auto-refreshes)
Expected: FormEmbed story appears with variant control. Stacked, split, and map variants all render.

- [ ] **Step 4: Commit**

```bash
git add src/components/blocks/__fixtures__/block-fixtures.ts src/components/blocks/block-categories.ts
git commit -m "feat(forms): add Storybook fixtures for FormEmbed block"
```

---

### Task 9: Visual polish and verify end-to-end

**Files:**
- Possibly modify: any component files from previous tasks for styling adjustments

This task requires the **dev server running** and a form created in the admin panel.

- [ ] **Step 1: Restart dev server**

Tell the user to restart the dev server (schema changed, needs restart).

- [ ] **Step 2: Create a test form in admin**

Go to `http://localhost:3100/admin` → Forms → Create New Form:
- Title: "Contact Form"
- Add fields: text (Name), email (Email), textarea (Message)
- Confirmation: Message → "Thank you for reaching out!"
- Save

- [ ] **Step 3: Add FormEmbed block to a test page**

Edit a page in admin → Content tab → Add Block → Form Embed:
- Select the "Contact Form"
- Set variant to "stacked"
- Add a heading: "Contact Us"
- Save and view the page

- [ ] **Step 4: Test all three variants**

Switch the variant to `split` and `map` (add map coordinates for map variant). Verify:
- Fields render correctly with labels
- Required field validation works
- Submit sends to `/api/form-submissions` and shows confirmation
- Map variant shows the map with pin
- Mobile responsive layout stacks properly

- [ ] **Step 5: Style adjustments**

Use `@design-language` and `@theme` skills to refine the component styling to match the project's Lumon/Severance aesthetic. Common adjustments:
- Animation timing and easing
- Border and background treatments
- Typography classes
- Spacing consistency with other blocks

- [ ] **Step 6: Final lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 7: Commit any polish changes**

```bash
git add -A
git commit -m "feat(forms): polish FormEmbed styling and verify end-to-end"
```
