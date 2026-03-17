import type { Block } from "payload";

export const BentoBlock: Block = {
  slug: "bento",
  labels: { singular: "Bento Showcase", plural: "Bento Showcases" },
  admin: {
    description:
      "Feature showcase with headline, subtext, an image card (title, description, badge), and an optional area chart. Use for 'what we do' or primary feature highlight sections.",
  },
  fields: [
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    {
      name: "image",
      type: "group",
      fields: [
        { name: "src", type: "upload", relationTo: "media", required: true },
        { name: "alt", type: "text", required: true },
        { name: "title", type: "text", required: true },
        { name: "description", type: "text", required: true },
        { name: "badge", type: "text" },
      ],
    },
    {
      name: "chartData",
      type: "array",
      fields: [
        { name: "month", type: "text", required: true },
        { name: "visitors", type: "number", required: true },
      ],
    },
  ],
};
