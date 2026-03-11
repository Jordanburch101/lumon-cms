import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { LatestArticlesBlock } from "@/types/block-types";

type ArticleData = LatestArticlesBlock["articles"][number];

interface ArticleCardProps {
  article: ArticleData;
  variant: "featured" | "supporting";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ArticleCard({ article, variant }: ArticleCardProps) {
  const imageSrc = getMediaUrl(article.image);
  const blurData = getBlurDataURL(article.image);
  const avatarSrc = getMediaUrl(article.author.avatar);

  if (variant === "featured") {
    return (
      <Link
        className="group relative block h-full overflow-hidden rounded-2xl"
        href={article.href}
      >
        {/* Image */}
        <div className="relative aspect-[3/2] w-full lg:aspect-auto lg:h-full">
          <Image
            alt={article.imageAlt}
            blurDataURL={blurData}
            className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:brightness-110"
            fill
            placeholder={blurData ? "blur" : "empty"}
            sizes="(max-width: 1024px) 100vw, 60vw"
            src={imageSrc}
          />
        </div>

        {/* Gradient overlay — taller for more breathing room */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-[45%] via-black/30 to-transparent" />

        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 lg:p-8">
          <Badge className="mb-3 bg-white/15 text-[10px] text-white backdrop-blur-sm">
            {article.category}
          </Badge>
          <h3 className="max-w-lg font-semibold text-white text-xl leading-snug sm:text-2xl lg:text-3xl lg:leading-snug">
            {article.title}
          </h3>
          <div className="mt-3 flex items-center gap-2.5 lg:mt-4">
            <Avatar className="size-6 ring-1 ring-white/20">
              <AvatarImage alt={article.author.name} src={avatarSrc} />
              <AvatarFallback className="text-[10px]">
                {article.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/60">{article.author.name}</span>
            <span className="text-white/30">&middot;</span>
            <span className="text-sm text-white/60">
              {formatDate(article.publishedAt)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Supporting variant
  return (
    <Link className="group block" href={article.href}>
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
        <Image
          alt={article.imageAlt}
          blurDataURL={blurData}
          className="object-cover brightness-[0.97] transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:brightness-105"
          fill
          placeholder={blurData ? "blur" : "empty"}
          sizes="(max-width: 1024px) 100vw, 40vw"
          src={imageSrc}
        />
      </div>

      {/* Content */}
      <div className="mt-4 px-0.5">
        <div className="flex items-center gap-2">
          <Badge className="text-[10px]" variant="secondary">
            {article.category}
          </Badge>
          <span className="text-muted-foreground/50 text-xs">
            {formatDate(article.publishedAt)}
          </span>
        </div>
        <h3 className="mt-2.5 line-clamp-2 font-semibold text-base leading-snug">
          {article.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
          {article.excerpt}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Avatar className="size-5 ring-1 ring-border/50">
            <AvatarImage alt={article.author.name} src={avatarSrc} />
            <AvatarFallback className="text-[9px]">
              {article.author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground text-xs">
            {article.author.name}
          </span>
        </div>
      </div>
    </Link>
  );
}
