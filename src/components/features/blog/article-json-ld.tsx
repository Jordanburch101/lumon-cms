import { TRAILING_SLASH_RE } from "@/core/lib/utils";
import type { Article, SiteSetting } from "@/payload-types";
import { resolveAuthor } from "./article-card";

interface ArticleJsonLdProps {
  article: Article;
  settings: SiteSetting;
}

export function ArticleJsonLd({ article, settings }: ArticleJsonLdProps) {
  const baseUrl = settings.baseUrl || "";
  const url = `${baseUrl}/blog/${article.slug}`.replace(TRAILING_SLASH_RE, "");
  const author = resolveAuthor(article);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    url,
    datePublished: article.publishedAt,
    ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
    author: {
      "@type": "Person",
      name: author.name,
    },
    ...(settings.jsonLd?.organizationName
      ? {
          publisher: {
            "@type": "Organization",
            name: settings.jsonLd.organizationName,
          },
        }
      : {}),
  };

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify escapes all special chars
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  );
}
