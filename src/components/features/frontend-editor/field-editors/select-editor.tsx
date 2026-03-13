"use client";

import type * as React from "react";
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
import type { FieldDescriptor } from "@/payload/lib/field-map/types";

interface SelectEditorProps {
  currentValue: string;
  fieldDescriptor: FieldDescriptor;
  onUpdate: (value: string) => void;
  trigger: React.ReactNode;
}

export function SelectEditor({
  currentValue,
  fieldDescriptor,
  onUpdate,
  trigger,
}: SelectEditorProps) {
  const options = fieldDescriptor.options ?? [];

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-48 p-3">
        <Select defaultValue={currentValue} onValueChange={onUpdate}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PopoverContent>
    </Popover>
  );
}
