# Admin Command Palette Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `Cmd+Shift+K` command palette to the admin bar that searches across all Payload CMS collections and provides admin commands.

**Architecture:** Extend the existing `cmdk` UI primitives with a new admin-only palette. A server-side API route auto-detects collection metadata from Payload config. The client fetches metadata once on first open, then fires debounced parallel search queries per collection. Static commands are filtered client-side.

**Tech Stack:** React 19, cmdk (via existing shadcn command.tsx), Payload CMS REST API, Hugeicons, AbortController

**Spec:** `docs/superpowers/specs/2026-03-12-admin-command-palette-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/app/(frontend)/api/admin/collections/route.ts` | Auth-gated GET endpoint returning collection metadata from Payload config |
| `src/components/features/admin-bar/admin-command-data.ts` | Types, static command definitions, `PALETTE_OVERRIDES`, `fetchCollectionMeta()`, `buildSearchUrl()`, `filterCommands()` |
| `src/components/features/admin-bar/admin-command-data.test.ts` | Unit tests for all pure functions in admin-command-data.ts |
| `src/components/features/admin-bar/admin-command-palette.tsx` | Dialog component with `Cmd+Shift+K` listener, debounced search orchestration, result rendering |
| `src/components/features/admin-bar/admin-command-results.tsx` | Result row renderers: versioned, upload, generic, command |

### Modified Files

| File | Change |
|------|--------|
| `src/components/features/admin-bar/admin-bar-data.ts` | Export `STATUS_COLORS` |
| `src/components/features/admin-bar/admin-bar-actions.tsx` | Add `onOpenPalette` prop, render search icon button |
| `src/components/features/admin-bar/admin-bar.tsx` | Own `paletteOpen` state, mount `AdminCommandPalette`, pass props |
| `src/components/layout/navbar/search-command.tsx` | Add `!e.shiftKey` guard to `Cmd+K` listener |

---

## Chunk 1: Data Layer & Tests

### Task 1: Export STATUS_COLORS from admin-bar-data.ts

**Files:**
- Modify: `src/components/features/admin-bar/admin-bar-data.ts`

- [ ] **Step 1: Export STATUS_COLORS**

In `src/components/features/admin-bar/admin-bar-data.ts`, change:

```ts
const STATUS_COLORS: Record<PageStatusState, string> = {
```

to:

```ts
export const STATUS_COLORS: Record<PageStatusState, string> = {
```

- [ ] **Step 2: Verify no breakage**

Run: `bun check`
Expected: PASS (no consumers change, just visibility)

- [ ] **Step 3: Commit**

```bash
git add src/components/features/admin-bar/admin-bar-data.ts
git commit -m "refactor: export STATUS_COLORS from admin-bar-data"
```

---

### Task 2: Add Cmd+K shift guard in search-command.tsx

**Files:**
- Modify: `src/components/layout/navbar/search-command.tsx`

- [ ] **Step 1: Add !e.shiftKey guard**

In `src/components/layout/navbar/search-command.tsx`, find the keyboard listener:

```ts
if ((e.metaKey || e.ctrlKey) && e.key === "k") {
```

Change to:

```ts
if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "k") {
```

This prevents the public search from opening when `Cmd+Shift+K` is pressed.

- [ ] **Step 2: Verify no breakage**

Run: `bun check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/navbar/search-command.tsx
git commit -m "fix: prevent Cmd+K from firing on Cmd+Shift+K"
```

---

### Task 3: Create admin-command-data.ts with types and pure functions

**Files:**
- Create: `src/components/features/admin-bar/admin-command-data.ts`
- Test: `src/components/features/admin-bar/admin-command-data.test.ts`

- [ ] **Step 1: Write failing tests for filterCommands**

