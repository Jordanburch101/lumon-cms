# FormEmbed Block — Design Spec

## Overview

A versatile page-builder block that renders forms created with `@payloadcms/plugin-form-builder` using existing shadcn UI components. Editors build forms in the admin panel; the block controls layout and context around the form.

## Dependencies

### New package

- `@payloadcms/plugin-form-builder@3.79.1` — matches current Payload version

### Plugin provides (no custom code)

- `forms` collection — admin UI for building forms with field types: text, textarea, select, radio, email, state, country, checkbox, number, message, date
- `form-submissions` collection — stores all submissions, viewable in admin
- Email sending with `{{field_name}}` dynamic templates
- Confirmation message (rich text) or redirect per form

## Block Schema

File: `src/payload/block-schemas/FormEmbed.ts`

```
slug: "formEmbed"
labels: { singular: "Form Embed", plural: "Form Embeds" }
admin:
  group: "Content"
  images:
    thumbnail: "/block-thumbnails/form-embed.png"
  custom:
    description: "Embed a form built in the admin panel. Supports stacked, split (content + form), and map (form + location) layouts."
```

### Fields

| Field | Type | Required | Condition | Notes |
|-------|------|----------|-----------|-------|
| `variant` | select | Yes | — | Options: `stacked`, `split`, `map`. Default: `stacked` |
| `heading` | text | No | — | Section heading |
| `content` | richText | No | — | Full Lexical editor. Supporting copy, links, formatting |
| `form` | relationship | Yes | — | `relationTo: "forms"` (plugin collection) |
| `mapCenter` | group | No | variant = `map` | Contains `latitude` (number) and `longitude` (number) |
| `mapZoom` | number | No | variant = `map` | Default: 14, min: 1, max: 20 |
| `mapMarkerLabel` | text | No | variant = `map` | Popup text for the map pin |

### Admin UX

- `variant` field at top so conditional fields appear/disappear immediately
- `mapCenter`, `mapZoom`, `mapMarkerLabel` use `admin.condition` to only show when variant is `map`
- `content` uses the project's standard Lexical editor config via `import { richTextEditor } from "@/payload/editor/config"`

## Variants

### `stacked` (default)

```
┌─────────────────────────────────┐
│         [Heading]               │
│      [Rich text content]        │
│                                 │
│   ┌─────────────────────────┐   │
│   │        Form fields      │   │
│   │        [Submit]         │   │
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

- Heading + content centered above form
- Form constrained to `max-w-xl` for readability
- Whole section within standard `max-w-7xl` container

### `split`

```
Desktop:
┌───────────────────┬─────────────────┐
│    [Heading]      │                 │
│    [Rich text     │   Form fields   │
│     content]      │   [Submit]      │
│                   │                 │
└───────────────────┴─────────────────┘

Mobile:
┌─────────────────────────────────┐
│         [Heading]               │
│      [Rich text content]        │
│         Form fields             │
│         [Submit]                │
└─────────────────────────────────┘
```

- Two-column grid on desktop (`lg:grid-cols-2`), stacked on mobile
- Content on left, form on right
- Classic "Contact Us" / "Get a Demo" layout

### `map`

```
Desktop:
┌─────────────────┬───────────────────┐
│   [Heading]     │                   │
│   [Content]     │                   │
│                 │    OpenStreetMap   │
│   Form fields   │    with pin       │
│   [Submit]      │                   │
│                 │                   │
└─────────────────┴───────────────────┘

Mobile:
┌─────────────────────────────────┐
│         [Heading]               │
│      [Rich text content]        │
│         Form fields             │
│         [Submit]                │
│      ┌─────────────────┐       │
│      │   Map with pin  │       │
│      └─────────────────┘       │
└─────────────────────────────────┘
```

- Two-column grid on desktop, stacked on mobile
- Content + form on left, map on right
- Uses existing `Map` component from `@/components/ui/map`
- Map renders with `MapMarker` at `mapCenter` coordinates, with `MarkerContent` for the pin and optional `MarkerPopup` for label
- Map has rounded corners, matches card styling

## Frontend Component

### File structure

```
src/components/blocks/form-embed/
  form-embed.tsx        — Server component: section wrapper, heading, RichText, variant layout
  form-renderer.tsx     — "use client": form state, submission logic, field rendering
  field-mapper.tsx      — Maps plugin field types → shadcn components
  map-panel.tsx         — "use client": Map component wrapper (only used by map variant)
