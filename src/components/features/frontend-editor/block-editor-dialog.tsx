"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  Delete02Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/core/lib/utils";
import { fieldMap } from "@/generated/field-map";
import type {
  ArrayFieldDescriptor,
  BlockFieldMap,
  FieldDescriptor,
  FieldEntry,
} from "@/payload/lib/field-map/types";
import { getFieldValue } from "./edit-mode-data";
import { UploadEditor } from "./field-editors/upload-editor";
import { useEditModeRequired } from "./use-edit-mode";

// Hoisted regexes — lint/performance/useTopLevelRegex
const RE_CAMEL = /([a-z])([A-Z])/g;
const RE_FIRST_CHAR = /^./;
const RE_TRAILING_S = /s$/;

function humanize(key: string): string {
  const last = key.includes(".") ? (key.split(".").pop() ?? key) : key;
  return last
    .replace(RE_CAMEL, "$1 $2")
    .replace(RE_FIRST_CHAR, (c) => c.toUpperCase());
}

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

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="font-mono text-sm">
            Edit {humanize(blockType)}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6">
          <div className="flex flex-col gap-5 pb-6">
            <FieldMapRenderer
              blockIndex={blockIndex}
              currentBlock={block}
              fields={fields as BlockFieldMap}
              pathPrefix=""
              updateField={actions.updateField}
            />
          </div>
        </ScrollArea>
        <DialogFooter className="border-t px-6 py-4">
          <Button onClick={() => onOpenChange(false)} type="button">
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
              className="rounded-lg border border-border/50 p-4"
              key={group.prefix}
            >
              <legend className="px-2 font-medium text-muted-foreground text-xs">
                {humanize(group.prefix)}
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
      label={humanize(fieldKey)}
      onChange={(value) => updateField(blockIndex, fullPath, value)}
      path={fullPath}
      value={currentValue}
    />
  );
}

// ─── Field Input (renders correct control by type) ───────────────────

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
          <Label className="text-xs" htmlFor={id}>
            {label}
            {descriptor.required && (
              <span className="ml-0.5 text-red-500">*</span>
            )}
          </Label>
          <Input
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
          <Label className="text-xs" htmlFor={id}>
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
          <Label className="text-xs" htmlFor={id}>
            {label}
            {descriptor.required && (
              <span className="ml-0.5 text-red-500">*</span>
            )}
          </Label>
          <Input
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
          <Label className="text-xs">
            {label}
            {descriptor.required && (
              <span className="ml-0.5 text-red-500">*</span>
            )}
          </Label>
          <Select
            defaultValue={(value as string) ?? ""}
            onValueChange={onChange}
          >
            <SelectTrigger>
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
        <div className="flex items-center gap-2 py-1">
          <Switch
            checked={(value as boolean) ?? false}
            id={id}
            onCheckedChange={(v) => onChange(v)}
          />
          <Label className="text-xs" htmlFor={id}>
            {label}
          </Label>
        </div>
      );

    case "date":
      return (
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs" htmlFor={id}>
            {label}
            {descriptor.required && (
              <span className="ml-0.5 text-red-500">*</span>
            )}
          </Label>
          <Input
            defaultValue={(value as string) ?? ""}
            id={id}
            onBlur={(e) => onChange(e.target.value)}
            type="date"
          />
        </div>
      );

    case "upload":
      return (
        <UploadFieldInput
          label={label}
          mediaId={(value as number) ?? null}
          onChange={onChange}
          required={descriptor.required}
        />
      );

    default:
      return (
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground text-xs">
            {label} ({descriptor.type})
          </Label>
          <p className="text-muted-foreground text-xs">
            No editor for this field type.
          </p>
        </div>
      );
  }
}

// ─── Upload field with thumbnail ─────────────────────────────────────

function UploadFieldInput({
  label,
  mediaId,
  onChange,
  required,
}: {
  label: string;
  mediaId: number | null;
  onChange: (value: unknown) => void;
  required?: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch thumbnail on first render if we have an ID
  if (mediaId && !thumbUrl && !loading) {
    setLoading(true);
    fetch(`/api/media/${mediaId}`)
      .then((res) => res.json())
      .then((data) => setThumbUrl(data?.url ?? null))
      .catch(() => setThumbUrl(null))
      .finally(() => setLoading(false));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      <div className="flex items-center gap-3">
        {thumbUrl ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border">
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="48px"
              src={thumbUrl}
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border border-dashed text-muted-foreground text-xs">
            —
          </div>
        )}
        <div className="flex gap-2">
          <Button
            onClick={() => setDialogOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            {mediaId ? "Change" : "Select"}
          </Button>
          {mediaId && (
            <Button
              onClick={() => {
                onChange(null);
                setThumbUrl(null);
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
        <Label className="font-medium text-xs">{humanize(fieldKey)}</Label>
        <span className="text-muted-foreground text-xs">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>
      <Separator />
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <ArrayItemCard
            blockIndex={blockIndex}
            currentBlock={currentBlock}
            descriptor={descriptor}
            index={i}
            isFirst={i === 0}
            isLast={i === items.length - 1}
            item={item as Record<string, unknown>}
            // biome-ignore lint/suspicious/noArrayIndexKey: array items may not have stable IDs
            key={i}
            onMove={handleMoveItem}
            onRemove={handleRemoveItem}
            parentPath={fullPath}
            updateField={updateField}
          />
        ))}
      </div>
      <Button
        className="mt-1 w-full"
        onClick={handleAddItem}
        size="sm"
        type="button"
        variant="outline"
      >
        <HugeiconsIcon className="mr-1" icon={PlusSignIcon} size={12} />
        Add {humanize(fieldKey).replace(RE_TRAILING_S, "")}
      </Button>
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
  item: Record<string, unknown>;
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
          "rounded-lg border border-border/50",
          isOpen && "border-border"
        )}
      >
        <div className="flex items-center gap-1 p-2">
          <CollapsibleTrigger asChild>
            <button
              className="flex flex-1 items-center gap-2 rounded px-1.5 py-1 text-left text-xs transition-colors hover:bg-muted"
              type="button"
            >
              <span className="font-mono text-[10px] text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="truncate">{preview}</span>
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
        <CollapsibleContent>
          <div className="flex flex-col gap-4 border-t px-4 py-4">
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
