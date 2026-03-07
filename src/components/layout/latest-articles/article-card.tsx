import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Article } from "./latest-articles-data";

interface ArticleCardProps {
  article: Article;
  variant: "featured" | "supporting";
}

export function ArticleCard({ article, variant }: ArticleCardProps) {
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
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            src={article.imageSrc}
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 lg:p-8">
          <Badge className="mb-3 bg-white/20 text-[10px] text-white">
            {article.category}
          </Badge>
          <h3 className="max-w-lg font-semibold text-xl text-white leading-snug sm:text-2xl">
            {article.title}
          </h3>
          <div className="mt-3 flex items-center gap-2.5">
            <Avatar className="size-6">
              <AvatarImage
                alt={article.author.name}
                src={article.author.avatarSrc}
              />
              <AvatarFallback className="text-[10px]">
                {article.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-white/60 text-sm">
              {article.author.name}
            </span>
            <span className="text-white/30">&middot;</span>
            <span className="text-white/60 text-sm">{article.readTime}</span>
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
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          src={article.imageSrc}
        />
      </div>

      {/* Content */}
      <div className="mt-4">
        <Badge variant="secondary" className="text-[10px]">
          {article.category}
        </Badge>
        <h3 className="mt-2 font-semibold text-lg leading-snug line-clamp-2">
          {article.title}
        </h3>
        <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {article.excerpt}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Avatar className="size-5">
            <AvatarImage
              alt={article.author.name}
              src={article.author.avatarSrc}
            />
            <AvatarFallback className="text-[9px]">
              {article.author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground text-xs">
            {article.author.name}
          </span>
          <span className="text-muted-foreground/50">&middot;</span>
          <span className="text-muted-foreground text-xs">
            {article.readTime}
          </span>
        </div>
      </div>
    </Link>
  );
}
