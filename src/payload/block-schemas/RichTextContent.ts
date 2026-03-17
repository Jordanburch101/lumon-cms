import type { Block } from "payload";
import { richTextEditor } from "@/payload/editor/config";

export const RichTextContentBlock: Block = {
  slug: "richTextContent",
  labels: { singular: "Rich Text", plural: "Rich Text" },
  admin: {
    custom: {
      description:
        "Free-form rich text content via Lexical editor. Width options: narrow, default, wide. Use for long-form prose, legal text, policy pages, or any unstructured content section.",
    },
  },
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
