import type { Block } from "payload";
import { link } from "../fields/link/link";

export const PricingBlock: Block = {
  slug: "pricing",
  labels: { singular: "Pricing", plural: "Pricing" },
  admin: {
    description:
      "Pricing table with tiered plans. Each tier has name, description, monthly/annual price, feature list, CTA button, optional badge, and recommended flag. Use on pricing pages.",
  },
  fields: [
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    { name: "footnote", type: "text" },
    { name: "footnoteAttribution", type: "text" },
    {
      name: "tiers",
      type: "array",
      required: true,
      fields: [
        { name: "name", type: "text", required: true },
        { name: "description", type: "text", required: true },
        { name: "monthlyPrice", type: "number", required: true },
        { name: "annualPrice", type: "number", required: true },
        {
          name: "features",
          type: "array",
          fields: [{ name: "text", type: "text", required: true }],
        },
        link({
          name: "cta",
          required: true,
          appearance: {
            type: ["button"],
            button: { variants: ["default", "outline"], sizes: ["lg"] },
          },
        }),
        { name: "badge", type: "text" },
        { name: "recommended", type: "checkbox", defaultValue: false },
      ],
    },
  ],
};
