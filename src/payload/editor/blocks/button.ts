import type { Block } from "payload";
import { link } from "../../fields/link/link";

export const RichTextButtonBlock: Block = {
  slug: "richTextButton",
  labels: { singular: "Button", plural: "Buttons" },
  fields: [
    link({
      name: "link",
      required: true,
      appearance: {
        type: ["button"],
        button: {
          variants: ["default", "secondary", "outline"],
          sizes: ["sm", "default", "lg"],
        },
      },
    }),
  ],
};
