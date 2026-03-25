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
import { FormEmbedBlock } from "../block-schemas/FormEmbed";
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
import { filterDescendants } from "../fields/parent/filterDescendants";
import { cascadeChildPaths } from "../hooks/cascadeChildPaths";
import { computePath } from "../hooks/computePath";
import { reparentOnDelete } from "../hooks/reparentOnDelete";
import { revalidateOnChange } from "../hooks/revalidateOnChange";

const { afterChange, afterDelete } = revalidateOnChange({ tags: ["sitemap"] });

export const Pages: CollectionConfig = {
  slug: "pages",
  custom: { linkable: true, sitemap: { enabled: true, urlPrefix: "" } },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    livePreview: {
      url: ({ data }) => {
        const baseUrl =
          process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3100";
        let pagePath = "";
        if (typeof data?.path === "string") {
          pagePath = data.path;
        } else if (typeof data?.slug === "string" && data.slug !== "home") {
          pagePath = data.slug;
        }
        return `${baseUrl}/preview/${pagePath || "home"}`;
      },
    },
    preview: (data) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3100";
      let pagePath = "";
      if (typeof data?.path === "string") {
        pagePath = data.path;
      } else if (typeof data?.slug === "string" && data.slug !== "home") {
        pagePath = data.slug;
      }
      return `${baseUrl}/preview/${pagePath || "home"}`;
    },
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeChange: [computePath],
    afterChange: [afterChange, cascadeChildPaths],
    afterDelete: [afterDelete, reparentOnDelete],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Hero",
          fields: [
            {
              name: "hero",
              type: "blocks",
              maxRows: 1,
              blocks: [
                HeroBlock,
                HeroCenteredBlock,
                HeroStatsBlock,
                HeroMinimalBlock,
              ],
            },
          ],
        },
        {
          label: "Content",
          fields: [
            {
              name: "layout",
              type: "blocks",
              blocks: [
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
                FormEmbedBlock,
              ],
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
    slugField({
      useAsSlug: "title",
      overrides: (field) => {
        const slugTextField = field.fields[1] as TextField;
        slugTextField.validate = validateSlug;
        return field;
      },
    }),
    {
      name: "parent",
      type: "relationship",
      relationTo: "pages",
      filterOptions: filterDescendants,
      admin: {
        position: "sidebar",
        description: "Select a parent page to nest this page under",
      },
    },
    {
      name: "path",
      type: "text",
      index: true,
      admin: {
        position: "sidebar",
        readOnly: true,
        description:
          "Auto-computed URL path (e.g., divisions/macrodata-refinement)",
      },
      hooks: {
        beforeValidate: [
          async ({ value, data, req, originalDoc }) => {
            if (value === undefined || value === null) {
              return value;
            }
            const id = originalDoc?.id ?? data?.id;
            const existing = await req.payload.find({
              collection: "pages",
              where: {
                path: { equals: value },
                ...(id ? { id: { not_equals: id } } : {}),
              },
              limit: 1,
              select: { slug: true },
            });
            if (existing.docs.length > 0) {
              throw new Error(
                `Path "${value}" is already in use by another page`
              );
            }
            return value;
          },
        ],
      },
    },
  ],
};
