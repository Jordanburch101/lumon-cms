"use client";

import { useEffect, useRef } from "react";
import { fieldMap } from "@/generated/field-map";
import type {
  ArrayFieldDescriptor,
  BlockFieldMap,
  FieldDescriptor,
  FieldEntry,
} from "@/payload/lib/field-map/types";
import { humanizeFieldPath } from "./edit-mode-data";
import { activateTextEditor } from "./field-editors/text-editor";
import { useEditMode } from "./use-edit-mode";

// Hoisted regexes to satisfy lint/performance/useTopLevelRegex
const RE_ARRAY_MID = /\.\d+\./g;
const RE_ARRAY_END = /\.\d+$/;

export function useEditRuntime() {
  const editMode = useEditMode();
  const isActive = editMode?.state.active ?? false;
  const actions = editMode?.actions;
  const cleanups = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!(isActive && actions)) {
      return;
    }

    const { updateField } = actions;

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

      // Add hover indicator class and field label for all editable elements
      const fieldLabel = humanizeFieldPath(fullPath);
      el.setAttribute("data-field-label", fieldLabel);

      if (isTextType(descriptor.type)) {
        el.classList.add("editable-field-text");
        const cleanup = activateTextEditor(
          el,
          blockIndex,
          fullPath,
          updateField
        );
        cleanups.current.push(() => {
          el.classList.remove("editable-field-text");
          el.removeAttribute("data-field-label");
          cleanup();
        });
      } else {
        el.classList.add("editable-field");
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
          el.classList.remove("editable-field");
          el.removeAttribute("data-field-label");
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

    let scanTimer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(scanTimer);
      scanTimer = setTimeout(scan, 400);
    });

    const overlay = document.querySelector(".frontend-editor-overlay");
    if (overlay) {
      observer.observe(overlay, { childList: true, subtree: true });
    }

    // Capture-phase listener: suppress all default interactive behaviour
    // (link navigation, button submits, etc.) inside the overlay while editing.
    // Our custom click handlers still fire because we only preventDefault, not stopPropagation.
    function suppressInteraction(e: Event) {
      const target = (e.target as HTMLElement).closest(
        "a, button, form, details, summary, [role='link'], [role='button']"
      );
      if (target) {
        e.preventDefault();
      }
    }

    overlay?.addEventListener("click", suppressInteraction, true);

    return () => {
      overlay?.removeEventListener("click", suppressInteraction, true);
      observer.disconnect();
      for (const cleanup of cleanups.current) {
        cleanup();
      }
      cleanups.current = [];
    };
  }, [isActive, actions]);
}

function isTextType(type: FieldDescriptor["type"]): boolean {
  return type === "text" || type === "textarea" || type === "email";
}

function resolveFieldPath(fullPath: string): string {
  return fullPath.replace(RE_ARRAY_MID, ".*.").replace(RE_ARRAY_END, ".*");
}

function resolveEntry(
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

    const resolved = resolveEntry(parts, i, entry);
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
