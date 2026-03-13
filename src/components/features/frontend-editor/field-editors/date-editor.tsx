"use client";

import type * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { FieldDescriptor } from "@/payload/lib/field-map/types";

interface DateEditorProps {
  currentValue: string;
  fieldDescriptor: FieldDescriptor;
  onUpdate: (value: string) => void;
  trigger: React.ReactNode;
}

export function DateEditor({
  currentValue,
  onUpdate,
  trigger,
}: DateEditorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-48 p-3">
        <Input
          defaultValue={currentValue}
          onChange={(e) => onUpdate(e.target.value)}
          type="date"
        />
      </PopoverContent>
    </Popover>
  );
}
