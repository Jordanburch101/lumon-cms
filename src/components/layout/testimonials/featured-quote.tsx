"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Testimonial } from "./testimonials-data";

const EASE = [0.16, 1, 0.3, 1] as const;
const WORD_STAGGER = 0.03;
const WORD_DURATION = 0.5;

interface FeaturedQuoteProps {
  duration: number;
  paused: boolean;
  testimonial: Testimonial;
}

export function FeaturedQuote({
  testimonial,
  duration,
  paused,
}: FeaturedQuoteProps) {
  const displayQuote = testimonial.featuredQuote ?? testimonial.quote;
  const words = displayQuote.split(" ");
  const totalRevealTime = words.length * WORD_STAGGER + WORD_DURATION;

  const contentRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const heightMv = useMotionValue(0);
  const heightSpring = useSpring(heightMv, { stiffness: 200, damping: 30 });

  // ResizeObserver tracks actual content size as words reveal and quotes change
  useEffect(() => {
    const el = contentRef.current;
    if (!el) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      if (hasInitialized) {
        heightMv.set(h);
      } else {
        // First meaningful size — jump immediately, then enable clipping
        heightMv.jump(h);
        setHasInitialized(true);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasInitialized, heightMv]);

  return (
    <div className="relative flex h-full flex-col justify-center">
      {/* Decorative quote mark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-4 -left-2 select-none font-serif text-[140px] text-foreground/[0.04] leading-none"
      >
        &ldquo;
      </span>

      {/* Animated height container */}
      <motion.div
        className={hasInitialized ? "overflow-hidden" : ""}
        style={hasInitialized ? { height: heightSpring } : undefined}
      >
        <div ref={contentRef}>
          <AnimatePresence mode="wait">
            <motion.div
              animate="visible"
              exit="exit"
              initial="hidden"
              key={testimonial.id}
            >
              {/* Quote text — per-word clip reveal */}
              <blockquote className="relative z-10">
                {words.map((word, i) => (
                  <span
                    className="inline-flex overflow-hidden align-bottom"
                    key={`${testimonial.id}-${i}`}
                  >
                    <motion.span
                      className="inline-block text-xl leading-relaxed tracking-tight will-change-transform sm:text-2xl lg:text-3xl lg:leading-relaxed"
                      variants={{
                        hidden: { y: "100%" },
                        visible: {
                          y: "0%",
                          transition: {
                            duration: WORD_DURATION,
                            ease: EASE,
                            delay: i * WORD_STAGGER,
                          },
                        },
                        exit: {
                          y: "-100%",
                          transition: {
                            duration: 0.25,
                            ease: EASE,
                            delay: i * 0.015,
                          },
                        },
                      }}
                    >
                      {word}
                    </motion.span>
                    {i < words.length - 1 && (
                      <span className="inline-block w-[0.3em]" />
                    )}
                  </span>
                ))}
              </blockquote>

              {/* Attribution */}
              <motion.div
                className="mt-6 flex items-center gap-3 lg:mt-8"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      duration: 0.4,
                      delay: totalRevealTime + 0.1,
                    },
                  },
                  exit: {
                    opacity: 0,
                    transition: { duration: 0.15 },
                  },
                }}
              >
                <Avatar>
                  <AvatarImage
                    alt={testimonial.name}
                    src={testimonial.avatarSrc}
                  />
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
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="mt-8 h-px w-full bg-border/60 lg:mt-10">
        <div
          className="h-full origin-left bg-foreground/20"
          key={testimonial.id}
          style={{
            animation: `progress-fill ${duration}ms linear forwards`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      </div>
    </div>
  );
}
