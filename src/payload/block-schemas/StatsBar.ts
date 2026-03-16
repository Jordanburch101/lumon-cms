import type { Block } from "payload";

export const StatsBarBlock: Block = {
  slug: "statsBar",
  labels: { singular: "Stats Bar", plural: "Stats Bars" },
  fields: [
    { name: "eyebrow", type: "text" },
    {
      name: "stats",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: "value", type: "text", required: true },
        { name: "label", type: "text", required: true },
        { name: "description", type: "text" },
      ],
    },
    {
      name: "variant",
      type: "select",
      defaultValue: "default",
      options: [
        { label: "Default", value: "default" },
        { label: "Card", value: "card" },
        { label: "Minimal", value: "minimal" },
      ],
    },
  ],
};
