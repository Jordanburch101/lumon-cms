import type { HeroFieldBlock, LayoutBlock } from "@/types/block-types";
import { BentoShowcase } from "./bento/bento";
import { CinematicCta } from "./cinematic-cta/cinematic-cta";
import { ComparisonTable } from "./comparison-table/comparison-table";
import { CtaBand } from "./cta-band/cta-band";
import { Faq } from "./faq/faq";
import { FeaturesGrid } from "./features-grid/features-grid";
import { FormEmbed } from "./form-embed/form-embed";
import { Hero } from "./hero/hero";
import { HeroCentered } from "./hero/hero-centered";
import { HeroMinimal } from "./hero/hero-minimal";
import { HeroStats } from "./hero/hero-stats";
import { ImageGallery } from "./image-gallery/image-gallery";
import { JobListings } from "./job-listings/job-listings";
import { LatestArticles } from "./latest-articles/latest-articles";
import { LogoCloud } from "./logo-cloud/logo-cloud";
import { PartnerGrid } from "./partner-grid/partner-grid";
import { Pricing } from "./pricing/pricing";
import { RichTextContent } from "./rich-text-content/rich-text-content";
import { SplitMedia } from "./split-media/split-media";
import { StatsBar } from "./stats-bar/stats-bar";
import { TabbedContent } from "./tabbed-content/tabbed-content";
import { Team } from "./team/team";
import { Testimonials } from "./testimonials/testimonials";
import { Timeline } from "./timeline/timeline";
import { Trust } from "./trust/trust";

export function renderHeroBlock(block: HeroFieldBlock) {
  switch (block.blockType) {
    case "hero":
      return <Hero {...block} />;
    case "heroCentered":
      return <HeroCentered {...block} />;
    case "heroStats":
      return <HeroStats {...block} />;
    case "heroMinimal":
      return <HeroMinimal {...block} />;
    default:
      return null;
  }
}

export function RenderHero({ blocks }: { blocks: HeroFieldBlock[] }) {
  const block = blocks[0];
  if (!block) {
    return null;
  }

  return <div data-block-type={block.blockType}>{renderHeroBlock(block)}</div>;
}

export function renderBlock(block: LayoutBlock) {
  switch (block.blockType) {
    case "bento":
      return <BentoShowcase {...block} />;
    case "splitMedia":
      return <SplitMedia {...block} />;
    case "testimonials":
      return <Testimonials {...block} />;
    case "imageGallery":
      return <ImageGallery {...block} />;
    case "latestArticles":
      return <LatestArticles {...block} />;
    case "cinematicCta":
      return <CinematicCta {...block} />;
    case "ctaBand":
      return <CtaBand {...block} />;
    case "pricing":
      return <Pricing {...block} />;
    case "faq":
      return <Faq {...block} />;
    case "featuresGrid":
      return <FeaturesGrid {...block} />;
    case "team":
      return <Team {...block} />;
    case "trust":
      return <Trust {...block} />;
    case "logoCloud":
      return <LogoCloud {...block} />;
    case "richTextContent":
      return <RichTextContent {...block} />;
    case "statsBar":
      return <StatsBar {...block} />;
    case "partnerGrid":
      return <PartnerGrid {...block} />;
    case "jobListings":
      return <JobListings {...block} />;
    case "timeline":
      return <Timeline {...block} />;
    case "tabbedContent":
      return <TabbedContent {...block} />;
    case "comparisonTable":
      return <ComparisonTable {...block} />;
    case "formEmbed":
      return <FormEmbed {...block} />;
    default:
      return null;
  }
}

/**
 * RenderBlocks — client-safe version used by both server pages and preview-client.
 * LatestArticles renders with empty articles (placeholder) in this version.
 */
export function RenderBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-16 lg:gap-32">
      {blocks.map((block, index) => (
        <div
          data-block-index={index}
          data-block-type={block.blockType}
          key={block.id}
        >
          {renderBlock(block)}
        </div>
      ))}
    </div>
  );
}
