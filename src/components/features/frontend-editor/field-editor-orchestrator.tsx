"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { FieldDescriptor } from "@/payload/lib/field-map/types";
import { getFieldValue } from "./edit-mode-data";
import { UploadEditor } from "./field-editors/upload-editor";
import { useEditMode } from "./use-edit-mode";

interface PopoverEditorState {
  anchorRect: DOMRect;
  blockIndex: number;
  descriptor: FieldDescriptor;
  fieldPath: string;
}

interface UploadEditorState {
  blockIndex: number;
  fieldPath: string;
}

/**
 * Listens for `edit:open-popover` and `edit:open-upload` custom events
 * dispatched by the edit runtime and renders the appropriate field editor.
 */
export function FieldEditorOrchestrator() {
  const editMode = useEditMode();
  const [popover, setPopover] = useState<PopoverEditorState | null>(null);
  const [upload, setUpload] = useState<UploadEditorState | null>(null);

  useEffect(() => {
    const overlay = document.querySelector(".frontend-editor-overlay");
    if (!overlay) {
      return;
    }

    const handlePopover = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const rect = (
        detail.currentElement as HTMLElement
      ).getBoundingClientRect();
      setPopover({
        blockIndex: detail.blockIndex,
        fieldPath: detail.fieldPath,
        descriptor: detail.descriptor,
        anchorRect: rect,
      });
    };

    const handleUpload = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setUpload({
        blockIndex: detail.blockIndex,
        fieldPath: detail.fieldPath,
      });
    };

    overlay.addEventListener("edit:open-popover", handlePopover);
    overlay.addEventListener("edit:open-upload", handleUpload);

    return () => {
      overlay.removeEventListener("edit:open-popover", handlePopover);
      overlay.removeEventListener("edit:open-upload", handleUpload);
    };
  }, []);

  const handleUpdateField = useCallback(
    (blockIndex: number, fieldPath: string, value: unknown) => {
      editMode?.actions.updateField(blockIndex, fieldPath, value);
    },
    [editMode?.actions]
  );

  if (!editMode?.state.active) {
    return null;
  }

  const { blocks } = editMode.state;

  return (
    <>
      {popover && (
        <PopoverFieldEditor
          blocks={blocks}
          onClose={() => setPopover(null)}
          onUpdateField={handleUpdateField}
          state={popover}
        />
      )}

      {upload && (
        <UploadFieldEditor
          blocks={blocks}
          onClose={() => setUpload(null)}
          onUpdateField={handleUpdateField}
          state={upload}
        />
      )}
    </>
  );
}

function PopoverFieldEditor({
  state,
  blocks,
  onUpdateField,
  onClose,
}: {
  blocks: unknown[];
  onClose: () => void;
  onUpdateField: (
    blockIndex: number,
    fieldPath: string,
    value: unknown
  ) => void;
  state: PopoverEditorState;
}) {
  const { blockIndex, fieldPath, descriptor, anchorRect } = state;
  const block = blocks[blockIndex] as Record<string, unknown>;
  const currentValue = getFieldValue(
    block as Record<string, unknown>,
    fieldPath
  );

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open
    >
      <PopoverAnchor asChild>
        <div
          style={{
            height: anchorRect.height,
            left: anchorRect.left,
            pointerEvents: "none",
            position: "fixed",
            top: anchorRect.top,
            width: anchorRect.width,
          }}
        />
      </PopoverAnchor>
      <PopoverContent className="w-48 p-3">
        <PopoverEditorContent
          currentValue={currentValue}
          descriptor={descriptor}
          onUpdate={(value) => onUpdateField(blockIndex, fieldPath, value)}
        />
      </PopoverContent>
    </Popover>
  );
}

function PopoverEditorContent({
  descriptor,
  currentValue,
  onUpdate,
}: {
  currentValue: unknown;
  descriptor: FieldDescriptor;
  onUpdate: (value: unknown) => void;
}) {
  switch (descriptor.type) {
    case "number":
      return (
        <Input
          defaultValue={currentValue as number}
          max={descriptor.max}
          min={descriptor.min}
          onChange={(e) => onUpdate(Number(e.target.value))}
          type="number"
        />
      );

    case "select":
    case "radio":
      return (
        <Select defaultValue={currentValue as string} onValueChange={onUpdate}>
          <SelectTrigger className="w-full">
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
      );

    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={currentValue as boolean}
            id="field-editor-checkbox"
            onCheckedChange={(val) => onUpdate(val)}
          />
          <Label htmlFor="field-editor-checkbox">
            {descriptor.options?.[0]?.label ?? "Enabled"}
          </Label>
        </div>
      );

    case "date":
      return (
        <Input
          defaultValue={currentValue as string}
          onChange={(e) => onUpdate(e.target.value)}
          type="date"
        />
      );

    default:
      return (
        <p className="text-muted-foreground text-xs">
          No editor for type &ldquo;{descriptor.type}&rdquo;
        </p>
      );
  }
}

function UploadFieldEditor({
  state,
  blocks,
  onUpdateField,
  onClose,
}: {
  blocks: unknown[];
  onClose: () => void;
  onUpdateField: (
    blockIndex: number,
    fieldPath: string,
    value: unknown
  ) => void;
  state: UploadEditorState;
}) {
  const { blockIndex, fieldPath } = state;
  const block = blocks[blockIndex] as Record<string, unknown>;
  const currentMediaId = (getFieldValue(block, fieldPath) as number) ?? null;

  return (
    <UploadEditor
      currentMediaId={currentMediaId}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      onSelect={(mediaId) => onUpdateField(blockIndex, fieldPath, mediaId)}
      open
    />
  );
}
