import type { CollectionConfig, TextField, TextFieldValidation } from "payload";
import { slugField } from "payload";
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
import { ComparisonTableBlock } from "../block-schemas/ComparisonTable";
import { CtaBandBlock } from "../block-schemas/CtaBand";
import { FaqBlock } from "../block-schemas/Faq";
import { FeaturesGridBlock } from "../block-schemas/FeaturesGrid";
import { HeroBlock } from "../block-schemas/Hero";
import { HeroCenteredBlock } from "../block-schemas/HeroCentered";
import { HeroMinimalBlock } from "../block-schemas/HeroMinimal";
import { HeroStatsBlock } from "../block-schemas/HeroStats";
import { ImageGalleryBlock } from "../block-schemas/ImageGallery";
import { JobListingsBlock } from "../block-schemas/JobListings";
import { LatestArticlesBlock } from "../block-schemas/LatestArticles";
import { LogoCloudBlock } from "../block-schemas/LogoCloud";
import { PartnerGridBlock } from "../block-schemas/PartnerGrid";
import { PricingBlock } from "../block-schemas/Pricing";
import { RichTextContentBlock } from "../block-schemas/RichTextContent";
import { SplitMediaBlock } from "../block-schemas/SplitMedia";
import { StatsBarBlock } from "../block-schemas/StatsBar";
import { TabbedContentBlock } from "../block-schemas/TabbedContent";
import { TeamBlock } from "../block-schemas/Team";
import { TestimonialsBlock } from "../block-schemas/Testimonials";
import { TimelineBlock } from "../block-schemas/Timeline";
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
    slugField({
      useAsSlug: "title",
      overrides: (field) => {
        const slugTextField = field.fields[1] as TextField;
        slugTextField.validate = validateSlug;
        return field;
      },
    }),
    {
      name: "layout",
      type: "blocks",
      blocks: [
        HeroBlock,
        HeroCenteredBlock,
        HeroStatsBlock,
        HeroMinimalBlock,
        BentoBlock,
        SplitMediaBlock,
        TestimonialsBlock,
        ImageGalleryBlock,
        LatestArticlesBlock,
        CinematicCtaBlock,
        CtaBandBlock,
        PricingBlock,
        FaqBlock,
        FeaturesGridBlock,
        TeamBlock,
        TrustBlock,
        LogoCloudBlock,
        RichTextContentBlock,
        StatsBarBlock,
        PartnerGridBlock,
        TimelineBlock,
        TabbedContentBlock,
        ComparisonTableBlock,
        JobListingsBlock,
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
