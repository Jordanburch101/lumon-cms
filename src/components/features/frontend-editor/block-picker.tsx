"use client";

import { AddCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/core/lib/utils";
import { blockMeta } from "@/generated/field-map";
import { createDefaultBlock } from "./default-block-values";
import { useEditModeRequired } from "./use-edit-mode";

export interface AddBlockButtonProps {
  /** The index at which the new block will be inserted (0 = before first block). */
  index: number;
}

/**
 * A subtle dashed divider between blocks that becomes visible on hover.
 * Clicking it opens a popover listing all available block types.
 */
export function AddBlockButton({ index }: AddBlockButtonProps) {
  const { actions } = useEditModeRequired();
  const [open, setOpen] = useState(false);

  function handleSelect(slug: string) {
    const newBlock = createDefaultBlock(slug);
    actions.addBlockAction(index, newBlock);
    setOpen(false);
  }

  const blockEntries = Object.values(blockMeta);

  return (
    <div className="group relative flex h-8 items-center justify-center">
      {/* Dashed separator line — visible on hover */}
      <div
        className={cn(
          "absolute inset-x-0 top-1/2 h-px -translate-y-1/2",
          "border-transparent border-t border-dashed",
          "transition-colors duration-200",
          "group-hover:border-blue-500/40 dark:group-hover:border-blue-400/30",
          open && "border-blue-500/40 dark:border-blue-400/30"
        )}
      />

      {/* Add button — centered on the line */}
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-label="Add block"
            className={cn(
              "relative z-10 h-6 w-6 rounded-full p-0",
              "border border-transparent border-dashed",
              "bg-background text-muted-foreground",
              "opacity-0 transition-all duration-200",
              "group-hover:opacity-100",
              "hover:border-blue-500/50 hover:text-blue-500",
              "dark:hover:border-blue-400/40 dark:hover:text-blue-400",
              open &&
                "border-blue-500/50 text-blue-500 opacity-100 dark:border-blue-400/40 dark:text-blue-400"
            )}
            size="icon"
            type="button"
            variant="ghost"
          >
            <HugeiconsIcon icon={AddCircleIcon} size={14} strokeWidth={1.5} />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="center"
          className="w-56 p-1"
          side="bottom"
          sideOffset={6}
        >
          <p className="px-2 py-1.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
            Add Block
          </p>
          <div className="flex flex-col gap-0.5">
            {blockEntries.map((meta) => (
              <button
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                  "text-foreground transition-colors",
                  "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                )}
                key={meta.slug}
                onClick={() => handleSelect(meta.slug)}
                type="button"
              >
                <span className="font-mono text-[10px] text-muted-foreground">
                  {meta.slug}
                </span>
                <span className="ml-auto text-xs">{meta.label}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
