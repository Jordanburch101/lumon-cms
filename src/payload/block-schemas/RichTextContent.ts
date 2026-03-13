import type { Block } from "payload";
import { richTextEditor } from "@/payload/editor/config";

export const RichTextContentBlock: Block = {
  slug: "richTextContent",
  labels: { singular: "Rich Text", plural: "Rich Text" },
  fields: [
    {
      name: "content",
      type: "richText",
      editor: richTextEditor,
      required: true,
    },
    {
      name: "maxWidth",
      type: "select",
      defaultValue: "default",
      options: [
        { label: "Narrow", value: "narrow" },
        { label: "Default", value: "default" },
        { label: "Wide", value: "wide" },
      ],
    },
  ],
};
