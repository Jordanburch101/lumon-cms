"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { ArticleCard } from "@/components/features/blog/article-card";
import { FeaturedCard } from "@/components/features/blog/featured-card";
import type { Article } from "@/payload-types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface LatestArticlesClientProps {
  articles: Article[];
  headline: string;
  subtext: string;
}

export function LatestArticlesClient({
  headline,
  subtext,
  articles,
}: LatestArticlesClientProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const featured = articles[0];
  const supporting = articles.slice(1);

  return (
    <section className="w-full" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Section header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-10 flex items-end justify-between gap-4 lg:mb-14"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="max-w-2xl">
            <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
              {headline}
            </h2>
            <p className="mt-3 text-base text-muted-foreground">{subtext}</p>
          </div>
          <Link
            className="group hidden shrink-0 items-center gap-2 font-medium text-foreground text-sm transition-colors hover:text-foreground/70 lg:inline-flex"
            href="/blog"
          >
            View all articles
            <HugeiconsIcon
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
              icon={ArrowRight01Icon}
            />
          </Link>
        </motion.div>

        {/* Article grid */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="grid grid-cols-1 gap-6 lg:grid-cols-5"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          {/* Featured card */}
          <div className="lg:col-span-3">
            <FeaturedCard article={featured} />
          </div>

          {/* Supporting cards */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {supporting.map((article) => (
              <div className="lg:flex-1" key={article.id}>
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mobile view all link */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mt-8 lg:hidden"
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
