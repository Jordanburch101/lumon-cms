"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import { useRef } from "react";

import { ArticleCard } from "./article-card";
import {
  featuredArticle,
  latestArticlesSectionData,
  supportingArticles,
} from "./latest-articles-data";

const EASE = [0.16, 1, 0.3, 1] as const;

export function LatestArticles() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section className="w-full py-16 lg:py-24" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Section header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-10 max-w-2xl lg:mb-14"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
            {latestArticlesSectionData.headline}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {latestArticlesSectionData.subtext}
          </p>
        </motion.div>

        {/* Article grid */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-6"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          {/* Featured card — 3 of 5 columns */}
          <div className="lg:col-span-3">
            <ArticleCard article={featuredArticle} variant="featured" />
          </div>

          {/* Supporting cards — 2 of 5 columns, stacked */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {supportingArticles.map((article) => (
              <ArticleCard
                article={article}
                key={article.id}
                variant="supporting"
              />
            ))}
          </div>
        </motion.div>

        {/* View all link */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mt-8 lg:mt-10"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
        >
          <Link
            className="group inline-flex items-center gap-2 font-medium text-foreground text-sm transition-colors hover:text-foreground/70"
            href="/blog"
          >
            View all articles
            <HugeiconsIcon
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
              icon={ArrowRight01Icon}
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
