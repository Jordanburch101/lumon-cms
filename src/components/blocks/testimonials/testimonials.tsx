"use client";

import { motion, useInView } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { TestimonialsBlock } from "@/types/block-types";
import { FeaturedQuote } from "./featured-quote";
import { QuoteCard } from "./quote-card";

export type TestimonialItem = TestimonialsBlock["testimonials"][number];

const ADVANCE_MS = 6000;
const EASE = [0.16, 1, 0.3, 1] as const;

export function Testimonials({
  headline,
  subtext,
  testimonials,
}: TestimonialsBlock) {
  const featuredTestimonials = testimonials.filter((t) => t.featured);
  const shortTestimonials = testimonials.filter((t) => !t.featured);

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const isVisible = useInView(sectionRef, { margin: "-50px" });

  const [activeIndex, setActiveIndex] = useState(0);
  const [activePool, setActivePool] =
    useState<TestimonialItem[]>(featuredTestimonials);
  const [timerKey, setTimerKey] = useState(0);
  const activeTestimonial = activePool[activeIndex % activePool.length];

  // Sync activePool when testimonials prop changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: testimonials identity changes when props change
  useEffect(() => {
    setActivePool(featuredTestimonials);
    setActiveIndex(0);
  }, [testimonials]);

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
    (testimonial: TestimonialItem) => {
      const newPool = [testimonial, ...featuredTestimonials];
      setActivePool(newPool);
      setActiveIndex(0);
      setTimerKey((k) => k + 1);
    },
    [featuredTestimonials]
  );

  return (
    <section aria-label="Testimonials" className="w-full" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Section header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-10 max-w-2xl lg:mb-14"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <h2
            className="font-semibold text-3xl leading-tight sm:text-4xl"
            data-field="headline"
          >
            {headline}
          </h2>
          <p
            className="mt-3 text-base text-muted-foreground"
            data-field="subtext"
          >
            {subtext}
          </p>
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
            <div
              data-array-item={`testimonials.${testimonials.indexOf(activeTestimonial)}`}
            >
              <FeaturedQuote
                duration={ADVANCE_MS}
                fieldPrefix={`testimonials.${testimonials.indexOf(activeTestimonial)}`}
                paused={!isVisible}
                testimonial={activeTestimonial}
              />
            </div>
          </div>

          {/* Short quote cards — 2 of 5 columns */}
          <div className="lg:col-span-2">
            {/* Desktop: 2x2 grid */}
            <div className="hidden gap-3 lg:grid lg:grid-cols-2">
              {shortTestimonials.map((t) => {
                const origIdx = testimonials.indexOf(t);
                return (
                  <div data-array-item={`testimonials.${origIdx}`} key={t.id}>
                    <QuoteCard
                      fieldPrefix={`testimonials.${origIdx}`}
                      isActive={activeTestimonial.id === t.id}
                      onSelect={() => handleSelectShort(t)}
                      testimonial={t}
                    />
                  </div>
                );
              })}
            </div>

            {/* Mobile: horizontal scroll */}
            <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden">
              {shortTestimonials.map((t) => {
                const origIdx = testimonials.indexOf(t);
                return (
                  <div
                    className="w-[260px] shrink-0"
                    data-array-item={`testimonials.${origIdx}`}
                    key={t.id}
                  >
                    <QuoteCard
                      fieldPrefix={`testimonials.${origIdx}`}
                      isActive={activeTestimonial.id === t.id}
                      onSelect={() => handleSelectShort(t)}
                      testimonial={t}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
