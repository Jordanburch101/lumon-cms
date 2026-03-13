"use client";

import { useBlockComponentContext } from "@payloadcms/richtext-lexical/client";
import { useFormFields } from "@payloadcms/ui";
import { cn } from "@/core/lib/utils";

const YOUTUBE_RE = /youtube\.com|youtu\.be/;
const VIMEO_RE = /vimeo\.com/;
const X_RE = /x\.com|twitter\.com/;

function detectProvider(url: string): { name: string; color: string } {
  if (YOUTUBE_RE.test(url)) {
    return { name: "YouTube", color: "bg-red-600" };
  }
  if (VIMEO_RE.test(url)) {
    return { name: "Vimeo", color: "bg-sky-500" };
  }
  if (X_RE.test(url)) {
    return { name: "X", color: "bg-foreground" };
  }
  return { name: "Embed", color: "bg-muted-foreground" };
}

export function EmbedPreview() {
  const { BlockCollapsible } = useBlockComponentContext();

  const fields = useFormFields(([f]) => ({
    url: f.url?.value as string | undefined,
    aspectRatio: f.aspectRatio?.value as string | undefined,
    maxWidth: f.maxWidth?.value as string | undefined,
  }));

  const url = fields.url ?? "";
  const provider = detectProvider(url);

  return (
    <BlockCollapsible>
      <div className="flex items-center gap-2.5 rounded-md border border-border p-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
            provider.color
          )}
        >
          <span className="font-bold text-white text-xs">▶</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-xs" style={{ color: "var(--theme-text)" }}>
            {url || "No URL entered"}
          </p>
          <p className="mt-0.5 text-[10px]" style={{ color: "var(--theme-elevation-500)" }}>
            {provider.name} · {fields.aspectRatio ?? "16:9"} · {fields.maxWidth ?? "large"}
          </p>
        </div>
      </div>
    </BlockCollapsible>
  );
}
