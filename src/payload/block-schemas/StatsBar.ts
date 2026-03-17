import type { Block } from "payload";

export const StatsBarBlock: Block = {
  slug: "statsBar",
  labels: { singular: "Stats Bar", plural: "Stats Bars" },
  admin: {
    custom: {
      description:
        "Horizontal stats display (1-6 items) with value, label, and optional description. Variants: default, card, minimal. Use for key metrics between content sections.",
    },
  },
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
