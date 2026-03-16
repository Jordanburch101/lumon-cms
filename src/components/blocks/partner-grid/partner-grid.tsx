"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import { cn, getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { PartnerGridBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;

type Partner = NonNullable<PartnerGridBlock["partners"]>[number];

/* ── Partner Card ─────────────────────────────────────── */

function PartnerCard({
  partner,
  index,
  inView,
}: {
  partner: Partner;
  index: number;
  inView: boolean;
}) {
  const logoUrl = getMediaUrl(partner.logo);
  const blurData = getBlurDataURL(partner.logo);

  const card = (
    <motion.div
      animate={inView ? { opacity: 1, y: 0 } : {}}
      className={cn(
        "group relative flex flex-col items-center rounded-lg border border-border/50 bg-card p-6 text-center transition-colors duration-300",
        "hover:border-border hover:bg-card/80",
        partner.link?.label && "cursor-pointer"
      )}
      data-array-item={`partners.${String(index)}`}
      initial={{ opacity: 0, y: 24 }}
      transition={{
        duration: 0.6,
        ease: EASE,
        delay: 0.1 + index * 0.06,
      }}
      whileHover={{ y: -4 }}
    >
      {/* Logo */}
      {logoUrl && (
        <div className="mb-5 flex h-12 items-center justify-center">
          <Image
            alt={partner.name}
            blurDataURL={blurData}
            className="h-10 w-auto max-w-[140px] opacity-70 brightness-0 transition-opacity duration-300 group-hover:opacity-100 dark:opacity-90 dark:invert"
            data-field={`partners.${String(index)}.logo`}
            height={40}
            placeholder={blurData ? "blur" : "empty"}
            src={logoUrl}
            width={140}
          />
        </div>
      )}

      {/* Divider */}
      <div className="mb-4 h-px w-8 bg-border/60 transition-colors duration-300 group-hover:bg-primary/40" />

      {/* Name */}
      <p
        className="font-semibold text-[0.9375rem] text-foreground"
        data-field={`partners.${String(index)}.name`}
      >
        {partner.name}
      </p>

      {/* Description */}
      {partner.description && (
        <p
          className="mt-2 line-clamp-3 text-muted-foreground text-sm leading-relaxed"
          data-field={`partners.${String(index)}.description`}
        >
          {partner.description}
        </p>
      )}

      {/* External link indicator */}
      {partner.link?.label && (
        <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] transition-colors duration-300 group-hover:text-foreground">
          {partner.link.label}
          <svg
            aria-hidden="true"
            className="size-3 transition-transform duration-300 group-hover:translate-x-0.5"
            fill="none"
            role="img"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <title>Arrow right</title>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </motion.div>
  );

  if (partner.link?.label) {
    return (
      <CMSLink
        className="no-underline"
        data-field-group={`partners.${String(index)}.link`}
        data-field-group-type="link"
        key={partner.id}
        link={partner.link}
      >
        {card}
      </CMSLink>
    );
  }

  return card;
}

/* ── Main Component ───────────────────────────────────── */

export function PartnerGrid({
  eyebrow,
  heading,
  description,
  partners,
}: PartnerGridBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  if (!partners || partners.length === 0) {
    return null;
  }

  return (
    <section aria-label="Partners" className="w-full" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-12 text-center lg:mb-16"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {eyebrow && (
            <p
              className="mb-4 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]"
              data-field="eyebrow"
            >
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2
              className="font-semibold text-3xl leading-tight sm:text-4xl"
              data-field="heading"
            >
              {heading}
            </h2>
          )}
          {description && (
            <p
              className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground"
              data-field="description"
            >
              {description}
            </p>
          )}
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner, i) => (
            <PartnerCard
              index={i}
              inView={inView}
              key={partner.id}
              partner={partner}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
