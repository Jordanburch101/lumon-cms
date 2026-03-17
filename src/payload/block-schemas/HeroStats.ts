import type { Block } from "payload";
import { link } from "../fields/link/link";

export const HeroStatsBlock: Block = {
  slug: "heroStats",
  dbName: "heroStat",
  labels: { singular: "Hero Stats", plural: "Hero Stats" },
  admin: {
    description:
      "Hero with optional stats grid (up to 4 key metrics) or media fallback. Two CTAs. Use when you want to lead with impressive numbers alongside a headline.",
  },
  fields: [
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    {
      name: "stats",
      type: "array",
      maxRows: 4,
      admin: {
        description:
          "Stats displayed in a grid panel. Leave empty and provide media instead.",
      },
      fields: [
        { name: "value", type: "text", required: true },
        { name: "label", type: "text", required: true },
      ],
    },
    {
      name: "mediaSrc",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Shown when no stats are provided. Optional if stats are populated.",
      },
    },
    {
      name: "posterSrc",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Still image shown while a video loads.",
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
