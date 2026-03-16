import type { Block } from "payload";

export const TimelineBlock: Block = {
  slug: "timeline",
  labels: { singular: "Timeline", plural: "Timelines" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        { name: "date", type: "text", required: true },
        { name: "heading", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
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
        { name: "image", type: "upload", relationTo: "media" },
      ],
    },
  ],
};
