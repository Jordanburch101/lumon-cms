# Change Tooltip + Zustand Migration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate edit mode state from React context to zustand, add per-field dirty tracking with original value snapshots, and build a change popover in the admin bar with individual revert buttons.

**Architecture:** Replace `edit-mode-context.tsx` (createContext + useState + useRef) with a zustand store in `edit-mode-store.ts`. Bridge the existing `useEditMode()` / `useEditModeRequired()` hooks to read from zustand so all 11 consumer files continue working without changes. Then add the DirtyEntry map, revertField action, and admin bar popover UI.

**Tech Stack:** zustand, existing shadcn Popover component, structuredClone for snapshots

**Spec:** `docs/superpowers/specs/2026-03-14-change-tooltip-design.md`

---

## File Structure

### New Files
- `src/components/features/frontend-editor/edit-mode-store.ts` — zustand store (replaces context)
- `src/components/features/frontend-editor/deep-equal.ts` — simple deep equality utility
- `src/components/features/frontend-editor/deep-equal.test.ts` — tests for deep-equal

### Modified Files
- `src/components/features/frontend-editor/use-edit-mode.ts` — bridge hooks to read from zustand
- `src/components/features/frontend-editor/edit-runtime.tsx` — remove blocksRef hack
- `src/components/features/admin-bar/admin-bar-actions.tsx` — add change popover UI
- `src/app/(frontend)/layout.tsx` — remove EditModeProvider wrapper

### Deleted Files
- `src/components/features/frontend-editor/edit-mode-context.tsx` — replaced by store

### Unchanged Files (work via bridge)
- `save-controls.tsx`, `editable-overlay.tsx`, `block-controls.tsx`, `block-editor-dialog.tsx`, `field-editor-orchestrator.tsx`, `link-editor-popover.tsx`, `block-picker.tsx`, `array-item-controls.tsx`, `admin-bar.tsx`

---

## Task 1: Install zustand

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install zustand**

```bash
bun add zustand
```

- [ ] **Step 2: Verify installation**

```bash
bun run build 2>&1 | head -5
```

Expected: no errors from zustand

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add zustand dependency"
```

---

## Task 2: Create deep-equal utility

**Files:**
- Create: `src/components/features/frontend-editor/deep-equal.ts`
- Create: `src/components/features/frontend-editor/deep-equal.test.ts`

- [ ] **Step 1: Write tests**

```typescript
// src/components/features/frontend-editor/deep-equal.test.ts
import { describe, expect, test } from "bun:test";
import { deepEqual } from "./deep-equal";

