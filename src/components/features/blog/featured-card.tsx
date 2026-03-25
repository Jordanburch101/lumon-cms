import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { Article, Category, Media } from "@/payload-types";
import { formatDate, resolveAuthor } from "./article-card";

interface FeaturedCardProps {
  article: Article;
}

export function FeaturedCard({ article }: FeaturedCardProps) {
  const imageSrc = getMediaUrl(article.heroImage as number | Media);
  const blurData = getBlurDataURL(article.heroImage as number | Media);
  const category = article.category as Category | undefined;
  const author = resolveAuthor(article);

  return (
    <Link
      className="group relative block overflow-hidden rounded-xl"
      href={`/blog/${article.slug}`}
    >
      <div className="relative aspect-[3/2] w-full lg:aspect-[21/9]">
        {imageSrc && (
          <Image
            alt={article.title}
            blurDataURL={blurData}
            className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:brightness-110"
            fill
            placeholder={blurData ? "blur" : "empty"}
            sizes="(max-width: 1024px) 100vw, 100vw"
            src={imageSrc}
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-[45%] via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 lg:p-8">
        <div className="mb-2 flex items-center gap-2">
          {category && (
            <Badge className="bg-white/15 text-[10px] text-white backdrop-blur-sm">
              {category.title}
            </Badge>
          )}
          <span className="text-white/50 text-xs">
            {formatDate(article.publishedAt)}
          </span>
          <span className="text-white/25">|</span>
          <span className="text-white/50 text-xs">
            {article.readTime} min read
          </span>
        </div>
        <h3 className="max-w-xl font-semibold text-white text-xl leading-snug sm:text-2xl">
          {article.title}
        </h3>
        <p className="mt-2 hidden max-w-lg text-sm text-white/55 leading-relaxed sm:line-clamp-2">
          {article.excerpt}
        </p>
        <div className="mt-3 flex items-center gap-2.5">
          <Avatar className="size-6 ring-1 ring-white/20">
            <AvatarImage alt={author.name} src={author.avatarUrl} />
            <AvatarFallback className="text-[10px]">
              {author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-white/60">{author.name}</span>
        </div>
      </div>
    </Link>
  );
}
