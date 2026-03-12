# Live Page Status Indicator — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a status dot badge on the admin bar's hex icon that shows page publish state at a glance, with a hover card revealing timestamps and version count.

**Architecture:** Client-side fetch approach. Expand existing page context query to include `_status` and `updatedAt`. Two parallel version fetches detect unpublished changes and total version count. Pure React components for dot + hover card, styled with existing liquid glass treatment.

**Tech Stack:** React 19, motion/react, Tailwind CSS v4, Payload CMS 3.x REST API, bun:test

**Spec:** `docs/superpowers/specs/2026-03-12-live-page-status-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/components/features/admin-bar/admin-bar-data.ts` | Types (`PageStatus`), `computePageStatus()` helper, `formatRelativeTime()` helper |
| `src/components/features/admin-bar/admin-bar.tsx` | Expanded page fetch, versions fetch, pass `PageStatus` to hex icon area |
| `src/components/features/admin-bar/admin-bar-status-dot.tsx` | **New.** Status dot badge + hover card trigger (expanded-only interaction) |
| `src/components/features/admin-bar/admin-bar-status-card.tsx` | **New.** Hover card content — status badge, timestamps, version count |
| `src/components/features/admin-bar/admin-bar-data.test.ts` | **New.** Unit tests for `computePageStatus()` and `formatRelativeTime()` |

---

## Chunk 1: Data layer and status computation

### Task 1: Types and status computation helper

**Files:**
- Modify: `src/components/features/admin-bar/admin-bar-data.ts`
- Create: `src/components/features/admin-bar/admin-bar-data.test.ts`

- [ ] **Step 1: Write failing tests for `computePageStatus`**

Create `src/components/features/admin-bar/admin-bar-data.test.ts`:

```typescript
import { describe, expect, it } from "bun:test";
import { computePageStatus } from "./admin-bar-data";

describe("computePageStatus", () => {
  it("returns 'published' when page is published with no draft versions", () => {
    const result = computePageStatus({
      _status: "published",
      updatedAt: "2026-03-10T12:00:00Z",
      draftVersionCount: 0,
      latestDraftUpdatedAt: null,
      totalVersionCount: 5,
    });
    expect(result).toEqual({
      state: "published",
      color: "#22c55e",
      label: "Published",
      lastPublished: "2026-03-10T12:00:00Z",
      lastEdited: null,
      versionCount: 5,
    });
  });

  it("returns 'unpublished-changes' when published page has newer drafts", () => {
    const result = computePageStatus({
      _status: "published",
      updatedAt: "2026-03-10T12:00:00Z",
      draftVersionCount: 2,
      latestDraftUpdatedAt: "2026-03-11T08:00:00Z",
      totalVersionCount: 7,
    });
    expect(result).toEqual({
      state: "unpublished-changes",
      color: "#f59e0b",
      label: "Unpublished changes",
      lastPublished: "2026-03-10T12:00:00Z",
      lastEdited: "2026-03-11T08:00:00Z",
      versionCount: 7,
    });
  });

  it("returns 'draft' when page status is draft", () => {
    const result = computePageStatus({
      _status: "draft",
      updatedAt: "2026-03-09T15:00:00Z",
      draftVersionCount: 0,
      latestDraftUpdatedAt: null,
      totalVersionCount: 1,
    });
    expect(result).toEqual({
      state: "draft",
      color: "#9ca3af",
      label: "Draft",
      lastPublished: null,
      lastEdited: "2026-03-09T15:00:00Z",
      versionCount: 1,
    });
  });

  it("returns 'published' when draft versions exist but are older", () => {
    const result = computePageStatus({
      _status: "published",
      updatedAt: "2026-03-11T12:00:00Z",
      draftVersionCount: 1,
      latestDraftUpdatedAt: "2026-03-10T08:00:00Z",
      totalVersionCount: 4,
    });
    expect(result).toEqual({
      state: "published",
      color: "#22c55e",
      label: "Published",
      lastPublished: "2026-03-11T12:00:00Z",
      lastEdited: null,
      versionCount: 4,
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/components/features/admin-bar/admin-bar-data.test.ts`
Expected: FAIL — `computePageStatus` is not exported from `admin-bar-data`

