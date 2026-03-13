"use client";

import { useContext } from "react";
import { EditModeContext } from "./edit-mode-context";

/** Access edit mode state and actions. Returns null if not inside provider. */
export function useEditMode() {
  return useContext(EditModeContext);
}

/** Access edit mode state and actions. Throws if not inside provider. */
export function useEditModeRequired() {
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    throw new Error("useEditModeRequired must be used within EditModeProvider");
  }
  return ctx;
}
