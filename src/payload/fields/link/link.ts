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

  // Appearance type select — always present when appearance is configured
  fields.push({
    name: "appearanceType",
    type: "select",
    defaultValue: appearance.type[0],
    options: toSelectOptions(appearance.type),
    admin: { width: "50%" },
  });

  // Button-scoped fields
  if (appearance.button) {
    if (appearance.button.variants?.length) {
      fields.push({
        name: "buttonVariant",
        type: "select",
        defaultValue: appearance.button.variants[0],
        options: toSelectOptions(appearance.button.variants),
        admin: {
          width: "50%",
          condition: (_, siblingData) =>
            siblingData?.appearanceType === "button",
        },
      });
    }
    if (appearance.button.sizes?.length) {
      fields.push({
        name: "buttonSize",
        type: "select",
        defaultValue: appearance.button.sizes[0],
        options: toSelectOptions(appearance.button.sizes),
        admin: {
          width: "50%",
          condition: (_, siblingData) =>
            siblingData?.appearanceType === "button",
        },
      });
    }
  }

  // Link-scoped fields
  if (appearance.link?.variants?.length) {
    fields.push({
      name: "linkVariant",
      type: "select",
      defaultValue: appearance.link.variants[0],
      options: toSelectOptions(appearance.link.variants),
      admin: {
        width: "50%",
        condition: (_, siblingData) => siblingData?.appearanceType === "link",
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
    {
      name: "type",
      type: "select",
      defaultValue: "external",
      options: [
        { label: "Internal", value: "internal" },
        { label: "External", value: "external" },
      ],
      admin: { width: "50%" },
    },
    {
      name: "label",
      type: "text",
      required: opts?.required,
      admin: { width: "50%" },
    },
    {
      name: "url",
      type: "text",
      required: opts?.required,
      admin: {
        condition: (_, siblingData) => siblingData?.type === "external",
      },
    },
    {
      name: "reference",
      type: "relationship",
      relationTo: [...linkableCollections],
      required: opts?.required,
      admin: {
        condition: (_, siblingData) => siblingData?.type === "internal",
      },
    },
    {
      name: "newTab",
      type: "checkbox",
      defaultValue: false,
      admin: { width: "50%" },
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
