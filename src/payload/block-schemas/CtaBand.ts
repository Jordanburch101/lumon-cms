import type { Block } from "payload";
import { link } from "../fields/link/link";

export const CtaBandBlock: Block = {
  slug: "ctaBand",
  labels: { singular: "CTA Band", plural: "CTA Bands" },
  admin: {
    custom: {
      description:
        "Compact call-to-action strip with heading, subtext, and one or two buttons. Variants: primary (colored background) or card (centered). Use between content sections to drive action.",
    },
  },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "subtext", type: "textarea" },
    {
      name: "variant",
      type: "select",
      defaultValue: "primary",
      options: [
        { label: "Primary (Blue)", value: "primary" },
        { label: "Card (Centered)", value: "card" },
      ],
    },
    link({
      name: "primaryCta",
      required: true,
      appearance: {
        type: ["button"],
        button: { variants: ["default", "outline"], sizes: ["default", "lg"] },
      },
    }),
    link({
      name: "secondaryCta",
      appearance: {
        type: ["button"],
        button: { variants: ["outline", "default"], sizes: ["default", "lg"] },
      },
    }),
  ],
};
