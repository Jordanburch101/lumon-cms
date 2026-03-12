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
    // biome-ignore lint/a11y/useSemanticElements: fieldset is for form controls, not segmented toggles
    <div
      aria-label="Content mode"
      className="flex items-center rounded-lg bg-black/[0.08] p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:bg-white/[0.08] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]"
      role="group"
    >
      <button
        aria-pressed={!isDraft}
        className={cn(
          "rounded-md px-2.5 py-1 font-medium text-[11px] transition-all duration-200",
          isDraft
            ? "text-black/50 hover:text-black/70 dark:text-white/40 dark:hover:text-white/60"
            : "bg-white/80 text-black shadow-[0_0_0_0.5px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.08)] dark:bg-white/[0.15] dark:text-white dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.06),0_1px_3px_rgba(0,0,0,0.3)]"
        )}
        disabled={disabled}
        onClick={isDraft ? onToggle : undefined}
        type="button"
      >
        Published
      </button>
      <button
        aria-pressed={isDraft}
        className={cn(
          "rounded-md px-2.5 py-1 font-medium text-[11px] transition-all duration-200",
          isDraft
            ? "bg-white/80 text-black shadow-[0_0_0_0.5px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.08)] dark:bg-white/[0.15] dark:text-white dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.06),0_1px_3px_rgba(0,0,0,0.3)]"
            : "text-black/50 hover:text-black/70 dark:text-white/40 dark:hover:text-white/60"
        )}
        disabled={disabled}
        onClick={isDraft ? undefined : onToggle}
        type="button"
      >
        Draft
      </button>
    </div>
  );
}