Create `src/components/features/admin-bar/admin-command-data.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import {
  buildSearchUrl,
  filterCommands,
  getStaticCommands,
  mergeCollectionMeta,
  type CollectionMeta,
  type StaticCommand,
} from "./admin-command-data";

describe("filterCommands", () => {
  const commands: StaticCommand[] = [
    {
      id: "create-page",
      label: "Create new page",
      action: { type: "navigate", url: "/admin/collections/pages/create" },
      badge: "action",
    },
    {
      id: "go-dashboard",
      label: "Go to Dashboard",
      action: { type: "navigate", url: "/admin" },
      badge: "navigate",
    },
    {
      id: "toggle-draft",
      label: "Toggle draft mode",
      action: { type: "inline", command: "toggle-draft" },
      badge: "action",
    },
  ];

  test("returns all commands when query is empty", () => {
    expect(filterCommands(commands, "")).toEqual(commands);
  });

  test("filters by case-insensitive substring match", () => {
    const result = filterCommands(commands, "dash");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("go-dashboard");
  });

  test("matches partial words", () => {
    const result = filterCommands(commands, "draft");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("toggle-draft");
  });

  test("returns empty array when nothing matches", () => {
    expect(filterCommands(commands, "xyznonexistent")).toEqual([]);
  });

  test("matches multiple commands", () => {
    const result = filterCommands(commands, "to");
    // "Go to Dashboard" and "Toggle draft mode" both contain "to"
    expect(result).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/components/features/admin-bar/admin-command-data.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write failing tests for getStaticCommands**

Append to the test file (below the `filterCommands` describe block, NOT as a new import — all imports are already at the top):

```ts
describe("getStaticCommands", () => {
  test("returns non-context commands when no page context", () => {
    const commands = getStaticCommands(null);
    const ids = commands.map((c) => c.id);
    expect(ids).toContain("create-page");
    expect(ids).toContain("go-collections");
    expect(ids).toContain("go-dashboard");
    expect(ids).toContain("toggle-draft");
    expect(ids).not.toContain("edit-current");
    expect(ids).not.toContain("view-versions");
  });

  test("includes context-aware commands when page context is set", () => {
    const commands = getStaticCommands({
      id: 42,
      slug: "about",
      collection: "pages",
      label: "About",
      _status: "published",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
    });
    const ids = commands.map((c) => c.id);
    expect(ids).toContain("edit-current");
    expect(ids).toContain("view-versions");
  });

  test("edit-current command URL includes collection and id", () => {
    const commands = getStaticCommands({
      id: 42,
      slug: "about",
      collection: "pages",
      label: "About",
      _status: "published",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
    });
    const editCmd = commands.find((c) => c.id === "edit-current");
    expect(editCmd?.action).toEqual({
      type: "navigate",
      url: "/admin/collections/pages/42",
    });
  });

  test("view-versions command URL includes collection and id", () => {
    const commands = getStaticCommands({
      id: 42,
      slug: "about",
      collection: "pages",
      label: "About",
      _status: "published",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
    });
    const versionsCmd = commands.find((c) => c.id === "view-versions");
    expect(versionsCmd?.action).toEqual({
      type: "navigate",
      url: "/admin/collections/pages/42/versions",
    });
  });
});
```

- [ ] **Step 4: Write failing tests for buildSearchUrl**

Append to the test file (no new imports needed — `buildSearchUrl` and `CollectionMeta` are already imported at the top):

```ts
describe("buildSearchUrl", () => {
  const baseMeta: CollectionMeta = {
    slug: "pages",
    label: "Pages",
    titleField: "title",
    hasVersions: false,
    isUpload: false,
  };

  test("builds basic search URL with contains operator", () => {
    const url = buildSearchUrl(baseMeta, "hello");
    expect(url).toBe(
      "/api/pages?where[title][contains]=hello&limit=5&select[id]=true&select[title]=true",
    );
  });

  test("adds _status select for versioned collections", () => {
    const meta = { ...baseMeta, hasVersions: true };
    const url = buildSearchUrl(meta, "hello");
    expect(url).toContain("&select[_status]=true");
  });

  test("adds upload fields for upload collections", () => {
    const meta: CollectionMeta = {
      slug: "media",
      label: "Media",
      titleField: "filename",
      hasVersions: false,
      isUpload: true,
    };
    const url = buildSearchUrl(meta, "hero");
    expect(url).toContain("&select[filename]=true");
    expect(url).toContain("&select[mimeType]=true");
    expect(url).toContain("&select[sizes.thumbnail.url]=true");
  });

  test("adds subtitle field when override specifies one", () => {
    const url = buildSearchUrl(baseMeta, "hello", "slug");
    expect(url).toContain("&select[slug]=true");
  });

  test("encodes query parameter", () => {
    const url = buildSearchUrl(baseMeta, "hello world");
    expect(url).toContain("contains]=hello%20world");
  });
});
```

- [ ] **Step 5: Write failing tests for mergeCollectionMeta**

Append to the test file (no new imports needed — `mergeCollectionMeta` and `CollectionMeta` are already imported at the top):

```ts
describe("mergeCollectionMeta", () => {
  const rawMeta: CollectionMeta[] = [
    {
      slug: "pages",
      label: "Pages",
      titleField: "title",
      hasVersions: true,
      isUpload: false,
    },
    {
      slug: "media",
      label: "Media",
      titleField: "filename",
      hasVersions: false,
      isUpload: true,
    },
    {
      slug: "users",
      label: "Users",
      titleField: "email",
      hasVersions: false,
      isUpload: false,
    },
  ];

  test("filters out hidden collections", () => {
    const result = mergeCollectionMeta(rawMeta);
    const slugs = result.map((c) => c.slug);
    expect(slugs).not.toContain("users");
  });

  test("sorts by priority ascending, then alphabetically", () => {
    const extended: CollectionMeta[] = [
      ...rawMeta,
      {
        slug: "articles",
        label: "Articles",
        titleField: "title",
        hasVersions: true,
        isUpload: false,
      },
    ];
    const result = mergeCollectionMeta(extended);
    const slugs = result.map((c) => c.slug);
    // pages (priority 1) → media (priority 2) → articles (alphabetical)
    expect(slugs).toEqual(["pages", "media", "articles"]);
  });

  test("applies showThumbnail override", () => {
    const result = mergeCollectionMeta(rawMeta);
    const media = result.find((c) => c.slug === "media");
    expect(media?.showThumbnail).toBe(true);
  });

  test("collections without priority sort alphabetically after prioritized ones", () => {
    const custom: CollectionMeta[] = [
      {
        slug: "zebras",
        label: "Zebras",
        titleField: "name",
        hasVersions: false,
        isUpload: false,
      },
      {
        slug: "alpacas",
        label: "Alpacas",
        titleField: "name",
        hasVersions: false,
        isUpload: false,
      },
      {
        slug: "pages",
        label: "Pages",
        titleField: "title",
        hasVersions: true,
        isUpload: false,
      },
    ];
    const result = mergeCollectionMeta(custom);
    const slugs = result.map((c) => c.slug);
    // pages (priority 1) → alpacas → zebras
    expect(slugs).toEqual(["pages", "alpacas", "zebras"]);
  });
});
```

- [ ] **Step 6: Implement admin-command-data.ts**

Create `src/components/features/admin-bar/admin-command-data.ts`:

```ts
import type { PageContext } from "./admin-bar-data";

