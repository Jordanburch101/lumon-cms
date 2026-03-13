# Group Field Editor — Frontend Editor Popover for Composite Fields

## Problem

The frontend editor handles individual fields well (inline text, popovers for number/select/checkbox/date, dialogs for uploads), but has no pattern for **composite field groups** — a single clickable DOM element that represents multiple related fields. The CMS link (`<CMSLink>`) is the first case: clicking a button/link on the page should let the editor modify type, URL/reference, newTab, and appearance options in a lightweight popover, with the label editable inline.

## Solution

A generic **group editor** system that extends the frontend editor with support for composite fields. The link editor is the first implementation; future composite fields (e.g., social profile, address) register their own editors using the same infrastructure.

## Architecture

### File Structure

```
src/
  payload/
    fields/link/
      link.ts                        — adds custom: { groupType: "link" } to GroupField
      linkable-collections.ts        — unchanged, shared registry
    lib/field-map/
      generate.ts                    — emits GroupFieldDescriptor for groups with custom.groupType
      types.ts                       — GroupFieldDescriptor type added

  app/(frontend)/api/pages/search/
    route.ts                         — authed search endpoint for internal link reference picker

  components/features/frontend-editor/
    edit-runtime.tsx                  — scans [data-field-group], inline label editing, edit icon overlay
    field-editor-orchestrator.tsx     — listens for edit:open-group-editor, dispatches to registry
    group-editor-registry.ts         — NEW: register/get pattern for group editor components
    group-editors/
      link-editor-popover.tsx        — NEW: compact popover for link field editing

  components/ui/
    cms-link.tsx                     — accepts data-field-group / data-field-group-type props
```

### Data Flow

```
1. Block renders <CMSLink data-field-group="primaryCta" data-field-group-type="link" />
2. Edit runtime scans DOM, finds [data-field-group] elements
3. For label text → activates inline contentEditable (existing text editing behavior)
4. For edit icon click → dispatches edit:open-group-editor event
5. Orchestrator receives event, looks up group type in registry
6. LinkEditorPopover renders anchored to element, populated with current values
7. User edits fields → updateField(blockIndex, "primaryCta.url", newValue) via edit mode context
8. Changes reflect in the page in realtime
```

## Field Map — Group Descriptor

### Problem

The field map generator currently flattens Payload groups with dot-prefix paths (e.g., `primaryCta.label`, `primaryCta.url`). For composite field groups, the editor needs to know that these fields belong together and which editor component should handle them.

### Solution

A new `GroupFieldDescriptor` type. The generator detects groups with `custom.groupType` on the Payload GroupField and emits the new descriptor instead of flattening.

### Type Definition

```ts
interface GroupFieldDescriptor {
  type: "group"                              // discriminant — matches existing FieldEntry convention
  groupType: string                          // "link" | future types
  fields: Record<string, FieldDescriptor>    // nested field descriptors
}
```

The `FieldEntry` union in `types.ts` is updated to include the new type:

```ts
export type FieldEntry = FieldDescriptor | ArrayFieldDescriptor | GroupFieldDescriptor;
```

### Detection

The `link()` field function in `link.ts` is modified to add `custom: { groupType: "link" }` to the GroupField it returns. The field map generator checks for `custom.groupType` on group fields:

- **Present** → emit `GroupFieldDescriptor` with nested fields
- **Absent** → flatten with dot-prefix paths (existing behavior, unchanged)

### Example

A Hero block's field map changes from:

```
primaryCta.type     → { type: "select", options: [...] }
primaryCta.label    → { type: "text" }
primaryCta.url      → { type: "text" }
primaryCta.newTab   → { type: "checkbox" }
...
```

to:

```
primaryCta → {
  type: "group",
  groupType: "link",
  fields: {
    type:       { type: "select", options: [...] },
    label:      { type: "text" },
    url:        { type: "text" },
    reference:  { type: "relationship", relationTo: ["pages"] },
    newTab:     { type: "checkbox" },
    buttonVariant: { type: "select", options: [...] },
    buttonSize:    { type: "select", options: [...] }
  }
}
```

