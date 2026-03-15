import type { Block } from "payload";
import { link } from "../fields/link/link";

export const HeroCenteredBlock: Block = {
  slug: "heroCentered",
  labels: { singular: "Hero Centered", plural: "Hero Centered" },
  fields: [
    { name: "mediaSrc", type: "upload", relationTo: "media", required: true },
    {
      name: "posterSrc",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Still image shown while a video loads.",
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
