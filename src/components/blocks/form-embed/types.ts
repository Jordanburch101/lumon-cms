/** Shared types for the FormEmbed block components. */

export interface FormFieldBlock {
  blockType: string;
  defaultValue?: string;
  label?: string;
  message?: unknown;
  name?: string;
  options?: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  width?: number | string;
}

export interface FormConfig {
  confirmationMessage?: Record<string, unknown> | null;
  confirmationType?: "message" | "redirect" | null;
  fields?: FormFieldBlock[] | null;
  id: number;
  redirect?: { url?: string } | null;
  submitButtonLabel?: string | null;
}
