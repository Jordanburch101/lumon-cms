import type { Block } from "payload";
import { link } from "../fields/link/link";

export const HeroMinimalBlock: Block = {
  slug: "heroMinimal",
  dbName: "heroMin",
  labels: { singular: "Hero Minimal", plural: "Hero Minimal" },
  admin: {
    group: "Heroes",
    images: {
      thumbnail: "/block-thumbnails/hero-minimal.png",
    },
    custom: {
      description:
        "Text-only hero with headline, subtext, and two CTA buttons. No media. Use for clean, simple page openers where the copy speaks for itself.",
    },
  },
  fields: [
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
