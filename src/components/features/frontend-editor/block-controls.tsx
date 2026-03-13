"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  Copy01Icon,
  Delete02Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/core/lib/utils";
import { blockMeta } from "@/generated/field-map";
import { BlockEditorDialog } from "./block-editor-dialog";
import { useEditModeRequired } from "./use-edit-mode";

export interface BlockControlsProps {
  blockIndex: number;
  blockType: string;
  totalBlocks: number;
}

/**
 * Floating toolbar that appears top-right of each block during edit mode.
 * Provides: block type label, move up/down, duplicate, and remove actions.
 */
export function BlockControls({
  blockIndex,
  blockType,
  totalBlocks,
}: BlockControlsProps) {
  const { actions } = useEditModeRequired();
  const [editorOpen, setEditorOpen] = useState(false);

  const label =
    blockMeta[blockType as keyof typeof blockMeta]?.label ?? blockType;

  const isFirst = blockIndex === 0;
  const isLast = blockIndex === totalBlocks - 1;

  return (
    <TooltipProvider>
      <div
        className={cn(
          // Glass morphism matching admin bar aesthetic
          "flex items-center gap-0.5 rounded-[10px] p-0.5",
          "border border-white/20 dark:border-white/10",
          "bg-white/60 dark:bg-black/40",
          "backdrop-blur-xl",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_4px_16px_rgba(0,0,0,0.08)]",
          "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.2)]"
        )}
      >
        {/* Block type label */}
        <Badge className="mx-1 font-mono text-[10px]" variant="outline">
          {label}
        </Badge>

        {/* Edit all fields */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Edit block fields"
              className="h-7 w-7 text-black/50 hover:text-black/80 dark:text-white/40 dark:hover:text-white/70"
              onClick={() => setEditorOpen(true)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <HugeiconsIcon
                icon={PencilEdit02Icon}
                size={13}
                strokeWidth={2}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit all fields</TooltipContent>
        </Tooltip>

        {/* Separator */}
        <div className="mx-0.5 h-4 w-px bg-black/[0.08] dark:bg-white/[0.08]" />

        {/* Move up */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Move block up"
              className="h-7 w-7 text-black/50 hover:text-black/80 dark:text-white/40 dark:hover:text-white/70"
              disabled={isFirst}
              onClick={() =>
                actions.moveBlockAction(blockIndex, blockIndex - 1)
              }
              size="icon"
              type="button"
              variant="ghost"
            >
              <HugeiconsIcon icon={ArrowUpIcon} size={13} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Move up</TooltipContent>
        </Tooltip>

        {/* Move down */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Move block down"
              className="h-7 w-7 text-black/50 hover:text-black/80 dark:text-white/40 dark:hover:text-white/70"
              disabled={isLast}
              onClick={() =>
                actions.moveBlockAction(blockIndex, blockIndex + 1)
              }
              size="icon"
              type="button"
              variant="ghost"
            >
              <HugeiconsIcon icon={ArrowDownIcon} size={13} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Move down</TooltipContent>
        </Tooltip>

        {/* Separator */}
        <div className="mx-0.5 h-4 w-px bg-black/[0.08] dark:bg-white/[0.08]" />

        {/* Duplicate */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Duplicate block"
              className="h-7 w-7 text-black/50 hover:text-black/80 dark:text-white/40 dark:hover:text-white/70"
              onClick={() => actions.duplicateBlockAction(blockIndex)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <HugeiconsIcon icon={Copy01Icon} size={13} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Duplicate</TooltipContent>
        </Tooltip>

        {/* Remove */}
        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button
                  aria-label="Remove block"
                  className="h-7 w-7 text-red-500/70 hover:bg-red-500/10 hover:text-red-500 dark:text-red-400/60 dark:hover:bg-red-400/10 dark:hover:text-red-400"
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    size={13}
                    strokeWidth={2}
                  />
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Remove block</TooltipContent>
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this block?</AlertDialogTitle>
              <AlertDialogDescription>
                The <strong>{label}</strong> block will be removed. This can be
                undone by discarding changes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => actions.removeBlockAction(blockIndex)}
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <BlockEditorDialog
        blockIndex={blockIndex}
        blockType={blockType}
        onOpenChange={setEditorOpen}
        open={editorOpen}
      />
    </TooltipProvider>
  );
}
