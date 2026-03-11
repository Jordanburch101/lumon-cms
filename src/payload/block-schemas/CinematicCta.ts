import type { Block } from "payload";

export const CinematicCtaBlock: Block = {
  slug: "cinematicCta",
  labels: { singular: "Cinematic CTA", plural: "Cinematic CTAs" },
  fields: [
    { name: "videoSrc", type: "upload", relationTo: "media", required: true },
    { name: "label", type: "text", required: true },
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    {
      name: "cta",
      type: "group",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
      ],
    },
  ],
};
