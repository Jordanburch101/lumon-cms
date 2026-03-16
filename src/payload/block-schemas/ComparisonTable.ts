import type { Block } from "payload";
import { link } from "../fields/link/link";

export const ComparisonTableBlock: Block = {
  slug: "comparisonTable",
  labels: { singular: "Comparison Table", plural: "Comparison Tables" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "features",
      type: "array",
      required: true,
      fields: [
        { name: "name", type: "text", required: true },
        { name: "tooltip", type: "text" },
        { name: "category", type: "text" },
      ],
    },
    {
      name: "plans",
      type: "array",
      required: true,
      minRows: 2,
      maxRows: 4,
      fields: [
        { name: "name", type: "text", required: true },
        { name: "price", type: "text" },
        { name: "description", type: "text" },
        { name: "recommended", type: "checkbox", defaultValue: false },
        link({
          name: "cta",
          required: true,
          appearance: {
            type: ["button"],
            button: {
              variants: ["default", "outline"],
              sizes: ["default", "lg"],
            },
          },
        }),
        {
          name: "values",
          type: "array",
          required: true,
          fields: [
            { name: "featureIndex", type: "number", required: true },
            {
              name: "value",
              type: "select",
              options: [
                { label: "Included", value: "included" },
                { label: "Excluded", value: "excluded" },
                { label: "Partial", value: "partial" },
                { label: "Text", value: "text" },
              ],
            },
            {
              name: "textValue",
              type: "text",
              admin: {
                condition: (_, siblingData) => siblingData?.value === "text",
              },
            },
          ],
        },
      ],
    },
  ],
};
