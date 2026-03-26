import type { Block } from "payload";
import { link } from "../fields/link/link";

export const HeroSpecimenBlock: Block = {
  slug: "heroSpecimen",
  dbName: "heroSpec",
  labels: { singular: "Hero Specimen", plural: "Hero Specimen" },
  admin: {
    group: "Heroes",
    custom: {
      description:
        "Contained specimen card with header bar, text left, full-bleed image right. For structured product/service pages.",
    },
  },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      required: true,
      admin: {
        description:
          'Department classification shown in header bar, e.g. "Core Operations — MDR"',
      },
    },
    {
      name: "icon",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Small department icon displayed in the header bar.",
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
        description:
          "Department photo displayed full-bleed in the right column.",
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
