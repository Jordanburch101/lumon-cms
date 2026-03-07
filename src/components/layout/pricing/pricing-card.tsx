"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/lib/utils";
import type { PricingTier } from "./pricing-data";

interface PricingCardProps {
  isAnnual: boolean;
  tier: PricingTier;
}

export function PricingCard({ tier, isAnnual }: PricingCardProps) {
  const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-6 transition-shadow duration-300 lg:p-8",
        tier.recommended
          ? "ring-1 ring-primary/15 lg:scale-[1.02]"
          : "hover:shadow-sm"
      )}
    >
      {/* Tier header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
            {tier.name}
          </span>
          {tier.badge && <Badge variant="secondary">{tier.badge}</Badge>}
        </div>
        <p className="mt-2 text-muted-foreground text-sm">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6 flex items-baseline gap-1">
        <AnimatePresence mode="popLayout">
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className="font-semibold text-4xl tracking-tight"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            key={price}
            transition={{ duration: 0.2 }}
          >
            {price === 0 ? "Free" : `$${price}`}
          </motion.span>
        </AnimatePresence>
        {price > 0 && (
          <span className="text-muted-foreground text-sm">/mo</span>
        )}
      </div>

      {/* Features */}
      <ul className="mb-8 flex flex-1 flex-col gap-2.5">
        {tier.features.map((feature) => (
          <li className="flex items-start gap-2.5" key={feature}>
            <HugeiconsIcon
              className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
              icon={Tick02Icon}
              strokeWidth={2}
            />
            <span className="text-muted-foreground text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        asChild
        className="w-full"
        size="lg"
        variant={tier.recommended ? "default" : "outline"}
      >
        <Link href={tier.cta.href}>{tier.cta.label}</Link>
      </Button>
    </div>
  );
}
