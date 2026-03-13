import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type {
  JSXConverter,
  JSXConverters,
} from "@payloadcms/richtext-lexical/react";
import {
  defaultJSXConverters,
  RichText as PayloadRichText,
} from "@payloadcms/richtext-lexical/react";
import { cn } from "@/core/lib/utils";
import { customBlockConverters, customNodeConverters } from "./converters";

const sizeClasses = {
  sm: "prose-sm",
  md: "prose-base",
  lg: "prose-lg",
} as const;

const proseClasses = [
  "prose dark:prose-invert max-w-none",
  "prose-headings:font-semibold prose-headings:leading-tight prose-headings:tracking-tight",
  "prose-p:text-muted-foreground",
  "prose-a:text-foreground prose-a:underline-offset-4 prose-a:decoration-border hover:prose-a:decoration-foreground",
  "prose-blockquote:border-border prose-blockquote:text-muted-foreground",
  "prose-code:font-mono prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.875em]",
  "prose-hr:border-border",
  "prose-img:hidden",
].join(" ");

type RichTextSize = keyof typeof sizeClasses;

export interface RichTextProps {
  className?: string;
  converters?: Partial<JSXConverters>;
  data: SerializedEditorState | null | undefined;
  disableBlocks?: string[];
  size?: RichTextSize;
}

function hasContent(data: SerializedEditorState): boolean {
  const children = data?.root?.children;
  if (!children || children.length === 0) {
    return false;
  }
  if (
    children.length === 1 &&
    children[0].type === "paragraph" &&
    (!("children" in children[0]) ||
      (children[0] as { children?: unknown[] }).children?.length === 0)
  ) {
    return false;
  }
  return true;
}

export function RichText({
  data,
  size = "md",
  converters: consumerConverters = {},
  disableBlocks = [],
  className,
}: RichTextProps) {
  // Edge cases: null, undefined, empty, or malformed data
  if (!data) {
    return null;
  }
  if (!data.root?.children) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[RichText] Malformed data: missing root.children", data);
    }
    return null;
  }
  if (!hasContent(data)) {
    return null;
  }

  // Build block converters: custom defaults + consumer overrides - disabled blocks
  const consumerBlocks =
    // biome-ignore lint/suspicious/noExplicitAny: matches Payload's JSXConverter generic
    (consumerConverters as { blocks?: Record<string, JSXConverter<any>> })
      .blocks ?? {};
  const blockConverters = {
    ...customBlockConverters,
    ...consumerBlocks,
  };

  for (const slug of disableBlocks) {
    delete blockConverters[slug];
  }

  // Deep merge: default JSX converters + custom node converters + consumer overrides
  const mergedConverters: JSXConverters = {
    ...defaultJSXConverters,
    ...customNodeConverters,
    ...consumerConverters,
    blocks: blockConverters,
  };

  return (
    <div className={cn(proseClasses, sizeClasses[size], className)}>
      <PayloadRichText converters={mergedConverters} data={data} />
    </div>
  );
}
