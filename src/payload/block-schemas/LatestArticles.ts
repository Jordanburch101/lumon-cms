import type { Block } from "payload";

export const LatestArticlesBlock: Block = {
  slug: "latestArticles",
  labels: { singular: "Latest Articles", plural: "Latest Articles" },
  admin: {
    description:
      "Blog/article card grid with image, title, excerpt, author, date, and read time. Use for content marketing sections, blog highlights, or news feeds.",
  },
  fields: [
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    {
      name: "articles",
      type: "array",
      required: true,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "excerpt", type: "textarea", required: true },
        { name: "category", type: "text", required: true },
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "imageAlt", type: "text", required: true },
        {
          name: "author",
          type: "group",
          fields: [
            { name: "name", type: "text", required: true },
            { name: "avatar", type: "upload", relationTo: "media" },
          ],
        },
        { name: "readTime", type: "text", required: true },
        { name: "href", type: "text", required: true },
        { name: "publishedAt", type: "date", required: true },
      ],
    },
  ],
};
