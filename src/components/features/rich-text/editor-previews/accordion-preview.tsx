"use client";

import { useBlockComponentContext } from "@payloadcms/richtext-lexical/client";
import { useFormFields } from "@payloadcms/ui";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function AccordionPreview() {
  const { BlockCollapsible } = useBlockComponentContext();

  const fields = useFormFields(([f]) => ({
    items: f.items?.value as
      | Array<{ title?: string; content?: string; id?: string }>
      | undefined,
  }));

  const items = fields.items ?? [];

  return (
    <BlockCollapsible>
      <div className="overflow-hidden rounded-md border border-border">
        {items.length === 0 ? (
          <div className="px-3.5 py-2.5 text-sm" style={{ color: "var(--theme-elevation-500)" }}>
            No items added yet — click edit to add items
          </div>
        ) : (
          items.map((item, i) => (
            <div
              className="flex items-center justify-between px-3.5 py-2.5"
              key={item.id ?? i}
              style={{ borderBottom: i < items.length - 1 ? "1px solid var(--theme-elevation-150)" : undefined }}
            >
              <span className="font-medium text-[13px]" style={{ color: "var(--theme-text)" }}>
                {item.title || "Untitled"}
              </span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={12}
                style={{ color: "var(--theme-elevation-500)" }}
              />
            </div>
          ))
        )}
        {items.length > 0 && (
          <div
            className="px-3.5 py-1.5 text-center text-[10px] italic"
            style={{ borderTop: "1px solid var(--theme-elevation-150)", color: "var(--theme-elevation-500)" }}
          >
            {items.length} item{items.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </BlockCollapsible>
  );
}
