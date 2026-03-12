# Frontend Editor — Inline Site Editing for Logged-In Users

## Overview

A frontend editing system that lets logged-in Payload CMS users edit page content directly on the rendered site. Users click on text to edit it inline, use popovers for non-text fields, and reorder/add/remove blocks via controls that appear on hover. All changes are explicit-save — nothing persists until the user clicks Save Draft or Publish.

## Goals

- Enable inline text editing on all block components by adding `data-field` attributes
- Provide block-level controls (reorder, duplicate, remove, add) between blocks
- Provide array-item-level controls within blocks (reorder, remove, add)
- Automatically discover editable fields from Payload block schemas — no manual configuration per block
- Extend the existing admin bar as the control surface (Save Draft / Publish / Discard)
- Zero impact on the visitor experience — all editing UI is invisible when not in edit mode
- No Next.js server re-rendering during editing — all changes are client-side React state

## Non-Goals

- Rich text (Lexical) inline editing — deferred entirely
- Auto-save — v1 uses explicit save only
- Collaborative editing / conflict resolution
- Custom field validation UI (use Payload's validation on save, surface errors)
- Undo/redo beyond browser's native contentEditable undo
- Page-level fields (`title`, `slug`, `meta`) — v1 edits only `layout` blocks. Page metadata is edited in the admin panel.
- Conditional field visibility logic (`admin.condition`) — conditional fields (e.g., `featuredQuote`) are always included in the field map. The block component's own rendering logic handles visibility. The edit runtime does not evaluate condition functions.

---

## 1. Architecture

### Data Flow

```
[Payload Block Schemas] → (build-time) → [Field Map JSON]
                                              ↓
[Server-rendered page] → (enter edit mode) → [Client state copy]
                                              ↓
                                     [User edits fields]
                                     [User reorders blocks]
                                              ↓
                                     [Save Draft / Publish]
                                              ↓
                              [PATCH /api/pages/<id>]
                                              ↓
                              [afterChange → revalidateTag]
                                              ↓
                              [router.refresh() → SSR re-render]
```

### Three Systems

1. **Schema Introspector** (build-time) — Imports the block schema files directly (not the full Payload config, which has server-only dependencies like `sharp` and `@payloadcms/db-sqlite`). Walks each block's `fields[]` recursively and outputs a typed field map. Runs via `bun generate:field-map` or as part of the build.

2. **Edit Mode Context** (client runtime) — React context provider holding mutable block data (client state), dirty field tracking, and save/discard handlers. Mounted in the `(frontend)` layout (alongside `AdminBar`), so both `RenderBlocks` and the admin bar can access it. Renders nothing when no user is authenticated — zero overhead for visitors.

3. **Edit Runtime** (client runtime) — On edit mode activation, performs a one-time DOM scan to find `data-field` elements within each `data-block-index` container. Applies `contentEditable` to text/textarea/email fields, attaches click handlers (via React portals anchored to the element's bounding rect) for popover/modal fields. Re-scans after structural changes (add/remove block) using a `MutationObserver` on the block list container, debounced to fire after Framer Motion layout animations settle (~400ms).

### Server/Client Component Boundary

`RenderBlocks` is currently a server component. It stays a server component — it renders the initial SSR page as before. The edit mode overlay is handled by a **sibling client component** (`EditableOverlay`) that wraps the same container:

```tsx
// (frontend)/[[...slug]]/page.tsx (server component — unchanged)
<RenderBlocks blocks={page.layout ?? []} />

// (frontend)/layout.tsx (client boundary already exists for AdminBar)
<EditModeProvider pageId={...} initialBlocks={...}>
  {children}           {/* ← RenderBlocks output lives here */}
  <EditableOverlay />  {/* ← client component, reads context */}
  <AdminBar />         {/* ← already a client component */}
</EditModeProvider>
```

When edit mode activates, `EditableOverlay` takes over rendering: it fetches the full page data via API, clones it into state, and renders `RenderBlocksClient` (a client version of the block renderer) on top of / replacing the SSR output. When edit mode is off, `EditableOverlay` renders nothing — the SSR output is visible as-is.

### Rendering Strategy

**Normal mode:** Server-rendered `RenderBlocks` output. Standard SSR, cached, fast. `EditableOverlay` renders nothing.

**Edit mode:** `EditableOverlay` renders `RenderBlocksClient` from client state. All edits update client state → instant client-side React re-render. Next.js server is never contacted during editing.

**Text fields** use `contentEditable` with `suppressContentEditableWarning`. The browser handles typing natively. State syncs on `blur` (not on every keystroke), so React does not re-render during active typing. Block components that contain `contentEditable` elements are wrapped with `React.memo` using a custom comparator that skips text field props when those fields are actively being edited — preventing React reconciliation from fighting the browser's DOM mutations.

**Structural changes** (reorder, add, remove) are array operations on state. Blocks are keyed by Payload `block.id` (stable across reorder) so React moves DOM nodes instead of destroying/recreating. Framer Motion `layout` prop provides smooth animated reorder.

**Prerequisite:** All array items in block components must use stable ID-based keys (e.g., `key={row.id}`), not content-derived keys (e.g., `key={tier.name}`). Some blocks currently use content keys and will need updating.

### Save Flow

**Save Draft:** PATCH with `_status: "draft"`. On success, toast via Sonner. Re-fetch the page data via API and re-populate the edit context with the saved version. Stay in edit mode with a clean dirty state. No `router.refresh()` — the client state is the source of truth while editing.

**Publish:** PATCH with `_status: "published"`. On success, toast. Exit edit mode (unmount `EditableOverlay`). Call `router.refresh()` to fetch the freshly-published data from the server. Page returns to canonical SSR state.

**Discard:** If dirty, `AlertDialog` confirmation. On confirm, `window.location.reload()` — full page reload restores the server-rendered state.

### Draft Mode Interaction

Entering edit mode ensures Next.js draft mode is enabled. The implementation first calls `GET /api/draft/toggle` to check the current state. If `enabled: false`, it calls `POST /api/draft/toggle` to enable it. This two-step check is necessary because the toggle API flips the current state — calling POST when already enabled would disable it. The pre-edit draft mode state is saved so it can be restored on exit.

When edit mode exits via Publish, draft mode is disabled (POST toggle if currently enabled). When edit mode exits via Discard, draft mode is restored to whatever state the user had before entering edit mode.

### "Edit Page" Button Behavior

The current "Edit Page" link in `admin-bar-actions.tsx` opens the admin panel. This changes to a toggle that activates frontend edit mode. The admin panel link is preserved as a secondary action: the user menu dropdown gets an "Open in Admin" item linking to `/admin/collections/pages/<id>`.

### `data-field` Path Resolution

`data-field` paths are resolved relative to the nearest ancestor `data-block-index` element. This means sub-components within a block (e.g., `ImageCard` inside `BentoShowcase`) can use `data-field="image.title"` without needing to know their block index — the edit runtime walks up the DOM to find the block container.

---

## 2. Data Attribute Contract

Block components declare editable fields by adding attributes to the elements that render field values.

### Attributes

| Attribute | Purpose | Added By | Example |
|---|---|---|---|
| `data-field` | Dot-notation path to the Payload field | Block component | `data-field="headline"` |
| `data-block-index` | Block position in the `layout[]` array | `RenderBlocks` / `RenderBlocksClient` | `data-block-index="0"` |
| `data-block-type` | Block type slug (replaces existing `data-section`) | `RenderBlocks` / `RenderBlocksClient` | `data-block-type="hero"` |
| `data-array-item` | Array item container with path prefix | Block component | `data-array-item="rows.0"` |

Note: `data-field` on an `<img>` or `<video>` element does not make it `contentEditable` — the edit runtime detects the element type + `upload` field type from the field map and attaches a click handler to open the media picker instead.

### Path Encoding

- **Simple field:** `data-field="headline"`
- **Group field:** `data-field="primaryCta.label"`
- **Array item field:** `data-field="rows.0.headline"`
- **Nested group in array:** `data-field="rows.0.mediaOverlay.title"`
- **Array in array:** `data-field="tiers.0.features.2.text"`

### Contract Rules

1. One attribute per rendered element — the element that displays the field value gets the `data-field`.
2. Path must match Payload's data shape exactly (dot notation for groups, numeric indices for arrays).
3. Field type is never declared in the DOM — the field map provides the type.
4. Missing attributes = not editable. Graceful degradation, no errors.
5. No runtime behavior in the component — components just add attributes. The edit runtime handles all behavior externally.

### Example: Hero Component

```tsx
// Before (current)
<h1>{headline}</h1>
<p>{subtext}</p>
<Button>{primaryCta.label}</Button>

// After (annotated)
<h1 data-field="headline">{headline}</h1>
<p data-field="subtext">{subtext}</p>
<Button data-field="primaryCta.label">{primaryCta.label}</Button>
```

### Example: Array Items (SplitMedia)

```tsx
{rows.map((row, i) => (
  <div key={row.id} data-array-item={`rows.${i}`}>
    <h2 data-field={`rows.${i}.headline`}>{row.headline}</h2>
    <p data-field={`rows.${i}.body`}>{row.body}</p>
    <img data-field={`rows.${i}.mediaSrc`} src={getMediaUrl(row.mediaSrc)} />
  </div>
))}
```

---

## 3. Schema Introspector

A build-time utility that imports the Payload config, walks every block's `fields[]` recursively, and generates a typed field map.

### Input → Output

The introspector imports block schema files directly from `src/payload/block-schemas/` (these are pure TypeScript objects with no server dependencies). It produces a typed field map keyed by block slug. Each entry describes the field's type, constraints, and nested structure.

### Sample Output

```ts
// generated/field-map.ts (auto-generated, gitignored)
export const fieldMap = {
  hero: {
    headline: { type: "text", required: true },
    subtext: { type: "text", required: true },
    mediaSrc: { type: "upload", relationTo: "media", required: true },
    "primaryCta.label": { type: "text", required: true },
    "primaryCta.href": { type: "text", required: true },
    "secondaryCta.label": { type: "text", required: true },
    "secondaryCta.href": { type: "text", required: true },
  },
  pricing: {
    headline: { type: "text", required: true },
    subtext: { type: "text" },
    footnote: { type: "text" },
    tiers: {
      type: "array",
      fields: {
        name: { type: "text", required: true },
        monthlyPrice: { type: "number", min: 0, required: true },
        annualPrice: { type: "number", required: true },
        recommended: { type: "checkbox" },
        badge: { type: "text" },
        "cta.label": { type: "text", required: true },
        "cta.href": { type: "text", required: true },
        features: {
          type: "array",
          fields: {
            text: { type: "text", required: true },
          },
        },
      },
    },
  },
  // ... all other blocks
} as const;
```

### Block Labels and Defaults

The introspector also extracts per-block metadata for the block picker:

```ts
export const blockMeta = {
  hero: { label: "Hero", slug: "hero" },
  pricing: { label: "Pricing", slug: "pricing" },
  faq: { label: "FAQ", slug: "faq" },
  // ...
} as const;
```

New block defaults: when a user adds a block via the block picker, required text fields start as empty strings, numbers as `0`, checkboxes as `false`, arrays as empty `[]`. The user fills them in inline and validation runs on save.

### What Gets Extracted Per Field

**Always:** `type`, `required`, `hasMany`, `localized`

**Type-specific:**
- `min` / `max` — number fields
- `minLength` / `maxLength` — text fields
- `minRows` / `maxRows` — array fields
- `options` — select, radio fields
- `relationTo` — upload, relationship fields

### What Gets Skipped

- `richText` fields — deferred
- `ui` fields — no data
- `row` / `collapsible` / unnamed `tabs` — layout only, no data
- `join` fields — read-only virtual
- `admin` config, `hooks`, `access`, `validate` — server-only concerns

### Field Types → Edit UI Mapping

| Field Type | Edit UI | Complexity |
|---|---|---|
| `text` | `contentEditable` | Trivial |
| `textarea` | `contentEditable` (multiline) | Trivial |
| `email` | `contentEditable` + email validation on save | Trivial |
| `number` | Popover with `Input` (type=number), respects min/max | Low |
| `select` | Popover with `Select` component, options from schema | Low |
| `radio` | Popover with option list (single select) | Low |
| `checkbox` | Popover with `Switch` toggle | Trivial |
| `date` | Popover with `Calendar` component | Low |
| `point` | Popover with lat/lng `Input` pair | Low |
| `code` | Popover/modal with code editor | Medium |
| `json` | Modal with JSON editor | Medium |
| `upload` | `Dialog` with media picker (browse + upload) | Medium |
| `relationship` | `Dialog` with document picker (search + select) | Medium |
| `group` | Container — dot-path encoding, children editable individually | Container |
| `array` | Container — indexed paths + add/remove/reorder controls | Container |
| `blocks` | Container — block-level controls | Container |
| `richText` | Skipped (deferred) | — |
| `row` / `collapsible` / `tabs` / `ui` / `join` | Skipped (no data or read-only) | — |

### hasMany Modifier

Fields with `hasMany: true` (text, number, select, relationship, upload) render as tag lists or sortable lists with add/remove controls instead of single-value editors.

---

## 4. Block Controls

Controls that appear when hovering over blocks and array items during edit mode. All controls use existing shadcn UI components.

### Block Toolbar

Appears top-right on hover over any block, outside the block boundary.

- **Block type label** — from schema `labels.singular` via `Badge`
- **Move up / Move down** — reorder in layout array via `Button` (ghost, icon) + `Tooltip`
- **Duplicate** — deep clone with new ID via `Button` (ghost, icon) + `Tooltip`
- **Remove** — `Button` (ghost, icon, destructive) → `AlertDialog` confirmation
- Glass morphism styling consistent with admin bar

### Add Block Button

Dashed line + button between every pair of blocks (and at top/bottom of page).

- Subtle until hovered
- Click opens block picker via `Popover` + `Command` (searchable list)
- Block picker shows all available block types from field map with label
- Selecting inserts a new block with default/empty values at that position

### Array Item Controls

Appear on hover over elements with `data-array-item`. Smaller, more compact than block toolbar.

- **Reorder** — arrows matching layout flow (←→ for horizontal, ↑↓ for vertical)
- **Remove** — no confirmation (easily undone via Discard)
- **Add** — appears after last item, respects `maxRows` from schema
- Same pattern nests for arrays-in-arrays (e.g., Pricing features)

### Safety

- Remove block → `AlertDialog` confirmation
- Remove array item → no confirmation (Discard reverts everything)
- `minRows` / `maxRows` enforced (disable add/remove at limits)
- Required fields validated on Save, not during editing (don't interrupt flow)

### shadcn Component Mapping

| Control | Component |
|---|---|
| Toolbar buttons | `Button` (ghost/icon) + `Tooltip` |
| Remove confirmation | `AlertDialog` |
| Block picker | `Popover` + `Command` |
| Block type label | `Badge` |
| Field popovers | `Popover` + `Input` / `Select` / `Calendar` / `Switch` |
| Media picker | `Dialog` + `ScrollArea` |
| Validation errors | `Sonner` (toast) |
| Loading states | `Spinner` inside buttons |

---

## 5. Admin Bar Edit Mode Integration

The existing admin bar transforms when edit mode is active. No new toolbars — the bar is the control surface.

### Three Bar States

**Normal** (existing, unchanged) — Edit Page link, Collections link, user menu, draft/published toggle, collapse button.

**Edit Mode Active** — Blue border + hex tint. "Editing" label with pulse dot replaces normal actions. Save controls appear: Discard (`Button` ghost) | Save Draft (`Button` outline) | Publish (`Button` default, green). Close button (×) exits edit mode.

**Unsaved Changes** — Amber border + hex tint. Change counter ("3 changes") replaces "Editing" label. Same save controls.

### State Transitions

| Trigger | Transition |
|---|---|
| "Edit Page" clicked | Normal → Edit Mode. Clone page data into state. |
| Field edited | Edit Mode → Unsaved Changes. Increment dirty counter. |
| Save Draft | PATCH with `_status: "draft"`. Toast on success. Re-fetch page data via API, re-populate context. Stay in Edit Mode (reset to clean). No `router.refresh()`. |
| Publish | PATCH with `_status: "published"`. Toast. Exit to Normal. Revalidation fires. |
| Discard | If dirty: `AlertDialog` → confirm → `window.location.reload()`. If clean: exit to Normal. |
| × (close) | Same as Discard. |
| Save fails | `Sonner` error toast. Stay in Unsaved Changes. No data lost. |
| Validation errors | `Sonner` toast listing issues. Error fields get red outline. Stay in Unsaved Changes. |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+E` | Toggle edit mode on/off |
| `Cmd+S` | Save draft (when in edit mode; `e.preventDefault()` suppresses browser save dialog) |
| `Cmd+Shift+S` | Publish (when in edit mode) |
| `Escape` | Exit edit mode (prompts if dirty) |

---

## 6. Edit Mode Visual Treatment

When edit mode is active, the page gets subtle visual cues without being overwhelming:

- **Block outlines** — faint dashed border on hover, solid on active. Uses `border-border/10` token.
- **Editable field highlights** — subtle bottom-border or background tint on hover. Disappears after first edit.
- **Cursor** — `cursor: text` on editable text fields. `cursor: pointer` on upload fields with small icon overlay.
- **No layout shift** — all edit overlays (toolbars, popovers, add-block buttons) are absolutely/fixed positioned. Page layout stays identical to what visitors see.

---

## 7. File Structure

```
src/
  components/
    features/
      frontend-editor/                 ← new feature folder
        edit-mode-context.tsx           React context + provider
        editable-overlay.tsx            Client overlay that renders RenderBlocksClient in edit mode
        block-controls.tsx              Block toolbar + add-block button
        array-item-controls.tsx         Array item reorder/remove/add
        render-blocks-client.tsx        Client version of RenderBlocks for edit mode
        field-editors/
          text-editor.tsx               contentEditable handler
          number-editor.tsx             Number popover (Popover + Input)
          select-editor.tsx             Select/radio popover (Popover + Select)
          checkbox-editor.tsx           Checkbox popover (Popover + Switch)
          date-editor.tsx               Date picker popover (Popover + Calendar)
          upload-editor.tsx             Media picker (Dialog + ScrollArea)
          relationship-editor.tsx       Document picker (Dialog + Command)
        block-picker.tsx                Add-block command palette (Popover + Command)
        save-controls.tsx               Admin bar save/discard/publish buttons
        use-edit-mode.ts                Hook for consuming edit state
        use-keyboard-shortcuts.ts       Cmd+E, Cmd+S, Escape handlers
  payload/
    lib/
      field-map/
        generate.ts                     Schema introspector script
        types.ts                        FieldMap TypeScript types
  generated/
    field-map.ts                        Auto-generated output (gitignored)
```

---

## 8. API Surface

### Enter Edit Mode

Fetch full page data for the mutable copy:

```
GET /api/pages/<id>?draft=true&depth=2
```

### Save

```
PATCH /api/pages/<id>
Content-Type: application/json
{
  "layout": [...updatedBlocks],
  "_status": "draft" | "published"
}
```

Uses existing Payload REST API with `payload-token` cookie auth. The `afterChange` hook fires `revalidateTag`, which invalidates the cached page.

### Media Picker

Browse existing media:
```
GET /api/media?limit=20&page=1&sort=-createdAt
```

Upload new media:
```
POST /api/media (multipart form)
```

---

## 9. Edge Cases

- **Page not found in API** — "Edit Page" button disabled, no edit mode available.
- **Concurrent edits** — Not handled in v1. Last save wins. Future: optimistic locking via `updatedAt` comparison.
- **Session expiry during editing** — Save returns 401 → toast error "Session expired. Please log in again." → link to admin login.
- **Insufficient permissions** — If the user does not have `update` access on the `pages` collection, the "Edit Page" button is hidden (checked via the initial page context fetch — if the user can read but not update, the API response will not include write capabilities).
- **Large pages** — Many blocks could slow re-renders. Mitigated by stable keys (React moves, not recreates) and `React.memo` on block components.
- **Navigation during editing** — `beforeunload` event warns if dirty state exists.
- **New block defaults** — Required text fields start as empty strings, numbers as `0`, checkboxes as `false`, arrays as `[]`. Validated on save.
- **Blocks without schemas** — If a block component exists without a corresponding schema in the field map (e.g., `mdr-terminal`), it renders normally but is not editable. No errors.

---

## 10. Prerequisites

Before implementation, the following codebase changes are needed:

1. **Stable array item keys** — Update block components that use content-derived keys (e.g., `key={tier.name}`, `key={item.question}`) to use Payload's stable `id` field (`key={tier.id}`). Required for reorder to work without DOM destruction.
2. **Add `.gitignore` entry** — Add `src/generated/` to `.gitignore` for the auto-generated field map.
3. **Create `src/generated/` directory** — Needed for field map output.

---

## 11. Testing Strategy

- **Schema introspector** — Pure function, easy to unit test. Feed it block schemas, assert the generated field map structure. Test nested groups, arrays, arrays-in-arrays, skipped field types (richText, ui, row).
- **Edit mode context** — Unit test state transitions: enter edit mode, edit fields, dirty tracking, save/discard reset.
- **Data attribute contract** — Snapshot tests on annotated block components to ensure `data-field` attributes are present and correctly pathed.
- **Save flow** — Integration test: mock Payload REST API, verify PATCH payload shape matches expected layout structure.
- **contentEditable sync** — Test that blur events correctly update context state at the right field path.
