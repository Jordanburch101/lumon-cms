import type { Block } from "payload";

export const LatestArticlesBlock: Block = {
  slug: "latestArticles",
  labels: { singular: "Latest Articles", plural: "Latest Articles" },
  admin: {
    group: "Content",
    images: {
      thumbnail: "/block-thumbnails/latest-articles.png",
    },
    custom: {
      description:
        "Displays the latest articles from the blog. Shows a featured card and supporting grid.",
    },
  },
  fields: [
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    {
      name: "limit",
      type: "number",
      defaultValue: 5,
      min: 1,
      max: 10,
      admin: {
        description: "Number of articles to display (default: 5)",
      },
    },
  ],
};