- [ ] **Step 3: Add types and implement `computePageStatus`**

Add to `src/components/features/admin-bar/admin-bar-data.ts`:

```typescript
export type PageStatusState = "published" | "unpublished-changes" | "draft";

export interface PageStatus {
  state: PageStatusState;
  color: string;
  label: string;
  lastPublished: string | null;
  lastEdited: string | null;
  versionCount: number;
}

export interface PageStatusInput {
  _status: "published" | "draft";
  updatedAt: string;
  draftVersionCount: number;
  latestDraftUpdatedAt: string | null;
  totalVersionCount: number;
}

const STATUS_COLORS: Record<PageStatusState, string> = {
  published: "#22c55e",
  "unpublished-changes": "#f59e0b",
  draft: "#9ca3af",
};

const STATUS_LABELS: Record<PageStatusState, string> = {
  published: "Published",
  "unpublished-changes": "Unpublished changes",
  draft: "Draft",
};

export function computePageStatus(input: PageStatusInput): PageStatus {
  if (input._status === "draft") {
    return {
      state: "draft",
      color: STATUS_COLORS.draft,
      label: STATUS_LABELS.draft,
      lastPublished: null,
      lastEdited: input.updatedAt,
      versionCount: input.totalVersionCount,
    };
  }

  const hasNewerDrafts =
    input.draftVersionCount > 0 &&
    input.latestDraftUpdatedAt !== null &&
    new Date(input.latestDraftUpdatedAt) > new Date(input.updatedAt);

  if (hasNewerDrafts) {
    return {
      state: "unpublished-changes",
      color: STATUS_COLORS["unpublished-changes"],
      label: STATUS_LABELS["unpublished-changes"],
      lastPublished: input.updatedAt,
      lastEdited: input.latestDraftUpdatedAt,
      versionCount: input.totalVersionCount,
    };
  }

  return {
    state: "published",
    color: STATUS_COLORS.published,
    label: STATUS_LABELS.published,
    lastPublished: input.updatedAt,
    lastEdited: null,
    versionCount: input.totalVersionCount,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/components/features/admin-bar/admin-bar-data.test.ts`
