import type { Block } from "payload";
import { link } from "../fields/link/link";

export const FeaturesGridBlock: Block = {
  slug: "featuresGrid",
  labels: { singular: "Features Grid", plural: "Features Grids" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "items",
      type: "array",
      minRows: 2,
      maxRows: 9,
      fields: [
        {
          name: "icon",
          type: "select",
          options: [
            { label: "Layers", value: "layers" },
            { label: "Shield Check", value: "shieldCheck" },
            { label: "Lightning", value: "lightning" },
            { label: "Lock", value: "lock" },
            { label: "Chart", value: "chart" },
            { label: "Sync", value: "sync" },
            { label: "Globe", value: "globe" },
            { label: "Code", value: "code" },
            { label: "Database", value: "database" },
            { label: "Cpu", value: "cpu" },
            { label: "Users", value: "users" },
            { label: "Settings", value: "settings" },
          ],
        },
        { name: "label", type: "text" },
        { name: "heading", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
        link({ name: "link" }),
      ],
    },
  ],
};
