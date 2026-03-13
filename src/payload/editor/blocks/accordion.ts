import type { Block } from "payload";

export const AccordionBlock: Block = {
  slug: "accordion",
  labels: { singular: "Accordion", plural: "Accordions" },
  fields: [
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "content", type: "textarea", required: true },
      ],
    },
  ],
};
