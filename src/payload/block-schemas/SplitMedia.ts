import type { Block } from "payload";
import { link } from "../fields/link/link";

export const SplitMediaBlock: Block = {
  slug: "splitMedia",
  labels: { singular: "Split Media", plural: "Split Media" },
  admin: {
    description:
      "Alternating text + media rows. Each row has headline, body, video/image with overlay card, and arrow-link CTA. Use for product deep-dives or feature walkthroughs. Typically 2-3 rows.",
  },
  fields: [
    {
      name: "rows",
      type: "array",
      required: true,
      fields: [
        { name: "headline", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
        { name: "mediaLabel", type: "text", required: true },
        {
          name: "mediaSrc",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        { name: "mediaAlt", type: "text", required: true },
        link({
          name: "cta",
          appearance: {
            type: ["link"],
            link: { variants: ["arrow", "plain"] },
          },
        }),
        {
          name: "mediaOverlay",
          type: "group",
          fields: [
            { name: "title", type: "text", required: true },
            { name: "badge", type: "text" },
            { name: "description", type: "text", required: true },
          ],
        },
      ],
    },
  ],
};
