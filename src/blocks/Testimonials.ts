import type { Block } from "payload";

export const TestimonialsBlock: Block = {
  slug: "testimonials",
  labels: { singular: "Testimonials", plural: "Testimonials" },
  fields: [
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    {
      name: "testimonials",
      type: "array",
      required: true,
      fields: [
        { name: "name", type: "text", required: true },
        { name: "role", type: "text", required: true },
        { name: "department", type: "text", required: true },
        { name: "quote", type: "textarea", required: true },
        { name: "avatar", type: "upload", relationTo: "media" },
        { name: "featured", type: "checkbox", defaultValue: false },
        {
          name: "featuredQuote",
          type: "textarea",
          admin: {
            condition: (_, siblingData) => siblingData?.featured,
          },
        },
      ],
    },
  ],
};
