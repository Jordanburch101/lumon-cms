"use client";

import { useFormFields } from "@payloadcms/ui";
import Image from "next/image";
import { cn } from "@/core/lib/utils";

export function MediaPreview() {
  const fields = useFormFields(([f]) => ({
    mediaSrc: f.mediaSrc?.value as { url?: string } | number | undefined,
    caption: f.caption?.value as string | undefined,
    credit: f.credit?.value as string | undefined,
    size: f.size?.value as string | undefined,
    alignment: f.alignment?.value as string | undefined,
  }));

  const mediaUrl =
    fields.mediaSrc && typeof fields.mediaSrc === "object"
      ? fields.mediaSrc.url
      : null;

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="relative flex h-32 items-center justify-center bg-muted">
        {mediaUrl ? (
          <Image
            alt=""
            className="h-full w-full object-cover"
            fill
            src={mediaUrl}
            unoptimized
          />
        ) : (
          <span className="text-muted-foreground text-sm">
            No media selected
          </span>
        )}
        {fields.credit && (
          <span className="absolute right-2 bottom-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white/80 backdrop-blur-sm">
            {fields.credit}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between px-2.5 py-2">
        <span className="text-muted-foreground text-xs">
          {fields.caption || "No caption"}
        </span>
        <span
          className={cn(
            "rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
          )}
        >
          {fields.size ?? "full"} · {fields.alignment ?? "center"}
        </span>
      </div>
    </div>
  );
}
