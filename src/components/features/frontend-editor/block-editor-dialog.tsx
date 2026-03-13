"use client";

import {
  ArrowDownIcon,
  ArrowRight01Icon,
  ArrowUpIcon,
  Calendar03Icon,
  Delete02Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/core/lib/utils";
import { blockMeta, fieldMap } from "@/generated/field-map";
import type {
  ArrayFieldDescriptor,
  BlockFieldMap,
  FieldDescriptor,
  FieldEntry,
} from "@/payload/lib/field-map/types";
import {
  getFieldValue,
  humanizeFieldPath,
  RE_VIDEO_EXT,
} from "./edit-mode-data";
import { UploadEditor } from "./field-editors/upload-editor";
import { useEditModeRequired } from "./use-edit-mode";

// Hoisted regexes — lint/performance/useTopLevelRegex
const RE_TRAILING_S = /s$/;

function groupPrefix(key: string): string | null {
  const dot = key.indexOf(".");
  return dot > 0 ? key.slice(0, dot) : null;
}

interface FieldGroup {
  fields: [string, FieldEntry][];
  prefix: string | null;
}

// ─── Types ───────────────────────────────────────────────────────────

interface BlockEditorDialogProps {
  blockIndex: number;
  blockType: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

// ─── Main Dialog ─────────────────────────────────────────────────────

export function BlockEditorDialog({
  open,
  onOpenChange,
  blockIndex,
  blockType,
}: BlockEditorDialogProps) {
  const { state, actions } = useEditModeRequired();
  const fields = fieldMap[blockType as keyof typeof fieldMap];

  if (!fields) {
    return null;
  }

  const block = state.blocks[blockIndex] as Record<string, unknown>;
  const label =
    blockMeta[blockType as keyof typeof blockMeta]?.label ??
    humanizeFieldPath(blockType);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2.5 text-sm">
            <Badge
              className="shrink-0 font-mono text-[10px]"
              variant="secondary"
            >
              {label}
            </Badge>
            <span className="text-muted-foreground">Block Editor</span>
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          <div className="flex flex-col gap-5 py-5">
            <FieldMapRenderer
              blockIndex={blockIndex}
              currentBlock={block}
              fields={fields as BlockFieldMap}
              pathPrefix=""
              updateField={actions.updateField}
            />
          </div>
        </div>
        <DialogFooter className="border-t px-6 py-3">
          <Button onClick={() => onOpenChange(false)} size="sm" type="button">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Recursive Field Map Renderer ────────────────────────────────────

function FieldMapRenderer({
  fields,
  pathPrefix,
  blockIndex,
  currentBlock,
  updateField,
}: {
  blockIndex: number;
  currentBlock: Record<string, unknown>;
  fields: BlockFieldMap;
  pathPrefix: string;
  updateField: (blockIndex: number, path: string, value: unknown) => void;
}) {
  const entries = Object.entries(fields);

  // Group fields by dot-prefix for visual sections
  const groups: FieldGroup[] = [];

  for (const entry of entries) {
    const [key] = entry;
    const prefix = groupPrefix(key);
    const last = groups.at(-1) ?? null;

    if (prefix && last && last.prefix === prefix) {
      last.fields.push(entry);
    } else {
      groups.push({ prefix, fields: [entry] });
    }
  }

  return (
    <>
      {groups.map((group) => {
        if (group.prefix && group.fields.length > 1) {
          return (
            <fieldset
              className="rounded-lg border border-border bg-muted/30 p-4 pt-3"
              key={group.prefix}
            >
              <legend className="px-2 font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                {humanizeFieldPath(group.prefix)}
              </legend>
              <div className="flex flex-col gap-4">
                {group.fields.map(([key, descriptor]) => (
                  <FieldEntryRenderer
                    blockIndex={blockIndex}
                    currentBlock={currentBlock}
                    descriptor={descriptor}
                    fieldKey={key}
                    key={key}
                    pathPrefix={pathPrefix}
                    updateField={updateField}
                  />
                ))}
              </div>
            </fieldset>
          );
        }

        return group.fields.map(([key, descriptor]) => (
          <FieldEntryRenderer
            blockIndex={blockIndex}
            currentBlock={currentBlock}
            descriptor={descriptor}
            fieldKey={key}
            key={key}
            pathPrefix={pathPrefix}
            updateField={updateField}
          />
        ));
      })}
    </>
  );
}

// ─── Single Field Entry (leaf or array) ──────────────────────────────

function FieldEntryRenderer({
  fieldKey,
  descriptor,
  pathPrefix,
  blockIndex,
  currentBlock,
  updateField,
}: {
  blockIndex: number;
  currentBlock: Record<string, unknown>;
  descriptor: FieldEntry;
  fieldKey: string;
  pathPrefix: string;
  updateField: (blockIndex: number, path: string, value: unknown) => void;
}) {
  const fullPath = pathPrefix ? `${pathPrefix}.${fieldKey}` : fieldKey;

  if (descriptor.type === "array") {
    return (
      <ArrayFieldSection
        blockIndex={blockIndex}
        currentBlock={currentBlock}
        descriptor={descriptor as ArrayFieldDescriptor}
        fieldKey={fieldKey}
        fullPath={fullPath}
        updateField={updateField}
      />
    );
  }

  const currentValue = getFieldValue(currentBlock, fullPath);

  return (
    <FieldInput
      descriptor={descriptor as FieldDescriptor}
      label={humanizeFieldPath(fieldKey)}
      onChange={(value) => updateField(blockIndex, fullPath, value)}
      path={fullPath}
      value={currentValue}
    />
  );
}

// ─── Field Input (renders correct control by type) ───────────────────

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: switch over field types — each case is simple
function FieldInput({
  label,
  path,
  descriptor,
  value,
  onChange,
}: {
  descriptor: FieldDescriptor;
  label: string;
  onChange: (value: unknown) => void;
  path: string;
  value: unknown;
}) {
  const id = `field-${path}`;

  switch (descriptor.type) {
    case "text":
    case "email":
      return (
        <div className="flex flex-col gap-1.5">
          <Label className="text-[13px]" htmlFor={id}>
            {label}
            {descriptor.required && (
              <span className="ml-0.5 text-red-500">*</span>
            )}
          </Label>
          <Input
            className="h-9"
            defaultValue={(value as string) ?? ""}
            id={id}
            maxLength={descriptor.maxLength}
            minLength={descriptor.minLength}
            onBlur={(e) => onChange(e.target.value)}
            type={descriptor.type}
          />
        </div>
      );

    case "textarea":
      return (
        <div className="flex flex-col gap-1.5">
          <Label className="text-[13px]" htmlFor={id}>
            {label}
            {descriptor.required && (
              <span className="ml-0.5 text-red-500">*</span>
            )}
          </Label>
          <Textarea
            className="min-h-20 resize-y"
            defaultValue={(value as string) ?? ""}
            id={id}
            onBlur={(e) => onChange(e.target.value)}
            rows={3}
          />
        </div>
      );

    case "number":
      return (
        <div className="flex flex-col gap-1.5">
          <Label className="text-[13px]" htmlFor={id}>
            {label}
            {descriptor.required && (
              <span className="ml-0.5 text-red-500">*</span>
            )}
          </Label>
          <Input
            className="h-9"
            defaultValue={(value as number) ?? ""}
            id={id}
            max={descriptor.max}
            min={descriptor.min}
            onBlur={(e) => onChange(Number(e.target.value))}
            type="number"
          />
        </div>
      );

    case "select":
    case "radio":
      return (
        <div className="flex flex-col gap-1.5">
          <Label className="text-[13px]">
            {label}
            {descriptor.required && (
              <span className="ml-0.5 text-red-500">*</span>
            )}
          </Label>
          <Select
            defaultValue={(value as string) ?? ""}
            onValueChange={onChange}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(descriptor.options ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "checkbox":
      return (
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
          <Switch
            defaultChecked={(value as boolean) ?? false}
            id={id}
            onCheckedChange={(v) => onChange(v)}
          />
          <Label className="text-[13px]" htmlFor={id}>
            {label}
          </Label>
        </div>
      );

    case "date":
      return (
        <DatePickerField
          id={id}
          label={label}
          onChange={onChange}
          required={descriptor.required}
          value={(value as string) ?? ""}
        />
      );

    case "upload": {
      // With depth=2, media fields are full objects { id, url, ... }
      const mediaObj = value as
        | number
        | { id: number; url?: string; filename?: string }
        | null;
      const resolvedId =
        typeof mediaObj === "number" ? mediaObj : (mediaObj?.id ?? null);
      const resolvedUrl =
        typeof mediaObj === "object" && mediaObj !== null
          ? (mediaObj.url ?? null)
          : null;
      const resolvedFilename =
        typeof mediaObj === "object" && mediaObj !== null
          ? (mediaObj.filename ?? null)
          : null;
      return (
        <UploadFieldInput
          initialFilename={resolvedFilename}
          initialUrl={resolvedUrl}
          label={label}
          mediaId={resolvedId}
          onChange={onChange}
          required={descriptor.required}
        />
      );
    }

    default:
      return (
        <div className="flex flex-col gap-1.5">
          <Label className="text-[13px] text-muted-foreground">{label}</Label>
          <div className="rounded-lg border border-border border-dashed px-3 py-2">
            <p className="text-muted-foreground text-xs">
              {descriptor.type} field — not editable here
            </p>
          </div>
        </div>
      );
  }
}

// ─── Media thumbnail ─────────────────────────────────────────────────

function MediaThumbnail({
  thumbUrl,
  isImage,
}: {
  isImage: boolean;
  thumbUrl: string | null;
}) {
  if (isImage && thumbUrl) {
    return (
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border">
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="48px"
          src={thumbUrl}
        />
      </div>
    );
  }
  if (thumbUrl) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-[10px] text-muted-foreground">
        Video
      </div>
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border border-dashed text-muted-foreground text-xs">
      —
    </div>
  );
}

// ─── Date Picker Field ──────────────────────────────────────────────

function DatePickerField({
  id,
  label,
  value,
  onChange,
  required,
}: {
  id: string;
  label: string;
  onChange: (value: unknown) => void;
  required?: boolean;
  value: string;
}) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => {
    if (!value) {
      return undefined;
    }
    // Handle both YYYY-MM-DD and full ISO datetime (2026-03-01T00:00:00.000Z)
    const dateOnly = value.includes("T") ? value.split("T")[0] : value;
    const [y, m, d] = dateOnly.split("-").map(Number);
    if (!(y && m && d)) {
      return undefined;
    }
    return new Date(y, m - 1, d);
  }, [value]);

  const formatted = selected
    ? selected.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[13px]" htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "h-9 w-full justify-start gap-2 font-normal",
              !selected && "text-muted-foreground"
            )}
            id={id}
            type="button"
            variant="outline"
          >
            <HugeiconsIcon
              className="shrink-0 text-muted-foreground"
              icon={Calendar03Icon}
              size={14}
            />
            {formatted ?? "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            defaultMonth={selected}
            mode="single"
            onSelect={(day) => {
              if (day) {
                const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
                onChange(iso);
              }
              setOpen(false);
            }}
            selected={selected}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─── Upload field with thumbnail ─────────────────────────────────────

function UploadFieldInput({
  label,
  mediaId,
  onChange,
  required,
  initialUrl,
  initialFilename,
}: {
  initialFilename?: string | null;
  initialUrl?: string | null;
  label: string;
  mediaId: number | null;
  onChange: (value: unknown) => void;
  required?: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [thumbUrl, setThumbUrl] = useState<string | null>(initialUrl ?? null);
  const [filename, setFilename] = useState<string | null>(
    initialFilename ?? null
  );
  const [loading, setLoading] = useState(false);

  // Fetch thumbnail only if we have an ID but no URL (depth=0 case)
  useEffect(() => {
    if (!mediaId || thumbUrl) {
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/media/${mediaId}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setThumbUrl(data?.url ?? null);
        setFilename(data?.filename ?? null);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setThumbUrl(null);
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaId, thumbUrl]);

  const isImage = thumbUrl && !RE_VIDEO_EXT.test(thumbUrl);

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[13px]">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2.5">
        <MediaThumbnail isImage={!!isImage} thumbUrl={thumbUrl} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {filename && <span className="truncate text-[13px]">{filename}</span>}
          {!(filename || mediaId) && (
            <span className="text-muted-foreground text-xs">
              No media selected
            </span>
          )}
          {loading && (
            <span className="text-muted-foreground text-xs">Loading...</span>
          )}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button
            className="h-7 text-xs"
            onClick={() => setDialogOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            {mediaId ? "Change" : "Select"}
          </Button>
          {mediaId && (
            <Button
              className="h-7 text-xs"
              onClick={() => {
                onChange(null);
                setThumbUrl(null);
                setFilename(null);
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              Remove
            </Button>
          )}
        </div>
      </div>
      <UploadEditor
        currentMediaId={mediaId}
        onOpenChange={setDialogOpen}
        onSelect={(id, url) => {
          onChange(id);
          setThumbUrl(url);
          setFilename(null);
        }}
        open={dialogOpen}
      />
    </div>
  );
}

// ─── Array Field Section ─────────────────────────────────────────────

function ArrayFieldSection({
  fieldKey,
  fullPath,
  descriptor,
  blockIndex,
  currentBlock,
  updateField,
}: {
  blockIndex: number;
  currentBlock: Record<string, unknown>;
  descriptor: ArrayFieldDescriptor;
  fieldKey: string;
  fullPath: string;
  updateField: (blockIndex: number, path: string, value: unknown) => void;
}) {
  const { actions } = useEditModeRequired();
  const items = (getFieldValue(currentBlock, fullPath) as unknown[]) ?? [];

  const handleMoveItem = useCallback(
    (from: number, to: number) => {
      actions.moveArrayItemAction(blockIndex, fullPath, from, to);
    },
    [actions, blockIndex, fullPath]
  );

  const handleRemoveItem = useCallback(
    (index: number) => {
      actions.removeArrayItemAction(blockIndex, fullPath, index);
    },
    [actions, blockIndex, fullPath]
  );

  const handleAddItem = useCallback(() => {
    const emptyItem: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(descriptor.fields)) {
      if (entry.type === "array") {
        emptyItem[key] = [];
      } else if (entry.type === "checkbox") {
        emptyItem[key] = false;
      } else if (entry.type === "number") {
        emptyItem[key] = 0;
      } else {
        emptyItem[key] = "";
      }
    }
    actions.addArrayItemAction(blockIndex, fullPath, emptyItem);
  }, [actions, blockIndex, fullPath, descriptor.fields]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="font-medium text-[13px]">
          {humanizeFieldPath(fieldKey)}
        </Label>
        <Badge className="font-mono text-[10px]" variant="secondary">
          {items.length}
        </Badge>
      </div>
      <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 p-2">
        {items.length === 0 && (
          <p className="py-3 text-center text-muted-foreground text-xs">
            No items yet
          </p>
        )}
        {items.map((_item, i) => (
          <ArrayItemCard
            blockIndex={blockIndex}
            currentBlock={currentBlock}
            descriptor={descriptor}
            index={i}
            isFirst={i === 0}
            isLast={i === items.length - 1}
            // biome-ignore lint/suspicious/noArrayIndexKey: array items may not have stable IDs
            key={i}
            onMove={handleMoveItem}
            onRemove={handleRemoveItem}
            parentPath={fullPath}
            updateField={updateField}
          />
        ))}
        <Button
          className="mt-0.5 w-full border-dashed"
          onClick={handleAddItem}
          size="sm"
          type="button"
          variant="outline"
        >
          <HugeiconsIcon className="mr-1.5" icon={PlusSignIcon} size={12} />
          Add {humanizeFieldPath(fieldKey).replace(RE_TRAILING_S, "")}
        </Button>
      </div>
    </div>
  );
}

// ─── Single Array Item ───────────────────────────────────────────────

function ArrayItemCard({
  index,
  parentPath,
  descriptor,
  blockIndex,
  currentBlock,
  updateField,
  onMove,
  onRemove,
  isFirst,
  isLast,
}: {
  blockIndex: number;
  currentBlock: Record<string, unknown>;
  descriptor: ArrayFieldDescriptor;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  parentPath: string;
  updateField: (blockIndex: number, path: string, value: unknown) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const itemPath = `${parentPath}.${index}`;

  // Try to get a preview label from common fields
  const previewValue =
    getFieldValue(currentBlock, `${itemPath}.name`) ??
    getFieldValue(currentBlock, `${itemPath}.title`) ??
    getFieldValue(currentBlock, `${itemPath}.label`) ??
    getFieldValue(currentBlock, `${itemPath}.question`) ??
    getFieldValue(currentBlock, `${itemPath}.headline`) ??
    getFieldValue(currentBlock, `${itemPath}.text`);

  let preview = `Item ${index + 1}`;
  if (typeof previewValue === "string" && previewValue.length > 0) {
    preview =
      previewValue.length > 40
        ? `${previewValue.slice(0, 40)}...`
        : previewValue;
  }

  return (
    <Collapsible onOpenChange={setIsOpen} open={isOpen}>
      <div
        className={cn(
          "rounded-md border bg-background transition-colors",
          isOpen ? "border-border" : "border-border/60"
        )}
      >
        <div className="flex items-center gap-1 px-1.5 py-1">
          <CollapsibleTrigger asChild>
            <button
              className="flex flex-1 items-center gap-2 rounded px-1.5 py-1.5 text-left text-[13px] transition-colors hover:bg-muted"
              type="button"
            >
              <HugeiconsIcon
                className={cn(
                  "shrink-0 text-muted-foreground transition-transform duration-150",
                  isOpen && "rotate-90"
                )}
                icon={ArrowRight01Icon}
                size={12}
              />
              <span className="font-mono text-[10px] text-muted-foreground/60">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="truncate font-medium">{preview}</span>
            </button>
          </CollapsibleTrigger>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              aria-label="Move up"
              className="h-6 w-6"
              disabled={isFirst}
              onClick={() => onMove(index, index - 1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <HugeiconsIcon icon={ArrowUpIcon} size={11} />
            </Button>
            <Button
              aria-label="Move down"
              className="h-6 w-6"
              disabled={isLast}
              onClick={() => onMove(index, index + 1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <HugeiconsIcon icon={ArrowDownIcon} size={11} />
            </Button>
            <Button
              aria-label="Remove"
              className="h-6 w-6 text-red-500/70 hover:text-red-500"
              onClick={() => onRemove(index)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <HugeiconsIcon icon={Delete02Icon} size={11} />
            </Button>
          </div>
        </div>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="flex flex-col gap-4 border-border/60 border-t bg-muted/20 px-4 py-4">
            <FieldMapRenderer
              blockIndex={blockIndex}
              currentBlock={currentBlock}
              fields={descriptor.fields}
              pathPrefix={itemPath}
              updateField={updateField}
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
