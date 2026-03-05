import { BentoShowcase } from "@/components/layout/bento/bento";
import { Hero } from "@/components/layout/hero/hero";
import { SplitMedia } from "@/components/layout/split-media/split-media";

export default function Page() {
  return (
    <>
      <Hero />
      <BentoShowcase />
      <SplitMedia />
    </>
  );
}
