import type { JSXConverter } from "@payloadcms/richtext-lexical/react";
import { defaultJSXConverters } from "@payloadcms/richtext-lexical/react";
import type { ReactNode } from "react";
import { cn } from "@/core/lib/utils";

interface ChecklistItem {
  checked?: boolean;
  children?: Record<string, unknown>[];
  id?: string;
  type: string;
  [key: string]: unknown;
}

interface ListNode {
  children: ChecklistItem[];
  listType: string;
  tag: string;
  [key: string]: unknown;
}

const defaultListConverter = defaultJSXConverters.list;

function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-transparent dark:bg-input/30"
      )}
    >
      {checked && (
        <svg
          aria-hidden="true"
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

// biome-ignore lint/suspicious/noExplicitAny: Must match Payload's JSXConverter signature
export const listConverter: JSXConverter<any> = (args) => {
  const node = args.node as unknown as ListNode;
  const nodesToJSX = args.nodesToJSX as (args: {
    nodes: Record<string, unknown>[];
  }) => ReactNode[];

  if (node.listType !== "check") {
    // biome-ignore lint/suspicious/noExplicitAny: delegate to default converter
    return (defaultListConverter as unknown as (a: any) => ReactNode)(args);
  }

  return (
    <ul className="not-prose my-6 space-y-3">
      {node.children.map((item, i) => {
        const checked = item.checked ?? false;
        return (
          <li className="flex items-start gap-3" key={item.id ?? i}>
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
};