```

### `form-embed.tsx` — Main component (server component)

- **No `"use client"`** — renders heading, RichText content, and section wrapper on the server
- Receives `FormEmbedBlock` props from render-blocks
- The `form` relationship field is populated by the page query's `depth` (the page catch-all already uses `depth: 2`). The populated form object includes `fields`, `confirmationType`, `confirmationMessage`, and `redirect`. If the relationship is not populated (comes as just an ID), the component should return null gracefully.
- Passes the populated form data down to `FormRenderer` (client) as props
- Delegates to variant-specific layout
- Standard section wrapper: `max-w-7xl mx-auto px-4 lg:px-6`
- Animation: `useInView` + `motion.div` stagger pattern (via client wrapper if needed)

### `form-renderer.tsx` — Form logic

- Manages form state (field values, errors, loading, submitted)
- Validates required fields client-side before submit
- Submits POST to `/api/form-submissions` with `{ form: formId, submissionData: [...] }`
- On success:
  - If `confirmationType === "redirect"`: navigate to the redirect page
  - If `confirmationType === "message"`: fade out form, fade in confirmation message rendered via `RichText` component
- On error: display inline `FieldError` per field + general error message

### `field-mapper.tsx` — Field type mapping

Maps the plugin's block types to shadcn components:

| Plugin field type | shadcn component | Notes |
|-------------------|-----------------|-------|
| `text` | `Input` | type="text" |
| `email` | `Input` | type="email" |
| `number` | `Input` | type="number" |
| `textarea` | `Textarea` | — |
| `select` | `Select` | With SelectTrigger, SelectContent, SelectItem |
| `radio` | `RadioGroup` | With RadioGroupItem |
| `checkbox` | `Checkbox` | With Label |
| `country` | `Select` | Pre-populated country list |
| `state` | `Select` | Pre-populated US state list |
| `message` | `RichText` | Display-only rich text block within the form |
| `date` | `Input` | type="date" (native date picker) |

Each field wrapped in `Field` component with `FieldLabel`, `FieldContent`, `FieldError`. Respects the `width` property from the plugin for grid column sizing. Required fields show indicator.

### `map-panel.tsx` — Map wrapper (client component)

- `"use client"` — Map requires browser APIs
- Import `Map`, `MapMarker`, `MarkerContent`, `MarkerPopup` from `@/components/ui/map`
- Map is **uncontrolled** — pass `center` and `zoom` as initial viewport, no `onViewportChange`
- Pass coordinates as `viewport={{ center: [longitude, latitude], zoom: mapZoom }}` — note: MapLibre uses **[lng, lat]** order, so convert from the schema's separate `latitude`/`longitude` fields
- Render `<MapMarker longitude={lng} latitude={lat}>` with `<MarkerContent />` for the default pin visual
- If `mapMarkerLabel` is provided, render `<MarkerPopup>{mapMarkerLabel}</MarkerPopup>` inside the `MapMarker`
- Map container has `min-h-[400px]` and `rounded-lg overflow-hidden`

## Plugin Configuration

In `payload.config.ts`:

```ts
import { formBuilderPlugin } from "@payloadcms/plugin-form-builder";

// In plugins array:
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
    payment: false,  // Not needed for now
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

## Registration

### Pages collection

Add `FormEmbedBlock` to the `layout` blocks array in `src/payload/collections/Pages.ts`.

### Block types

Add to `src/types/block-types.ts`:

```ts
export type FormEmbedBlock = ExtractBlock<"formEmbed">;
```

### Render blocks

Add to `src/components/blocks/render-blocks.tsx`:

```ts
case "formEmbed":
  return <FormEmbed {...block} />;
```

### Storybook

Add fixture to `src/components/blocks/__fixtures__/block-fixtures.ts` with sample data for all three variants. Use `blockArgTypes` for the variant control. The `form` field must be a mock populated form object (not just an ID), including a `fields` array with block-typed field definitions matching the plugin's schema, plus `confirmationType` and `confirmationMessage`.

## Migration

Running `bun run migrate:create` after adding the plugin + block schema will generate migrations for:
- `forms` collection (plugin)
- `form_submissions` collection (plugin)
- `formEmbed` block columns in pages layout

## Submission API

The plugin automatically creates a REST endpoint at `POST /api/form-submissions`. The frontend component submits to this endpoint with:

```json
{
  "form": 1,
  "submissionData": [
    { "field": "fieldName", "value": "fieldValue" }
  ]
}
```

The `form` value is the numeric form ID (Payload uses number IDs with SQLite). No custom API route needed.

## Cache Revalidation

The plugin's `forms` collection does not have afterChange/afterDelete hooks for the project's cache revalidation system. If an editor changes a form's fields or confirmation message, pages embedding that form will serve stale data until the page is re-saved. This is acceptable for now — form schemas change rarely. If it becomes a problem, add a revalidation hook to the `forms` collection via `formOverrides.hooks`.

## Out of Scope

- Payment processing (can be added later via `handlePayment` hook)
- Multi-step forms / wizards
- File upload fields
- CAPTCHA / spam protection (can layer in later via `beforeChange` hook)
- Custom email HTML templates (plugin default is fine for now)
