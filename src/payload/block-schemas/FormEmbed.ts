import type { Block } from "payload";
import { richTextEditor } from "../editor/config";

export const FormEmbedBlock: Block = {
  slug: "formEmbed",
  labels: { singular: "Form Embed", plural: "Form Embeds" },
  admin: {
    group: "Content",
    images: {
      thumbnail: "/block-thumbnails/form-embed.png",
    },
    custom: {
      description:
        "Embed a form built in the admin panel. Supports stacked, split (content + form), and map (form + location) layouts.",
    },
  },
  fields: [
    {
      name: "variant",
      type: "select",
      required: true,
      defaultValue: "stacked",
      options: [
        { label: "Stacked", value: "stacked" },
        { label: "Split", value: "split" },
        { label: "Map", value: "map" },
      ],
    },
    { name: "heading", type: "text" },
    {
      name: "content",
      type: "richText",
      editor: richTextEditor,
    },
    {
      name: "form",
      type: "relationship",
      relationTo: "forms",
      required: true,
    },
    {
      name: "mapCenter",
      type: "group",
      admin: {
        condition: (_, siblingData) => siblingData?.variant === "map",
      },
      fields: [
        {
          name: "latitude",
          type: "number",
          required: true,
          admin: { step: 0.000_001 },
        },
        {
          name: "longitude",
          type: "number",
          required: true,
          admin: { step: 0.000_001 },
        },
      ],
    },
    {
      name: "mapZoom",
      type: "number",
      defaultValue: 14,
      min: 1,
      max: 20,
      admin: {
        condition: (_, siblingData) => siblingData?.variant === "map",
      },
    },
    {
      name: "mapMarkerLabel",
      type: "text",
      admin: {
        condition: (_, siblingData) => siblingData?.variant === "map",
        description: "Popup text shown when the map pin is clicked",
      },
    },
  ],
};
