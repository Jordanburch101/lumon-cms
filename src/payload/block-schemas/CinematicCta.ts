import type { Block } from "payload";
import { link } from "../fields/link/link";

export const CinematicCtaBlock: Block = {
  slug: "cinematicCta",
  labels: { singular: "Cinematic CTA", plural: "Cinematic CTAs" },
  fields: [
    { name: "videoSrc", type: "upload", relationTo: "media", required: true },
    { name: "label", type: "text", required: true },
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    link({
      name: "cta",
      appearance: {
        type: ["button"],
        button: { variants: ["default", "outline"], sizes: ["lg"] },
      },
    }),
  ],
};
