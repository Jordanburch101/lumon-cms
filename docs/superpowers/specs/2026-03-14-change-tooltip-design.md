# Change Tooltip with Per-Field Revert + Zustand Migration

## Problem

The admin bar shows "N changes" but gives no visibility into _what_ changed. The only option is "discard all" via page reload. Users need to see individual changes and revert specific ones without losing other edits.

Additionally, the edit mode state lives in a React context with `useRef` workarounds for reading state outside React (e.g., DOM-based edit runtime). Migrating to zustand eliminates these hacks and positions the editor for future features (undo/redo, realtime collaboration).

## Design

### State Migration: Context → Zustand

Replace `edit-mode-context.tsx` (createContext + useState + useRef) with a zustand store.

**Current pain points solved:**
- `blocksRef = useRef(editMode?.state.blocks)` hack in edit-runtime.tsx → `useEditStore.getState().blocks`
- Entire editor tree re-renders on every keystroke → selector-based re-renders
- No provider wrapper needed → store is module-level singleton

**Store shape:**

```typescript
interface DirtyEntry {
  originalValue: unknown;   // structuredClone'd at first edit
  currentValue: unknown;    // latest value after edit
  label: string;            // human-readable (from humanizeFieldPath)
  blockIndex: number;
  fieldPath: string;
}

interface EditModeStore {
  // State
  active: boolean;
  blocks: LayoutBlock[];
  dirtyFields: Map<string, DirtyEntry>;
  pageId: number | null;
  saving: boolean;

  // Actions
  activate: (pageId: number, blocks: LayoutBlock[]) => void;
  deactivate: () => void;
  updateField: (blockIndex: number, path: string, value: unknown) => void;
  revertField: (dirtyKey: string) => void;
  moveBlock: (from: number, to: number) => void;
  addBlock: (block: LayoutBlock, index: number) => void;
  removeBlock: (index: number) => void;
  duplicateBlock: (index: number) => void;
  addArrayItem: (blockIndex: number, arrayPath: string, item: unknown) => void;
  removeArrayItem: (blockIndex: number, arrayPath: string, itemIndex: number) => void;
  save: () => Promise<void>;
  resetDirty: () => void;
}
```

Key format for dirtyFields: `"${blockIndex}.${fieldPath}"` (e.g., `"0.primaryCta.label"`).

### Snapshot Behavior

In `updateField()`:
1. If key not in `dirtyFields` → snapshot current value via `structuredClone`, create entry
2. If key already in `dirtyFields` → only update `currentValue`
3. After updating, if `currentValue` deep-equals `originalValue` → auto-remove from map (change is effectively a no-op)

For group field updates (link editor), each sub-field gets its own entry.

### Revert Action

`revertField(dirtyKey: string)`:
1. Look up `DirtyEntry` from `dirtyFields` map
2. Write `originalValue` back into `blocks[blockIndex]` at `fieldPath`
3. Remove key from `dirtyFields`
4. Zustand notifies only subscribers of `dirtyFields` and `blocks` slices

### Structural Changes

Block add/remove/move operations continue using the `"__structure"` marker. These are NOT individually revertable (too complex — reordering indices would invalidate all path-based entries). The popover shows them as "Layout changes" without an X button.

### Consumer Migration

The `useEditMode()` hook is kept as a thin wrapper around zustand selectors for backwards compatibility:

```typescript
// Existing call sites keep working
export function useEditMode() {
  const store = useEditStore();
  return { state: { active: store.active, ... }, actions: { updateField: store.updateField, ... } };
}

// New code can use selectors directly
const dirtyFields = useEditStore((s) => s.dirtyFields);
```

Or: replace all call sites directly with `useEditStore` selectors (cleaner, slightly more migration work).

### Admin Bar UI

Replace the plain "N changes" text with a Popover trigger:

```
┌─────────────────────────────┐
│ 3 changes                   │
├─────────────────────────────┤
│ Hero › Primary CTA › Label  ✕│
│ Hero › Primary CTA › URL    ✕│
│ Layout changes               │
└─────────────────────────────┘
```

- Trigger: click on the change counter badge
- Each row: human-readable path + revert (✕) button
- Structural changes shown without ✕
- Styled to match existing admin bar aesthetic (dark bg, small text)

### Equality Check

Simple deep-equal utility (~10 lines):
- Primitives: `===`
- Objects: recursive comparison of own enumerable keys
- Arrays: length + element-wise comparison
- `null`/`undefined` handled

No library needed — values are simple JSON.

## Files

### New
- **`edit-mode-store.ts`** — Zustand store replacing edit-mode-context.tsx

### Modified
- **`edit-mode-context.tsx`** — Gutted to thin wrapper or deleted entirely
- **`use-edit-mode.ts`** — Updated to read from zustand store
- **`edit-runtime.tsx`** — Remove `blocksRef` hack, use `useEditStore.getState()`
- **`admin-bar-actions.tsx`** — Replace change count with Popover + revert buttons
- **`save-controls.tsx`** — Update to use zustand store
- **`orchestrator.tsx`** — Update to use zustand store (if it reads edit mode)
- **`edit-mode-data.ts`** — Add `deepEqual` utility
- **`link-editor-popover.tsx`** — Update `useEditModeRequired` usage
- All other consumers of `useEditMode()` — update imports

### NOT Modified
- Block components — they pass data-attributes, don't read edit state
- CSS/globals.css — no changes
- Field map / import map — no changes

## Edge Cases

- **Rapid edits to same field**: Only first edit snapshots original; subsequent edits update `currentValue`
- **Edit back to original**: Auto-removed from dirty map, count decrements
- **Revert after structural change**: After structural changes, field-level dirty entries are cleared (indices are invalidated)
- **Group editor (link popover)**: Each sub-field tracked independently
- **SSR safety**: Zustand store is client-only; the `useEditMode` hook already guards with `"use client"`