Expected: PASS (all 4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/features/admin-bar/admin-bar-data.ts src/components/features/admin-bar/admin-bar-data.test.ts
git commit -m "feat(admin-bar): add PageStatus types and computePageStatus helper"
```

---

### Task 2: Relative time formatter

**Files:**
- Modify: `src/components/features/admin-bar/admin-bar-data.ts`
- Modify: `src/components/features/admin-bar/__tests__/admin-bar-status.test.ts`

- [ ] **Step 1: Write failing tests for `formatRelativeTime`**

Append to `admin-bar-data.test.ts`:

```typescript
import { computePageStatus, formatRelativeTime } from "./admin-bar-data";

describe("formatRelativeTime", () => {
  it("returns 'just now' for times less than 60 seconds ago", () => {
    const now = new Date("2026-03-12T12:00:00Z");
    expect(formatRelativeTime("2026-03-12T11:59:30Z", now)).toBe("just now");
  });

  it("returns minutes for times less than 60 minutes ago", () => {
    const now = new Date("2026-03-12T12:00:00Z");
    expect(formatRelativeTime("2026-03-12T11:45:00Z", now)).toBe("15 min ago");
  });

  it("returns hours for times less than 24 hours ago", () => {
    const now = new Date("2026-03-12T12:00:00Z");
    expect(formatRelativeTime("2026-03-12T09:00:00Z", now)).toBe("3 hours ago");
  });

  it("returns '1 hour ago' (singular)", () => {
    const now = new Date("2026-03-12T12:00:00Z");
    expect(formatRelativeTime("2026-03-12T10:30:00Z", now)).toBe("1 hour ago");
  });

  it("returns days for times less than 30 days ago", () => {
    const now = new Date("2026-03-12T12:00:00Z");
    expect(formatRelativeTime("2026-03-09T12:00:00Z", now)).toBe("3 days ago");
  });

  it("returns '1 day ago' (singular)", () => {
    const now = new Date("2026-03-12T12:00:00Z");
    expect(formatRelativeTime("2026-03-11T12:00:00Z", now)).toBe("1 day ago");
  });

  it("returns months for times more than 30 days ago", () => {
    const now = new Date("2026-03-12T12:00:00Z");
    expect(formatRelativeTime("2026-01-05T12:00:00Z", now)).toBe("2 months ago");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/components/features/admin-bar/admin-bar-data.test.ts`
Expected: FAIL — `formatRelativeTime` is not exported

- [ ] **Step 3: Implement `formatRelativeTime`**

Add to `src/components/features/admin-bar/admin-bar-data.ts`:

```typescript
export function formatRelativeTime(
  dateString: string,
  now: Date = new Date()
): string {
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24)
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  if (diffDays < 30)
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/components/features/admin-bar/admin-bar-data.test.ts`
Expected: PASS (all 11 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/features/admin-bar/admin-bar-data.ts src/components/features/admin-bar/admin-bar-data.test.ts
git commit -m "feat(admin-bar): add formatRelativeTime helper"
```

---

## Chunk 2: Data fetching in admin bar

### Task 3: Expand page fetch and add versions fetching

**Files:**
- Modify: `src/components/features/admin-bar/admin-bar-data.ts` (add `PageContext` fields)
- Modify: `src/components/features/admin-bar/admin-bar.tsx` (fetch logic + state)

- [ ] **Step 1: Extend `PageContext` interface**

In `admin-bar-data.ts`, update the `PageContext` interface:

```typescript
export interface PageContext {
  collection: string;
  id: number;
  label: string;
  slug: string;
  _status?: "published" | "draft";
  updatedAt?: string;
}
```

- [ ] **Step 2: Expand existing page fetch query**

In `admin-bar.tsx`, find the page context fetch (line ~186) and expand the select fields:

Change:
```typescript
`/api/${collection}?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&select[id]=true&select[slug]=true`
```

To:
```typescript
`/api/${collection}?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&select[id]=true&select[slug]=true&select[_status]=true&select[updatedAt]=true`
```

And update the result mapping:
```typescript
setPage(
  doc
    ? {
        id: doc.id,
        slug: doc.slug,
        collection,
        label,
        _status: doc._status,
        updatedAt: doc.updatedAt,
      }
    : null
);
```

- [ ] **Step 3: Add `PageStatus` state and versions fetch**

In `admin-bar.tsx`, add imports and state:

```typescript
import {
  // ...existing imports...
  type PageStatus,
  type PageStatusInput,
  computePageStatus,
} from "./admin-bar-data";
```

Add state:
```typescript
const [pageStatus, setPageStatus] = useState<PageStatus | null>(null);
```

Add a new `useEffect` after the page context effect:

```typescript
// Versions fetch — compute page status
useEffect(() => {
  if (!(user && page?.id && page._status && page.updatedAt)) {
    setPageStatus(null);
    return;
  }

  const controller = new AbortController();
  const opts = { credentials: "include" as const, signal: controller.signal };
  const base = `/api/${page.collection}/${page.id}/versions`;

  // Two parallel fetches: draft versions + total count
  Promise.all([
    fetch(
      `${base}?limit=1&sort=-updatedAt&where[version._status][equals]=draft`,
      opts
    ).then((r) => (r.ok ? r.json() : null)),
    fetch(`${base}?limit=1&sort=-updatedAt`, opts).then((r) =>
      r.ok ? r.json() : null
    ),
  ])
    .then(([draftData, allData]) => {
      const input: PageStatusInput = {
        _status: page._status!,
        updatedAt: page.updatedAt!,
        draftVersionCount: draftData?.totalDocs ?? 0,
        latestDraftUpdatedAt: draftData?.docs?.[0]?.updatedAt ?? null,
        totalVersionCount: allData?.totalDocs ?? 0,
      };
      setPageStatus(computePageStatus(input));
    })
    .catch((err) => {
      if (err.name !== "AbortError") {
        // Fallback: use page _status alone
        setPageStatus(
          computePageStatus({
            _status: page._status!,
            updatedAt: page.updatedAt!,
            draftVersionCount: 0,
            latestDraftUpdatedAt: null,
            totalVersionCount: 0,
          })
        );
      }
    });

  return () => controller.abort();
}, [user, page?.id, page?._status, page?.updatedAt, page?.collection]);
```

- [ ] **Step 4: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/features/admin-bar/admin-bar-data.ts src/components/features/admin-bar/admin-bar.tsx
git commit -m "feat(admin-bar): fetch page status and version data"
```

---

## Chunk 3: Status dot component

### Task 4: Status dot badge on hex icon

**Files:**
- Create: `src/components/features/admin-bar/admin-bar-status-dot.tsx`
- Modify: `src/components/features/admin-bar/admin-bar.tsx` (render dot on hex)

- [ ] **Step 1: Create the status dot component**

Create `src/components/features/admin-bar/admin-bar-status-dot.tsx`:

```tsx
"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import type { PageStatus, SnapPosition } from "./admin-bar-data";
import { AdminBarStatusCard } from "./admin-bar-status-card";

interface AdminBarStatusDotProps {
  collapsed: boolean;
  position: SnapPosition;
  status: PageStatus;
}

export function AdminBarStatusDot({
  collapsed,
  position,
  status,
}: AdminBarStatusDotProps) {
  const [hovered, setHovered] = useState(false);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isTop = position.startsWith("top");

  const handleEnter = useCallback(() => {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
    setHovered(true);
  }, []);

  const handleLeave = useCallback(() => {
    leaveTimeout.current = setTimeout(() => setHovered(false), 100);
  }, []);

  return (
    <>
      {/* Dot badge */}
      <div
        className="absolute -top-[2px] -right-[2px]"
        onClick={collapsed ? undefined : handleEnter}
        onMouseEnter={collapsed ? undefined : handleEnter}
        onMouseLeave={collapsed ? undefined : handleLeave}
      >
        {/* Invisible hit area */}
        {!collapsed && (
          <div className="absolute -inset-[6px] rounded-full" />
        )}
        <motion.div
          animate={{ scale: 1, opacity: 1 }}
          className="h-[7px] w-[7px] rounded-full border-[1.5px] border-white/90 dark:border-black/50"
          initial={{ scale: 0, opacity: 0 }}
          style={{
            backgroundColor: status.color,
            boxShadow: `0 0 4px ${status.color}66`,
            transition: "background-color 0.3s",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        />
      </div>

      {/* Hover card — expanded state only */}
      {!collapsed && (
        <AnimatePresence>
          {hovered && (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="absolute left-0 z-[10]"
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              initial={{ opacity: 0, scale: 0.95 }}
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
              style={{
                [isTop ? "top" : "bottom"]: "100%",
                [isTop ? "marginTop" : "marginBottom"]: "8px",
                transformOrigin: isTop ? "top left" : "bottom left",
              }}
              transition={{ duration: 0.15 }}
            >
              <AdminBarStatusCard status={status} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
```

- [ ] **Step 2: Create the status card component**

Create `src/components/features/admin-bar/admin-bar-status-card.tsx`:

```tsx
"use client";

import type { PageStatus } from "./admin-bar-data";
import { formatRelativeTime } from "./admin-bar-data";

interface AdminBarStatusCardProps {
  status: PageStatus;
}

export function AdminBarStatusCard({ status }: AdminBarStatusCardProps) {
  return (
    <div className="relative min-w-[200px] rounded-[12px] p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_4px_16px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.12),0_8px_32px_rgba(0,0,0,0.08)]">
      {/* Liquid glass layers */}
      <div className="admin-glass-effect rounded-[inherit]" />
      <div className="admin-glass-tint rounded-[inherit]" />
      <div className="admin-glass-shine rounded-[inherit]" />

      <div className="relative z-[3] space-y-2 px-2.5 py-2">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: status.color,
              boxShadow: `0 0 6px ${status.color}66`,
            }}
          />
          <span className="font-medium text-black/90 text-xs dark:text-white">
            {status.label}
          </span>
        </div>

        <div className="h-px bg-black/[0.06] dark:bg-white/[0.06]" />

        {/* Timestamps */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-black/50 dark:text-white/40">
              Last published
            </span>
            <span className="text-[11px] text-black/70 dark:text-white/60">
              {status.lastPublished
                ? formatRelativeTime(status.lastPublished)
                : "Never published"}
            </span>
          </div>

          {status.lastEdited && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] text-black/50 dark:text-white/40">
                Last edited
              </span>
              <span className="text-[11px] text-black/70 dark:text-white/60">
                {formatRelativeTime(status.lastEdited)}
              </span>
            </div>
          )}
        </div>

        <div className="h-px bg-black/[0.06] dark:bg-white/[0.06]" />

        {/* Version count */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] text-black/50 dark:text-white/40">
            Versions
          </span>
          <span className="text-[11px] text-black/70 dark:text-white/60">
            {status.versionCount > 0 ? status.versionCount : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/features/admin-bar/admin-bar-status-dot.tsx src/components/features/admin-bar/admin-bar-status-card.tsx
git commit -m "feat(admin-bar): add status dot and hover card components"
```

---

### Task 5: Wire status dot into the hex icon area

**Files:**
- Modify: `src/components/features/admin-bar/admin-bar.tsx`

- [ ] **Step 1: Import and render the status dot**

Add import:
```typescript
import { AdminBarStatusDot } from "./admin-bar-status-dot";
```

In the hex icon area (around line 426-440), the hex icon wrapper `<motion.div>` has `className="relative ..."`. The dot goes inside this wrapper, as a sibling of the inner rotation div. Find:

```tsx
<motion.div
  className={cn(
    "relative z-[3] flex items-center",
    !barState.collapsed &&
      "cursor-grab pr-2 pl-3.5 active:cursor-grabbing"
  )}
  layout
>
  <motion.div
    animate={{ rotate: barState.collapsed ? 30 : 0 }}
    transition={{ duration: 0.3, ease: EASE }}
  >
    <LumonHexIcon size={15} />
  </motion.div>
</motion.div>
```

Change the inner content to include the dot. Wrap the hex icon in a `relative` positioned div so the absolute dot positions relative to the icon:

```tsx
<motion.div
  className={cn(
    "relative z-[3] flex items-center",
    !barState.collapsed &&
      "cursor-grab pr-2 pl-3.5 active:cursor-grabbing"
  )}
  layout
>
  <div className="relative">
    <motion.div
      animate={{ rotate: barState.collapsed ? 30 : 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <LumonHexIcon size={15} />
    </motion.div>
    {pageStatus && (
      <AdminBarStatusDot
        collapsed={barState.collapsed}
        position={barState.position}
        status={pageStatus}
      />
    )}
  </div>
</motion.div>
```

- [ ] **Step 2: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 3: Run all tests**

Run: `bun test`
Expected: PASS

- [ ] **Step 4: Manual verification**

Open `http://localhost:3000` and verify:
1. Status dot appears on the hex icon (top-right badge)
2. Dot is green on published pages, gray on drafts
3. Hovering the dot (expanded bar) shows the glass card with status, timestamps, versions
4. Card positions below when bar is at top, above when at bottom
5. Card disappears when mouse leaves
6. Dot is visible in collapsed state but not interactive
7. Card does not appear when hovering the hex drag area (only the dot)

- [ ] **Step 5: Commit**

```bash
git add src/components/features/admin-bar/admin-bar.tsx
git commit -m "feat(admin-bar): wire status dot into hex icon area"
```

---

## Chunk 4: Final verification

### Task 6: Full lint and test pass

- [ ] **Step 1: Run all tests**

Run: `bun test`
Expected: PASS

- [ ] **Step 2: Run full lint check**

Run: `bun check`
Expected: PASS — all files clean
