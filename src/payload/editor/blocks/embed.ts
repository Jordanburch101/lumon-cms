import type { Block } from "payload";

export const EmbedBlock: Block = {
  slug: "embed",
  labels: { singular: "Embed", plural: "Embeds" },
  admin: {
    components: {
      Block:
        "@/components/features/rich-text/editor-previews/embed-preview#EmbedPreview",
    },
  },
  fields: [
    { name: "url", type: "text", required: true },
    {
      name: "aspectRatio",
      type: "select",
      defaultValue: "16:9",
      options: [
        { label: "16:9", value: "16:9" },
        { label: "4:3", value: "4:3" },
        { label: "1:1", value: "1:1" },
      ],
    },
    {
      name: "maxWidth",
      type: "select",
      defaultValue: "large",
      options: [
        { label: "Full", value: "full" },
        { label: "Large", value: "large" },
        { label: "Medium", value: "medium" },
      ],
    },
  ],
};
