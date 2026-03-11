import { BentoShowcase } from "@/components/layout/bento/bento";
import { CinematicCta } from "@/components/layout/cinematic-cta/cinematic-cta";
import { Faq } from "@/components/layout/faq/faq";
import { Hero } from "@/components/layout/hero/hero";
import { ImageGallery } from "@/components/layout/image-gallery/image-gallery";
import { LatestArticles } from "@/components/layout/latest-articles/latest-articles";
import { Pricing } from "@/components/layout/pricing/pricing";
import { SplitMedia } from "@/components/layout/split-media/split-media";
import { Testimonials } from "@/components/layout/testimonials/testimonials";
import { Trust } from "@/components/layout/trust/trust";

// Temporary until payload-types.ts is generated
interface LayoutBlock {
  blockType: string;
  id: string;
  // biome-ignore lint/suspicious/noExplicitAny: dynamic block props from Payload CMS
  [key: string]: any;
}

// biome-ignore lint/suspicious/noExplicitAny: blocks have varying prop shapes
const blockComponents: Record<string, React.ComponentType<any>> = {
  hero: Hero,
  bento: BentoShowcase,
  splitMedia: SplitMedia,
  testimonials: Testimonials,
  imageGallery: ImageGallery,
  latestArticles: LatestArticles,
  cinematicCta: CinematicCta,
  pricing: Pricing,
  faq: Faq,
  trust: Trust,
};

export function RenderBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-16 lg:gap-32">
      {blocks.map((block) => {
        const Component = blockComponents[block.blockType];
        if (!Component) {
          return null;
        }

        return (
          <div data-section={block.blockType} key={block.id}>
            <Component {...block} />
          </div>
        );
      })}
    </div>
  );
}
