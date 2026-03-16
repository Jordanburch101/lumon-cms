"use client";

import { motion, useInView } from "motion/react";
import { useMemo, useRef } from "react";
import type { JobListingsBlock } from "@/types/block-types";
import { JobCard } from "./job-card";

const EASE = [0.16, 1, 0.3, 1] as const;

export function JobListings({
  eyebrow,
  heading,
  description,
  jobs,
}: JobListingsBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Group jobs by department
  const departments = useMemo(() => {
    if (!jobs || jobs.length === 0) {
      return [];
    }

    const map = new Map<string, typeof jobs>();
    for (const job of jobs) {
      const dept = job.department;
      const existing = map.get(dept);
      if (existing) {
        existing.push(job);
      } else {
        map.set(dept, [job]);
      }
    }
    return Array.from(map.entries());
  }, [jobs]);

  if (!jobs || jobs.length === 0) {
    return null;
  }

  const hasDepartmentGroups = departments.length > 1;

  // Compute a global index offset for stagger continuity across groups
  let globalIndex = 0;

  return (
    <section aria-label="Job listings" className="w-full" ref={sectionRef}>
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
              className="mb-4 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.25em]"
              data-field="eyebrow"
            >
              {eyebrow}
            </p>
          )}
          <h2
            className="font-semibold text-3xl leading-tight sm:text-4xl"
            data-field="heading"
          >
            {heading}
          </h2>
          {description && (
            <p
              className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground"
              data-field="description"
            >
              {description}
            </p>
          )}
        </motion.div>

        {/* Job listings */}
        {hasDepartmentGroups ? (
          <div className="space-y-12">
            {departments.map(([dept, deptJobs], deptIndex) => {
              const startIndex = globalIndex;
              globalIndex += deptJobs.length;

              return (
                <div key={dept}>
                  {/* Department header */}
                  <motion.div
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    className="mb-6 flex items-center gap-4"
                    initial={{ opacity: 0, y: 16 }}
                    transition={{
                      duration: 0.6,
                      ease: EASE,
                      delay: 0.05 + deptIndex * 0.08,
                    }}
                  >
                    <h3 className="shrink-0 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
                      {dept}
                    </h3>
                    <div className="h-px flex-1 bg-border/50" />
                  </motion.div>

                  {/* Department grid */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {deptJobs.map((job, i) => (
                      <JobCard
                        index={startIndex + i}
                        inView={inView}
                        job={job}
                        key={job.id}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job, i) => (
              <JobCard index={i} inView={inView} job={job} key={job.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
