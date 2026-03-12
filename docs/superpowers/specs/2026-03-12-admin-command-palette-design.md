# Admin Command Palette — Design Spec

## Goal

Add a command palette to the admin bar that lets authenticated users search across all Payload CMS collections and execute admin commands. Triggered via `Cmd+Shift+K` or a button in the admin bar.

## Approach

Extend the existing `cmdk` UI primitives with a new admin-only palette. Collection metadata is auto-detected from Payload's config at runtime, with optional overrides for customization. Search is live (debounced API calls per collection), not prefetched.

Separate from the public `Cmd+K` search — different context, different trigger, different data source.

---

## Architecture

### New Files

All in `src/components/features/admin-bar/`:

| File | Responsibility |
|------|---------------|
| `admin-command-palette.tsx` | Dialog component, context provider, `Cmd+Shift+K` listener |
| `admin-command-data.ts` | Types, static command definitions, collection metadata fetcher, overrides config |
| `admin-command-results.tsx` | Result row renderers (page, media, generic, command) |

### Modified Files

| File | Change |
|------|--------|
| `admin-bar-actions.tsx` | Add `onOpenPalette` to `AdminBarActionsProps`, render search icon button between Collections link and user avatar |
| `admin-bar.tsx` | Own `paletteOpen`/`setPaletteOpen` state, mount `AdminCommandPalette`, pass props |
| `admin-bar-data.ts` | Export `STATUS_COLORS` (currently module-private) so palette result renderers can import it |
| `search-command.tsx` | Add `!e.shiftKey` guard to `Cmd+K` listener to prevent conflict |

### New API Route

| File | Responsibility |
|------|---------------|
| `src/app/(frontend)/api/admin/collections/route.ts` | Returns collection metadata from Payload config (auth-gated) |

---

## Collection Auto-Detection

### Metadata Endpoint

`GET /api/admin/collections` — requires authenticated user.

Reads `payload.config` server-side and returns an array of collection metadata:

```ts
interface CollectionMeta {
  hasVersions: boolean;     // whether the collection has versions/drafts
  isUpload: boolean;        // whether the collection is an upload type
  label: string;            // human-readable label
  slug: string;             // collection slug
  titleField: string;       // field used as display title (see fallback logic below)
}
```

**Title field resolution:**
1. Use `admin.useAsTitle` if set (e.g., `"email"` for Users, `"title"` for Pages)
2. For upload collections without `useAsTitle`, fall back to `"filename"`
3. For other collections without `useAsTitle`, fall back to `"id"` — but mark the collection as non-searchable (only navigable via commands)

The `contains` operator only works on text fields. Collections whose `titleField` resolves to a non-text field (like `id`) are excluded from search queries but still appear in static commands ("Go to {Collection}").

**Internal Payload collections** (`payload-jobs`, `payload-migrations`, `payload-preferences`, `payload-locked-documents`, `payload-mcp-api-keys`, `payload-kv`) are filtered out server-side. Only user-defined collections are returned.

The palette fetches this once on first open and caches it in a module-level variable. The cache persists until a full page reload (not just SPA navigations). Subsequent opens reuse the cached metadata.

### Override Config

Optional `PALETTE_OVERRIDES` in `admin-command-data.ts`:

```ts
interface PaletteOverride {
  hidden?: boolean;          // exclude from search
  priority?: number;         // sort order (lower = first)
  showThumbnail?: boolean;   // render image preview for upload collections
  subtitleField?: string;    // override subtitle field
}

const PALETTE_OVERRIDES: Record<string, PaletteOverride> = {
  pages: { priority: 1 },
  media: { priority: 2, showThumbnail: true },
  users: { hidden: true },
};
```

Collections with a `priority` value are sorted ascending by priority (lower = first). Remaining collections without an explicit priority are sorted alphabetically by label after all prioritized collections.

---

## Search Behavior

### Debounced Live Search

1. User types in the input.
2. After 200ms of no keystrokes, fire parallel API requests — one per visible collection.
3. If the user types again before results return, abort in-flight requests and restart the debounce.
4. Results are rendered via `cmdk`'s `Command` component with `shouldFilter={false}` — all filtering is server-side. The `Command` is nested inside `CommandDialog` which provides the modal overlay and positioning.

### API Query Pattern

For each searchable collection:

```
GET /api/{slug}?where[{titleField}][contains]={query}&limit=5&select[id]=true&select[{titleField}]=true
```

Additional select fields based on collection type:
- Versioned collections: `&select[_status]=true`
- Upload collections: `&select[filename]=true&select[mimeType]=true&select[sizes.thumbnail.url]=true`
- Collections with a subtitle field override: `&select[{subtitleField}]=true`

All requests use `credentials: "include"` and `AbortController` for cleanup.

### Error Handling

