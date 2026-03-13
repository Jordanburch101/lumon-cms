"use client";

import { useEffect, useRef } from "react";
import { fieldMap } from "@/generated/field-map";
import type {
  ArrayFieldDescriptor,
  BlockFieldMap,
  FieldDescriptor,
  FieldEntry,
} from "@/payload/lib/field-map/types";
import { activateTextEditor } from "./field-editors/text-editor";
import { useEditMode } from "./use-edit-mode";

// Hoisted regexes to satisfy lint/performance/useTopLevelRegex
const RE_ARRAY_MID = /\.\d+\./g;
const RE_ARRAY_END = /\.\d+$/;

export function useEditRuntime() {
  const editMode = useEditMode();
  const cleanups = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!editMode?.state.active) {
      return;
    }

    const { actions } = editMode;

    function bindElement(
      el: HTMLElement,
      blockIndex: number,
      fullPath: string
    ) {
      const fieldPath = resolveFieldPath(fullPath);
      const blockType =
        el.closest<HTMLElement>("[data-block-index]")?.dataset.blockType;
      if (!(blockType && blockType in fieldMap)) {
        return;
      }

      const descriptor = lookupDescriptor(fieldMap[blockType], fieldPath);
      if (!descriptor) {
        return;
      }

      if (isTextType(descriptor.type)) {
        const cleanup = activateTextEditor(
          el,
          blockIndex,
          fullPath,
          actions.updateField
        );
        cleanups.current.push(cleanup);
      } else {
        const eventName =
          descriptor.type === "upload"
            ? "edit:open-upload"
            : "edit:open-popover";
        const handler = () => {
          el.dispatchEvent(
            new CustomEvent(eventName, {
              bubbles: true,
              detail: {
                blockIndex,
                fieldPath: fullPath,
                descriptor,
                currentElement: el,
              },
            })
          );
        };
        el.style.cursor = "pointer";
        el.addEventListener("click", handler);
        cleanups.current.push(() => {
          el.style.cursor = "";
          el.removeEventListener("click", handler);
        });
      }
    }

    function scan() {
      for (const cleanup of cleanups.current) {
        cleanup();
      }
      cleanups.current = [];

      const container = document.querySelector<HTMLElement>(
        ".frontend-editor-overlay"
      );
      if (!container) {
        return;
      }

      const fieldElements =
        container.querySelectorAll<HTMLElement>("[data-field]");

      for (const el of fieldElements) {
        const fullPath = el.dataset.field;
        if (!fullPath) {
          continue;
        }

        const blockContainer = el.closest<HTMLElement>("[data-block-index]");
        if (!blockContainer) {
          continue;
        }

        const blockIndex = Number(blockContainer.dataset.blockIndex);
        bindElement(el, blockIndex, fullPath);
      }
    }

    scan();

    const observer = new MutationObserver(() => {
      setTimeout(scan, 400);
    });

    const overlay = document.querySelector(".frontend-editor-overlay");
    if (overlay) {
      observer.observe(overlay, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      for (const cleanup of cleanups.current) {
        cleanup();
      }
      cleanups.current = [];
    };
  }, [editMode]);
}

function isTextType(type: FieldDescriptor["type"]): boolean {
  return type === "text" || type === "textarea" || type === "email";
}

function resolveFieldPath(fullPath: string): string {
  return fullPath.replace(RE_ARRAY_MID, ".*.").replace(RE_ARRAY_END, ".*");
}

function resolveEntry(
  _current: BlockFieldMap,
  parts: string[],
  i: number,
  entry: FieldEntry
): FieldDescriptor | null {
  const isLast =
    i === parts.length - 1 || (i === parts.length - 2 && parts[i + 1] === "*");
  if (isLast) {
    return entry.type !== "array" ? (entry as FieldDescriptor) : null;
  }
  return null;
}

function lookupDescriptor(
  fields: BlockFieldMap,
  normalizedPath: string
): FieldDescriptor | null {
  const parts = normalizedPath.split(".");
  let current: BlockFieldMap = fields;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === "*") {
      continue;
    }

    const entry = current[part];
    if (!entry) {
      const remaining = parts.slice(i).join(".");
      if (remaining in current) {
        const found = current[remaining];
        return found.type !== "array" ? (found as FieldDescriptor) : null;
      }
      return null;
    }

    const resolved = resolveEntry(current, parts, i, entry);
    if (resolved !== null || i === parts.length - 1) {
      return resolved;
    }

    if (entry.type === "array") {
      current = (entry as ArrayFieldDescriptor).fields;
      if (parts[i + 1] === "*") {
        i++;
      }
    }
  }

  return null;
}
