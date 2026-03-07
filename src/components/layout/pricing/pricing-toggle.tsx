"use client";

import { AnimatePresence, motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/core/lib/utils";

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: (annual: boolean) => void;
}

const options = [
  { label: "Monthly", value: false },
  { label: "Annual", value: true },
] as const;

export function PricingToggle({ isAnnual, onToggle }: PricingToggleProps) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative inline-flex rounded-full border bg-muted/50 p-0.5">
        {options.map((option) => {
          const isActive = isAnnual === option.value;
          return (
            <button
              className={cn(
                "relative z-10 px-4 py-1.5 font-medium text-sm transition-colors duration-200",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
              key={option.label}
              onClick={() => onToggle(option.value)}
              type="button"
            >
              {isActive && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-background shadow-sm"
                  layoutId="pricing-toggle-pill"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              {option.label}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {isAnnual && (
          <motion.div
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className="absolute left-[calc(50%+95px)]"
            exit={{ opacity: 0, scale: 0.8, x: -4 }}
            initial={{ opacity: 0, scale: 0.8, x: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Badge variant="secondary">Save 20%</Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
