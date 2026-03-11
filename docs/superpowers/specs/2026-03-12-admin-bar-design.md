# Admin Bar + Draft Preview Infrastructure

## Overview

A floating frontend admin bar for logged-in Payload CMS users, plus the Draft Mode API routes that power its preview toggle. The bar provides quick access to edit the current page, browse collections, toggle between draft and published content, and reposition itself to any of six snap zones. It collapses to a single Lumon hexagon icon.

## Goals

- Give logged-in admins a fast path from frontend → admin panel editing
- Enable draft/published preview toggling directly from the frontend
- Stay completely invisible to unauthenticated visitors
- Maintain the Severance/Lumon aesthetic — glass-morphism, institutional restraint
- Zero impact on existing SSR caching strategy

## Non-Goals

- Inline editing on the frontend
- Auth provider or user context for other components (extract later if needed)
- Live Preview iframe integration in the Payload admin panel (separate effort)

---

## 1. Draft Mode API Routes

### Problem

The Pages collection already has `versions: { drafts: true }` and the catch-all `[[...slug]]/page.tsx` already checks `draftMode()` and fetches draft content via `getPageDirect(slug, true)`. But there are no API routes to enable/disable Next.js Draft Mode from the browser.

### Design

Two Next.js Route Handlers in `src/app/(frontend)/api/draft/`. Authentication uses Payload's cookie-based auth — if you have a valid `payload-token` cookie, you can toggle drafts. No shared secrets needed.

Note: Payload's REST API endpoints (`/api/users/me`, `/api/users/logout`, `/api/pages`) are mounted at the app root by Payload's middleware, not scoped to the `(payload)` route group.

**`toggle/route.ts`** (`src/app/(frontend)/api/draft/toggle/route.ts`)
- `GET /api/draft/toggle` — returns current draft mode state as `{ enabled: boolean }`. Requires auth (cookie). Used by the admin bar on mount to read draft state (the draft mode cookie is HttpOnly and unreadable from `document.cookie`).
- `POST /api/draft/toggle` — flips draft mode. Validates by calling `payload.auth({ headers: request.headers })`. If `result.user` is `null`, return 401. Returns `{ enabled: boolean }` JSON response.

**`disable/route.ts`** (`src/app/(frontend)/api/draft/disable/route.ts`)
- `GET /api/draft/disable`
- No auth required (disabling draft is always safe)
- Calls `(await draftMode()).disable()`
- Redirects to Referer or `/`
- This serves as the fallback exit for draft mode without the admin bar

---

## 2. Admin Bar Component

### Auth Detection

1. On mount, check if `payload-token` cookie exists (fast, synchronous via `document.cookie`)
2. If cookie exists, fetch `GET /api/users/me` with `credentials: 'include'`
3. On success → render bar. On 401/failure → stay hidden (expired token)
4. No loading state shown — the bar simply appears or doesn't

### Page Context

- Read `window.location.pathname` to derive the current slug. Map `/` to `home` to match the catch-all page's convention (`slugSegments?.join('/') || 'home'`). Strip leading slash for all other paths.
- Fetch `GET /api/pages?where[slug][equals]=<slug>&limit=1&select[id]=true&select[slug]=true` to get the page ID for the edit link
- The draft/published toggle reflects Next.js `draftMode` state (whether the user is viewing draft content), not the page's `_status` field. Optionally, the `_status` field could show a "has unpublished changes" indicator in the future, but that's out of scope.
- Cache page context in component state — refetch on `pathname` change
- If not on a Pages route (e.g. 404), the "Edit Page" action is disabled/hidden

### UI States

**Expanded (default on first visit):**
A floating pill with glass-morphism background (`bg-card/92 backdrop-blur-xl`), subtle border (`border border-border/10`), rounded-xl, shadow. Fixed position with `z-[9999]` to float above all page content including modals and the sticky navbar.

Contents left to right:
1. **Drag handle** — Lumon hexagon icon + grip dots. Initiates drag for repositioning.
2. **Edit Page** — pencil icon + "Edit Page" label. Links to `/admin/collections/pages/<id>`. Disabled if no page context.
3. **Collections** — grid icon + "Collections" label. Links to `/admin/collections`.
4. **Divider** — 1px vertical line, `bg-border/10`
5. **Draft/Published toggle** — segmented control. Active segment has subtle `bg-white/8`. Clicking toggles via `POST /api/draft/toggle`, then calls `window.location.reload()` (not `router.refresh()`) since `draftMode()` is evaluated server-side on each request. Reads initial state from `GET /api/draft/toggle` on mount (draft cookie is HttpOnly).
6. **Divider**
7. **User avatar** — circle with first initial, `bg-white/8`. Click opens a dropdown with user name/email and "Sign out" (calls `POST /api/users/logout`).
8. **Collapse button** — chevron icon. Animates bar to collapsed state.

