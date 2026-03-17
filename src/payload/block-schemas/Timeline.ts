import type { Block } from "payload";

export const TimelineBlock: Block = {
  slug: "timeline",
  labels: { singular: "Timeline", plural: "Timelines" },
  admin: {
    description:
      "Chronological timeline with dated entries. Each entry has heading, description, optional stat with label, and category tag. Use for company history, product roadmap, or process flows.",
  },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        { name: "date", type: "text", required: true },
        { name: "heading", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
        { name: "stat", type: "text" },
        { name: "statLabel", type: "text" },
        { name: "category", type: "text" },
      ],
    },
  ],
};
