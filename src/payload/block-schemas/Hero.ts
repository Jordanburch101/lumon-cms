import type { Block } from "payload";

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Hero" },
  fields: [
    { name: "mediaSrc", type: "upload", relationTo: "media", required: true },
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    {
      name: "primaryCta",
      type: "group",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
      ],
    },
    {
      name: "secondaryCta",
      type: "group",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
      ],
    },
  ],
};
