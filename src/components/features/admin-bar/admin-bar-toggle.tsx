"use client";

import { cn } from "@/core/lib/utils";

interface AdminBarToggleProps {
  disabled?: boolean;
  isDraft: boolean;
  onToggle: () => void;
}

export function AdminBarToggle({
  isDraft,
  onToggle,
  disabled,
}: AdminBarToggleProps) {
  return (
    <fieldset
      aria-label="Content mode"
      className="flex items-center rounded-lg border-none bg-white/[0.04] p-0.5"
    >
      <button
        className={cn(
          "rounded-md px-2.5 py-1 font-medium text-[11px] transition-colors",
          isDraft
            ? "text-muted-foreground hover:text-foreground/70"
            : "bg-white/[0.08] text-foreground"
        )}
        disabled={disabled}
        onClick={isDraft ? onToggle : undefined}
        type="button"
      >
        Published
      </button>
      <button
        className={cn(
          "rounded-md px-2.5 py-1 font-medium text-[11px] transition-colors",
          isDraft
            ? "bg-white/[0.08] text-foreground"
            : "text-muted-foreground hover:text-foreground/70"
        )}
        disabled={disabled}
        onClick={isDraft ? undefined : onToggle}
        type="button"
      >
        Draft
      </button>
    </fieldset>
  );
}