Only fields that were configured on the `link()` call appear in the nested fields. A plain link with no appearance config would only have type, label, url, reference, newTab.

## DOM Attributes & Edit Runtime

### CMSLink Props

`<CMSLink>` gets two new optional props that pass through as data attributes on the root element:

```tsx
interface CMSLinkProps {
  link?: CMSLinkData | null
  className?: string
  children?: ReactNode
  "data-field-group"?: string      // e.g., "primaryCta"
  "data-field-group-type"?: string // e.g., "link"
}
```

The component collects `data-field-group` and `data-field-group-type` from props via rest-spread and passes them through to the **inner link element** (`<a>` or `<Link>`), not the `<Button>` wrapper. In the `asChild` button path, the attributes are placed on the `<LinkEl>` child inside `<Button>`, ensuring they land on the actual DOM element the runtime scans. Blocks opt in by passing these props — no overhead in non-editor contexts.

### Edit Runtime Scanning

The runtime adds a second scan pass for `[data-field-group]` elements, separate from the existing `[data-field]` scan. When a group element is found:

1. **Read attributes:** `data-field-group` (field path) and `data-field-group-type` (group type). The `blockIndex` is resolved by traversing up to the nearest `[data-block-index]` ancestor — same pattern the existing `[data-field]` scan uses.
2. **Inline label editing:** The runtime wraps the text content in a `<span>` with `contentEditable` rather than making the `<a>` or `<button>` itself editable (anchors and buttons have browser quirks with contentEditable — cursor behavior, Enter key creating `<br>`, click-to-edit conflicting with link navigation). The span is mapped to `{groupName}.label` in the edit mode state. Link navigation is suppressed via `preventDefault` on the anchor's click handler (existing `suppressInteraction` pattern).
3. **Edit icon overlay:** On hover, a small edit icon (pencil) appears anchored to the element. Clicking the icon dispatches the `edit:open-group-editor` custom event.

### Event Payload

```ts
interface OpenGroupEditorEvent {
  blockIndex: number                          // which block this group belongs to
  fieldPath: string                           // "primaryCta"
  groupType: string                           // "link"
  fields: Record<string, FieldDescriptor>     // nested descriptors from field map
  currentValues: Record<string, unknown>      // current group values, read from edit mode state
  anchorEl: HTMLElement                       // DOM element to anchor popover to
}
```

The `currentValues` are read from the edit mode context's `state.blocks[blockIndex]` at the group's field path (e.g., `blocks[0].primaryCta` yields `{ type: "external", label: "Get Started", url: "https://...", ... }`). The runtime has access to the edit mode state through the React context — it reads the current block data when constructing the event payload.

## Group Editor Registry

### Purpose

A dispatch mechanism that maps group type strings to editor components. Keeps the orchestrator generic — it doesn't know about link-specific UI.

### API

```ts
// group-editor-registry.ts
type GroupEditorProps = {
  blockIndex: number
  fieldPath: string
  fields: Record<string, FieldDescriptor>
  currentValues: Record<string, unknown>
  anchorEl: HTMLElement
  onClose: () => void
}

type GroupEditorComponent = React.ComponentType<GroupEditorProps>

const registry = new Map<string, GroupEditorComponent>()

export function registerGroupEditor(type: string, component: GroupEditorComponent): void {
  registry.set(type, component)
}

export function getGroupEditor(type: string): GroupEditorComponent | null {
  return registry.get(type) ?? null
}
```

### Registration

Each group editor registers itself at module level:

```ts
registerGroupEditor("link", LinkEditorPopover)
```

Registration runs as a side effect when the module is imported. The orchestrator (or a central `group-editors/index.ts` barrel) imports each editor module to ensure the side effect executes and the editor is available in the registry.

### Fallback

If `getGroupEditor()` returns null (no editor registered for that group type), the orchestrator falls back to opening the block editor dialog. The dialog receives a `focusGroup` prop containing the group's `fieldPath` and `fields`, which tells `FieldMapRenderer` to render only that group's fields rather than the full block. This reuses existing rendering infrastructure with minimal changes — just a filter on which fields to show.