// --- Types ---

export interface CollectionMeta {
  hasVersions: boolean;
  isUpload: boolean;
  label: string;
  slug: string;
  titleField: string;
}

export interface MergedCollectionMeta extends CollectionMeta {
  priority?: number;
  showThumbnail?: boolean;
  subtitleField?: string;
}

export interface StaticCommand {
  id: string;
  label: string;
  action:
    | { type: "navigate"; url: string }
    | { type: "inline"; command: string };
  badge: "action" | "navigate";
}

interface PaletteOverride {
  hidden?: boolean;
  priority?: number;
  showThumbnail?: boolean;
  subtitleField?: string;
}

// --- Overrides Config ---

export const PALETTE_OVERRIDES: Record<string, PaletteOverride> = {
  pages: { priority: 1, subtitleField: "slug" },
  media: { priority: 2, showThumbnail: true },
  users: { hidden: true },
};

// --- Static Commands ---

const BASE_COMMANDS: StaticCommand[] = [
  {
    id: "create-page",
    label: "Create new page",
    action: { type: "navigate", url: "/admin/collections/pages/create" },
    badge: "action",
  },
  {
    id: "go-collections",
    label: "Go to Collections",
    action: { type: "navigate", url: "/admin/collections" },
    badge: "navigate",
  },
  {
    id: "go-dashboard",
    label: "Go to Dashboard",
    action: { type: "navigate", url: "/admin" },
    badge: "navigate",
  },
  {
    id: "toggle-draft",
    label: "Toggle draft mode",
    action: { type: "inline", command: "toggle-draft" },
    badge: "action",
  },
];

