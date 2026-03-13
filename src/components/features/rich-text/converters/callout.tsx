import { cn } from "@/core/lib/utils";

const variantConfig = {
  info: {
    border: "border-l-foreground/25",
    bg: "bg-muted/50",
    text: "text-muted-foreground",
    label: "Notice",
  },
  warning: {
    border: "border-l-foreground/40",
    bg: "bg-muted/60",
    text: "text-foreground/70",
    label: "Advisory",
  },
  tip: {
    border: "border-l-primary/40",
    bg: "bg-primary/5",
    text: "text-primary/80",
    label: "Guidance",
  },
  error: {
    border: "border-l-destructive/50",
    bg: "bg-destructive/5",
    text: "text-destructive/80",
    label: "Alert",
  },
} as const;

type CalloutVariant = keyof typeof variantConfig;

export function CalloutConverter({
  node,
}: {
  node: {
    fields: { variant?: CalloutVariant; title?: string; content?: string };
  };
}) {
  const variant = node.fields.variant ?? "info";
  const style = variantConfig[variant];

  return (
    <div
      className={cn(
        "not-prose my-6 rounded-r-md border-l-[3px] px-4 py-3",
        style.border,
        style.bg
      )}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <span
          className={cn(
            "font-medium text-[11px] uppercase tracking-[0.2em]",
            style.text
          )}
        >
          {style.label}
        </span>
      </div>
      {node.fields.title && (
        <p className="mb-1 font-semibold text-foreground text-sm">
          {node.fields.title}
        </p>
      )}
      <p className="text-muted-foreground text-sm leading-relaxed">
        {node.fields.content}
      </p>
    </div>
  );
}
