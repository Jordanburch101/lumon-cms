"use client";

import { useBlockComponentContext } from "@payloadcms/richtext-lexical/client";
import { RenderFields, useFormFields } from "@payloadcms/ui";
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
  const { BlockCollapsible, formSchema } = useBlockComponentContext();

  const fields = useFormFields(([f]) => ({
    label: f.label?.value as string | undefined,
    variant: f.variant?.value as ButtonVariant | undefined,
    size: f.size?.value as ButtonSize | undefined,
  }));

  const variant = fields.variant ?? "primary";
  const size = fields.size ?? "md";

  return (
    <BlockCollapsible>
      <div className="mb-3">
        <span
          className={cn(
            "inline-flex items-center rounded-md font-semibold",
            variantClasses[variant],
            sizeClasses[size]
          )}
        >
          {fields.label || "Button"}
        </span>
      </div>
      <RenderFields
        fields={formSchema}
        forceRender
        parentIndexPath=""
        parentPath=""
        parentSchemaPath=""
        permissions
      />
    </BlockCollapsible>
  );
}
