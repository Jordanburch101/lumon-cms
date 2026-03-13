"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { LayoutBlock } from "@/types/block-types";
import {
  addArrayItem,
  duplicateBlock,
  moveArrayItem,
  moveBlock,
  removeArrayItem,
  removeBlock,
  setFieldValue,
} from "./edit-mode-data";

// biome-ignore lint/suspicious/noExplicitAny: Field values can be any type — intentional escape hatch.
type AnyValue = any;

export interface EditModeState {
  /** Whether edit mode is active. */
  active: boolean;
  /** The mutable blocks array. */
  blocks: LayoutBlock[];
  /** Number of dirty fields. */
  dirtyCount: number;
  /** Current page ID being edited. */
  pageId: number | null;
  /** Whether a save is in progress. */
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
  setSaving: (saving: boolean) => void;
  updateField: (blockIndex: number, path: string, value: AnyValue) => void;
}

export interface EditModeContextValue {
  actions: EditModeActions;
  state: EditModeState;
}

export const EditModeContext = createContext<EditModeContextValue | null>(null);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EditModeState>({
    active: false,
    pageId: null,
    blocks: [],
    dirtyCount: 0,
    saving: false,
  });

  const dirtyPaths = useRef(new Set<string>());

  const enter = useCallback((pageId: number, blocks: LayoutBlock[]) => {
    dirtyPaths.current.clear();
    setState({
      active: true,
      pageId,
      blocks: structuredClone(blocks),
      dirtyCount: 0,
      saving: false,
    });
  }, []);

  const exit = useCallback(() => {
    dirtyPaths.current.clear();
    setState({
      active: false,
      pageId: null,
      blocks: [],
      dirtyCount: 0,
      saving: false,
    });
  }, []);

  const updateField = useCallback(
    (blockIndex: number, path: string, value: AnyValue) => {
      setState((prev) => {
        const updated = [...prev.blocks];
        updated[blockIndex] = setFieldValue(
          updated[blockIndex] as unknown as Record<string, unknown>,
          path,
          value
        ) as unknown as LayoutBlock;
        const dirtyKey = `${blockIndex}.${path}`;
        dirtyPaths.current.add(dirtyKey);
        return {
          ...prev,
          blocks: updated,
          dirtyCount: dirtyPaths.current.size,
        };
      });
    },
    []
  );

  const moveBlockAction = useCallback((from: number, to: number) => {
    setState((prev) => {
      dirtyPaths.current.add("__structure");
      return {
        ...prev,
        blocks: moveBlock(prev.blocks, from, to),
        dirtyCount: dirtyPaths.current.size,
      };
    });
  }, []);

  const removeBlockAction = useCallback((index: number) => {
    setState((prev) => {
      dirtyPaths.current.add("__structure");
      return {
        ...prev,
        blocks: removeBlock(prev.blocks, index),
        dirtyCount: dirtyPaths.current.size,
      };
    });
  }, []);

  const duplicateBlockAction = useCallback((index: number) => {
    setState((prev) => {
      dirtyPaths.current.add("__structure");
      return {
        ...prev,
        blocks: duplicateBlock(
          prev.blocks as unknown as Record<string, unknown>[],
          index
        ) as unknown as LayoutBlock[],
        dirtyCount: dirtyPaths.current.size,
      };
    });
  }, []);

  const addBlockAction = useCallback((index: number, block: LayoutBlock) => {
    setState((prev) => {
      dirtyPaths.current.add("__structure");
      const copy = [...prev.blocks];
      copy.splice(index, 0, block);
      return {
        ...prev,
        blocks: copy,
        dirtyCount: dirtyPaths.current.size,
      };
    });
  }, []);

  const moveArrayItemAction = useCallback(
    (blockIndex: number, arrayPath: string, from: number, to: number) => {
      setState((prev) => {
        const updated = [...prev.blocks];
        updated[blockIndex] = moveArrayItem(
          updated[blockIndex] as unknown as Record<string, unknown>,
          arrayPath,
          from,
          to
        ) as unknown as LayoutBlock;
        dirtyPaths.current.add(`${blockIndex}.${arrayPath}`);
        return {
          ...prev,
          blocks: updated,
          dirtyCount: dirtyPaths.current.size,
        };
      });
    },
    []
  );

  const removeArrayItemAction = useCallback(
    (blockIndex: number, arrayPath: string, index: number) => {
      setState((prev) => {
        const updated = [...prev.blocks];
        updated[blockIndex] = removeArrayItem(
          updated[blockIndex] as unknown as Record<string, unknown>,
          arrayPath,
          index
        ) as unknown as LayoutBlock;
        dirtyPaths.current.add(`${blockIndex}.${arrayPath}`);
        return {
          ...prev,
          blocks: updated,
          dirtyCount: dirtyPaths.current.size,
        };
      });
    },
    []
  );

  const addArrayItemAction = useCallback(
    (blockIndex: number, arrayPath: string, item: Record<string, AnyValue>) => {
      setState((prev) => {
        const updated = [...prev.blocks];
        updated[blockIndex] = addArrayItem(
          updated[blockIndex] as unknown as Record<string, unknown>,
          arrayPath,
          item
        ) as unknown as LayoutBlock;
        dirtyPaths.current.add(`${blockIndex}.${arrayPath}`);
        return {
          ...prev,
          blocks: updated,
          dirtyCount: dirtyPaths.current.size,
        };
      });
    },
    []
  );

  const setSaving = useCallback((saving: boolean) => {
    setState((prev) => ({ ...prev, saving }));
  }, []);

  const resetDirty = useCallback((blocks: LayoutBlock[]) => {
    dirtyPaths.current.clear();
    setState((prev) => ({
      ...prev,
      blocks: structuredClone(blocks),
      dirtyCount: 0,
    }));
  }, []);

  useEffect(() => {
    if (!state.active || state.dirtyCount === 0) {
      return;
    }

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.active, state.dirtyCount]);

  const actions = useMemo<EditModeActions>(
    () => ({
      enter,
      exit,
      updateField,
      moveBlockAction,
      removeBlockAction,
      duplicateBlockAction,
      addBlockAction,
      moveArrayItemAction,
      removeArrayItemAction,
      addArrayItemAction,
      setSaving,
      resetDirty,
    }),
    [
      enter,
      exit,
      updateField,
      moveBlockAction,
      removeBlockAction,
      duplicateBlockAction,
      addBlockAction,
      moveArrayItemAction,
      removeArrayItemAction,
      addArrayItemAction,
      setSaving,
      resetDirty,
    ]
  );

  const value = useMemo<EditModeContextValue>(
    () => ({ state, actions }),
    [state, actions]
  );

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
}
