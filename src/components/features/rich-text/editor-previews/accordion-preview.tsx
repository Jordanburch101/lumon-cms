"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface AccordionPreviewProps {
  formData: Record<string, unknown>;
  nodeKey: string;
}

export function AccordionPreview({ formData }: AccordionPreviewProps) {
  const items = (formData.items as
    | Array<{ title?: string; content?: string; id?: string }>
    | undefined) ?? [];

  return (
    <div className="overflow-hidden rounded-md border border-border">
      {items.length === 0 ? (
        <div className="px-3.5 py-2.5 text-muted-foreground text-sm">
          No items added
        </div>
      ) : (
        items.map((item, i) => (
          <div
            className="flex items-center justify-between border-border border-b px-3.5 py-2.5 last:border-b-0"
            key={item.id ?? i}
          >
            <span className="font-medium text-[13px] text-foreground">
              {item.title || "Untitled"}
            </span>
            <HugeiconsIcon
              className="text-muted-foreground"
              icon={ArrowDown01Icon}
              size={12}
            />
          </div>
        ))
      )}
      {items.length > 0 && (
        <div className="border-border border-t px-3.5 py-1.5 text-center text-[10px] text-muted-foreground italic">
          {items.length} item{items.length !== 1 ? "s" : ""} · Collapsed in
          editor
        </div>
      )}
    </div>
  );
}
