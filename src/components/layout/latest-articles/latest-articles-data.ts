export interface Article {
  author: {
    name: string;
    avatarSrc: string;
  };
  category: string;
  excerpt: string;
  href: string;
  id: string;
  imageAlt: string;
  imageSrc: string;
  publishedAt: string;
  readTime: string;
  title: string;
}

export const latestArticlesSectionData = {
  headline: "Latest from the blog",
  subtext:
    "Insights, updates, and dispatches from the severed floor and beyond.",
} as const;

export const latestArticles: Article[] = [
  {
    id: "severance-protocol",
    title:
      "Understanding the Severance Protocol: A New Era of Work-Life Balance",
    excerpt:
      "How Lumon's revolutionary procedure is redefining what it means to leave work at the office. A deep dive into the science and philosophy behind the split.",
    category: "Research",
    imageSrc: "/gallery/gallery-1.jpg",
    imageAlt: "Lumon severance research facility",
    author: {
      name: "Harmony Cobel",
      avatarSrc: "/testimonials/cobel.jpg",
    },
    readTime: "8 min read",
    href: "/blog/severance-protocol",
    publishedAt: "2026-03-01",
  },
  {
    id: "waffle-party",
    title: "Inside the Waffle Party: Lumon's Most Coveted Incentive",
    excerpt:
      "What makes the waffle party the ultimate reward? We explore the history, the ritual, and why top refiners will do anything to earn one.",
    category: "Culture",
    imageSrc: "/gallery/gallery-2.jpg",
    imageAlt: "Lumon waffle party celebration",
    author: {
      name: "Seth Milchick",
      avatarSrc: "/testimonials/milchick.png",
    },
    readTime: "5 min read",
    href: "/blog/waffle-party",
    publishedAt: "2026-02-22",
  },
  {
    id: "perpetuity-wing",
    title: "The Perpetuity Wing: Walking with Kier",
    excerpt:
      "A guided tour through nine floors of founder legacy, preserved in wax and devotion.",
    category: "Heritage",
    imageSrc: "/gallery/gallery-3.jpg",
    imageAlt: "The Perpetuity Wing at Lumon Industries",
    author: {
      name: "Irving B.",
      avatarSrc: "/testimonials/irving.webp",
    },
    readTime: "6 min read",
    href: "/blog/perpetuity-wing",
    publishedAt: "2026-02-15",
  },
];

export const featuredArticle = latestArticles[0];
export const supportingArticles = latestArticles.slice(1);
