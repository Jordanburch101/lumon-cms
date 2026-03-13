"use client";

import {
  AddCircleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/core/lib/utils";
import { fieldMap } from "@/generated/field-map";
import type { ArrayFieldDescriptor } from "@/payload/lib/field-map/types";
import { useEditModeRequired } from "./use-edit-mode";

export interface ArrayItemControlsProps {
  /** Dot-notation path to the array field, e.g. "rows" or "items". */
  arrayPath: string;
  blockIndex: number;
  /** Block type slug — used to derive minRows/maxRows from field map if not passed. */
  blockType?: string;
  itemIndex: number;
  maxRows?: number;
  minRows?: number;
  totalItems: number;
}

/**
 * Compact toolbar for array item reordering and management.
 * Renders top-right of a `data-array-item` element via CSS :hover.
 *
 * Move up/down — disabled at boundaries.
 * Remove — disabled when at minRows.
 * Add — only on the last item, disabled when at maxRows.
 */
export function ArrayItemControls({
  blockIndex,
  arrayPath,
  itemIndex,
  totalItems,
  minRows,
  maxRows,
  blockType,
}: ArrayItemControlsProps) {
  const { actions } = useEditModeRequired();

  // Resolve minRows/maxRows from field map if not explicitly provided
  let resolvedMin = minRows;
  let resolvedMax = maxRows;
  if ((resolvedMin === undefined || resolvedMax === undefined) && blockType) {
    const fields = fieldMap[blockType as keyof typeof fieldMap];
    if (fields) {
      const arrayField = fields[arrayPath] as ArrayFieldDescriptor | undefined;
      if (arrayField?.type === "array") {
        resolvedMin ??= arrayField.minRows;
        resolvedMax ??= arrayField.maxRows;
      }
    }
  }

  const isFirst = itemIndex === 0;
  const isLast = itemIndex === totalItems - 1;
  const atMin = resolvedMin !== undefined && totalItems <= resolvedMin;
  const atMax = resolvedMax !== undefined && totalItems >= resolvedMax;

  function handleMoveUp() {
    actions.moveArrayItemAction(
      blockIndex,
      arrayPath,
      itemIndex,
      itemIndex - 1
    );
  }

  function handleMoveDown() {
    actions.moveArrayItemAction(
      blockIndex,
      arrayPath,
      itemIndex,
      itemIndex + 1
    );
  }

  function handleRemove() {
    actions.removeArrayItemAction(blockIndex, arrayPath, itemIndex);
  }

  function handleAdd() {
    // Insert empty item after this one
    actions.addArrayItemAction(blockIndex, arrayPath, {
      id: crypto.randomUUID(),
    });
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex items-center gap-0.5 rounded-lg p-0.5",
          "border border-white/20 dark:border-white/10",
          "bg-white/70 dark:bg-black/50",
          "backdrop-blur-xl",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.07)]",
          "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.2)]"
        )}
      >
        {/* Move up */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Move item up"
              className="h-6 w-6 text-black/50 hover:text-black/80 dark:text-white/40 dark:hover:text-white/70"
              disabled={isFirst}
              onClick={handleMoveUp}
              size="icon"
              type="button"
              variant="ghost"
            >
              <HugeiconsIcon icon={ArrowUpIcon} size={11} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Move up</TooltipContent>
        </Tooltip>

        {/* Move down */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Move item down"
              className="h-6 w-6 text-black/50 hover:text-black/80 dark:text-white/40 dark:hover:text-white/70"
              disabled={isLast}
              onClick={handleMoveDown}
              size="icon"
              type="button"
              variant="ghost"
            >
              <HugeiconsIcon icon={ArrowDownIcon} size={11} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Move down</TooltipContent>
        </Tooltip>

        {/* Separator */}
        <div className="mx-0.5 h-3 w-px bg-black/[0.08] dark:bg-white/[0.08]" />

        {/* Remove */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Remove item"
              className="h-6 w-6 text-red-500/70 hover:bg-red-500/10 hover:text-red-500 dark:text-red-400/60 dark:hover:bg-red-400/10 dark:hover:text-red-400"
              disabled={atMin}
              onClick={handleRemove}
              size="icon"
              type="button"
              variant="ghost"
            >
              <HugeiconsIcon icon={Delete02Icon} size={11} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove item</TooltipContent>
        </Tooltip>

        {/* Add — only on last item */}
        {isLast && (
          <>
            <div className="mx-0.5 h-3 w-px bg-black/[0.08] dark:bg-white/[0.08]" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Add item"
                  className="h-6 w-6 text-blue-500/70 hover:bg-blue-500/10 hover:text-blue-500 dark:text-blue-400/60 dark:hover:bg-blue-400/10 dark:hover:text-blue-400"
                  disabled={atMax}
                  onClick={handleAdd}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <HugeiconsIcon
                    icon={AddCircleIcon}
                    size={11}
                    strokeWidth={2}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add item</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
