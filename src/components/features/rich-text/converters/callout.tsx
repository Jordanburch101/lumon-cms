import { cn } from "@/core/lib/utils";

const variantConfig = {
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
        "not-prose my-6 rounded-md border-l-[3px] px-4 py-3",
        style.border,
        style.bg
      )}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <span
          className={cn(
            "font-semibold text-[11px] uppercase tracking-[0.05em]",
            style.text
          )}
        >
          {style.label}
        </span>
      </div>
      {node.fields.title && (
        <p className="mb-1 font-semibold text-foreground">
          {node.fields.title}
        </p>
      )}
      <p className="text-muted-foreground text-sm leading-relaxed">
        {node.fields.content}
      </p>
    </div>
  );
}
