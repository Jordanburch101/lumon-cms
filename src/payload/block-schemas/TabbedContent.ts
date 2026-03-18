import type { Block } from "payload";

export const TabbedContentBlock: Block = {
  slug: "tabbedContent",
  labels: { singular: "Tabbed Content", plural: "Tabbed Content" },
  admin: {
    group: "Content",
    images: {
      thumbnail: "/block-thumbnails/tabbed-content.png",
    },
    custom: {
      description:
        "Tabbed interface with 2+ tabs. Each tab has label, heading, description, optional image, icon, and feature bullet list. Use for multi-faceted product features or service categories.",
    },
  },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "tabs",
      type: "array",
      required: true,
      minRows: 2,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "heading", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
        { name: "image", type: "upload", relationTo: "media" },
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
        {
          name: "features",
          type: "array",
          fields: [{ name: "text", type: "text", required: true }],
        },
      ],
    },
  ],
};
