"use client";

import Image from "next/image";
import { cn } from "@/core/lib/utils";

interface MediaPreviewProps {
  formData: Record<string, unknown>;
  nodeKey: string;
}

export function MediaPreview({ formData }: MediaPreviewProps) {
  const mediaSrc = formData.mediaSrc as
    | { url?: string }
    | number
    | undefined;
  const caption = formData.caption as string | undefined;
  const credit = formData.credit as string | undefined;
  const size = (formData.size as string) ?? "full";
  const alignment = (formData.alignment as string) ?? "center";

  const mediaUrl =
    mediaSrc && typeof mediaSrc === "object" ? mediaSrc.url : null;

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
        {credit && (
          <span className="absolute right-2 bottom-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white/80 backdrop-blur-sm">
            {credit}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between px-2.5 py-2">
        <span className="text-muted-foreground text-xs">
          {caption || "No caption"}
        </span>
        <span
          className={cn(
            "rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
          )}
        >
          {size} · {alignment}
        </span>
      </div>
    </div>
  );
}
