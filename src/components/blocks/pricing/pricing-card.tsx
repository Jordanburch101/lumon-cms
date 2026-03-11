"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/core/lib/utils";
import type { PricingBlock } from "@/types/block-types";

type PricingTier = PricingBlock["tiers"][number];

interface PricingCardProps {
  isAnnual: boolean;
  tier: PricingTier;
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

export function PricingCard({ tier, isAnnual }: PricingCardProps) {
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
      >
        {tier.name}
      </span>

      {/* Price */}
      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="font-semibold text-5xl tracking-tight">
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
        {features.map((feature) => (
          <li
            className={cn(
              "text-sm leading-relaxed",
              rec ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
            key={feature.id ?? feature.text}
          >
            {feature.text}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        asChild
        className={cn(
          "w-full",
          rec &&
            "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        )}
        size="lg"
        variant={rec ? "default" : "outline"}
      >
        <Link href={tier.cta.href}>{tier.cta.label}</Link>
      </Button>
    </motion.div>
  );
}
