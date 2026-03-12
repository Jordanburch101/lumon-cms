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
      className="flex items-center rounded-lg border-none bg-white/[0.06] p-0.5"
    >
      <button
        className={cn(
          "rounded-md px-2.5 py-1 font-medium text-[11px] transition-colors",
          isDraft
            ? "text-white/40 hover:text-white/60"
            : "bg-white/[0.1] text-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
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
            ? "bg-white/[0.1] text-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
            : "text-white/40 hover:text-white/60"
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
