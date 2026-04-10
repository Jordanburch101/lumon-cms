import type { Metadata } from "next";
import { ViewTransition } from "react";
import { ArticleCard } from "@/components/features/blog/article-card";
import { CategoryFilter } from "@/components/features/blog/category-filter";
import { FeaturedCard } from "@/components/features/blog/featured-card";
import { Pagination } from "@/components/features/blog/pagination";
import { DirectionalTransition } from "@/components/ui/directional-transition";
import {
  getCachedArticles,
  getCachedCategories,
  getCachedSiteSettings,
} from "@/payload/lib/cached-payload";

interface Args {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const siteName = settings.siteName?.trim();
  const separator = settings.separator || " | ";
  const title = siteName ? `Blog${separator}${siteName}` : "Blog";

  return {
    title,
    description:
      "Insights, updates, and dispatches from the severed floor and beyond.",
  };
}

export default async function BlogArchivePage({ searchParams }: Args) {
  const { category: categorySlug, page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const [result, categories] = await Promise.all([
    getCachedArticles(currentPage, 9, categorySlug),
    getCachedCategories(),
  ]);

  const articles = result.docs;
  const featured = !categorySlug && currentPage === 1 ? articles[0] : undefined;
  const gridArticles = featured ? articles.slice(1) : articles;
  const baseHref = categorySlug ? `/blog?category=${categorySlug}` : "/blog";

  return (
    <DirectionalTransition>
      <section className="w-full">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          {/* Header */}
          <div className="pt-8 pb-6 lg:pt-12">
            <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]">
              Department Archives
            </div>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-semibold text-3xl leading-tight sm:text-4xl">
                  Latest from the blog
                </h1>
                <p className="mt-2 text-muted-foreground text-sm">
                  Insights, updates, and dispatches from the severed floor.
                </p>
              </div>
              <CategoryFilter
                activeSlug={categorySlug}
                categories={categories}
              />
            </div>
          </div>

          {/* Featured article */}
          {featured && (
            <div className="pb-5">
              <ViewTransition key={featured.id}>
                <FeaturedCard article={featured} />
              </ViewTransition>
            </div>
          )}

          {/* Article grid */}
          {gridArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 pb-8 sm:grid-cols-2 lg:grid-cols-3">
              {gridArticles.map((article) => (
                <ViewTransition key={article.id}>
                  <ArticleCard article={article} />
                </ViewTransition>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-muted-foreground">
              No articles found.
            </div>
          )}

          {/* Pagination */}
          <div className="pb-12">
            <Pagination
              baseHref={baseHref}
              currentPage={currentPage}
              totalPages={result.totalPages}
            />
          </div>
        </div>
      </section>
    </DirectionalTransition>
  );
}
