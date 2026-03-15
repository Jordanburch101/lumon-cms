import type { Block } from "payload";

export const TeamBlock: Block = {
  slug: "team",
  labels: { singular: "Team", plural: "Team" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "variant",
      type: "select",
      defaultValue: "detailed",
      options: [
        { label: "Detailed", value: "detailed" },
        { label: "Compact", value: "compact" },
      ],
    },
    {
      name: "members",
      type: "array",
      minRows: 1,
      maxRows: 12,
      fields: [
        { name: "photo", type: "upload", relationTo: "media" },
        { name: "name", type: "text", required: true },
        { name: "role", type: "text", required: true },
        { name: "department", type: "text" },
        { name: "bio", type: "textarea" },
        {
          name: "links",
          type: "array",
          maxRows: 4,
          fields: [
            {
              name: "platform",
              type: "select",
              options: [
                { label: "LinkedIn", value: "linkedin" },
                { label: "Twitter / X", value: "twitter" },
                { label: "GitHub", value: "github" },
                { label: "Website", value: "website" },
              ],
            },
            { name: "url", type: "text", required: true },
          ],
        },
      ],
    },
  ],
};
