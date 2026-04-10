import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { Article, Category, Media, User } from "@/payload-types";

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Resolve author display details, respecting overrides. */
export function resolveAuthor(article: Article) {
  const user = article.author as User | undefined;
  if (article.showAuthorOverride && article.authorOverride) {
    return {
      name:
        article.authorOverride.displayName ||
        user?.name ||
        user?.email ||
        "Unknown",
      avatarUrl: getMediaUrl(
        article.authorOverride.avatar as number | Media | undefined
      ),
      bio: article.authorOverride.bio || "",
      jobTitle: "",
    };
  }
  return {
    name: user?.name || user?.email || "Unknown",
    avatarUrl: getMediaUrl(user?.avatar),
    bio: user?.bio || "",
    jobTitle: user?.jobTitle || "",
  };
}

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const imageSrc = getMediaUrl(article.heroImage as number | Media);
  const blurData = getBlurDataURL(article.heroImage as number | Media);
  const category = article.category as Category | undefined;
  const author = resolveAuthor(article);

  return (
    <Link
      className="group block"
      href={`/blog/${article.slug}`}
      transitionTypes={["nav-forward"]}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
        {imageSrc && (
          <ViewTransition
            default="none"
            name={`article-hero-${article.id}`}
            share="morph"
          >
            <Image
              alt={article.title}
              blurDataURL={blurData}
              className="object-cover brightness-[0.97] transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:brightness-105"
              fill
              placeholder={blurData ? "blur" : "empty"}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              src={imageSrc}
            />
          </ViewTransition>
        )}
      </div>
      <div className="mt-4 px-0.5">
        <div className="flex items-center gap-2">
          {category && (
            <Badge className="text-[10px]" variant="secondary">
              {category.title}
            </Badge>
          )}
          <span className="text-muted-foreground/50 text-xs">
            {formatDateShort(article.publishedAt)}
          </span>
        </div>
        <ViewTransition
          default="none"
          name={`article-title-${article.id}`}
          share="text-morph"
        >
          <h3 className="mt-2.5 line-clamp-2 font-semibold text-base leading-snug">
            {article.title}
          </h3>
        </ViewTransition>
        <p className="mt-1.5 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
          {article.excerpt}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Avatar className="size-5 ring-1 ring-border/50">
            <AvatarImage alt={author.name} src={author.avatarUrl} />
            <AvatarFallback className="text-[9px]">
              {author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground text-xs">{author.name}</span>
          {article.readTime && (
            <span className="ml-auto text-muted-foreground/40 text-xs">
              {article.readTime} min
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
