import type { Block } from "payload";

export const RichTextMediaBlock: Block = {
  slug: "richTextMedia",
  labels: { singular: "Media", plural: "Media" },
  admin: {
    components: {
      Block:
        "@/components/features/rich-text/editor-previews/media-preview#MediaPreview",
    },
  },
  fields: [
    { name: "mediaSrc", type: "upload", relationTo: "media", required: true },
    { name: "caption", type: "text" },
    { name: "credit", type: "text" },
    { name: "creditUrl", type: "text" },
    {
      name: "size",
      type: "select",
      defaultValue: "full",
      options: [
        { label: "Full", value: "full" },
        { label: "Large", value: "large" },
        { label: "Medium", value: "medium" },
        { label: "Small", value: "small" },
      ],
    },
    {
      name: "alignment",
      type: "select",
      defaultValue: "center",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    { name: "rounded", type: "checkbox", defaultValue: true },
  ],
};
