import type { Block } from "payload";

export const AccordionBlock: Block = {
  slug: "accordion",
  labels: { singular: "Accordion", plural: "Accordions" },
  admin: {
    components: {
      Block:
        "@/components/features/rich-text/editor-previews/accordion-preview#AccordionPreview",
    },
  },
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
