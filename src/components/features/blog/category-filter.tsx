import Link from "next/link";
import { cn } from "@/core/lib/utils";
import type { Category } from "@/payload-types";

interface CategoryFilterProps {
  activeSlug?: string;
  categories: Category[];
}

export function CategoryFilter({
  categories,
  activeSlug,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Link
        className={cn(
          "rounded-md px-3 py-1.5 font-medium text-xs transition-colors",
          activeSlug
            ? "border border-border text-muted-foreground hover:text-foreground"
            : "bg-foreground text-background"
        )}
        href="/blog"
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          className={cn(
            "rounded-md px-3 py-1.5 font-medium text-xs transition-colors",
            activeSlug === cat.slug
              ? "bg-foreground text-background"
              : "border border-border text-muted-foreground hover:text-foreground"
          )}
          href={`/blog?category=${cat.slug}`}
          key={cat.id}
        >
          {cat.title}
        </Link>
      ))}
    </div>
  );
}
