import type { Page } from "@/payload-types";

/** Single block from the Page hero field — discriminated union on `blockType`. */
export type HeroFieldBlock = NonNullable<Page["hero"]>[number];

/** Extract one hero block type by its discriminant. */
export type ExtractHeroBlock<T extends HeroFieldBlock["blockType"]> = Extract<
  HeroFieldBlock,
  { blockType: T }
>;

export type HeroBlock = ExtractHeroBlock<"hero">;
export type HeroCenteredBlock = ExtractHeroBlock<"heroCentered">;
export type HeroStatsBlock = ExtractHeroBlock<"heroStats">;
export type HeroMinimalBlock = ExtractHeroBlock<"heroMinimal">;

/** Union of all block types across all Page fields (hero + layout). */
export type AnyPageBlock = HeroFieldBlock | LayoutBlock;

/** Extract a block type from any Page field by its discriminant. */
export type ExtractAnyBlock<T extends AnyPageBlock["blockType"]> = Extract<
  AnyPageBlock,
  { blockType: T }
>;

/** Single block from the Page layout field — discriminated union on `blockType`. */
export type LayoutBlock = NonNullable<Page["layout"]>[number];

/** Extract one layout block type by its discriminant. */
export type ExtractBlock<T extends LayoutBlock["blockType"]> = Extract<
  LayoutBlock,
  { blockType: T }
>;
export type BentoBlock = ExtractBlock<"bento">;
export type SplitMediaBlock = ExtractBlock<"splitMedia">;
export type TestimonialsBlock = ExtractBlock<"testimonials">;
export type ImageGalleryBlock = ExtractBlock<"imageGallery">;
export type LatestArticlesBlock = ExtractBlock<"latestArticles">;
export type CinematicCtaBlock = ExtractBlock<"cinematicCta">;
export type CtaBandBlock = ExtractBlock<"ctaBand">;
export type PricingBlock = ExtractBlock<"pricing">;
export type FaqBlock = ExtractBlock<"faq">;
export type FeaturesGridBlock = ExtractBlock<"featuresGrid">;
export type TeamBlock = ExtractBlock<"team">;
export type TrustBlock = ExtractBlock<"trust">;
export type LogoCloudBlock = ExtractBlock<"logoCloud">;
export type RichTextContentBlock = ExtractBlock<"richTextContent">;
export type StatsBarBlock = ExtractBlock<"statsBar">;
export type PartnerGridBlock = ExtractBlock<"partnerGrid">;
export type TimelineBlock = ExtractBlock<"timeline">;
export type TabbedContentBlock = ExtractBlock<"tabbedContent">;
export type ComparisonTableBlock = ExtractBlock<"comparisonTable">;
export type JobListingsBlock = ExtractBlock<"jobListings">;
export type FormEmbedBlock = ExtractBlock<"formEmbed">;
