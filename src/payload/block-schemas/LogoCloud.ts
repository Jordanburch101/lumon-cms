import type { Block } from "payload";
import { link } from "../fields/link/link";

export const LogoCloudBlock: Block = {
  slug: "logoCloud",
  labels: { singular: "Logo Cloud", plural: "Logo Clouds" },
  admin: {
    group: "Social Proof",
    images: {
      thumbnail: "/block-thumbnails/logo-cloud.png",
    },
    custom: {
      description:
        "Partner/client logo display (4-20 logos) with optional links. Variants: scrolling marquee or static grid. Use for 'trusted by', technology stack, or partner sections.",
    },
  },
  fields: [
    { name: "eyebrow", type: "text" },
    {
      name: "variant",
      type: "select",
      defaultValue: "scroll",
      options: [
        { label: "Scrolling Row", value: "scroll" },
        { label: "Featured Grid", value: "grid" },
      ],
    },
    {
      name: "logos",
      type: "array",
      minRows: 4,
      maxRows: 20,
      fields: [
        { name: "logo", type: "upload", relationTo: "media", required: true },
        { name: "name", type: "text", required: true },
        link({ name: "link" }),
      ],
    },
  ],
};
