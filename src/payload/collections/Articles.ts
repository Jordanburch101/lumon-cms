import type { CollectionConfig } from "payload";
import { slugField } from "payload";
import { isAdminOrEditor } from "../access";
import { richTextEditor } from "../editor/config";
import { computeReadTime } from "../hooks/computeReadTime";
import { revalidateOnChange } from "../hooks/revalidateOnChange";

const { afterChange, afterDelete } = revalidateOnChange({ tags: ["sitemap"] });

export const Articles: CollectionConfig = {
  slug: "articles",
  custom: { sitemap: { enabled: true, urlPrefix: "/blog" } },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "author", "publishedAt", "updatedAt"],
    group: "Blog",
    livePreview: {
      url: ({ data }) => {
        const baseUrl =
          process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3100";
        const slug = typeof data?.slug === "string" ? data.slug : "";
        return `${baseUrl}/preview/blog/${slug}`;
      },
    },
    preview: (data) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3100";
      const slug = typeof data?.slug === "string" ? data.slug : "";
      return `${baseUrl}/preview/blog/${slug}`;
    },
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeChange: [computeReadTime],
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            {
              name: "heroImage",
              type: "upload",
              relationTo: "media",
              required: true,
            },
            {
              name: "excerpt",
              type: "textarea",
              required: true,
              admin: {
                description: "Short summary for cards and SEO fallback",
              },
            },
            {
              name: "body",
              type: "richText",
              required: true,
              editor: richTextEditor,
            },
          ],
        },
      ],
    },
    {
      name: "title",
      type: "text",
      required: true,
      admin: { position: "sidebar" },
    },
    slugField({ useAsSlug: "title" }),
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
      hasMany: false,
      admin: { position: "sidebar" },
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      name: "readTime",
      type: "number",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Auto-calculated from body content (minutes)",
      },
    },
    {
      name: "showAuthorOverride",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Override author display details for this article",
      },
    },
    {
      name: "authorOverride",
      type: "group",
      admin: {
        condition: (data) => data?.showAuthorOverride === true,
      },
      fields: [
        {
          name: "displayName",
          type: "text",
        },
        {
          name: "avatar",
          type: "upload",
          relationTo: "media",
        },
        {
          name: "bio",
          type: "textarea",
        },
      ],
    },
  ],
};
