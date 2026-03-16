"use client";

import { motion } from "motion/react";
import { CMSLink } from "@/components/ui/cms-link";
import { cn } from "@/core/lib/utils";
import type { JobListingsBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;
type Job = JobListingsBlock["jobs"][number];

const TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const TYPE_COLORS: Record<string, string> = {
  "full-time": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "part-time": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  contract: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  internship: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

interface JobCardProps {
  index: number;
  inView: boolean;
  job: Job;
}

export function JobCard({ job, index, inView }: JobCardProps) {
  const typeLabel = TYPE_LABELS[job.type ?? "full-time"] ?? job.type;

  return (
    <motion.div
      animate={inView ? { opacity: 1, y: 0 } : {}}
      className="group relative flex h-full flex-col rounded-lg border border-border/50 bg-card p-6 transition-colors duration-300 hover:border-border lg:p-8"
      data-array-item={`jobs.${String(index)}`}
      initial={{ opacity: 0, y: 24 }}
      transition={{
        duration: 0.6,
        ease: EASE,
        delay: 0.1 + index * 0.06,
      }}
      whileHover={{ y: -4 }}
    >
      {/* Meta row */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className="inline-block rounded-[3px] border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-[9px] text-foreground uppercase tracking-[0.15em]"
          data-field={`jobs.${String(index)}.department`}
        >
          {job.department}
        </span>
        <span className="inline-block rounded-[3px] bg-muted px-2.5 py-0.5 font-mono text-[9px] text-muted-foreground uppercase tracking-[0.15em]">
          {job.location}
        </span>
        <span
          className={cn(
            "inline-block rounded-[3px] px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em]",
            TYPE_COLORS[job.type ?? "full-time"] ?? TYPE_COLORS["full-time"]
          )}
        >
          {typeLabel}
        </span>
      </div>

      {/* Title */}
      <h3
        className="font-semibold text-foreground text-lg leading-tight"
        data-field={`jobs.${String(index)}.title`}
      >
        {job.title}
      </h3>

      {/* Salary */}
      {job.salary && (
        <p
          className="mt-2 font-mono text-[11px] text-muted-foreground tracking-wide"
          data-field={`jobs.${String(index)}.salary`}
        >
          {job.salary}
        </p>
      )}

      {/* Description */}
      {job.description && (
        <p
          className="mt-3 flex-1 text-muted-foreground text-sm leading-relaxed"
          data-field={`jobs.${String(index)}.description`}
        >
          {job.description}
        </p>
      )}

      {/* Divider */}
      <div className="my-6 h-px bg-border/50" />

      {/* Apply CTA */}
      <CMSLink
        className="w-full"
        data-field-group={`jobs.${String(index)}.link`}
        data-field-group-type="link"
        link={job.link}
      />
    </motion.div>
  );
}
