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

import { faqItems, faqSectionData } from "./faq-data";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Faq() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

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
          <p className="mb-4 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
            {faqSectionData.eyebrow}
          </p>
          <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
            {faqSectionData.headline}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {faqSectionData.subtext}
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mx-auto max-w-3xl"
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
                    "border-border/40 border-b data-open:bg-transparent",
                    i === 0 && "border-t border-t-border/40"
                  )}
                  value={`faq-${String(i)}`}
                >
                  <AccordionTrigger className="py-5 font-semibold text-sm/relaxed hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm/relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
