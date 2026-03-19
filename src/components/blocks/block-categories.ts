/**
 * Block category mapping — single source of truth.
 *
 * Maps Payload block slug (camelCase) → Storybook sidebar category.
 * Used by:
 *   - .storybook/generate.ts (story file generation)
 *   - scripts/generate-thumbnails.ts (thumbnail screenshot targeting)
 */
export const BLOCK_CATEGORIES: Record<string, string> = {
  hero: "Heroes",
  heroCentered: "Heroes",
  heroMinimal: "Heroes",
  heroStats: "Heroes",
  bento: "Content",
  featuresGrid: "Content",
  splitMedia: "Content",
  richTextContent: "Content",
  latestArticles: "Content",
  imageGallery: "Content",
  tabbedContent: "Content",
  timeline: "Content",
  testimonials: "Social Proof",
  team: "Social Proof",
  trust: "Social Proof",
  logoCloud: "Social Proof",
  statsBar: "Social Proof",
  partnerGrid: "Social Proof",
  cinematicCta: "CTAs",
  ctaBand: "CTAs",
  pricing: "Commerce",
  faq: "Commerce",
  jobListings: "Commerce",
  comparisonTable: "Commerce",
};