If an individual collection's search request fails (network error, 403, 500, etc.), that collection's group is silently omitted from results — the other collections still render normally. No toast or error banner; the user simply sees fewer groups. If *all* collection requests fail, the "No results found." empty state is shown.

A 401 response from any collection request indicates the session has expired. In this case, all pending requests are aborted and the palette closes immediately. The admin bar's existing auth check will handle redirecting or hiding itself on next render.

### Empty Query (Palette Just Opened)

No API calls. Show only static commands immediately.

---

## Static Commands

Defined in `admin-command-data.ts`. Filtered client-side by matching query text against command labels (case-insensitive substring match).

| Command | Action | Context-aware |
|---------|--------|---------------|
| Create new page | Open `/admin/collections/pages/create` in new tab | No |
| Go to Collections | Open `/admin/collections` in new tab | No |
| Go to Dashboard | Open `/admin` in new tab | No |
| Toggle draft mode | Execute inline (same as admin bar toggle) | No |
| Edit current page | Open `/admin/collections/{collection}/{id}` in new tab | Yes — uses `PageContext` |
| View page versions | Open `/admin/collections/{collection}/{id}/versions` in new tab | Yes — uses `PageContext` |

Context-aware commands only appear when the corresponding data is available (e.g., "Edit current page" only shows when `PageContext` is set).

`AdminCommandPalette` receives `pageContext` (the current page's collection/id/slug) and `handleToggleDraft` as props from `admin-bar.tsx` — the same data already available in the admin bar. No new context providers are needed.

---

## UI Design

### Dialog

Reuses `CommandDialog` from `src/components/ui/command.tsx`. Positioned at top-third of viewport (existing styling). Liquid glass styling is NOT applied — the dialog uses the existing shadcn command styling for consistency with the public search.

### Result Groups

Displayed in priority order. Each group has an uppercase label header and a separator between groups.

**Versioned collection results** (any collection with `hasVersions: true`):
- Status dot using `STATUS_COLORS` from `admin-bar-data.ts` (green = published, amber = unpublished changes, gray = draft)
- Title field value
- Subtitle field as right-aligned secondary text

**Upload collection results** (any collection with `isUpload: true`):
- Thumbnail preview (24x24, rounded) from `sizes.thumbnail.url`, fallback icon for non-images or missing thumbnails
- Filename
- MIME type as secondary text

**Generic collection results:**
- Title field value
- Subtitle field value as secondary text

**Static commands:**
- Icon (from Hugeicons)
- Command label
- Badge: "action" or "navigate" as right-aligned tag

### Footer

Keyboard hints: `↑↓ navigate` · `↵ select` · `esc close`

### States

- **Empty query**: Static commands only
- **Loading**: "Searching..." centered in list area
- **Results**: Grouped by collection, commands appended at bottom
- **No results**: "No results found." centered in list area

---

## Triggers

### Keyboard Shortcut

`Cmd+Shift+K` (macOS) / `Ctrl+Shift+K` (Windows/Linux).

Listener is registered in `AdminCommandPalette` context provider, only active when user is authenticated. Does not conflict with the public `Cmd+K` search.

### Admin Bar Button

A search icon button in `admin-bar-actions.tsx`, positioned between the "Collections" link and the user avatar. Opens the palette on click.

### State Sharing

`admin-bar.tsx` owns the `paletteOpen` state and passes it down:
- `AdminCommandPalette` receives `open` and `onOpenChange` props (controlled dialog)
- `AdminBarActions` receives an `onOpenPalette` callback to trigger opening from the button
- The `Cmd+Shift+K` listener lives inside `AdminCommandPalette` and calls `onOpenChange(true)`

### Public Search Guard

The existing `Cmd+K` listener in `search-command.tsx` must be updated to add `&& !e.shiftKey` to its condition. Without this, `Cmd+Shift+K` would trigger both the public search and the admin palette simultaneously.

---

## Result Actions

All collection results open the Payload admin editor for that document in a new tab:

```
/admin/collections/{collection-slug}/{document-id}
```

Static commands either:
- Navigate to an admin URL in a new tab (create, collections, dashboard, edit, versions)
- Execute an inline action (toggle draft mode — uses the existing `handleToggleDraft` callback)

After any selection, the palette closes.

---

## Testing Strategy

### Unit Tests (`admin-command-data.test.ts`)

- Static command filtering by query
- Collection metadata merging with overrides (hidden, priority, defaults)
- Search URL construction for different collection types (versioned, upload, generic)

### Integration

- Verify palette opens/closes via `Cmd+Shift+K`
- Verify palette opens from admin bar button
- Verify debounced search fires after 200ms
- Verify abort on rapid typing
- Verify results render in correct group order

---

## Scope Exclusions

- No fuzzy matching — uses Payload's `contains` operator (substring match)
- No search result caching between queries — each keystroke after debounce fires fresh requests
- No analytics or search history
- No custom keybinding configuration
- Public search (`Cmd+K`) is untouched — separate system entirely
