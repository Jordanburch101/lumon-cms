import type { LayoutBlock } from "@/types/block-types";
import { BentoShowcase } from "./bento/bento";
import { CinematicCta } from "./cinematic-cta/cinematic-cta";
import { Faq } from "./faq/faq";
import { Hero } from "./hero/hero";
import { ImageGallery } from "./image-gallery/image-gallery";
import { LatestArticles } from "./latest-articles/latest-articles";
import { Pricing } from "./pricing/pricing";
import { SplitMedia } from "./split-media/split-media";
import { Testimonials } from "./testimonials/testimonials";
import { Trust } from "./trust/trust";

function renderBlock(block: LayoutBlock) {
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
    case "pricing":
      return <Pricing {...block} />;
    case "faq":
      return <Faq {...block} />;
    case "trust":
      return <Trust {...block} />;
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
      {blocks.map((block) => (
        <div data-section={block.blockType} key={block.id}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  );
}
