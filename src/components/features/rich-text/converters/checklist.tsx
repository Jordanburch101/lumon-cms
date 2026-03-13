import { defaultJSXConverters } from "@payloadcms/richtext-lexical/react";
import { cn } from "@/core/lib/utils";

type ListNode = {
  listType: string;
  tag: string;
  children: Array<{
    type: string;
    checked?: boolean;
    children?: Array<Record<string, unknown>>;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

type ConverterArgs = {
  node: ListNode;
  nodesToJSX: (args: {
    nodes: Array<Record<string, unknown>>;
  }) => JSX.Element[];
  parent: Record<string, unknown>;
};

const defaultListConverter = defaultJSXConverters.list;

function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <span
      aria-checked={checked}
      className={cn(
        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-transparent dark:bg-input/30"
      )}
      role="checkbox"
    >
      {checked && (
        <svg
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
      )}
    </span>
  );
}

export function listConverter(args: ConverterArgs) {
  const { node, nodesToJSX } = args;

  if (node.listType !== "check") {
    return (defaultListConverter as (args: ConverterArgs) => JSX.Element)(args);
  }

  return (
    <ul className="not-prose my-6 space-y-3">
      {node.children.map((item, i) => {
        const checked = item.checked ?? false;
        return (
          <li className="flex items-start gap-3" key={(item.id as string) ?? i}>
            <CheckIcon checked={checked} />
            <span
              className={cn(
                "text-sm leading-relaxed",
                checked ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {item.children ? nodesToJSX({ nodes: item.children }) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
