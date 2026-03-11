"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import { PricingCard } from "./pricing-card";
import {
  pricingTiers as defaultPricingTiers,
  type PricingTier,
  pricingSectionData,
} from "./pricing-data";
import { PricingToggle } from "./pricing-toggle";

const EASE = [0.16, 1, 0.3, 1] as const;

interface PricingProps {
  footnote?: string;
  footnoteAttribution?: string;
  headline?: string;
  subtext?: string;
  tiers?: {
    name: string;
    description: string;
    monthlyPrice: number;
    annualPrice: number;
    features: { text: string }[] | string[];
    cta: { label: string; href: string };
    badge?: string;
    recommended?: boolean;
  }[];
}

export function Pricing(props: PricingProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isAnnual, setIsAnnual] = useState(false);

  const headline = props.headline || pricingSectionData.headline;
  const subtext = props.subtext || pricingSectionData.subtext;
  const footnote = props.footnote || pricingSectionData.footnote;
  const footnoteAttribution =
    props.footnoteAttribution || pricingSectionData.footnoteAttribution;

  const pricingTiers: PricingTier[] = props.tiers
    ? props.tiers.map((t) => ({
        name: t.name,
        description: t.description,
        monthlyPrice: t.monthlyPrice,
        annualPrice: t.annualPrice,
        features: t.features.map((f) => (typeof f === "string" ? f : f.text)),
        cta: t.cta,
        badge: t.badge,
        recommended: t.recommended,
      }))
    : defaultPricingTiers;

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
              {pricingTiers.map((tier) => (
                <CarouselItem
                  className="basis-[85%] pl-4 sm:basis-[70%]"
                  key={tier.name}
                >
                  <PricingCard isAnnual={isAnnual} tier={tier} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </motion.div>

        {/* Desktop: 3-col grid */}
        <div className="hidden gap-4 lg:grid lg:grid-cols-3">
          {pricingTiers.map((tier, i) => (
            <motion.div
              animate={inView ? { opacity: 1, y: 0 } : {}}
              initial={{ opacity: 0, y: 24 }}
              key={tier.name}
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
        <motion.p
          animate={inView ? { opacity: 1 } : {}}
          className="mt-10 text-center text-muted-foreground/50 text-xs italic lg:mt-14"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
        >
          &ldquo;{footnote}&rdquo; &mdash; {footnoteAttribution}
        </motion.p>
      </div>
    </section>
  );
}
