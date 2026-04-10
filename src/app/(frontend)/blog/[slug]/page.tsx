import config from "@payload-config";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { ViewTransition } from "react";
import { ArticleAuthor } from "@/components/features/blog/article-author";
import {
  formatDate,
  resolveAuthor,
} from "@/components/features/blog/article-card";
import { ArticleJsonLd } from "@/components/features/blog/article-json-ld";
import { RichText } from "@/components/features/rich-text/rich-text";
import { Badge } from "@/components/ui/badge";
import { DirectionalTransition } from "@/components/ui/directional-transition";
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import {
  getCachedArticle,
  getCachedSiteSettings,
} from "@/payload/lib/cached-payload";
import { generateArticleMetadata } from "@/payload/lib/seo/generate-article-metadata";
import type { Category, Media } from "@/payload-types";

interface Args {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config });
    const articles = await payload.find({
      collection: "articles",
      limit: 100,
      select: { slug: true },
      draft: false,
    });

    const params = articles.docs.map((article) => ({ slug: article.slug }));
    return params.length > 0 ? params : [{ slug: "_" }];
  } catch {
    return [{ slug: "_" }];
  }
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCachedArticle(slug);
  const settings = await getCachedSiteSettings();

  if (!article) {
    return {};
  }

  return generateArticleMetadata(article, settings);
}

export default async function ArticlePage({ params }: Args) {
  const { slug } = await params;
  const article = await getCachedArticle(slug);

  if (!article) {
    notFound();
  }

  const settings = await getCachedSiteSettings();
  const imageSrc = getMediaUrl(article.heroImage as number | Media);
  const blurData = getBlurDataURL(article.heroImage as number | Media);
  const category = article.category as Category | undefined;
  const author = resolveAuthor(article);

  return (
    <DirectionalTransition>
    <article>
      <ArticleJsonLd article={article} settings={settings} />

      {/* Hero image */}
      <div className="relative">
        <div className="relative h-[280px] sm:h-[340px] lg:h-[420px]">
          {imageSrc && (
            <ViewTransition
              name={`article-hero-${article.id}`}
              share="morph"
            >
              <Image
                alt={article.title}
                blurDataURL={blurData}
                className="object-cover"
                fill
                placeholder={blurData ? "blur" : "empty"}
                priority
                sizes="100vw"
                src={imageSrc}
              />
            </ViewTransition>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Article header */}
      <div className="relative mx-auto -mt-10 max-w-3xl px-4 lg:px-6">
        {/* Meta */}
        <div className="flex items-center gap-2">
          {category && (
            <Badge className="bg-foreground/10 text-[10px]" variant="secondary">
              {category.title}
            </Badge>
          )}
          <span className="text-muted-foreground text-xs">
            {formatDate(article.publishedAt)}
          </span>
          <span className="text-muted-foreground/30">|</span>
          <span className="text-muted-foreground text-xs">
            {article.readTime} min read
          </span>
        </div>

        {/* Title */}
        <ViewTransition
          name={`article-title-${article.id}`}
          share="text-morph"
        >
          <h1 className="mt-3 font-semibold text-3xl leading-tight tracking-tight sm:text-4xl">
            {article.title}
          </h1>
        </ViewTransition>

        {/* Author */}
        <div className="mt-5 border-border border-b pb-6">
          <ArticleAuthor
            avatarUrl={author.avatarUrl}
            jobTitle={author.jobTitle}
            name={author.name}
            variant="inline"
          />
        </div>

        {/* Body */}
        <div className="py-8">
          <RichText data={article.body} />
        </div>

        {/* Divider */}
        <div
          className="my-2 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--border), transparent)",
          }}
        />

        {/* Author bio */}
        <div className="py-8">
          <ArticleAuthor
            avatarUrl={author.avatarUrl}
            bio={author.bio}
            name={author.name}
            variant="bio"
          />
        </div>

        {/* Back link */}
        <div className="pb-12">
          <Link
            className="inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
            href="/blog"
            transitionTypes={["nav-back"]}
          >
            <svg
              aria-hidden="true"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to all articles
          </Link>
        </div>
      </div>
    </article>
    </DirectionalTransition>
  );
}
