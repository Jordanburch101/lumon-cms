"use client";

import { useEffect } from "react";
import { renderBlock } from "@/components/blocks/render-blocks";
import { useEditRuntime } from "./edit-runtime";
import { useEditMode } from "./use-edit-mode";

/**
 * When edit mode is active, renders blocks from client state with
 * edit controls. Sets data-editing on <main> to hide the SSR content.
 */
export function EditableOverlay() {
  const editMode = useEditMode();

  useEditRuntime();

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) {
      return;
    }
    if (editMode?.state.active) {
      main.setAttribute("data-editing", "true");
    }
    return () => main.removeAttribute("data-editing");
  }, [editMode?.state.active]);

  if (!editMode?.state.active) {
    return null;
  }

  return (
    <div className="frontend-editor-overlay">
      <div className="flex flex-col gap-16 lg:gap-32">
        {editMode.state.blocks.map((block, index) => (
          <div
            data-block-index={index}
            data-block-type={block.blockType}
            key={block.id}
          >
            {renderBlock(block)}
          </div>
        ))}
      </div>
    </div>
  );
}
