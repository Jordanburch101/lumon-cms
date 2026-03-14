"use client";

import { useEffect, useRef } from "react";
import { fieldMap } from "@/generated/field-map";
import type {
  ArrayFieldDescriptor,
  BlockFieldMap,
  FieldDescriptor,
  FieldEntry,
  GroupFieldDescriptor,
} from "@/payload/lib/field-map/types";
import { getFieldValue, humanizeFieldPath } from "./edit-mode-data";
import { useEditStore } from "./edit-mode-store";
import { activateTextEditor } from "./field-editors/text-editor";
import { useEditMode } from "./use-edit-mode";

// Hoisted regexes to satisfy lint/performance/useTopLevelRegex
const RE_ARRAY_MID = /\.\d+\./g;
const RE_ARRAY_END = /\.\d+$/;

const EDIT_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;

/** Wrap the first TEXT_NODE child of el in a span and return it.
 *  Preserves sibling elements (icons, etc.). Falls back to prepending
 *  a span with full textContent when no text nodes are found. */
function wrapLabelTextInSpan(el: HTMLElement): HTMLSpanElement {
  const labelSpan = document.createElement("span");
  const textNodes: Text[] = [];
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      textNodes.push(node as Text);
    }
  }
  if (textNodes.length > 0) {
    labelSpan.textContent = textNodes[0].textContent;
    textNodes[0].replaceWith(labelSpan);
    for (let t = 1; t < textNodes.length; t++) {
      textNodes[t].remove();
    }
  } else {
    labelSpan.textContent = el.textContent;
    el.prepend(labelSpan);
  }
  return labelSpan;
}

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

    function bindGroupElement(el: HTMLElement) {
      const fieldPath = el.dataset.fieldGroup;
      const groupType = el.dataset.fieldGroupType;
      if (!(fieldPath && groupType)) {
        return;
      }

      const blockContainer = el.closest<HTMLElement>("[data-block-index]");
      if (!blockContainer) {
        return;
      }

      const blockIndex = Number(blockContainer.dataset.blockIndex);
      const blockType = blockContainer.dataset.blockType;
      if (!(blockType && blockType in fieldMap)) {
        return;
      }

      const entry = fieldMap[blockType as keyof typeof fieldMap][fieldPath];
      if (!entry || entry.type !== "group") {
        return;
      }

      const groupDescriptor = entry as GroupFieldDescriptor;

      // Add hover indicator
      el.classList.add("editable-field");
      const fieldLabel = humanizeFieldPath(fieldPath);
      el.setAttribute("data-field-label", fieldLabel);

      // Inline label editing: wrap only TEXT_NODE children in a span
      // (preserves icons and other elements)
      const labelSpan = wrapLabelTextInSpan(el);

      const labelCleanup = activateTextEditor(
        labelSpan,
        blockIndex,
        `${fieldPath}.label`,
        updateField
      );

      // Create edit icon overlay
      const editIcon = document.createElement("button");
      editIcon.className = "group-edit-icon";
      editIcon.setAttribute("aria-label", `Edit ${fieldLabel}`);
      editIcon.innerHTML = EDIT_ICON_SVG;
      el.style.position = "relative";
      el.appendChild(editIcon);

      const handleEditClick = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();

        // Read current values from edit mode state using getFieldValue
        const block = (useEditStore.getState().blocks ?? [])[blockIndex] as
          | Record<string, unknown>
          | undefined;
        const currentValues = block
          ? ((getFieldValue(block, fieldPath) as Record<string, unknown>) ?? {})
          : {};

        el.dispatchEvent(
          new CustomEvent("edit:open-group-editor", {
            bubbles: true,
            detail: {
              blockIndex,
              fieldPath,
              groupType,
              fields: groupDescriptor.fields,
              currentValues,
              anchorEl: el,
            },
          })
        );
      };

      editIcon.addEventListener("click", handleEditClick);

      cleanups.current.push(() => {
        el.classList.remove("editable-field");
        el.removeAttribute("data-field-label");
        el.style.position = "";
        // Restore: replace the span with a text node
        const restoredText = document.createTextNode(
          labelSpan.textContent ?? ""
        );
        labelSpan.replaceWith(restoredText);
        editIcon.remove();
        labelCleanup();
      });
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

      // --- Group field elements ---
      const groupElements =
        container.querySelectorAll<HTMLElement>("[data-field-group]");
      for (const el of groupElements) {
        bindGroupElement(el);
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
    return entry.type !== "array" && entry.type !== "group"
      ? (entry as FieldDescriptor)
      : null;
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
    } else if (entry.type === "group") {
      current = (entry as GroupFieldDescriptor).fields;
    }
  }

  return null;
}
