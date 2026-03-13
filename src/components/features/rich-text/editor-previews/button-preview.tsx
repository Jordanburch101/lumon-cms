"use client";

import { useBlockComponentContext } from "@payloadcms/richtext-lexical/client";
import { useFormFields } from "@payloadcms/ui";
import { cn } from "@/core/lib/utils";

const variantClasses = {
  primary: "bg-primary text-primary-foreground",
  secondary: "border border-border bg-transparent text-foreground",
  outline: "border border-border bg-transparent text-muted-foreground",
} as const;

const sizeClasses = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-5 py-2 text-sm",
  lg: "px-6 py-2.5 text-sm",
} as const;

type ButtonVariant = keyof typeof variantClasses;
type ButtonSize = keyof typeof sizeClasses;

export function ButtonPreview() {
  const { BlockCollapsible } = useBlockComponentContext();

  const fields = useFormFields(([f]) => ({
    label: f.label?.value as string | undefined,
    href: f.href?.value as string | undefined,
    variant: f.variant?.value as ButtonVariant | undefined,
    size: f.size?.value as ButtonSize | undefined,
    newTab: f.newTab?.value as boolean | undefined,
  }));

  const variant = fields.variant ?? "primary";
  const size = fields.size ?? "md";

  return (
    <BlockCollapsible>
      <div className="flex items-center gap-3 py-1">
        <span
          className={cn(
            "inline-flex items-center rounded-md font-semibold",
            variantClasses[variant],
            sizeClasses[size]
          )}
        >
          {fields.label || "Button"}
        </span>
        {fields.href && (
          <span className="truncate font-mono text-[11px]" style={{ color: "var(--theme-elevation-500)" }}>
            → {fields.href}
          </span>
        )}
        {fields.newTab && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]" style={{ color: "var(--theme-elevation-500)" }}>
            new tab
          </span>
        )}
      </div>
    </BlockCollapsible>
  );
}
