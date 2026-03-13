"use client";

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

interface ButtonPreviewProps {
  formData: Record<string, unknown>;
  nodeKey: string;
}

export function ButtonPreview({ formData }: ButtonPreviewProps) {
  const label = formData.label as string | undefined;
  const variant = (formData.variant as ButtonVariant) ?? "primary";
  const size = (formData.size as ButtonSize) ?? "md";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-semibold",
        variantClasses[variant],
        sizeClasses[size]
      )}
    >
      {label || "Button"}
    </span>
  );
}
