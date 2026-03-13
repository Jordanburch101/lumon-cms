"use client";

import { useBlockComponentContext } from "@payloadcms/richtext-lexical/client";
import { useFormFields } from "@payloadcms/ui";
import { cn } from "@/core/lib/utils";

export function MediaPreview() {
  const { BlockCollapsible } = useBlockComponentContext();

  const fields = useFormFields(([f]) => ({
    mediaSrc: f.mediaSrc?.value as { filename?: string; url?: string; mimeType?: string } | number | undefined,
    caption: f.caption?.value as string | undefined,
    credit: f.credit?.value as string | undefined,
    size: (f.size?.value as string) ?? "full",
    alignment: (f.alignment?.value as string) ?? "center",
  }));

  const hasMedia = fields.mediaSrc != null;
  const filename =
    typeof fields.mediaSrc === "object" ? fields.mediaSrc.filename : null;

  return (
    <BlockCollapsible>
      <div className="rounded-md border border-border overflow-hidden">
        <div
          className="flex h-20 items-center justify-center"
          style={{ background: "var(--theme-elevation-50)" }}
        >
          {hasMedia ? (
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" style={{ color: "var(--theme-elevation-500)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <span className="text-sm font-medium" style={{ color: "var(--theme-text)" }}>
                {filename || "Media selected"}
              </span>
            </div>
          ) : (
            <span className="text-sm" style={{ color: "var(--theme-elevation-500)" }}>
              No media selected
            </span>
          )}
        </div>
        <div
          className="flex items-center justify-between px-2.5 py-2"
          style={{ borderTop: "1px solid var(--theme-elevation-150)" }}
        >
          <span className="text-xs" style={{ color: "var(--theme-elevation-500)" }}>
            {fields.caption || "No caption"}
          </span>
          <div className="flex items-center gap-2">
            {fields.credit && (
              <span
                className={cn("rounded px-1.5 py-0.5 text-[10px] font-mono")}
                style={{ background: "var(--theme-elevation-100)", color: "var(--theme-elevation-500)" }}
              >
                © {fields.credit}
              </span>
            )}
            <span
              className="rounded px-1.5 py-0.5 font-mono text-[10px]"
              style={{ background: "var(--theme-elevation-100)", color: "var(--theme-elevation-500)" }}
            >
              {fields.size} · {fields.alignment}
            </span>
          </div>
        </div>
      </div>
    </BlockCollapsible>
  );
}
