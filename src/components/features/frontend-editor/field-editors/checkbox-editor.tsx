"use client";

import type * as React from "react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import type { FieldDescriptor } from "@/payload/lib/field-map/types";

interface CheckboxEditorProps {
  currentValue: boolean;
  fieldDescriptor: FieldDescriptor;
  onUpdate: (value: boolean) => void;
  trigger: React.ReactNode;
}

export function CheckboxEditor({
  currentValue,
  fieldDescriptor,
  onUpdate,
  trigger,
}: CheckboxEditorProps) {
  const label = fieldDescriptor.options?.[0]?.label ?? "Enabled";

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-48 p-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={currentValue}
            id="checkbox-editor-switch"
            onCheckedChange={onUpdate}
          />
          <Label htmlFor="checkbox-editor-switch">{label}</Label>
        </div>
      </PopoverContent>
    </Popover>
  );
}
