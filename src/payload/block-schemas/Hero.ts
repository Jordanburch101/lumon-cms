import type { Block } from "payload";
import { link } from "../fields/link/link";

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Hero" },
  fields: [
    { name: "mediaSrc", type: "upload", relationTo: "media", required: true },
    {
      name: "posterSrc",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Still image shown while a video loads. Upload a frame from the video for best results.",
      },
    },
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    link({
      name: "primaryCta",
      required: true,
      appearance: {
        type: ["button"],
        button: { variants: ["default", "outline"], sizes: ["lg"] },
      },
    }),
    link({
      name: "secondaryCta",
      required: true,
      appearance: {
        type: ["button"],
        button: { variants: ["outline", "default"], sizes: ["lg"] },
      },
    }),
  ],
};
