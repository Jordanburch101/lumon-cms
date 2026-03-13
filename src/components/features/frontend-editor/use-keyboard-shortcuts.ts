"use client";

import { useEffect } from "react";

export type ShortcutAction = "toggle" | "saveDraft" | "publish" | "exit";

/** Pure matcher for keyboard shortcuts. Normalizes key to lowercase for Shift combos. */
export function matchShortcut(e: KeyboardEvent): ShortcutAction | null {
  const mod = e.metaKey || e.ctrlKey;
  const key = e.key.toLowerCase();

  if (mod && !e.shiftKey && key === "e") {
    return "toggle";
  }
  if (mod && !e.shiftKey && key === "s") {
    return "saveDraft";
  }
  if (mod && e.shiftKey && key === "s") {
    return "publish";
  }
  if (e.key === "Escape" && !mod) {
    return "exit";
  }

  return null;
}

/** Register keyboard shortcuts for edit mode. */
export function useKeyboardShortcuts(
  active: boolean,
  handlers: Partial<Record<ShortcutAction, () => void>>
) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const action = matchShortcut(e);
      if (!action) {
        return;
      }

      // Toggle always works; others only when edit mode is active
      if (action !== "toggle" && !active) {
        return;
      }

      const handler = handlers[action];
      if (handler) {
        e.preventDefault();
        handler();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, handlers]);
}
