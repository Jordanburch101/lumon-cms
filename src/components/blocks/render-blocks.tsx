import type { LayoutBlock } from "@/types/block-types";
import { BentoShowcase } from "./bento/bento";
import { CinematicCta } from "./cinematic-cta/cinematic-cta";
import { CtaBand } from "./cta-band/cta-band";
import { Faq } from "./faq/faq";
import { FeaturesGrid } from "./features-grid/features-grid";
import { Hero } from "./hero/hero";
import { ImageGallery } from "./image-gallery/image-gallery";
import { LatestArticles } from "./latest-articles/latest-articles";
import { LogoCloud } from "./logo-cloud/logo-cloud";
import { Pricing } from "./pricing/pricing";
import { RichTextContent } from "./rich-text-content/rich-text-content";
import { SplitMedia } from "./split-media/split-media";
import { Team } from "./team/team";
import { Testimonials } from "./testimonials/testimonials";
import { Trust } from "./trust/trust";

export function renderBlock(block: LayoutBlock) {
  switch (block.blockType) {
    case "hero":
      return <Hero {...block} />;
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
    default:
      return null;
  }
}

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
