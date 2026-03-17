import type { Block } from "payload";

export const TimelineBlock: Block = {
  slug: "timeline",
  labels: { singular: "Timeline", plural: "Timelines" },
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
