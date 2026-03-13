import type { Block } from "payload";

export const RichTextButtonBlock: Block = {
  slug: "richTextButton",
  labels: { singular: "Button", plural: "Buttons" },
  admin: {
    components: {
      Block:
        "@/components/features/rich-text/editor-previews/button-preview#ButtonPreview",
    },
  },
  fields: [
    { name: "label", type: "text", required: true },
    { name: "href", type: "text", required: true },
    {
      name: "variant",
      type: "select",
      defaultValue: "primary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Outline", value: "outline" },
      ],
    },
    {
      name: "size",
      type: "select",
      defaultValue: "md",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    { name: "newTab", type: "checkbox", defaultValue: false },
  ],
};
