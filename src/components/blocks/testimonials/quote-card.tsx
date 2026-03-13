"use client";

import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getMediaUrl } from "@/core/lib/utils";
import type { TestimonialItem } from "./testimonials";

interface QuoteCardProps {
  fieldPrefix: string;
  isActive: boolean;
  onSelect: () => void;
  testimonial: TestimonialItem;
}

export function QuoteCard({
  testimonial,
  fieldPrefix,
  isActive,
  onSelect,
}: QuoteCardProps) {
  const avatarUrl = getMediaUrl(testimonial.avatar);

  return (
    <motion.button
      className={cn(
        "relative flex w-full flex-col gap-3 rounded-xl border p-4 text-left transition-shadow duration-300",
        isActive
          ? "border-primary/30 shadow-[0_0_0_1px_var(--primary),0_0_16px_var(--primary)/8%]"
          : "border-border/50 hover:border-border hover:shadow-sm"
      )}
      onClick={onSelect}
      transition={{ duration: 0.2 }}
      type="button"
      whileHover={isActive ? {} : { scale: 1.02 }}
    >
      <p
        className="text-muted-foreground text-sm leading-relaxed"
        data-field={`${fieldPrefix}.quote`}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="flex items-center gap-2.5">
        <Avatar>
          <AvatarImage
            alt={testimonial.name}
            data-field={`${fieldPrefix}.avatar`}
            src={avatarUrl}
          />
          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <span
            className="block truncate font-medium text-foreground text-xs"
            data-field={`${fieldPrefix}.name`}
          >
            {testimonial.name}
          </span>
          <span
            className="block truncate text-[11px] text-muted-foreground"
            data-field={`${fieldPrefix}.department`}
          >
            {testimonial.department}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
