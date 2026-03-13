import type { Block } from "payload";

export const CalloutBlock: Block = {
  slug: "callout",
  labels: { singular: "Callout", plural: "Callouts" },
  fields: [
    {
      name: "variant",
      type: "select",
      defaultValue: "info",
      options: [
        { label: "Info", value: "info" },
        { label: "Warning", value: "warning" },
        { label: "Tip", value: "tip" },
        { label: "Error", value: "error" },
      ],
    },
    { name: "title", type: "text" },
    { name: "content", type: "textarea", required: true },
  ],
};
