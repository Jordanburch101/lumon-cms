"use client";

import { useEffect } from "react";
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

/** Access edit mode state and actions. Backed by zustand — no provider needed. */
export function useEditMode(): EditModeContextValue | null {
  const store = useEditStore();

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

/** Access edit mode state and actions. Throws if unavailable. */
export function useEditModeRequired(): EditModeContextValue {
  const ctx = useEditMode();
  if (!ctx) {
    throw new Error("useEditModeRequired: edit mode unavailable");
  }
  return ctx;
}

/** Warn before navigating away with unsaved changes. Call from any edit-mode component. */
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
