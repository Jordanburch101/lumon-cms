# Live Page Status Indicator — Design Spec

## Goal

Add a glanceable status dot (badge on the Lumon hex icon) to the admin bar that communicates the current page's publish/draft state at a glance, with a hover card revealing full detail: status label, timestamps, editors, and version count.

## Architecture

Client-side fetch approach. Expand the existing page context query to include `_status` and `updatedAt`. Additional fetches to the Payload versions endpoint for version count, last-published timestamp, and to detect unpublished draft changes. All logic computed client-side. No new API routes.

## Status Model

The dot represents page health in CMS terms — not arbitrary time-based freshness, but the actual publish workflow state.

| State | Condition | Dot Color | Label |
|-------|-----------|-----------|-------|
| Published (clean) | `_status === 'published'` and no newer draft versions | Green `#22c55e` | "Published" |
| Unpublished changes | `_status === 'published'` but newer draft versions exist | Amber `#f59e0b` | "Unpublished changes" |
| Draft | `_status === 'draft'` (never published) | Gray `#9ca3af` | "Draft" |

Detection: Query `/api/pages/{id}/versions?limit=1&where[_status][equals]=draft&sort=-updatedAt` on a published page. If `totalDocs > 0` and the latest draft version's `updatedAt` is newer than the page's `updatedAt`, the page has unpublished changes.

## Status Dot

- **Position:** Absolute on the hex icon wrapper, top-right corner
- **Size:** 7px circle
- **Border:** 1.5px solid white (or dark equivalent) to visually separate from hex fill
- **Glow:** Subtle `box-shadow` matching dot color (e.g., `0 0 4px rgba(34,197,94,0.4)` for green)
- **Color transition:** Smooth CSS transition when status changes (e.g., after publishing)
- **Visibility:** Present in both expanded and collapsed states (hex is always visible)

### Interaction

- **Expanded state:** Hovering the dot reveals the status card. The dot has a generous invisible hit area (~20px) via a pseudo-element to make it easy to target without interfering with the hex drag handle.
- **Collapsed state:** The dot is visual-only. No hover interaction. The user must expand the bar to access the hover card.
- **Mobile:** Dot is visual-only. In expanded state, tap on the dot area shows the card.

## Hover Card

### Content (top to bottom)

1. **Status badge** — Colored dot (matching the hex dot) + status label text ("Published", "Unpublished changes", "Draft")
2. **Last published** — Relative timestamp (e.g., "3 days ago"). Shows "Never published" for draft-only pages.
3. **Last edited** — Relative timestamp (e.g., "2 hours ago"). Hidden when the page is in "Published (clean)" state, since the latest edit IS the publish — no redundant line.
4. **Versions** — Version count (e.g., "12 versions")

### Styling

- Same liquid glass treatment as the existing user menu dropdown (`.admin-glass-effect`, `.admin-glass-tint`, `.admin-glass-shine`)
- `min-width: 200px`, rounded-[12px], `p-1.5` outer padding
- Text: `text-xs` for labels, `text-[11px]` for secondary info
- Semantic color tokens for text (not hardcoded)

### Positioning

- Bar at top positions → card drops below the dot
- Bar at bottom positions → card pops above the dot
- Left-aligned to the hex icon area (hex is always the leftmost element). The bar's 16px inset from snap positions provides enough viewport clearance.
- Offset slightly to avoid overlapping the dot

### Animation

- Enter: `opacity: 0, scale: 0.95` → `opacity: 1, scale: 1` with `duration: 0.15`
- Exit: fade out `duration: 0.1`
- Transform origin aligned to the dot position

### Dismissal

- Mouse leaves the card and dot area → card disappears
- Small grace gap (~4px) between dot and card so the mouse can travel between them without dismissing

## Data Fetching

### Existing fetch (expanded)

Current query in `admin-bar.tsx` (line ~186):
```
/api/pages?where[slug][equals]={slug}&limit=1&select[id]=true&select[slug]=true
```

Expand to also select:
```
&select[_status]=true&select[updatedAt]=true
```

Note: `updatedAt` is an auto-field available without schema changes. `createdAt` is not needed.

### New fetches: versions

After the page fetch resolves (need the page ID), fire two queries in parallel:

**1. Draft versions (detects unpublished changes):**
```
/api/pages/{id}/versions?limit=1&sort=-updatedAt&where[version._status][equals]=draft
```
- `totalDocs` — number of draft versions
- `docs[0].updatedAt` — timestamp of most recent draft save

**2. All versions (total count + last published timestamp):**
```
/api/pages/{id}/versions?limit=1&sort=-updatedAt
```
- `totalDocs` — total version count for the "X versions" display
- Walk `docs` to find the latest entry where `version._status === 'published'` — its `updatedAt` is the last-published timestamp

Note: `limit=1` (not `limit=0`) to avoid fetching all version bodies. We only need `totalDocs` and the latest version's metadata.

### Editor name

Payload does not add an `updatedBy` field to documents or versions by default. Rather than adding a schema hook, the hover card omits editor attribution for now. The card shows timestamps only:
- "Last published: 3 days ago"
- "Last edited: 2 hours ago"

Editor attribution can be added in a future iteration by adding a `lastEditedBy` relationship field with a `beforeChange` hook on the Pages collection. This is noted in Out of Scope.

### Loading and error states

- The status dot is hidden until both the page fetch and versions fetch resolve
- On versions fetch failure, fall back to the page's `_status` field alone (Published or Draft, without the "Unpublished changes" distinction)
- Version count shows "—" on fetch failure

## File Changes

| File | Change |
|------|--------|
| `src/components/features/admin-bar/admin-bar-data.ts` | Add `PageStatus` type, freshness computation helper |
| `src/components/features/admin-bar/admin-bar.tsx` | Expand page fetch, add versions fetch, pass status to hex icon |
| `src/components/features/admin-bar/admin-bar-status-dot.tsx` | **New file.** Status dot component with hover card |
| `src/components/features/admin-bar/admin-bar-status-card.tsx` | **New file.** Hover card content component |

## Out of Scope

- Scheduled publish indicators
- Real-time updates (polling or WebSocket) — status updates on page load only
- Status for non-page collections (future phase)
- Showing full version history in the card (just count)
- Editor attribution (`updatedBy`) — requires a `beforeChange` hook on Pages; deferred to a future iteration
