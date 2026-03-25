import type { GlobalConfig } from "payload";
import { isAdminOrEditor } from "../access";
import { link } from "../fields/link/link";
import { logoField } from "../fields/logo/logo";
import { revalidateGlobalOnChange } from "../hooks/revalidateGlobal";

export const Footer: GlobalConfig = {
  slug: "footer",
  label: "Footer",
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateGlobalOnChange(["footer"])],
  },
  fields: [
    logoField(),
    {
      name: "tagline",
      type: "text",
      label: "Tagline",
      admin: {
        description: "Short tagline below the logo",
      },
    },
    {
      name: "columns",
      type: "array",
      label: "Columns",
      maxRows: 6,
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          label: "Label",
        },
        {
          name: "links",
          type: "array",
          label: "Links",
          fields: [link({ required: true })],
        },
      ],
    },
    {
      name: "socialLinks",
      type: "array",
      label: "Social Links",
      fields: [
        {
          name: "platform",
          type: "select",
          required: true,
          label: "Platform",
          options: [
            { label: "GitHub", value: "github" },
            { label: "Twitter", value: "twitter" },
            { label: "LinkedIn", value: "linkedin" },
            { label: "Instagram", value: "instagram" },
            { label: "YouTube", value: "youtube" },
            { label: "Facebook", value: "facebook" },
            { label: "TikTok", value: "tiktok" },
            { label: "Discord", value: "discord" },
          ],
        },
        {
          name: "url",
          type: "text",
          required: true,
          label: "URL",
          admin: {
            description: "Full URL to your profile",
          },
        },
      ],
    },
    {
      name: "legalLinks",
      type: "array",
      label: "Legal Links",
      fields: [link({ required: true })],
    },
    {
      name: "copyrightText",
      type: "text",
      label: "Copyright Text",
      admin: {
        description: "Company name for copyright line. Year is auto-generated.",
      },
    },
  ],
};
