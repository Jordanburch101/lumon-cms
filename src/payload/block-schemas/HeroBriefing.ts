import type { Block } from "payload";
import { link } from "../fields/link/link";

export const HeroBriefingBlock: Block = {
  slug: "heroBriefing",
  dbName: "heroBrief",
  labels: { singular: "Hero Briefing", plural: "Hero Briefing" },
  admin: {
    group: "Heroes",
    custom: {
      description:
        "Cinematic letterbox image (21:9) with text below. For editorial/brand pages where photography is the star.",
    },
  },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      required: true,
      admin: {
        description:
          'Department classification, e.g. "Research & Development — Biotech"',
      },
    },
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    {
      name: "mediaSrc",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description: "Department photo displayed in a cinematic 21:9 letterbox crop.",
      },
    },
    {
      name: "posterSrc",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Fallback poster image if mediaSrc is a video.",
      },
    },
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
