import type { Block } from "payload";
import { link } from "../fields/link/link";

export const LogoCloudBlock: Block = {
  slug: "logoCloud",
  labels: { singular: "Logo Cloud", plural: "Logo Clouds" },
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
