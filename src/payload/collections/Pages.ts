import type { CollectionConfig, TextFieldValidation } from "payload";
import { isAdminOrEditor } from "../access";

const RESERVED_SLUGS = new Set(["admin", "api", "preview", "next", "media"]);

const validateSlug: TextFieldValidation = (value) => {
  if (typeof value === "string" && RESERVED_SLUGS.has(value)) {
    return `"${value}" is a reserved slug and would conflict with internal routes`;
  }
  return true;
};

import { BentoBlock } from "../block-schemas/Bento";
import { CinematicCtaBlock } from "../block-schemas/CinematicCta";
import { FaqBlock } from "../block-schemas/Faq";
import { FeaturesGridBlock } from "../block-schemas/FeaturesGrid";
import { HeroBlock } from "../block-schemas/Hero";
import { ImageGalleryBlock } from "../block-schemas/ImageGallery";
import { LatestArticlesBlock } from "../block-schemas/LatestArticles";
import { PricingBlock } from "../block-schemas/Pricing";
import { RichTextContentBlock } from "../block-schemas/RichTextContent";
import { SplitMediaBlock } from "../block-schemas/SplitMedia";
import { TestimonialsBlock } from "../block-schemas/Testimonials";
import { TrustBlock } from "../block-schemas/Trust";
import { revalidateOnChange } from "../hooks/revalidateOnChange";

const { afterChange, afterDelete } = revalidateOnChange();

export const Pages: CollectionConfig = {
  slug: "pages",
  custom: { linkable: true },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [afterChange],
    afterDelete: [afterDelete],
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
      validate: validateSlug,
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
        FeaturesGridBlock,
        TrustBlock,
        RichTextContentBlock,
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
