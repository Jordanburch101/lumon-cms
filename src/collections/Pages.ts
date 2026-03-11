import type { CollectionConfig } from "payload";

import { BentoBlock } from "../blocks/Bento";
import { CinematicCtaBlock } from "../blocks/CinematicCta";
import { FaqBlock } from "../blocks/Faq";
import { HeroBlock } from "../blocks/Hero";
import { ImageGalleryBlock } from "../blocks/ImageGallery";
import { LatestArticlesBlock } from "../blocks/LatestArticles";
import { PricingBlock } from "../blocks/Pricing";
import { SplitMediaBlock } from "../blocks/SplitMedia";
import { TestimonialsBlock } from "../blocks/Testimonials";
import { TrustBlock } from "../blocks/Trust";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "layout",
      type: "blocks",
      blocks: [
        HeroBlock,
        BentoBlock,
        SplitMediaBlock,
        TestimonialsBlock,
        ImageGalleryBlock,
        LatestArticlesBlock,
        CinematicCtaBlock,
        PricingBlock,
        FaqBlock,
        TrustBlock,
      ],
    },
    {
      name: "meta",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
        { name: "image", type: "upload", relationTo: "media" },
      ],
    },
  ],
};
