import type { Block } from "payload";
import { link } from "../fields/link/link";

export const PartnerGridBlock: Block = {
  slug: "partnerGrid",
  labels: { singular: "Partner Grid", plural: "Partner Grids" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "partners",
      type: "array",
      required: true,
      fields: [
        { name: "logo", type: "upload", relationTo: "media" },
        { name: "name", type: "text", required: true },
        { name: "description", type: "text" },
        link({ name: "link" }),
      ],
    },
  ],
};
