import Link from "next/link";
import { cn } from "@/core/lib/utils";

interface PaginationProps {
  baseHref: string;
  currentPage: number;
  totalPages: number;
}

export function Pagination({
  currentPage,
  totalPages,
  baseHref,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const separator = baseHref.includes("?") ? "&" : "?";

  return (
    <div className="flex justify-center gap-1">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          className={cn(
            "flex size-8 items-center justify-center rounded-md font-medium text-xs transition-colors",
            page === currentPage
              ? "bg-foreground text-background"
              : "border border-border text-muted-foreground hover:text-foreground"
          )}
          href={page === 1 ? baseHref : `${baseHref}${separator}page=${page}`}
          key={page}
        >
          {page}
        </Link>
      ))}
    </div>
  );
}