export function getStaticCommands(
  pageContext: PageContext | null,
): StaticCommand[] {
  const commands = [...BASE_COMMANDS];

  if (pageContext) {
    commands.push({
      id: "edit-current",
      label: "Edit current page",
      action: {
        type: "navigate",
        url: `/admin/collections/${pageContext.collection}/${pageContext.id}`,
      },
      badge: "navigate",
    });
    commands.push({
      id: "view-versions",
      label: "View page versions",
      action: {
        type: "navigate",
        url: `/admin/collections/${pageContext.collection}/${pageContext.id}/versions`,
      },
      badge: "navigate",
    });
  }

  return commands;
}

export function filterCommands(
  commands: StaticCommand[],
  query: string,
): StaticCommand[] {
  if (!query) {
    return commands;
  }
  const lower = query.toLowerCase();
  return commands.filter((cmd) => cmd.label.toLowerCase().includes(lower));
}

// --- Search URL Builder ---

export function buildSearchUrl(
  meta: CollectionMeta,
  query: string,
  subtitleField?: string,
): string {
  const encoded = encodeURIComponent(query);
  let url = `/api/${meta.slug}?where[${meta.titleField}][contains]=${encoded}&limit=5&select[id]=true&select[${meta.titleField}]=true`;

  if (meta.hasVersions) {
    url += "&select[_status]=true";
  }

  if (meta.isUpload) {
    url += "&select[filename]=true&select[mimeType]=true&select[sizes.thumbnail.url]=true";
  }

  if (subtitleField) {
    url += `&select[${subtitleField}]=true`;
  }

  return url;
}

// --- Collection Metadata ---

export function mergeCollectionMeta(
  raw: CollectionMeta[],
): MergedCollectionMeta[] {
  return raw
    .map((meta) => {
      const override = PALETTE_OVERRIDES[meta.slug];
      if (override?.hidden) {
        return null;
      }
      return {
        ...meta,
        priority: override?.priority,
        showThumbnail: override?.showThumbnail,
        subtitleField: override?.subtitleField,
      } satisfies MergedCollectionMeta;
    })
    .filter((m): m is MergedCollectionMeta => m !== null)
    .sort((a, b) => {
      const ap = a.priority ?? Number.POSITIVE_INFINITY;
      const bp = b.priority ?? Number.POSITIVE_INFINITY;
      if (ap !== bp) return ap - bp;
      return a.label.localeCompare(b.label);
    });
}

// --- Metadata Fetcher (cached) ---

let cachedMeta: MergedCollectionMeta[] | null = null;

