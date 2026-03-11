import type { CollectionConfig } from "payload";

import { BentoBlock } from "../block-schemas/Bento";
import { CinematicCtaBlock } from "../block-schemas/CinematicCta";
import { FaqBlock } from "../block-schemas/Faq";
import { HeroBlock } from "../block-schemas/Hero";
import { ImageGalleryBlock } from "../block-schemas/ImageGallery";
import { LatestArticlesBlock } from "../block-schemas/LatestArticles";
import { PricingBlock } from "../block-schemas/Pricing";
import { SplitMediaBlock } from "../block-schemas/SplitMedia";
import { TestimonialsBlock } from "../block-schemas/Testimonials";
import { TrustBlock } from "../block-schemas/Trust";

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
