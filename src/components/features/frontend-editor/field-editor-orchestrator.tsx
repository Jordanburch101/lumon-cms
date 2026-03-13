"use client";

import "./group-editors";

import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
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
import type {
  BlockFieldMap,
  FieldDescriptor,
} from "@/payload/lib/field-map/types";
import { getFieldValue } from "./edit-mode-data";
import { UploadEditor } from "./field-editors/upload-editor";
import { getGroupEditor } from "./group-editor-registry";
import { useEditMode } from "./use-edit-mode";

interface PopoverEditorState {
  anchorElement: HTMLElement;
  blockIndex: number;
  descriptor: FieldDescriptor;
  fieldPath: string;
}

interface UploadEditorState {
  blockIndex: number;
  fieldPath: string;
}

interface GroupEditorState {
  anchorElement: HTMLElement;
  blockIndex: number;
  currentValues: Record<string, unknown>;
  fieldPath: string;
  fields: BlockFieldMap;
  groupType: string;
}

/**
 * Listens for `edit:open-popover`, `edit:open-upload`, and
 * `edit:open-group-editor` custom events dispatched by the edit runtime
 * and renders the appropriate field editor.
 */
export function FieldEditorOrchestrator() {
  const editMode = useEditMode();
  const [popover, setPopover] = useState<PopoverEditorState | null>(null);
  const [upload, setUpload] = useState<UploadEditorState | null>(null);
  const [groupEditor, setGroupEditor] = useState<GroupEditorState | null>(null);

  useEffect(() => {
    const overlay = document.querySelector(".frontend-editor-overlay");
    if (!overlay) {
      return;
    }

    const handlePopover = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setPopover({
        blockIndex: detail.blockIndex,
        fieldPath: detail.fieldPath,
        descriptor: detail.descriptor,
        anchorElement: detail.currentElement as HTMLElement,
      });
    };

    const handleUpload = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setUpload({
        blockIndex: detail.blockIndex,
        fieldPath: detail.fieldPath,
      });
    };

    const handleGroupEditor = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setGroupEditor({
        anchorElement: detail.anchorEl as HTMLElement,
        blockIndex: detail.blockIndex,
        currentValues: detail.currentValues,
        fieldPath: detail.fieldPath,
        fields: detail.fields,
        groupType: detail.groupType,
      });
    };

    overlay.addEventListener("edit:open-popover", handlePopover);
    overlay.addEventListener("edit:open-upload", handleUpload);
    overlay.addEventListener("edit:open-group-editor", handleGroupEditor);

    return () => {
      overlay.removeEventListener("edit:open-popover", handlePopover);
      overlay.removeEventListener("edit:open-upload", handleUpload);
      overlay.removeEventListener("edit:open-group-editor", handleGroupEditor);
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

      {groupEditor && (
        <GroupEditorRenderer
          onClose={() => setGroupEditor(null)}
          onUpdateField={handleUpdateField}
          state={groupEditor}
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
  const { blockIndex, fieldPath, descriptor, anchorElement } = state;
  const block = blocks[blockIndex] as Record<string, unknown>;
  const currentValue = getFieldValue(
    block as Record<string, unknown>,
    fieldPath
  );
  const anchorRef = useRef<HTMLElement>(anchorElement);

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
          onBlur={(e) => onUpdate(Number(e.target.value))}
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

    case "date": {
      const dateStr = currentValue as string;
      const dateOnly = dateStr?.includes("T") ? dateStr.split("T")[0] : dateStr;
      const parts = dateOnly ? dateOnly.split("-").map(Number) : [];
      const dateObj =
        parts.length === 3 && parts[0] && parts[1] && parts[2]
          ? new Date(parts[0], parts[1] - 1, parts[2])
          : undefined;

      return (
        <Calendar
          className="p-0"
          defaultMonth={dateObj}
          mode="single"
          onSelect={(day) => {
            if (day) {
              const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
              onUpdate(iso);
            }
          }}
          selected={dateObj}
        />
      );
    }

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
  const mediaValue = getFieldValue(block, fieldPath) as
    | number
    | { id: number }
    | null;
  const currentMediaId =
    typeof mediaValue === "number" ? mediaValue : (mediaValue?.id ?? null);

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

function GroupEditorRenderer({
  state,
  onUpdateField: _onUpdateField,
  onClose,
}: {
  onClose: () => void;
  onUpdateField: (
    blockIndex: number,
    fieldPath: string,
    value: unknown
  ) => void;
  state: GroupEditorState;
}) {
  const EditorComponent = getGroupEditor(state.groupType);

  if (!EditorComponent) {
    return (
      <Popover
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
        open
      >
        <PopoverAnchor virtualRef={{ current: state.anchorElement }} />
        <PopoverContent className="w-48 p-3">
          <p className="text-muted-foreground text-xs">
            Use the block editor to edit this field group.
          </p>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <EditorComponent
      anchorEl={state.anchorElement}
      blockIndex={state.blockIndex}
      currentValues={state.currentValues}
      fieldPath={state.fieldPath}
      fields={state.fields}
      onClose={onClose}
    />
  );
}