**Collapsed:**
A single 36px rounded square with glass-morphism treatment, containing the Lumon hexagon icon. Click expands back to full bar with a spring animation.

**Dragging:**
Bar gains elevated shadow. Six snap zone outlines appear as dashed borders at: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right. The nearest zone highlights with a brighter border and subtle fill. On release, bar animates to the snap position.

### Snap Positions

Six positions, each defined as a CSS class with fixed positioning:

| Position | CSS |
|---|---|
| `top-left` | `top-4 left-4` |
| `top-center` | `top-4 left-1/2 -translate-x-1/2` |
| `top-right` | `top-4 right-4` |
| `bottom-left` | `bottom-4 left-4` |
| `bottom-center` | `bottom-4 left-1/2 -translate-x-1/2` |
| `bottom-right` | `bottom-4 right-4` |

Default: `bottom-center`.

### Persistence

A single `localStorage` key: `lumon-admin-bar`

```ts
interface AdminBarState {
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  collapsed: boolean
}
```

Default: `{ position: 'bottom-center', collapsed: false }`

Read on mount, written on every position or collapse change.

### Animation

Uses `motion/react` (already a project dependency).

- **Expand/collapse**: `layout` animation with spring `{ stiffness: 400, damping: 30 }`
- **Position snap**: `animate` to new position with `{ duration: 0.4, ease: EASE }` where `EASE = [0.16, 1, 0.3, 1] as const` (re-declare per-component, matching existing project pattern)
- **Initial mount**: fade in with `{ opacity: [0, 1], duration: 0.3 }`
- **Snap zones appear**: fade in `{ opacity: [0, 0.5], duration: 0.15 }` on drag start
- **Drag**: `dragControls` from motion/react, constrained to viewport

### Styling

- Glass background: `bg-card/92 backdrop-blur-xl border border-border/10`
- Shadow: `shadow-[0_8px_32px_rgba(0,0,0,0.5)]`
- Text: `text-xs text-muted-foreground` for labels, `text-foreground/70` for interactive elements
- Active toggle segment: `bg-white/8 text-foreground`
- Hover states: `hover:bg-white/5` on action buttons
- Icons: Hugeicons, 14px size
- All values from the project's existing design tokens

---

## 3. File Structure

```
src/
  app/(frontend)/
    api/draft/
      toggle/route.ts     — POST, cookie-auth, toggles draft mode
      disable/route.ts    — GET, no auth, disables + redirects
  components/features/admin-bar/
    admin-bar.tsx          — main client component (auth, render, drag)
    admin-bar-actions.tsx  — Edit, Collections, user menu actions
    admin-bar-toggle.tsx   — Draft/Published segmented control
    admin-bar-snap.tsx     — snap zone overlay during drag
    admin-bar-data.ts      — snap position configs, localStorage helpers, types
```

Layout integration — single addition to `src/app/(frontend)/layout.tsx`:
```tsx
import { AdminBar } from "@/components/features/admin-bar/admin-bar";

// Inside the Providers wrapper, after <Footer />:
<AdminBar />
```

---

## 4. Access Control

- The admin bar is a client component that self-gates on authentication
- No server-side rendering of admin-specific content — caching unaffected
- The draft toggle endpoint validates the Payload auth cookie server-side
- The disable endpoint has no auth (disabling drafts is always safe, and needed for the fallback exit)
- Draft mode state is per-browser via Next.js cookies — no user-to-user leakage

---

## 5. Edge Cases

- **No page context** (404, non-page routes): "Edit Page" button disabled, other actions still work
- **Expired token**: `/api/users/me` returns 401 → bar doesn't render. If token expires mid-session, next toggle attempt fails → bar hides itself.
- **Toggle/fetch errors**: On non-401 errors from the toggle or page-context endpoints (network error, 500, etc.), leave the UI in its current state. No retry. The bar is a convenience tool — silent failure is acceptable.
- **Multiple tabs**: Draft mode cookie is shared. Toggling in one tab affects all tabs on next navigation. This is expected Next.js behavior.
- **Mobile**: Bar renders at same position. Touch drag for repositioning. Collapse is especially useful on small screens.
- **Dark/light theme**: Uses semantic tokens (`bg-card`, `text-foreground`, `border-border`) — works in both themes automatically.
