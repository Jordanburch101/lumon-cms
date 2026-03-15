import type { Field, GroupField } from "payload";
import { linkableCollections } from "./linkable-collections";

// --- Types ---

type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "xs" | "sm" | "default" | "lg";
type LinkVariant = "plain" | "underline" | "arrow";

interface AppearanceOptions {
  button?: {
    variants?: ButtonVariant[];
    sizes?: ButtonSize[];
  };
  link?: {
    variants?: LinkVariant[];
  };
  type: ("button" | "link")[];
}

interface LinkFieldOptions {
  appearance?: AppearanceOptions;
  label?: string;
  name?: string;
  required?: boolean;
}

// --- Helpers ---

function toSelectOptions(
  values: readonly string[]
): { label: string; value: string }[] {
  return values.map((v) => ({
    label: v.charAt(0).toUpperCase() + v.slice(1),
    value: v,
  }));
}

function buildAppearanceFields(appearance: AppearanceOptions): Field[] {
  const fields: Field[] = [];

  // Row: Appearance type + variant (button/link variants are mutually exclusive)
  const typeRowFields: Field[] = [
    {
      name: "appearanceType",
      type: "select",
      defaultValue: appearance.type[0],
      options: toSelectOptions(appearance.type),
      admin: {
        description: "Choose how the link should be rendered.",
      },
    },
  ];

  if (appearance.button?.variants?.length) {
    typeRowFields.push({
      name: "buttonVariant",
      type: "select",
      defaultValue: appearance.button.variants[0],
      options: toSelectOptions(appearance.button.variants),
      admin: {
        condition: (_, siblingData) => siblingData?.appearanceType === "button",
      },
    });
  }

  if (appearance.link?.variants?.length) {
    typeRowFields.push({
      name: "linkVariant",
      type: "select",
      defaultValue: appearance.link.variants[0],
      options: toSelectOptions(appearance.link.variants),
      admin: {
        condition: (_, siblingData) => siblingData?.appearanceType === "link",
      },
    });
  }

  fields.push({ type: "row", fields: typeRowFields });

  // Row: Button size (only when button appearance is active)
  if (appearance.button?.sizes?.length) {
    fields.push({
      name: "buttonSize",
      type: "select",
      defaultValue: appearance.button.sizes[0],
      options: toSelectOptions(appearance.button.sizes),
      admin: {
        width: "50%",
        condition: (_, siblingData) => siblingData?.appearanceType === "button",
      },
    });
  }

  return fields;
}

// --- Main ---

export function link(opts?: LinkFieldOptions): GroupField {
  const name = opts?.name ?? "link";
  const label = opts?.label ?? false;

  const fields: Field[] = [
    // Row 1: Type radio + Open in new tab
    {
      type: "row",
      fields: [
        {
          name: "type",
          type: "radio",
          defaultValue: "external",
          options: [
            { label: "Internal", value: "internal" },
            { label: "External", value: "external" },
          ],
          admin: { layout: "horizontal" },
        },
        {
          name: "newTab",
          type: "checkbox",
          label: "Open in new tab",
          defaultValue: false,
        },
      ],
    },
    // Row 2: Destination + Label (side by side — url/reference are mutually exclusive)
    {
      type: "row",
      fields: [
        {
          name: "url",
          type: "text",
          admin: {
            condition: (_, siblingData) => siblingData?.type === "external",
          },
          validate: (
            val: string | null | undefined,
            { siblingData }: { siblingData: Record<string, unknown> }
          ) => {
            if (opts?.required && siblingData?.type === "external" && !val) {
              return "URL is required for external links";
            }
            return true;
          },
        },
        {
          name: "reference",
          type: "relationship",
          relationTo: [...linkableCollections],
          admin: {
            condition: (_, siblingData) => siblingData?.type === "internal",
          },
          validate: (
            val: unknown,
            { siblingData }: { siblingData: Record<string, unknown> }
          ) => {
            if (opts?.required && siblingData?.type === "internal" && !val) {
              return "A page reference is required for internal links";
            }
            return true;
          },
        },
        {
          name: "label",
          type: "text",
          required: opts?.required,
        },
      ],
    },
  ];

  // Add appearance fields if configured
  if (opts?.appearance) {
    fields.push(...buildAppearanceFields(opts.appearance));
  }

  return {
    name,
    type: "group",
    label,
    custom: { groupType: "link" },
    admin: {
      components: {
        Label: {
          path: "@/payload/fields/link/link-label",
          clientProps: { fieldName: label || name },
        },
      },
    },
    fields,
  };
}
