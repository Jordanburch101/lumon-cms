import type { Block } from "payload";
import { link } from "../fields/link/link";

export const HeroMinimalBlock: Block = {
  slug: "heroMinimal",
  dbName: "heroMin",
  labels: { singular: "Hero Minimal", plural: "Hero Minimal" },
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
