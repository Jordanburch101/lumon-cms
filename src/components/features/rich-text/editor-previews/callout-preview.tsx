"use client";

import { useBlockComponentContext } from "@payloadcms/richtext-lexical/client";
import { useFormFields } from "@payloadcms/ui";
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

export function CalloutPreview() {
  const { BlockCollapsible } = useBlockComponentContext();

  const fields = useFormFields(([f]) => ({
    variant: f.variant?.value as CalloutVariant | undefined,
    title: f.title?.value as string | undefined,
    content: f.content?.value as string | undefined,
  }));

  const variant = fields.variant ?? "info";
  const style = variantStyles[variant];

  return (
    <BlockCollapsible
      Pill={
        <span className={cn("rounded px-2 py-0.5 text-[11px] font-medium", style.bg, style.text)}>
          {style.label}
        </span>
      }
    >
      <div
        className={cn(
          "rounded border-l-[3px] px-3.5 py-3",
          style.border,
          style.bg
        )}
      >
        {fields.title && (
          <p className="mb-1 font-medium text-sm" style={{ color: "var(--theme-text)" }}>
            {fields.title}
          </p>
        )}
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--theme-elevation-500)" }}>
          {fields.content || "Callout content..."}
        </p>
      </div>
    </BlockCollapsible>
  );
}
