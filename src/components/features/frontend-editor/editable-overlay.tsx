"use client";

import { useEffect } from "react";
import { renderBlock } from "@/components/blocks/render-blocks";
import { BlockControls } from "./block-controls";
import { AddBlockButton } from "./block-picker";
import { useEditRuntime } from "./edit-runtime";
import { FieldEditorOrchestrator } from "./field-editor-orchestrator";
import { useBeforeUnloadGuard, useEditMode } from "./use-edit-mode";

/**
 * When edit mode is active, renders blocks from client state with
 * edit controls. Sets data-editing on <main> to hide the SSR content.
 */
export function EditableOverlay() {
  const editMode = useEditMode();

  useEditRuntime();
  useBeforeUnloadGuard();

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

  const blocks = editMode.state.blocks;

  return (
    <div className="frontend-editor-overlay">
      {/* Add button before the first block */}
      <AddBlockButton index={0} />

      <div className="flex flex-col">
        {blocks.map((block, index) => (
          <div key={block.id}>
            {/* Block wrapper with relative positioning for the toolbar */}
            <div
              className="relative"
              data-block-index={index}
              data-block-type={block.blockType}
            >
              {/* Block controls toolbar — top-right overlay */}
              <div className="absolute top-3 right-3 z-10">
                <BlockControls
                  blockIndex={index}
                  blockType={block.blockType}
                  totalBlocks={blocks.length}
                />
              </div>

              {renderBlock(block)}
            </div>

            {/* Add button after each block */}
            <AddBlockButton index={index + 1} />
          </div>
        ))}
      </div>
      <FieldEditorOrchestrator />
    </div>
  );
}
