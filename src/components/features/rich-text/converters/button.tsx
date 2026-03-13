import { cn } from "@/core/lib/utils";

const variantClasses = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary:
    "border border-border bg-transparent text-foreground hover:bg-muted",
  outline:
    "border border-border bg-transparent text-muted-foreground hover:text-foreground",
} as const;

const sizeClasses = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-5 py-2 text-sm",
  lg: "px-6 py-2.5 text-sm",
} as const;

type ButtonVariant = keyof typeof variantClasses;
type ButtonSize = keyof typeof sizeClasses;

export function ButtonConverter({
  node,
}: {
  node: {
    fields: {
      label: string;
      href: string;
      variant?: ButtonVariant;
      size?: ButtonSize;
      newTab?: boolean;
    };
  };
}) {
  const variant = node.fields.variant ?? "primary";
  const size = node.fields.size ?? "md";

  return (
    <a
      className={cn(
        "not-prose my-4 inline-flex items-center rounded-md font-semibold transition-colors",
        variantClasses[variant],
        sizeClasses[size]
      )}
      href={node.fields.href}
      {...(node.fields.newTab
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {node.fields.label}
    </a>
  );
}
