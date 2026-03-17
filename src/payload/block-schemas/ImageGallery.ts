import type { Block } from "payload";

export const ImageGalleryBlock: Block = {
  slug: "imageGallery",
  labels: { singular: "Image Gallery", plural: "Image Galleries" },
  admin: {
    description:
      "Grid of labeled images with captions. Each item has a label, caption, image, and alt text. Use for portfolio showcases, case study visuals, or photo galleries.",
  },
  fields: [
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "caption", type: "text", required: true },
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "imageAlt", type: "text", required: true },
      ],
    },
  ],
};