### Extensibility

Adding a new composite field type requires:
1. Create the Payload field function with `custom: { groupType: "myType" }`
2. Write the editor component implementing `GroupEditorProps`
3. Call `registerGroupEditor("myType", MyEditor)`

No changes to the runtime, orchestrator, or registry.

## Field Editor Orchestrator Changes

The orchestrator (`field-editor-orchestrator.tsx`) adds a listener for the `edit:open-group-editor` event alongside its existing `edit:open-popover` and `edit:open-upload` listeners:

1. Receive `OpenGroupEditorEvent`
2. Call `getGroupEditor(event.groupType)`
3. If found → render the component with `GroupEditorProps`, anchored to `event.anchorEl`
4. If not found → fall back to block editor dialog for the group's fields
5. Dismiss on click-outside or Escape (same behavior as existing popovers)

## Link Editor Popover

### Layout

Compact stacked popover (~320px wide):

- **Header:** "Edit Link" label + close button
- **Type toggle:** Segmented control — External / Internal
- **Destination field:** Switches based on type:
  - External → URL text input
  - Internal → Searchable page combobox
- **New Tab:** Toggle switch
- **Divider** (only when appearance fields exist)
- **Appearance fields** (schema-aware, only shown if configured):
  - Variant: pill selector from configured options
  - Size: pill selector from configured options

### Schema Awareness

The popover reads the `fields` prop (from the `GroupFieldDescriptor`) to determine which fields to render. If `buttonVariant` isn't in `fields`, the variant selector doesn't appear. If no appearance fields exist, the divider and appearance section are hidden entirely.

### Field Updates

Each field change calls `updateField(blockIndex, path, value)` via edit mode context — matching the existing signature `(blockIndex: number, path: string, value: AnyValue) => void`:
- `updateField(blockIndex, "primaryCta.type", "internal")`
- `updateField(blockIndex, "primaryCta.url", "https://...")`
- `updateField(blockIndex, "primaryCta.reference", { relationTo: "pages", value: 5 })`
- `updateField(blockIndex, "primaryCta.newTab", true)`
- `updateField(blockIndex, "primaryCta.buttonVariant", "outline")`

Changes apply immediately — no save/cancel flow. Consistent with how other frontend editor fields work.

## Searchable Page Combobox

### API Endpoint

`(frontend)/api/pages/search/route.ts` — a lightweight authed route handler.

**Authentication:** Checks for a valid Payload user session via `payload.auth({ headers })`. Returns 401 if unauthenticated. The frontend editor is already behind auth, but this enforces it server-side.

**Query:** Accepts `?q=` search param. Calls Payload Local API `find()` on all collections in `linkableCollections` (imported from `@/payload/fields/link/linkable-collections`), searching by title field, limited to 20 results.

**Response:** `{ id: number, title: string, slug: string, collection: string }[]`

### Combobox Behavior

- Uses shadcn Combobox component
- Empty state: shows first 20 pages (no query filter)
- Typing: debounced search (300ms) via the API endpoint
- Selection: displays page title, stores `{ relationTo: collection, value: id }` as the reference field value
- Clearing: clears the reference value

### Linkable Collections

The API route imports `linkableCollections` from `@/payload/fields/link/linkable-collections.ts` — same source of truth as the Payload field schema. When new collections become linkable, the API automatically searches them.

## Dependencies

- shadcn Popover (positioning, dismiss behavior)
- shadcn Combobox / Command (searchable page picker)
- Existing edit mode context (`updateField`, `getFieldValue`)
- Existing edit runtime (DOM scanning, inline text editing)
- Existing field map generator and types

## Out of Scope

- Rich text inline link editing (Lexical has its own link plugin)
- Navigation/navbar/footer links (currently hardcoded)
- Drag-and-drop reordering of links within arrays
- Undo/redo for group field changes (follows existing frontend editor behavior — no undo)
