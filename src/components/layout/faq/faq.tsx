"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/core/lib/utils";

import { faqItems as defaultFaqItems, faqSectionData } from "./faq-data";

const EASE = [0.16, 1, 0.3, 1] as const;

interface FaqProps {
  cta?: { text?: string; label?: string; href?: string };
  eyebrow?: string;
  headline?: string;
  items?: { question: string; answer: string }[];
  subtext?: string;
}

export function Faq(props: FaqProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const eyebrow = props.eyebrow || faqSectionData.eyebrow;
  const headline = props.headline || faqSectionData.headline;
  const subtext = props.subtext || faqSectionData.subtext;
  const faqItems = props.items || defaultFaqItems;
  const ctaText = props.cta?.text || "Still have questions?";
  const ctaLabel = props.cta?.label || "Contact your floor supervisor";
  const ctaHref = props.cta?.href || "/contact";

  return (
    <section ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.8fr] lg:gap-16">
          {/* Section header — pinned left on desktop */}
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="lg:sticky lg:top-32 lg:self-start"
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <p className="mb-4 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
              {eyebrow}
            </p>
            <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
              {headline}
            </h2>
            <p className="mt-3 text-base text-muted-foreground">{subtext}</p>

            {/* CTA */}
            <motion.p
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="mt-8 text-muted-foreground text-sm"
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
            >
              {ctaText}{" "}
              <a
                className="text-foreground underline underline-offset-4 transition-colors hover:text-foreground/70"
                href={ctaHref}
              >
                {ctaLabel}
              </a>
            </motion.p>
          </motion.div>

          {/* Accordion — right column */}
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            initial={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          >
            <Accordion
              className="rounded-none border-none"
              collapsible
              type="single"
            >
              {faqItems.map((item, i) => (
                <motion.div
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  initial={{ opacity: 0, y: 16 }}
                  key={item.question}
                  transition={{
                    duration: 0.6,
                    ease: EASE,
                    delay: 0.1 + i * 0.05,
                  }}
                >
                  <AccordionItem
                    className={cn(
                      "border-border/50 border-b data-open:bg-transparent",
                      i === 0 && "border-t border-t-border/50"
                    )}
                    value={`faq-${String(i)}`}
                  >
                    <AccordionTrigger className="py-5 text-left font-semibold text-[15px]/relaxed hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 text-muted-foreground text-sm/relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
