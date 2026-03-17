import type { Block } from "payload";
import { link } from "../fields/link/link";

export const FaqBlock: Block = {
  slug: "faq",
  labels: { singular: "FAQ", plural: "FAQs" },
  admin: {
    description:
      "Accordion-style FAQ section with eyebrow, headline, subtext, question/answer pairs, and optional CTA link. Use on product, pricing, or support pages.",
  },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text" },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },
    { name: "ctaText", type: "text" },
    link({ name: "cta" }),
  ],
};
