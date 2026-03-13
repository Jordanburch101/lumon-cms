"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";

import { CMSLink } from "@/components/ui/cms-link";
import { cn } from "@/core/lib/utils";
import type { PricingBlock } from "@/types/block-types";

type PricingTier = PricingBlock["tiers"][number];

interface PricingCardProps {
  isAnnual: boolean;
  tier: PricingTier;
  tierIndex: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

function AnimatedPrice({ price }: { price: number }) {
  const mv = useMotionValue(price);
  const display = useTransform(mv, (v) => {
    const rounded = Math.round(v);
    return rounded === 0 ? "Free" : `$${rounded}`;
  });

  useEffect(() => {
    const controls = animate(mv, price, { duration: 0.6, ease: EASE });
    return controls.stop;
  }, [price, mv]);

  return <motion.span>{display}</motion.span>;
}

export function PricingCard({ tier, isAnnual, tierIndex }: PricingCardProps) {
  const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
  const rec = tier.recommended ?? false;
  const features = tier.features ?? [];

  return (
    <motion.div
      className={cn(
        "relative flex h-full flex-col rounded-2xl p-8 lg:p-10",
        rec
          ? "bg-primary text-primary-foreground"
          : "border border-border/40 bg-card"
      )}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      whileHover={{ y: -4 }}
    >
      {/* Ambient glow on recommended */}
      {rec && (
        <div className="pointer-events-none absolute -inset-px animate-[pricing-glow_4s_ease-in-out_infinite] rounded-2xl" />
      )}

      {/* Tier name */}
      <span
        className={cn(
          "font-medium text-[11px] uppercase tracking-[0.2em]",
          rec ? "text-primary-foreground/60" : "text-muted-foreground"
        )}
        data-field={`tiers.${tierIndex}.name`}
      >
        {tier.name}
      </span>

      {/* Price */}
      <div className="mt-6 flex items-baseline gap-1.5">
        <span
          className="font-semibold text-5xl tracking-tight"
          data-field={`tiers.${tierIndex}.monthlyPrice`}
        >
          <AnimatedPrice price={price} />
        </span>
        {price > 0 && (
          <span
            className={cn(
              "text-sm",
              rec ? "text-primary-foreground/40" : "text-muted-foreground"
            )}
          >
            /mo
          </span>
        )}
      </div>

      {/* Description */}
      <p
        className={cn(
          "mt-3 text-sm leading-relaxed",
          rec ? "text-primary-foreground/60" : "text-muted-foreground"
        )}
        data-field={`tiers.${tierIndex}.description`}
      >
        {tier.description}
      </p>

      {/* Divider */}
      <div
        className={cn(
          "my-8 h-px",
          rec ? "bg-primary-foreground/10" : "bg-border"
        )}
      />

      {/* Features */}
      <ul className="mb-10 flex flex-1 flex-col gap-3.5">
        {features.map((feature, j) => (
          <li
            className={cn(
              "text-sm leading-relaxed",
              rec ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
            data-field={`tiers.${tierIndex}.features.${j}.text`}
            key={feature.id}
          >
            {feature.text}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <CMSLink
        className={cn(
          "w-full",
          rec &&
            "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        )}
        link={tier.cta}
      />
    </motion.div>
  );
}
