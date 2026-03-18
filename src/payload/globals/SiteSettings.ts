import type { GlobalConfig, TextFieldValidation } from "payload";
import { isAdminOrEditor } from "../access";
import { revalidateGlobalOnChange } from "../hooks/revalidate-global";

const validateUrl: TextFieldValidation = (value) => {
  if (!value) {
    return true;
  }
  if (!(value.startsWith("https://") || value.startsWith("http://"))) {
    return "URL must start with https:// or http://";
  }
  if (value.endsWith("/")) {
    return "URL must not have a trailing slash";
  }
  return true;
};

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateGlobalOnChange(["site-settings", "sitemap"])],
  },
  fields: [
    { name: "siteName", type: "text", required: true, label: "Site Name" },
    {
      name: "baseUrl",
      type: "text",
      required: true,
      label: "Base URL",
      validate: validateUrl,
      admin: {
        description: "Full URL without trailing slash (e.g. https://lumon.dev)",
      },
    },
    {
      name: "separator",
      type: "text",
      defaultValue: " | ",
      label: "Title Separator",
      admin: { description: "Character(s) between page title and site name" },
    },
    {
      name: "defaultOgImage",
      type: "upload",
      relationTo: "media",
      label: "Default OG Image",
      admin: {
        description:
          "Fallback social share image when a page has no meta image",
      },
    },
    {
      name: "robots",
      type: "group",
      label: "Robots Defaults",
      fields: [
        {
          name: "index",
          type: "checkbox",
          defaultValue: true,
          label: "Allow indexing",
        },
        {
          name: "follow",
          type: "checkbox",
          defaultValue: true,
          label: "Allow link following",
        },
      ],
    },
    {
      name: "social",
      type: "group",
      label: "Social",
      fields: [
        {
          name: "twitter",
          type: "text",
          label: "Twitter Handle",
          admin: { description: "@handle for twitter:site tag" },
        },
        {
          name: "twitterCardType",
          type: "select",
          defaultValue: "summary_large_image",
          label: "Twitter Card Type",
          options: [
            { label: "Summary", value: "summary" },
            { label: "Summary Large Image", value: "summary_large_image" },
          ],
        },
      ],
    },
    {
      name: "jsonLd",
      type: "group",
      label: "Structured Data (JSON-LD)",
      fields: [
        { name: "organizationName", type: "text", label: "Organization Name" },
        {
          name: "organizationLogo",
          type: "upload",
          relationTo: "media",
          label: "Organization Logo",
        },
        {
          name: "organizationUrl",
          type: "text",
          label: "Organization URL",
          validate: validateUrl,
        },
      ],
    },
  ],
};
