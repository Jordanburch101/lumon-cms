"use client";

import { RenderBlocks } from "@/components/blocks/render-blocks";
import { useEditModeRequired } from "./use-edit-mode";

/**
 * Client wrapper that renders blocks from edit mode context state.
 * Used by EditableOverlay when edit mode is active.
 */
export function RenderBlocksClient() {
  const { state } = useEditModeRequired();
  return <RenderBlocks blocks={state.blocks} />;
}
