"use client";

import { motion, useInView } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { getMediaUrl } from "@/core/lib/utils";
import { FeaturedQuote } from "./featured-quote";
import { QuoteCard } from "./quote-card";
import {
  featuredTestimonials as defaultFeatured,
  shortTestimonials as defaultShort,
  type Testimonial,
  testimonialsSectionData,
} from "./testimonials-data";

const ADVANCE_MS = 6000;
const EASE = [0.16, 1, 0.3, 1] as const;

interface TestimonialsProps {
  headline?: string;
  subtext?: string;
  testimonials?: {
    avatar?: { url?: string } | string;
    department: string;
    featured?: boolean;
    featuredQuote?: string;
    id?: string;
    name: string;
    quote: string;
    role: string;
  }[];
}

/** Map a Payload testimonial item to the internal Testimonial shape. */
function toTestimonial(
  item: NonNullable<TestimonialsProps["testimonials"]>[number],
  index: number
): Testimonial {
  return {
    id: item.id || `t-${index}`,
    avatarSrc: getMediaUrl(item.avatar),
    name: item.name,
    role: item.role,
    department: item.department,
    quote: item.quote,
    featured: item.featured,
    featuredQuote: item.featuredQuote,
  };
}

export function Testimonials(props: TestimonialsProps) {
  const headline = props.headline || testimonialsSectionData.headline;
  const subtext = props.subtext || testimonialsSectionData.subtext;

  // Resolve testimonials from props or fallback to data file
  const payloadTestimonials = props.testimonials;
  const hasPayloadData =
    payloadTestimonials !== undefined && payloadTestimonials.length > 0;
  const allTestimonials = hasPayloadData
    ? payloadTestimonials.map(toTestimonial)
    : undefined;

  const featuredTestimonials = allTestimonials
    ? allTestimonials.filter((t) => t.featured)
    : defaultFeatured;
  const shortTestimonials = allTestimonials
    ? allTestimonials.filter((t) => !t.featured)
    : defaultShort;

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const isVisible = useInView(sectionRef, { margin: "-50px" });

  const [activeIndex, setActiveIndex] = useState(0);
  const [activePool, setActivePool] =
    useState<Testimonial[]>(featuredTestimonials);
  const [timerKey, setTimerKey] = useState(0);
  const activeTestimonial = activePool[activeIndex % activePool.length];

  // Sync activePool when featuredTestimonials changes (e.g. props arrive)
  // biome-ignore lint/correctness/useExhaustiveDependencies: featuredTestimonials identity changes when props change
  useEffect(() => {
    setActivePool(featuredTestimonials);
    setActiveIndex(0);
  }, [hasPayloadData]);

  // Auto-advance timer — only runs while section is visible in viewport
  // biome-ignore lint/correctness/useExhaustiveDependencies: timerKey intentionally resets the interval
  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % activePool.length);
    }, ADVANCE_MS);

    return () => clearInterval(timer);
  }, [isVisible, activePool.length, timerKey]);

  // Handle short quote card click — promote to spotlight and reset timer
  const handleSelectShort = useCallback(
    (testimonial: Testimonial) => {
      const newPool = [testimonial, ...featuredTestimonials];
      setActivePool(newPool);
      setActiveIndex(0);
      setTimerKey((k) => k + 1);
    },
    [featuredTestimonials]
  );

  return (
    <section className="w-full" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Section header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-10 max-w-2xl lg:mb-14"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
            {headline}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">{subtext}</p>
        </motion.div>

        {/* Content grid */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          {/* Featured spotlight — 3 of 5 columns */}
          <div className="lg:col-span-3">
            <FeaturedQuote
              duration={ADVANCE_MS}
              paused={!isVisible}
              testimonial={activeTestimonial}
            />
          </div>

          {/* Short quote cards — 2 of 5 columns */}
          <div className="lg:col-span-2">
            {/* Desktop: 2x2 grid */}
            <div className="hidden gap-3 lg:grid lg:grid-cols-2">
              {shortTestimonials.map((t) => (
                <QuoteCard
                  isActive={activeTestimonial.id === t.id}
                  key={t.id}
                  onSelect={() => handleSelectShort(t)}
                  testimonial={t}
                />
              ))}
            </div>

            {/* Mobile: horizontal scroll */}
            <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden">
              {shortTestimonials.map((t) => (
                <div className="w-[260px] shrink-0" key={t.id}>
                  <QuoteCard
                    isActive={activeTestimonial.id === t.id}
                    onSelect={() => handleSelectShort(t)}
                    testimonial={t}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
