"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/core/lib/utils";
import type { FormFieldBlock } from "./types";

interface FieldMapperProps {
  error?: string;
  field: FormFieldBlock;
  onChange: (name: string, value: string) => void;
  value: string;
}

/** Convert plugin width percentages to Tailwind grid column classes */
function widthToClass(width?: number | string): string {
  if (width == null) {
    return "col-span-full";
  }
  const n = typeof width === "number" ? width : Number.parseInt(width, 10);
  if (n <= 50) {
    return "col-span-full sm:col-span-1";
  }
  return "col-span-full";
}

export function FormField({ field, value, onChange, error }: FieldMapperProps) {
  const { blockType, name, label, required, placeholder } = field;
  const fieldName = name ?? "";

  // TODO: Render message blocks as inline rich text instructions within the form
  if (blockType === "message") {
    return null;
  }

  const handleChange = (val: string) => onChange(fieldName, val);

  // Checkbox: render label inline next to the checkbox
  if (blockType === "checkbox") {
    return (
      <div className={cn(widthToClass(field.width))}>
        <Field>
          <FieldContent>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={value === "true"}
                id={fieldName}
                onCheckedChange={(checked) =>
                  handleChange(checked ? "true" : "false")
                }
              />
              {label && (
                <Label htmlFor={fieldName}>
                  {label}
                  {required && (
                    <span className="ml-0.5 text-destructive">*</span>
                  )}
                </Label>
              )}
            </div>
          </FieldContent>
          {error && <FieldError>{error}</FieldError>}
        </Field>
      </div>
    );
  }

  return (
    <div className={cn(widthToClass(field.width))}>
      <Field>
        {label && (
          <FieldLabel>
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </FieldLabel>
        )}
        <FieldContent>
          {renderInput(blockType, {
            fieldName,
            value,
            onChange: handleChange,
            placeholder,
            required,
            options: field.options,
            defaultValue: field.defaultValue,
          })}
        </FieldContent>
        {error && <FieldError>{error}</FieldError>}
      </Field>
    </div>
  );
}

function renderInput(
  blockType: string,
  props: {
    fieldName: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: string }[];
    defaultValue?: string;
  }
) {
  switch (blockType) {
    case "text":
      return (
        <Input
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          required={props.required}
          type="text"
          value={props.value}
        />
      );
    case "email":
      return (
        <Input
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          required={props.required}
          type="email"
          value={props.value}
        />
      );
    case "number":
      return (
        <Input
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          required={props.required}
          type="number"
          value={props.value}
        />
      );
    case "date":
      return (
        <Input
          onChange={(e) => props.onChange(e.target.value)}
          required={props.required}
          type="date"
          value={props.value}
        />
      );
    case "textarea":
      return (
        <Textarea
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          required={props.required}
          value={props.value}
        />
      );
    case "select":
    case "country":
    case "state":
      return (
        <Select onValueChange={props.onChange} value={props.value}>
          <SelectTrigger>
            <SelectValue placeholder={props.placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {(props.options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "radio":
      return (
        <RadioGroup onValueChange={props.onChange} value={props.value}>
          {(props.options ?? []).map((opt) => {
            const radioId = `${props.fieldName}-${opt.value}`;
            return (
              <div className="flex items-center gap-2" key={opt.value}>
                <RadioGroupItem id={radioId} value={opt.value} />
                <Label htmlFor={radioId}>{opt.label}</Label>
              </div>
            );
          })}
        </RadioGroup>
      );
    default:
      return (
        <Input
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          type="text"
          value={props.value}
        />
      );
  }
}
