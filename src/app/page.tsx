import { BentoShowcase } from "@/components/layout/bento/bento";
import { CinematicCta } from "@/components/layout/cinematic-cta/cinematic-cta";
import { Hero } from "@/components/layout/hero/hero";
import { ImageGallery } from "@/components/layout/image-gallery/image-gallery";
import { LatestArticles } from "@/components/layout/latest-articles/latest-articles";
import { SplitMedia } from "@/components/layout/split-media/split-media";
import { Testimonials } from "@/components/layout/testimonials/testimonials";

export default function Page() {
  return (
    <>
      <Hero />
      <BentoShowcase />
      <SplitMedia />
      <Testimonials />
      <ImageGallery />
      <LatestArticles />
      <CinematicCta />
    </>
  );
}
