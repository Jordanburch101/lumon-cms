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
function invalidateToStructure(): Map<string, DirtyEntry> {
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

/** Create a structural dirty entry for array/block mutations. */
function structuralEntry(
  blockIndex: number,
  fieldPath: string
): DirtyEntry {
  return {
    originalValue: null,
    currentValue: null,
    label: humanizeFieldPath(fieldPath),
    blockIndex,
    fieldPath,
  };
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
    const { blocks } = get();
    set({
      blocks: moveBlock(blocks, from, to),
      dirtyFields: invalidateToStructure(),
    });
  },

  removeBlockAction: (index) => {
    const { blocks } = get();
    set({
      blocks: removeBlock(blocks, index),
      dirtyFields: invalidateToStructure(),
    });
  },

  duplicateBlockAction: (index) => {
    const { blocks, dirtyFields } = get();
    const newBlocks = duplicateBlock(
      blocks as unknown as Record<string, unknown>[],
      index
    ) as unknown as LayoutBlock[];
    dirtyFields.set("__structure", structuralEntry(-1, "__structure"));
    set({ blocks: newBlocks, dirtyFields: new Map(dirtyFields) });
  },

  addBlockAction: (index, block) => {
    const { blocks, dirtyFields } = get();
    const copy = [...blocks];
    copy.splice(index, 0, block);
    dirtyFields.set("__structure", structuralEntry(-1, "__structure"));
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
    const key = `${blockIndex}.${arrayPath}`;
    dirtyFields.set(key, structuralEntry(blockIndex, arrayPath));
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
    const key = `${blockIndex}.${arrayPath}`;
    dirtyFields.set(key, structuralEntry(blockIndex, arrayPath));
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
    const key = `${blockIndex}.${arrayPath}`;
    dirtyFields.set(key, structuralEntry(blockIndex, arrayPath));
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
