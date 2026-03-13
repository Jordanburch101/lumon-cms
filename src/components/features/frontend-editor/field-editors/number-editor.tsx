"use client";

import type * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { FieldDescriptor } from "@/payload/lib/field-map/types";

interface NumberEditorProps {
  currentValue: number;
  fieldDescriptor: FieldDescriptor;
  onUpdate: (value: number) => void;
  trigger: React.ReactNode;
}

export function NumberEditor({
  currentValue,
  fieldDescriptor,
  onUpdate,
  trigger,
}: NumberEditorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-48 p-3">
        <Input
          defaultValue={currentValue}
          max={fieldDescriptor.max}
          min={fieldDescriptor.min}
          onChange={(e) => onUpdate(Number(e.target.value))}
          type="number"
        />
      </PopoverContent>
    </Popover>
  );
}
