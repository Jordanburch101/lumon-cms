import type { Field, GroupField } from "payload";

// --- Types ---

interface LogoFieldOptions {
  label?: string;
  name?: string;
}

// --- Main ---

export function logoField(opts?: LogoFieldOptions): GroupField {
  const name = opts?.name ?? "logo";
  const label = opts?.label ?? "Logo";

  const fields: Field[] = [
    // Row 1: Type radio
    {
      name: "type",
      type: "radio",
      defaultValue: "text",
      options: [
        { label: "Text", value: "text" },
        { label: "Image", value: "image" },
      ],
      admin: { layout: "horizontal" },
    },
    // Row 2: Text + Accent (visible when type = "text")
    {
      type: "row",
      fields: [
        {
          name: "text",
          type: "text",
          admin: {
            description: "Primary text (e.g. 'Lumon')",
            condition: (_, siblingData) => siblingData?.type !== "image",
          },
        },
        {
          name: "textAccent",
          type: "text",
          required: false,
          admin: {
            description: "Secondary styled text (e.g. 'Payload')",
            condition: (_, siblingData) => siblingData?.type !== "image",
          },
        },
      ],
    },
    // Row 3: Image + Height (visible when type = "image")
    {
      type: "row",
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          admin: {
            condition: (_, siblingData) => siblingData?.type === "image",
          },
        },
        {
          name: "imageHeight",
          type: "number",
          required: false,
          min: 16,
          max: 128,
          admin: {
            description: "Max height in pixels (e.g. 32)",
            condition: (_, siblingData) => siblingData?.type === "image",
          },
        },
      ],
    },
  ];

  return {
    name,
    type: "group",
    label,
    fields,
  };
}
