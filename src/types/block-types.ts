import type { Page } from "@/payload-types";

/** Single block from a Page layout — discriminated union on `blockType`. */
export type LayoutBlock = NonNullable<Page["layout"]>[number];

/** Extract one block type by its discriminant. */
export type ExtractBlock<T extends LayoutBlock["blockType"]> = Extract<
  LayoutBlock,
  { blockType: T }
>;

export type HeroBlock = ExtractBlock<"hero">;
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
export type RichTextContentBlock = ExtractBlock<"richTextContent">;
