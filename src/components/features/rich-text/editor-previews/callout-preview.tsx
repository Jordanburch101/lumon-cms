"use client";

import { cn } from "@/core/lib/utils";

const variantStyles = {
  info: {
    border: "border-l-blue-500",
    bg: "bg-blue-500/5",
    text: "text-blue-500",
    label: "Info",
  },
  warning: {
    border: "border-l-amber-500",
    bg: "bg-amber-500/5",
    text: "text-amber-500",
    label: "Warning",
  },
  tip: {
    border: "border-l-green-500",
    bg: "bg-green-500/5",
    text: "text-green-500",
    label: "Tip",
  },
  error: {
    border: "border-l-red-500",
    bg: "bg-red-500/5",
    text: "text-red-500",
    label: "Error",
  },
} as const;

type CalloutVariant = keyof typeof variantStyles;

interface CalloutPreviewProps {
  formData: Record<string, unknown>;
  nodeKey: string;
}

export function CalloutPreview({ formData }: CalloutPreviewProps) {
  const variant = (formData.variant as CalloutVariant) ?? "info";
  const title = formData.title as string | undefined;
  const content = formData.content as string | undefined;
  const style = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded border-l-[3px] px-3.5 py-3",
        style.border,
        style.bg
      )}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <span
          className={cn(
            "font-semibold text-[11px] uppercase tracking-[0.05em]",
            style.text
          )}
        >
          {style.label}
        </span>
      </div>
      {title && (
        <p className="mb-1 font-medium text-foreground text-sm">
          {title}
        </p>
      )}
      <p className="text-[13px] text-muted-foreground leading-relaxed">
        {content || "Callout content..."}
      </p>
    </div>
  );
}
