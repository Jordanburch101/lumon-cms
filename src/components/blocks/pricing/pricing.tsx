"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { PricingBlock } from "@/types/block-types";

import { PricingCard } from "./pricing-card";
import { PricingToggle } from "./pricing-toggle";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Pricing({
  headline,
  subtext,
  footnote,
  footnoteAttribution,
  tiers,
}: PricingBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="w-full" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Section header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
            {headline}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">{subtext}</p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-10 lg:mb-14"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        >
          <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
        </motion.div>

        {/* Mobile: Embla carousel */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="lg:hidden"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          <Carousel
            opts={{
              align: "center",
              containScroll: false,
              startIndex: 1, // Start on the recommended mid-tier plan
            }}
          >
            <CarouselContent className="-ml-4">
              {tiers.map((tier) => (
                <CarouselItem
                  className="basis-[85%] pl-4 sm:basis-[70%]"
                  key={tier.id}
                >
                  <PricingCard isAnnual={isAnnual} tier={tier} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </motion.div>

        {/* Desktop: 3-col grid */}
        <div className="hidden gap-4 lg:grid lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <motion.div
              animate={inView ? { opacity: 1, y: 0 } : {}}
              initial={{ opacity: 0, y: 24 }}
              key={tier.id}
              transition={{
                duration: 0.8,
                ease: EASE,
                delay: 0.1 + i * 0.05,
              }}
            >
              <PricingCard isAnnual={isAnnual} tier={tier} />
            </motion.div>
          ))}
        </div>

        {/* Footnote */}
        {footnote && (
          <motion.p
            animate={inView ? { opacity: 1 } : {}}
            className="mt-10 text-center text-muted-foreground/50 text-xs italic lg:mt-14"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          >
            &ldquo;{footnote}&rdquo;
            {footnoteAttribution && <> &mdash; {footnoteAttribution}</>}
          </motion.p>
        )}
      </div>
    </section>
  );
}
