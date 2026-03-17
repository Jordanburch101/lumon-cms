import type { Block } from "payload";

export const TrustBlock: Block = {
  slug: "trust",
  labels: { singular: "Trust", plural: "Trust" },
  admin: {
    custom: {
      description:
        "Social proof strip with animated counter stats and optional partner logos. Use to build credibility with impressive numbers and brand associations.",
    },
  },
  fields: [
    { name: "eyebrow", type: "text" },
    {
      name: "stats",
      type: "array",
      required: true,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "value", type: "number", required: true },
        { name: "decimals", type: "number", defaultValue: 0 },
        {
          name: "format",
          type: "select",
          options: [
            { label: "None", value: "none" },
            { label: "K (thousands)", value: "k" },
          ],
          defaultValue: "none",
        },
        { name: "suffix", type: "text" },
      ],
    },
    {
      name: "logos",
      type: "array",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "logo", type: "upload", relationTo: "media" },
      ],
    },
  ],
};
