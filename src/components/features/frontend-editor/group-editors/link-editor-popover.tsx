"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/core/lib/utils";
import type { FieldDescriptor } from "@/payload/lib/field-map/types";
import {
  type GroupEditorProps,
  registerGroupEditor,
} from "../group-editor-registry";
import { useEditModeRequired } from "../use-edit-mode";

// --- Types ---

interface PageResult {
  collection: string;
  id: number;
  slug: string;
  title: string;
}

// --- Helpers ---

function SegmentedToggle({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  return (
    <div className="flex gap-1 rounded-md bg-muted p-0.5">
      {options.map((opt) => (
        <button
          className={cn(
            "flex-1 rounded px-3 py-1.5 font-medium text-xs transition-colors",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          key={opt.value}
          onClick={() => onChange(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function PillSelector({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  return (
    <div>
      <div className="mb-1.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            className={cn(
              "flex-1 rounded border px-2 py-1.5 text-center font-medium text-[11px] transition-colors",
              value === opt.value
                ? "border-border bg-muted text-foreground"
                : "border-transparent bg-muted/50 text-muted-foreground hover:text-foreground"
            )}
            key={opt.value}
            onClick={() => onChange(opt.value)}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PageCombobox({
  onChange,
  value,
}: {
  onChange: (ref: { relationTo: string; value: number } | null) => void;
  value: { relationTo: string; value: number } | null;
}) {
  const [query, setQuery] = useState("");
  const [pages, setPages] = useState<PageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchPages = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/search?q=${encodeURIComponent(q)}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages("");
    return () => clearTimeout(debounceRef.current);
  }, [fetchPages]);

  const handleSearch = (q: string) => {
    setQuery(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPages(q), 300);
  };

  const selectedPage = pages.find(
    (p) => p.id === value?.value && p.collection === value?.relationTo
  );

  return (
    <div>
      <div className="mb-1.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
        Page
      </div>
      <Command className="rounded-md border" shouldFilter={false}>
        <CommandInput
          className="h-8 text-xs"
          onValueChange={handleSearch}
          placeholder={selectedPage?.title ?? "Search pages..."}
          value={query}
        />
        <CommandList className="max-h-32">
          <CommandEmpty className="py-2 text-center text-muted-foreground text-xs">
            {loading ? "Searching..." : "No pages found"}
          </CommandEmpty>
          {pages.map((page) => (
            <CommandItem
              className="text-xs"
              key={`${page.collection}-${page.id}`}
              onSelect={() => {
                onChange({ relationTo: page.collection, value: page.id });
                setQuery("");
              }}
              value={`${page.collection}-${page.id}`}
            >
              <span className="truncate">{page.title}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">
                /{page.slug}
              </span>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
      {value && (
        <button
          className="mt-1 text-[10px] text-muted-foreground hover:text-foreground"
          onClick={() => onChange(null)}
          type="button"
        >
          Clear selection
        </button>
      )}
    </div>
  );
}

// --- Main Component ---

function LinkEditorPopover({
  anchorEl,
  blockIndex,
  currentValues,
  fieldPath,
  fields,
  onClose,
}: GroupEditorProps) {
  const { actions } = useEditModeRequired();

  // Snapshot the anchor's bounding rect at open time so the popover stays
  // pinned even if the underlying DOM element re-renders or unmounts
  // (e.g. when toggling between internal/external link type).
  const [frozenRect] = useState(() => anchorEl.getBoundingClientRect());
  const anchorRef = useRef<HTMLElement>({
    getBoundingClientRect: () => frozenRect,
  } as HTMLElement);

  // Local state initialized from currentValues — avoids stale reads when user edits fields.
  const [linkType, setLinkType] = useState(
    (currentValues.type as string) ?? "external"
  );
  const [url, setUrl] = useState((currentValues.url as string) ?? "");
  const [newTab, setNewTab] = useState(
    (currentValues.newTab as boolean) ?? false
  );
  const [reference, setReference] = useState(
    currentValues.reference as { relationTo: string; value: number } | null
  );
  const [appearanceType, setAppearanceType] = useState(
    (currentValues.appearanceType as string) ?? ""
  );
  const [buttonVariant, setButtonVariant] = useState(
    (currentValues.buttonVariant as string) ?? ""
  );
  const [buttonSize, setButtonSize] = useState(
    (currentValues.buttonSize as string) ?? ""
  );
  const [linkVariant, setLinkVariant] = useState(
    (currentValues.linkVariant as string) ?? ""
  );

  const update = useCallback(
    (subField: string, value: unknown) => {
      actions.updateField(blockIndex, `${fieldPath}.${subField}`, value);
    },
    [actions, blockIndex, fieldPath]
  );

  // Appearance fields — only render if they exist in the field descriptors
  const hasAppearance =
    "buttonVariant" in fields ||
    "buttonSize" in fields ||
    "linkVariant" in fields;

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open
    >
      <PopoverAnchor virtualRef={anchorRef} />
      <PopoverContent align="start" className="w-80 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
            Edit Link
          </span>
          <button
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            <svg
              aria-labelledby="close-link-editor"
              fill="none"
              height="14"
              role="img"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="14"
            >
              <title id="close-link-editor">Close</title>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-3 px-4 py-3">
          {/* Type toggle */}
          <SegmentedToggle
            onChange={(v) => {
              setLinkType(v);
              update("type", v);
            }}
            options={[
              { label: "External", value: "external" },
              { label: "Internal", value: "internal" },
            ]}
            value={linkType}
          />

          {/* Destination field — switches based on type */}
          {linkType === "external" ? (
            <div>
              <div className="mb-1.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                URL
              </div>
              <Input
                className="h-8 text-xs"
                defaultValue={url}
                onBlur={(e) => {
                  setUrl(e.target.value);
                  update("url", e.target.value);
                }}
                placeholder="https://..."
              />
            </div>
          ) : (
            <PageCombobox
              onChange={(ref) => {
                setReference(ref);
                update("reference", ref);
              }}
              value={reference}
            />
          )}

          {/* New Tab */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-muted-foreground text-xs">
              Open in new tab
            </span>
            <Switch
              checked={newTab}
              onCheckedChange={(v) => {
                setNewTab(v);
                update("newTab", v);
              }}
            />
          </div>

          {/* Appearance section — only if configured */}
          {hasAppearance && (
            <>
              <div className="border-t" />

              {fields.appearanceType && (
                <SegmentedToggle
                  onChange={(v) => {
                    setAppearanceType(v);
                    update("appearanceType", v);
                  }}
                  options={
                    (fields.appearanceType as FieldDescriptor).options ?? []
                  }
                  value={appearanceType}
                />
              )}

              {fields.buttonVariant && appearanceType === "button" && (
                <PillSelector
                  label="Variant"
                  onChange={(v) => {
                    setButtonVariant(v);
                    update("buttonVariant", v);
                  }}
                  options={
                    (fields.buttonVariant as FieldDescriptor).options ?? []
                  }
                  value={buttonVariant}
                />
              )}

              {fields.buttonSize && appearanceType === "button" && (
                <PillSelector
                  label="Size"
                  onChange={(v) => {
                    setButtonSize(v);
                    update("buttonSize", v);
                  }}
                  options={(fields.buttonSize as FieldDescriptor).options ?? []}
                  value={buttonSize}
                />
              )}

              {fields.linkVariant && appearanceType === "link" && (
                <PillSelector
                  label="Variant"
                  onChange={(v) => {
                    setLinkVariant(v);
                    update("linkVariant", v);
                  }}
                  options={
                    (fields.linkVariant as FieldDescriptor).options ?? []
                  }
                  value={linkVariant}
                />
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Register in the group editor registry
registerGroupEditor("link", LinkEditorPopover);

export { LinkEditorPopover };
