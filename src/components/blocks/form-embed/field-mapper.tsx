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

interface FormFieldBlock {
  blockType: string;
  defaultValue?: string;
  label?: string;
  message?: unknown;
  name?: string;
  options?: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  width?: string;
}

interface FieldMapperProps {
  error?: string;
  field: FormFieldBlock;
  onChange: (name: string, value: string) => void;
  value: string;
}

/** Convert plugin width percentages to Tailwind grid column classes */
function widthToClass(width?: string): string {
  if (!width) {
    return "col-span-full";
  }
  const n = Number.parseInt(width, 10);
  if (n <= 50) {
    return "col-span-full sm:col-span-1";
  }
  return "col-span-full";
}

export function FormField({ field, value, onChange, error }: FieldMapperProps) {
  const { blockType, name, label, required, placeholder } = field;
  const fieldName = name ?? "";

  if (blockType === "message") {
    return null;
  }

  const handleChange = (val: string) => onChange(fieldName, val);

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
          {(props.options ?? []).map((opt) => (
            <div className="flex items-center gap-2" key={opt.value}>
              <RadioGroupItem id={opt.value} value={opt.value} />
              <Label htmlFor={opt.value}>{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={props.value === "true"}
            onCheckedChange={(checked) =>
              props.onChange(checked ? "true" : "false")
            }
          />
        </div>
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