describe("deepEqual", () => {
  test("primitives", () => {
    expect(deepEqual("a", "a")).toBe(true);
    expect(deepEqual("a", "b")).toBe(false);
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual(true, true)).toBe(true);
    expect(deepEqual(true, false)).toBe(false);
  });

  test("null and undefined", () => {
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
    expect(deepEqual(null, undefined)).toBe(false);
    expect(deepEqual(null, "a")).toBe(false);
  });

  test("plain objects", () => {
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  test("nested objects (relationship refs)", () => {
    const a = { relationTo: "pages", value: 3 };
    const b = { relationTo: "pages", value: 3 };
    const c = { relationTo: "pages", value: 5 };
    expect(deepEqual(a, b)).toBe(true);
    expect(deepEqual(a, c)).toBe(false);
  });

  test("arrays", () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  test("type mismatches", () => {
    expect(deepEqual("1", 1)).toBe(false);
    expect(deepEqual({}, [])).toBe(false);
    expect(deepEqual(null, {})).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test src/components/features/frontend-editor/deep-equal.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Implement deep-equal**

```typescript
// src/components/features/frontend-editor/deep-equal.ts

/** Simple deep equality for JSON-compatible values (primitives, plain objects, arrays). */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    return a.every((val, i) => deepEqual(val, b[i]));
  }

  if (typeof a === "object") {
    const keysA = Object.keys(a as Record<string, unknown>);
    const keysB = Object.keys(b as Record<string, unknown>);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) =>
      deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    );
  }

  return false;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun test src/components/features/frontend-editor/deep-equal.test.ts
```

Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/features/frontend-editor/deep-equal.ts src/components/features/frontend-editor/deep-equal.test.ts
git commit -m "feat: add deep-equal utility for dirty field comparison"
```

---

## Task 3: Create zustand store

**Files:**
- Create: `src/components/features/frontend-editor/edit-mode-store.ts`

This is the core migration. The store has the same actions as the current context but replaces `dirtyPaths: Set<string>` with `dirtyFields: Map<string, DirtyEntry>` and adds `revertField`.

- [ ] **Step 1: Create the store**

```typescript
// src/components/features/frontend-editor/edit-mode-store.ts
"use client";

import { create } from "zustand";
import type { LayoutBlock } from "@/types/block-types";
import { deepEqual } from "./deep-equal";
import {
  addArrayItem,
  duplicateBlock,
  getFieldValue,
  humanizeFieldPath,
  moveArrayItem,
  moveBlock,
  removeArrayItem,
  removeBlock,
  setFieldValue,
} from "./edit-mode-data";

// biome-ignore lint/suspicious/noExplicitAny: Field values can be any type — intentional escape hatch.
type AnyValue = any;

export interface DirtyEntry {
  originalValue: unknown;
  currentValue: unknown;
  label: string;
  blockIndex: number;
  fieldPath: string;
}

interface EditModeStore {
  // --- State ---
  active: boolean;
  blocks: LayoutBlock[];
  dirtyFields: Map<string, DirtyEntry>;
  pageId: number | null;
  saving: boolean;

  // --- Actions ---
  enter: (pageId: number, blocks: LayoutBlock[]) => void;
  exit: () => void;
  updateField: (blockIndex: number, path: string, value: AnyValue) => void;
  revertField: (dirtyKey: string) => void;
  moveBlockAction: (from: number, to: number) => void;
  removeBlockAction: (index: number) => void;
  duplicateBlockAction: (index: number) => void;
  addBlockAction: (index: number, block: LayoutBlock) => void;
  moveArrayItemAction: (
    blockIndex: number,
    arrayPath: string,
    from: number,
    to: number
  ) => void;
  removeArrayItemAction: (
    blockIndex: number,
    arrayPath: string,
    index: number
  ) => void;
  addArrayItemAction: (
    blockIndex: number,
    arrayPath: string,
    item: Record<string, AnyValue>
  ) => void;
  setSaving: (saving: boolean) => void;
  resetDirty: (blocks: LayoutBlock[]) => void;
}

/** Safely clone a value for snapshotting. Falls back to JSON round-trip. */
function safeClone(value: unknown): unknown {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}

/** Replace all index-prefixed dirty keys with a single structural marker. */
function invalidateToStructure(
  dirtyFields: Map<string, DirtyEntry>
): Map<string, DirtyEntry> {
  const next = new Map<string, DirtyEntry>();
  next.set("__structure", {
    originalValue: null,
    currentValue: null,
    label: "Layout changes",
    blockIndex: -1,
    fieldPath: "__structure",
  });
  return next;
}

export const useEditStore = create<EditModeStore>((set, get) => ({
  // --- Initial state ---
  active: false,
  blocks: [],
  dirtyFields: new Map(),
  pageId: null,
  saving: false,

  // --- Actions ---

  enter: (pageId, blocks) => {
    set({
      active: true,
      pageId,
      blocks: structuredClone(blocks),
      dirtyFields: new Map(),
      saving: false,
    });
  },

  exit: () => {
    set({
      active: false,
      pageId: null,
      blocks: [],
      dirtyFields: new Map(),
      saving: false,
    });
  },

  updateField: (blockIndex, path, value) => {
    const { blocks, dirtyFields } = get();
    const key = `${blockIndex}.${path}`;

    // Snapshot original on first edit to this field
    if (!dirtyFields.has(key)) {
      const original = safeClone(
        getFieldValue(
          blocks[blockIndex] as unknown as Record<string, unknown>,
          path
        )
      );
      dirtyFields.set(key, {
        originalValue: original,
        currentValue: value,
        label: humanizeFieldPath(path),
        blockIndex,
        fieldPath: path,
      });
    } else {
      dirtyFields.get(key)!.currentValue = value;
    }

    // Auto-clean: if edited back to original, remove from dirty map
    const entry = dirtyFields.get(key)!;
    if (deepEqual(entry.currentValue, entry.originalValue)) {
      dirtyFields.delete(key);
    }

    const updated = [...blocks];
    updated[blockIndex] = setFieldValue(
      updated[blockIndex] as unknown as Record<string, unknown>,
      path,
      value
    ) as unknown as LayoutBlock;

    set({ blocks: updated, dirtyFields: new Map(dirtyFields) });
  },

  revertField: (dirtyKey) => {
    const { blocks, dirtyFields } = get();
    const entry = dirtyFields.get(dirtyKey);
    if (!entry) return;

    const updated = [...blocks];
    updated[entry.blockIndex] = setFieldValue(
      updated[entry.blockIndex] as unknown as Record<string, unknown>,
      entry.fieldPath,
      entry.originalValue
    ) as unknown as LayoutBlock;

    dirtyFields.delete(dirtyKey);
    set({ blocks: updated, dirtyFields: new Map(dirtyFields) });
  },

  moveBlockAction: (from, to) => {
    const { blocks, dirtyFields } = get();
    set({
      blocks: moveBlock(blocks, from, to),
      dirtyFields: invalidateToStructure(dirtyFields),
    });
  },

  removeBlockAction: (index) => {
    const { blocks, dirtyFields } = get();
    set({
      blocks: removeBlock(blocks, index),
      dirtyFields: invalidateToStructure(dirtyFields),
    });
  },

  duplicateBlockAction: (index) => {
    const { blocks, dirtyFields } = get();
    const newBlocks = duplicateBlock(
      blocks as unknown as Record<string, unknown>[],
      index
    ) as unknown as LayoutBlock[];
    dirtyFields.set("__structure", {
      originalValue: null,
      currentValue: null,
      label: "Layout changes",
      blockIndex: -1,
      fieldPath: "__structure",
    });
    set({ blocks: newBlocks, dirtyFields: new Map(dirtyFields) });
  },

  addBlockAction: (index, block) => {
    const { blocks, dirtyFields } = get();
    const copy = [...blocks];
    copy.splice(index, 0, block);
    dirtyFields.set("__structure", {
      originalValue: null,
      currentValue: null,
      label: "Layout changes",
      blockIndex: -1,
      fieldPath: "__structure",
    });
    set({ blocks: copy, dirtyFields: new Map(dirtyFields) });
  },

  moveArrayItemAction: (blockIndex, arrayPath, from, to) => {
    const { blocks, dirtyFields } = get();
    const updated = [...blocks];
    updated[blockIndex] = moveArrayItem(
      updated[blockIndex] as unknown as Record<string, unknown>,
      arrayPath,
      from,
      to
    ) as unknown as LayoutBlock;
    dirtyFields.set(`${blockIndex}.${arrayPath}`, {
      originalValue: null,
      currentValue: null,
      label: humanizeFieldPath(arrayPath),
      blockIndex,
      fieldPath: arrayPath,
    });
    set({ blocks: updated, dirtyFields: new Map(dirtyFields) });
  },

  removeArrayItemAction: (blockIndex, arrayPath, index) => {
    const { blocks, dirtyFields } = get();
    const updated = [...blocks];
    updated[blockIndex] = removeArrayItem(
      updated[blockIndex] as unknown as Record<string, unknown>,
      arrayPath,
      index
    ) as unknown as LayoutBlock;
    dirtyFields.set(`${blockIndex}.${arrayPath}`, {
      originalValue: null,
      currentValue: null,
      label: humanizeFieldPath(arrayPath),
      blockIndex,
      fieldPath: arrayPath,
    });
    set({ blocks: updated, dirtyFields: new Map(dirtyFields) });
  },

  addArrayItemAction: (blockIndex, arrayPath, item) => {
    const { blocks, dirtyFields } = get();
    const updated = [...blocks];
    updated[blockIndex] = addArrayItem(
      updated[blockIndex] as unknown as Record<string, unknown>,
      arrayPath,
      item
    ) as unknown as LayoutBlock;
    dirtyFields.set(`${blockIndex}.${arrayPath}`, {
      originalValue: null,
      currentValue: null,
      label: humanizeFieldPath(arrayPath),
      blockIndex,
      fieldPath: arrayPath,
    });
    set({ blocks: updated, dirtyFields: new Map(dirtyFields) });
  },

  setSaving: (saving) => set({ saving }),

  resetDirty: (blocks) => {
    set({
      blocks: structuredClone(blocks),
      dirtyFields: new Map(),
    });
  },
}));
```

- [ ] **Step 2: Verify it compiles**

```bash
bun run build 2>&1 | tail -5
```

Expected: no new errors (store isn't imported yet)

- [ ] **Step 3: Commit**

```bash
git add src/components/features/frontend-editor/edit-mode-store.ts
git commit -m "feat: create zustand edit mode store with dirty tracking and revert"
```

---

## Task 4: Bridge hooks + remove provider

**Files:**
- Modify: `src/components/features/frontend-editor/use-edit-mode.ts`
- Modify: `src/app/(frontend)/layout.tsx`
- Delete: `src/components/features/frontend-editor/edit-mode-context.tsx`

The bridge keeps `useEditMode()` and `useEditModeRequired()` returning the same `{ state, actions }` shape so all 11 consumers work without changes.

- [ ] **Step 1: Rewrite use-edit-mode.ts to bridge zustand**

Replace the entire file. The hooks return the same `EditModeContextValue` shape but backed by zustand:

```typescript
// src/components/features/frontend-editor/use-edit-mode.ts
"use client";

import type { LayoutBlock } from "@/types/block-types";
import { type DirtyEntry, useEditStore } from "./edit-mode-store";

// biome-ignore lint/suspicious/noExplicitAny: Field values can be any type — intentional escape hatch.
type AnyValue = any;

export interface EditModeState {
  active: boolean;
  blocks: LayoutBlock[];
  dirtyCount: number;
  dirtyFields: Map<string, DirtyEntry>;
  pageId: number | null;
  saving: boolean;
}

export interface EditModeActions {
  addArrayItemAction: (
    blockIndex: number,
    arrayPath: string,
    item: Record<string, AnyValue>
  ) => void;
  addBlockAction: (index: number, block: LayoutBlock) => void;
  duplicateBlockAction: (index: number) => void;
  enter: (pageId: number, blocks: LayoutBlock[]) => void;
  exit: () => void;
  moveArrayItemAction: (
    blockIndex: number,
    arrayPath: string,
    from: number,
    to: number
  ) => void;
  moveBlockAction: (from: number, to: number) => void;
  removeArrayItemAction: (
    blockIndex: number,
    arrayPath: string,
    index: number
  ) => void;
  removeBlockAction: (index: number) => void;
  resetDirty: (blocks: LayoutBlock[]) => void;
  revertField: (dirtyKey: string) => void;
  setSaving: (saving: boolean) => void;
  updateField: (blockIndex: number, path: string, value: AnyValue) => void;
}

export interface EditModeContextValue {
  actions: EditModeActions;
  state: EditModeState;
}

/** Access edit mode state and actions. Returns null when not active (mirrors old nullable context). */
export function useEditMode(): EditModeContextValue | null {
  const store = useEditStore();

  // Always return the value — zustand doesn't need a provider.
  // Consumers check `editMode?.state.active` anyway.
  return {
    state: {
      active: store.active,
      blocks: store.blocks,
      dirtyCount: store.dirtyFields.size,
      dirtyFields: store.dirtyFields,
      pageId: store.pageId,
      saving: store.saving,
    },
    actions: {
      addArrayItemAction: store.addArrayItemAction,
      addBlockAction: store.addBlockAction,
      duplicateBlockAction: store.duplicateBlockAction,
      enter: store.enter,
      exit: store.exit,
      moveArrayItemAction: store.moveArrayItemAction,
      moveBlockAction: store.moveBlockAction,
      removeArrayItemAction: store.removeArrayItemAction,
      removeBlockAction: store.removeBlockAction,
      resetDirty: store.resetDirty,
      revertField: store.revertField,
      setSaving: store.setSaving,
      updateField: store.updateField,
    },
  };
}

/** Access edit mode state and actions. Throws if edit mode store is unavailable. */
export function useEditModeRequired(): EditModeContextValue {
  const ctx = useEditMode();
  if (!ctx) {
    throw new Error("useEditModeRequired: edit mode unavailable");
  }
  return ctx;
}
```

- [ ] **Step 2: Remove EditModeProvider from layout.tsx**

In `src/app/(frontend)/layout.tsx`, remove the `<EditModeProvider>` wrapper and its import. The layout should still render children but without the context provider (zustand doesn't need one).

Find and remove:
- The import: `import { EditModeProvider } from ...`
- The wrapper: `<EditModeProvider>...</EditModeProvider>` → just render children directly

- [ ] **Step 3: Delete edit-mode-context.tsx**

```bash
rm src/components/features/frontend-editor/edit-mode-context.tsx
```

- [ ] **Step 4: Fix any remaining imports of edit-mode-context**

Search for any files still importing from `edit-mode-context` and update them. The `use-edit-mode.ts` rewrite already removed its import. Check:

```bash
bun run build 2>&1 | grep "edit-mode-context"
```

Expected: no references found

- [ ] **Step 5: Run build to verify**

```bash
bun run build
```

Expected: build passes — all consumers work through the bridge hooks

- [ ] **Step 6: Add beforeunload guard**

The old context had a `useEffect` for `beforeunload`. Add this as a standalone hook in `use-edit-mode.ts` or a small component. The simplest approach: add a `useBeforeUnloadGuard()` hook exported from `use-edit-mode.ts` and call it from `editable-overlay.tsx` (which already renders only when editing).

```typescript
// Add to use-edit-mode.ts
export function useBeforeUnloadGuard() {
  const active = useEditStore((s) => s.active);
  const dirtySize = useEditStore((s) => s.dirtyFields.size);

  useEffect(() => {
    if (!active || dirtySize === 0) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active, dirtySize]);
}
```

Call it from `editable-overlay.tsx` at the top of the component.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: migrate edit mode from React context to zustand store"
```

---

## Task 5: Remove blocksRef hack from edit-runtime.tsx

**Files:**
- Modify: `src/components/features/frontend-editor/edit-runtime.tsx`

- [ ] **Step 1: Replace blocksRef pattern**

In `edit-runtime.tsx`, find lines 50-51:

```typescript
const blocksRef = useRef(editMode?.state.blocks);
blocksRef.current = editMode?.state.blocks;
```

And in `bindGroupElement` (line 179), the usage:

```typescript
const block = (blocksRef.current ?? [])[blockIndex]
```

Replace with direct zustand `getState()` call:

```typescript
import { useEditStore } from "./edit-mode-store";
```

Then in `bindGroupElement`'s `handleEditClick`, replace:
```typescript
const block = (blocksRef.current ?? [])[blockIndex]
```
with:
```typescript
const block = (useEditStore.getState().blocks ?? [])[blockIndex]
```

Remove the `blocksRef` lines entirely.

- [ ] **Step 2: Verify build**

```bash
bun run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/features/frontend-editor/edit-runtime.tsx
git commit -m "refactor: remove blocksRef hack, use zustand getState()"
```

---

## Task 6: Add change popover to admin bar

**Files:**
- Modify: `src/components/features/admin-bar/admin-bar-actions.tsx`

- [ ] **Step 1: Replace change count text with popover**

In `admin-bar-actions.tsx`, replace the change count span (lines 119-124):

```tsx
<span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
  {editMode.state.dirtyCount > 0
    ? `${editMode.state.dirtyCount} ${editMode.state.dirtyCount === 1 ? "change" : "changes"}`
    : "Editing"}
</span>
```

With a Popover-wrapped version:

```tsx
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Inside the component, derive values:
const dirtyFields = editMode.state.dirtyFields;
const dirtyCount = dirtyFields.size;
const dirtyEntries = [...dirtyFields.entries()];

// Replace the span with:
{dirtyCount > 0 ? (
  <Popover>
    <PopoverTrigger asChild>
      <button
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        type="button"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
        {dirtyCount} {dirtyCount === 1 ? "change" : "changes"}
      </button>
    </PopoverTrigger>
    <PopoverContent
      align="start"
      className="w-72 p-0"
      sideOffset={8}
    >
      <div className="border-b px-3 py-2">
        <span className="font-medium text-xs">
          {dirtyCount} unsaved {dirtyCount === 1 ? "change" : "changes"}
        </span>
      </div>
      <div className="max-h-48 overflow-y-auto py-1">
        {dirtyEntries.map(([key, entry]) => (
          <div
            className="flex items-center justify-between px-3 py-1.5"
            key={key}
          >
            <span className="truncate text-[11px] text-muted-foreground">
              {entry.label}
            </span>
            {key !== "__structure" && (
              <button
                className="ml-2 shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => editMode.actions.revertField(key)}
                title="Revert this change"
                type="button"
              >
                <svg
                  fill="none"
                  height="12"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="12"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </PopoverContent>
  </Popover>
) : (
  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
    Editing
  </span>
)}
```

- [ ] **Step 2: Update save-controls dirtyCount reference**

In `save-controls.tsx`, `state.dirtyCount` will still work through the bridge. No changes needed — verify by checking the build.

- [ ] **Step 3: Verify build and test manually**

```bash
bun run build
```

Then test in browser:
1. Enter edit mode
2. Edit a text field → popover shows "1 change" with label
3. Edit another field → popover shows "2 changes"
4. Click ✕ on one → count decrements, field reverts to original
5. Edit a field back to its original value → auto-removed from list

- [ ] **Step 4: Commit**

```bash
git add src/components/features/admin-bar/admin-bar-actions.tsx
git commit -m "feat: add change popover with per-field revert in admin bar"
```

---

## Task 7: Run full test suite and final verification

- [ ] **Step 1: Run existing tests**

```bash
bun test
```

Expected: all tests pass (edit-mode-data tests are pure helpers, unaffected by store migration)

- [ ] **Step 2: Run lint**

```bash
bun check
```

Fix any issues.

- [ ] **Step 3: Run build**

```bash
bun run build
```

Expected: clean build

- [ ] **Step 4: Final commit if any fixes**

```bash
git add -A
git commit -m "fix: address lint and test issues from zustand migration"
```
