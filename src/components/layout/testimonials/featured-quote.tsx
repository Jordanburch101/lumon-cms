"use client";

import { AnimatePresence, motion } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Testimonial } from "./testimonials-data";

const EASE = [0.16, 1, 0.3, 1] as const;

interface FeaturedQuoteProps {
  duration: number;
  testimonial: Testimonial;
}

export function FeaturedQuote({ testimonial, duration }: FeaturedQuoteProps) {
  // Use featuredQuote (longer version) when available, fall back to quote
  const displayQuote = testimonial.featuredQuote ?? testimonial.quote;
  // Split into sentences for staggered animation
  const sentences = displayQuote.match(/[^.!?]+[.!?]+/g) ?? [displayQuote];

  return (
    <div className="relative flex h-full flex-col justify-center">
      {/* Decorative quote mark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-4 -left-2 select-none font-serif text-[140px] text-foreground/[0.04] leading-none"
      >
        &ldquo;
      </span>

      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          initial={{ opacity: 0 }}
          key={testimonial.id}
          transition={{ duration: 0.3 }}
        >
          {/* Quote text — staggered by sentence */}
          <blockquote className="relative z-10">
            {sentences.map((sentence, i) => (
              <motion.span
                animate={{ opacity: 1, y: 0 }}
                className="inline text-xl leading-relaxed tracking-tight sm:text-2xl lg:text-3xl lg:leading-relaxed"
                initial={{ opacity: 0, y: 12 }}
                key={`${testimonial.id}-${i}`}
                transition={{
                  duration: 0.5,
                  ease: EASE,
                  delay: 0.15 + i * 0.08,
                }}
              >
                {sentence}
              </motion.span>
            ))}
          </blockquote>

          {/* Attribution */}
          <motion.div
            animate={{ opacity: 1 }}
            className="mt-6 flex items-center gap-3 lg:mt-8"
            initial={{ opacity: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.15 + sentences.length * 0.08 + 0.2,
            }}
          >
            <Avatar>
              <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <span className="block font-medium text-foreground text-sm">
                {testimonial.name}
              </span>
              <span className="block text-muted-foreground text-xs">
                {testimonial.role}, {testimonial.department}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Progress bar — key forces remount (restarting animation) when testimonial changes */}
      <div className="mt-8 h-px w-full bg-border/60 lg:mt-10">
        <div
          className="h-full origin-left bg-foreground/20"
          key={testimonial.id}
          style={{
            animation: `progress-fill ${duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}
