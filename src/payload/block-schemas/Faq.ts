import type { Block } from "payload";

export const FaqBlock: Block = {
  slug: "faq",
  labels: { singular: "FAQ", plural: "FAQs" },
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
    {
      name: "cta",
      type: "group",
      fields: [
        { name: "text", type: "text" },
        { name: "label", type: "text" },
        { name: "href", type: "text" },
      ],
    },
  ],
};