export async function fetchCollectionMeta(
  signal?: AbortSignal,
): Promise<MergedCollectionMeta[]> {
  if (cachedMeta) return cachedMeta;

  const res = await fetch("/api/admin/collections", {
    credentials: "include",
    signal,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch collection metadata: ${res.status}`);
  }

  const raw: CollectionMeta[] = await res.json();
  cachedMeta = mergeCollectionMeta(raw);
  return cachedMeta;
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `bun test src/components/features/admin-bar/admin-command-data.test.ts`
Expected: All 18 tests PASS

- [ ] **Step 8: Run lint check**

Run: `bun check`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/components/features/admin-bar/admin-command-data.ts src/components/features/admin-bar/admin-command-data.test.ts
git commit -m "feat: add admin command palette data layer with tests"
```

---

### Task 4: Create the collections metadata API route

**Files:**
- Create: `src/app/(frontend)/api/admin/collections/route.ts`

- [ ] **Step 1: Create the API route**

Create `src/app/(frontend)/api/admin/collections/route.ts`:

```ts
import { getPayload } from "payload";
import config from "@payload-config";
import { headers as getHeaders } from "next/headers";

const INTERNAL_SLUGS = new Set([
  "payload-jobs",
  "payload-migrations",
  "payload-preferences",
  "payload-locked-documents",
  "payload-mcp-api-keys",
  "payload-kv",
]);

export async function GET() {
  const payload = await getPayload({ config });
  const headersList = await getHeaders();

  // Auth check — parse user from payload-token cookie
  const user = await payload
    .auth({ headers: headersList })
    .then((result) => result.user)
    .catch(() => null);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const collections = payload.config.collections
    .filter((col) => !INTERNAL_SLUGS.has(col.slug))
    .map((col) => {
      const isUpload = Boolean(col.upload);
      const useAsTitle =
        typeof col.admin?.useAsTitle === "string"
          ? col.admin.useAsTitle
          : undefined;

      let titleField: string;
      if (useAsTitle) {
        titleField = useAsTitle;
      } else if (isUpload) {
        titleField = "filename";
      } else {
        titleField = "id";
      }

      return {
        hasVersions: Boolean(col.versions),
        isUpload,
        label:
          typeof col.labels?.plural === "string"
            ? col.labels.plural
            : col.slug,
        slug: col.slug,
        titleField,
      };
    });

  return Response.json(collections);
}
```

- [ ] **Step 2: Verify lint passes**

Run: `bun check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/api/admin/collections/route.ts
git commit -m "feat: add auth-gated collections metadata endpoint"
```

---

## Chunk 2: UI Components

### Task 5: Create admin-command-results.tsx

**Files:**
- Create: `src/components/features/admin-bar/admin-command-results.tsx`

- [ ] **Step 1: Create the result renderers**

Create `src/components/features/admin-bar/admin-command-results.tsx`:

```tsx
"use client";

import { CommandGroup, CommandItem, CommandSeparator } from "@/components/ui/command";
import {
  Add01Icon,
  ArrowUpRight01Icon,
  DashboardSquare01Icon,
  Edit02Icon,
  GridIcon,
  PencilEdit02Icon,
  TimeSetting01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { STATUS_COLORS } from "./admin-bar-data";
import type { MergedCollectionMeta, StaticCommand } from "./admin-command-data";

// --- Types ---

interface CollectionResultDoc {
  id: string | number;
  [key: string]: unknown;
}

interface CollectionResultGroupProps {
  docs: CollectionResultDoc[];
  isFirst: boolean;
  meta: MergedCollectionMeta;
  onSelect: (collectionSlug: string, docId: string | number) => void;
}

interface CommandResultGroupProps {
  commands: StaticCommand[];
  isFirst: boolean;
  onSelect: (command: StaticCommand) => void;
}

// --- Helpers ---

function getStatusColor(status: unknown): string {
  if (status === "published") return STATUS_COLORS.published;
  if (status === "draft") return STATUS_COLORS.draft;
  return STATUS_COLORS["unpublished-changes"];
}

function getThumbnailUrl(doc: CollectionResultDoc): string | null {
  if (
    typeof doc.sizes !== "object" ||
    doc.sizes === null ||
    !("thumbnail" in doc.sizes)
  ) {
    return null;
  }
  const thumb = (doc.sizes as Record<string, Record<string, unknown>>)
    .thumbnail;
  return typeof thumb?.url === "string" ? thumb.url : null;
}

const COMMAND_ICONS: Record<string, typeof Add01Icon> = {
  "create-page": Add01Icon,
  "edit-current": PencilEdit02Icon,
  "go-collections": GridIcon,
  "go-dashboard": DashboardSquare01Icon,
  "toggle-draft": Edit02Icon,
  "view-versions": TimeSetting01Icon,
};

// --- Collection Result Group ---

export function CollectionResultGroup({
  docs,
  isFirst,
  meta,
  onSelect,
}: CollectionResultGroupProps) {
  if (docs.length === 0) {
    return null;
  }

  return (
    <>
      {!isFirst && <CommandSeparator />}
      <CommandGroup heading={meta.label}>
        {docs.map((doc) => (
          <CommandItem
            key={`${meta.slug}-${doc.id}`}
            onSelect={() => onSelect(meta.slug, doc.id)}
            value={`${meta.slug}-${doc.id}`}
          >
            <div className="flex w-full items-center gap-2">
              {/* Status dot for versioned collections */}
              {meta.hasVersions && (
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: getStatusColor(doc._status) }}
                />
              )}

              {/* Thumbnail for upload collections */}
              {meta.showThumbnail && meta.isUpload && (() => {
                const thumbUrl = getThumbnailUrl(doc);
                return (
                  <div className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                    {thumbUrl ? (
                      <img alt="" className="size-full object-cover" height={24} src={thumbUrl} width={24} />
                    ) : (
                      <span className="text-[8px] text-muted-foreground">FILE</span>
                    )}
                  </div>
                );
              })()}

              {/* Title */}
              <span className="truncate">
                {String(doc[meta.titleField] ?? doc.id)}
              </span>

              {/* Subtitle (right-aligned) */}
              {meta.subtitleField && doc[meta.subtitleField] != null && (
                <span className="ml-auto truncate text-xs text-muted-foreground">
                  {String(doc[meta.subtitleField])}
                </span>
              )}

              {/* MIME type for uploads without subtitle override */}
              {!meta.subtitleField && meta.isUpload && doc.mimeType && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {String(doc.mimeType)}
                </span>
              )}
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  );
}

// --- Command Result Group ---

export function CommandResultGroup({
  commands,
  isFirst,
  onSelect,
}: CommandResultGroupProps) {
  if (commands.length === 0) {
    return null;
  }

  return (
    <>
      {!isFirst && <CommandSeparator />}
      <CommandGroup heading="Commands">
        {commands.map((cmd) => {
          const icon = COMMAND_ICONS[cmd.id] ?? ArrowUpRight01Icon;
          return (
            <CommandItem
              key={cmd.id}
              onSelect={() => onSelect(cmd)}
              value={cmd.id}
            >
              <div className="flex w-full items-center gap-2">
                <HugeiconsIcon className="text-muted-foreground" icon={icon} size={14} />
                <span>{cmd.label}</span>
                <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {cmd.badge}
                </span>
              </div>
            </CommandItem>
          );
        })}
      </CommandGroup>
    </>
  );
}
```

- [ ] **Step 2: Verify lint passes**

Run: `bun check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/features/admin-bar/admin-command-results.tsx
git commit -m "feat: add command palette result renderers"
```

---

### Task 6: Create admin-command-palette.tsx

**Files:**
- Create: `src/components/features/admin-bar/admin-command-palette.tsx`

- [ ] **Step 1: Create the palette component**

Create `src/components/features/admin-bar/admin-command-palette.tsx`:

```tsx
"use client";

import {
  CommandDialog,
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PageContext } from "./admin-bar-data";
import {
  buildSearchUrl,
  fetchCollectionMeta,
  filterCommands,
  getStaticCommands,
  type MergedCollectionMeta,
  type StaticCommand,
} from "./admin-command-data";
import {
  CollectionResultGroup,
  CommandResultGroup,
} from "./admin-command-results";

// --- Types ---

interface AdminCommandPaletteProps {
  handleToggleDraft: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pageContext: PageContext | null;
}

interface SearchResults {
  docs: Array<{ id: string | number; [key: string]: unknown }>;
  meta: MergedCollectionMeta;
}

// --- Component ---

export function AdminCommandPalette({
  handleToggleDraft,
  onOpenChange,
  open,
  pageContext,
}: AdminCommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults[]>([]);
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<MergedCollectionMeta[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keyboard shortcut: Cmd+Shift+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange]);

  // Fetch collection metadata on first open
  useEffect(() => {
    if (!open) return;
    if (collections.length > 0) return;

    const controller = new AbortController();
    fetchCollectionMeta(controller.signal)
      .then(setCollections)
      .catch(() => {
        // Silently fail — palette will show commands only
      });
    return () => controller.abort();
  }, [open, collections.length]);

  // Reset state and cancel pending work when palette closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setLoading(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    }
  }, [open]);

  // Debounced search
  const search = useCallback(
    (q: string) => {
      // Cancel previous
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();

      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      debounceRef.current = setTimeout(() => {
        const controller = new AbortController();
        abortRef.current = controller;

        const searchable = collections.filter(
          (c) => c.titleField !== "id",
        );

        const fetches = searchable.map(async (meta) => {
          try {
            const url = buildSearchUrl(meta, q, meta.subtitleField);
            const res = await fetch(url, {
              credentials: "include",
              signal: controller.signal,
            });

            if (res.status === 401) {
              // Session expired — close palette
              controller.abort();
              onOpenChange(false);
              return null;
            }

            if (!res.ok) {
              return null;
            }

            const data = await res.json();
            return { meta, docs: data.docs ?? [] } satisfies SearchResults;
          } catch {
            return null;
          }
        });

        Promise.all(fetches).then((fetched) => {
          if (controller.signal.aborted) return;
          setResults(
            fetched.filter((r): r is SearchResults => r !== null && r.docs.length > 0),
          );
          setLoading(false);
        });
      }, 200);
    },
    [collections, onOpenChange],
  );

  function handleQueryChange(value: string) {
    setQuery(value);
    search(value);
  }

  // --- Actions ---

  function handleCollectionSelect(slug: string, docId: string | number) {
    window.open(`/admin/collections/${slug}/${docId}`, "_blank");
    onOpenChange(false);
  }

  function handleCommandSelect(cmd: StaticCommand) {
    if (cmd.action.type === "navigate") {
      window.open(cmd.action.url, "_blank");
    } else if (cmd.action.command === "toggle-draft") {
      handleToggleDraft();
    }
    onOpenChange(false);
  }

  // --- Render ---

  const staticCommands = getStaticCommands(pageContext);
  const filteredCommands = filterCommands(staticCommands, query);
  const hasResults = results.length > 0 || filteredCommands.length > 0;
  const showLoading = loading && query.trim().length > 0;

  return (
    <CommandDialog
      description="Search across collections or type a command"
      onOpenChange={onOpenChange}
      open={open}
      title="Admin Command Palette"
    >
      <Command shouldFilter={false}>
        <CommandInput
          onValueChange={handleQueryChange}
          placeholder="Search pages, media, or type a command..."
          value={query}
        />
        <CommandList>
          {showLoading && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}

          {!showLoading && !hasResults && query.trim() && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {!showLoading && (
            <>
              {results.map((group, i) => (
                <CollectionResultGroup
                  docs={group.docs}
                  isFirst={i === 0}
                  key={group.meta.slug}
                  meta={group.meta}
                  onSelect={handleCollectionSelect}
                />
              ))}

              <CommandResultGroup
                commands={filteredCommands}
                isFirst={results.length === 0}
                onSelect={handleCommandSelect}
              />
            </>
          )}
        </CommandList>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t px-3 py-2 text-[10px] text-muted-foreground">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </Command>
    </CommandDialog>
  );
}
```

- [ ] **Step 2: Verify lint passes**

Run: `bun check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/features/admin-bar/admin-command-palette.tsx
git commit -m "feat: add admin command palette dialog component"
```

---

## Chunk 3: Integration & Wiring

### Task 7: Wire palette into admin bar

**Files:**
- Modify: `src/components/features/admin-bar/admin-bar-actions.tsx`
- Modify: `src/components/features/admin-bar/admin-bar.tsx`

- [ ] **Step 1: Add onOpenPalette prop and search button to admin-bar-actions.tsx**

In `src/components/features/admin-bar/admin-bar-actions.tsx`:

Add `Search01Icon` to the existing `@hugeicons/core-free-icons` import (do NOT add a new import line — merge it into the existing destructure):

```ts
import {
  // ... existing icons ...
  Search01Icon,
} from "@hugeicons/core-free-icons";
```

Update the props interface — add `onOpenPalette`:

```ts
interface AdminBarActionsProps {
  onOpenPalette: () => void;
  page: PageContext | null;
  position: SnapPosition;
  user: AdminUser;
}
```

Update the function signature to destructure `onOpenPalette`:

```ts
export function AdminBarActions({
  onOpenPalette,
  page,
  position,
  user,
}: AdminBarActionsProps) {
```

Add the search button between the Collections link and the user menu button. Find the existing Collections link (`/admin/collections`) and add this immediately after it:

```tsx
{/* Palette trigger */}
<button
  className="rounded-sm p-1 text-black/60 transition-colors hover:text-black/80 dark:text-white/70 dark:hover:text-white"
  onClick={onOpenPalette}
  title="Search (⌘⇧K)"
  type="button"
>
  <HugeiconsIcon icon={Search01Icon} size={14} />
</button>
```

- [ ] **Step 2: Mount palette and manage state in admin-bar.tsx**

In `src/components/features/admin-bar/admin-bar.tsx`:

Add import at the top of the file:

```ts
import { AdminCommandPalette } from "./admin-command-palette";
```

Add state near the other `useState` calls (around the `user`, `page`, etc. state declarations):

```ts
const [paletteOpen, setPaletteOpen] = useState(false);
```

Pass `onOpenPalette` to `AdminBarActions` — find the existing `<AdminBarActions` JSX and add the prop:

```tsx
<AdminBarActions
  onOpenPalette={() => setPaletteOpen(true)}
  page={page}
  position={barState.position}
  user={user}
/>
```

Mount the palette as the last child of the root `<>` fragment, after the closing `</motion.div>` and before the closing `</>`. It must be a sibling of the admin bar motion.div, not nested inside it (the dialog renders as a portal anyway):

```tsx
<AdminCommandPalette
  handleToggleDraft={handleToggleDraft}
  onOpenChange={setPaletteOpen}
  open={paletteOpen}
  pageContext={page}
/>
```

- [ ] **Step 3: Verify lint passes**

Run: `bun check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/features/admin-bar/admin-bar-actions.tsx src/components/features/admin-bar/admin-bar.tsx
git commit -m "feat: wire admin command palette into admin bar"
```

---

### Task 8: Manual verification

- [ ] **Step 1: Start dev server**

Run: `bun dev`

- [ ] **Step 2: Verify keyboard shortcut**

1. Navigate to `http://localhost:3000` (any page)
2. Press `Cmd+Shift+K` — admin command palette should open
3. Press `Cmd+K` — public search should open (not admin palette)
4. Confirm both work independently

- [ ] **Step 3: Verify admin bar button**

1. Click the search icon in the admin bar (between Collections and user avatar)
2. Palette should open

- [ ] **Step 4: Verify static commands**

1. Open palette with empty query
2. Should see: Create new page, Go to Collections, Go to Dashboard, Toggle draft mode
3. If on a page with context: should also see Edit current page, View page versions
4. Type "draft" — should filter to "Toggle draft mode" only

- [ ] **Step 5: Verify live search**

1. Type "home" in the palette
2. After ~200ms, should see grouped results (Pages, Media, etc.)
3. Type rapidly — previous results should be replaced, no stale data
4. Select a result — should open in new tab at `/admin/collections/{slug}/{id}`

- [ ] **Step 6: Verify error states**

1. Type a query with no matches (e.g., "xyznonexistent") — should show "No results found."
2. While searching, should briefly show "Searching..."

- [ ] **Step 7: Run full test suite**

Run: `bun test`
Expected: All tests pass (existing + new admin-command-data tests)

- [ ] **Step 8: Final lint check**

Run: `bun check`
Expected: PASS
