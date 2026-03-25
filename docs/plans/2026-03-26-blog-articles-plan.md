# Blog & Articles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dynamic blog system with Articles collection, Categories taxonomy, archive page, article detail page, and refactor LatestArticles to query dynamically.

**Architecture:** Two new Payload collections (Categories, Articles) with cached data fetching, revalidation hooks, and SEO integration. Frontend routes at `/blog` (archive) and `/blog/[slug]` (detail). Live preview via the existing preview route pattern. LatestArticles block refactored from inline data to dynamic queries.

**Tech Stack:** Payload CMS 3.x, Next.js 16 (App Router), SQLite/libsql, Lexical rich text, `"use cache"` + `cacheTag`, Framer Motion

---

### Task 1: Categories Collection

**Files:**
- Create: `src/payload/collections/Categories.ts`
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Create the Categories collection**

```ts
// src/payload/collections/Categories.ts
import type { CollectionConfig } from "payload";
import { slugField } from "payload";
import { isAdminOrEditor } from "../access";
import { revalidateOnChange } from "../hooks/revalidateOnChange";

const { afterChange, afterDelete } = revalidateOnChange();

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    group: "Blog",
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    slugField({ useAsSlug: "title" }),
  ],
};
```

- [ ] **Step 2: Register in Payload config**

In `src/payload.config.ts`:

Add import at top:
```ts
import { Categories } from "./payload/collections/Categories";
```

Add to collections array:
```ts
collections: [
  Users,
  Media,
  Pages,
  Categories,
  // ... BA collections
],
```

Add to mcpPlugin collections:
```ts
categories: { enabled: true, description: "Article categories" },
```

- [ ] **Step 3: Run migration and generate types**

```bash
bun run migrate:create
```

Review the generated file in `src/migrations/`, then:

```bash
bun run migrate && bun generate:types
```

- [ ] **Step 4: Verify**

```bash
bun check
```

- [ ] **Step 5: Commit**

```bash
git add src/payload/collections/Categories.ts src/payload.config.ts src/migrations/ src/payload-types.ts
git commit -m "feat(blog): add Categories collection"
```

---

### Task 2: Add Author Fields to Users Collection

**Files:**
- Modify: `src/payload/collections/Users.ts`

- [ ] **Step 1: Add avatar, bio, and role display fields to Users**

In `src/payload/collections/Users.ts`, add these three fields to the `fields` array (after the existing `name` field):

```ts
{
  name: "avatar",
  type: "upload",
  relationTo: "media",
  admin: {
    description: "Profile photo displayed on blog articles",
  },
},
{
  name: "bio",
  type: "textarea",
  admin: {
    description: "Short author bio for blog articles",
  },
},
{
  name: "jobTitle",
  type: "text",
  admin: {
    description: "Job title or role displayed on blog articles",
  },
},
```

Note: Using `jobTitle` instead of `role` since `role` is already taken by the auth role select field.

- [ ] **Step 2: Run migration and generate types**

```bash
bun run migrate:create
bun run migrate && bun generate:types
```

- [ ] **Step 3: Verify**

```bash
bun check
```

- [ ] **Step 4: Commit**

```bash
git add src/payload/collections/Users.ts src/migrations/ src/payload-types.ts
git commit -m "feat(blog): add author display fields to Users collection"
```

---

### Task 3: Articles Collection

**Files:**
- Create: `src/payload/collections/Articles.ts`
- Create: `src/payload/hooks/computeReadTime/index.ts`
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Create the computeReadTime hook**

```ts
// src/payload/hooks/computeReadTime/index.ts
import type { CollectionBeforeChangeHook } from "payload";

/**
 * Walk Lexical editor JSON to extract all text content, then
 * compute read time at ~200 words per minute.
 */
function countWords(node: unknown): number {
  if (!node || typeof node !== "object") return 0;

  const n = node as Record<string, unknown>;
  let count = 0;

  // Lexical text nodes have a "text" property
  if (typeof n.text === "string") {
    count += n.text.split(/\s+/).filter(Boolean).length;
  }

  // Recurse into children
  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      count += countWords(child);
    }
  }

  // Lexical root has children under root.children
  if (n.root && typeof n.root === "object") {
    count += countWords(n.root);
  }

  return count;
}

export const computeReadTime: CollectionBeforeChangeHook = ({ data }) => {
  if (!data?.body) return data;

  const words = countWords(data.body);
  const minutes = Math.max(1, Math.ceil(words / 200));

  return {
    ...data,
    readTime: minutes,
  };
};
```

- [ ] **Step 2: Create the Articles collection**

```ts
// src/payload/collections/Articles.ts
import type { CollectionConfig } from "payload";
import { slugField } from "payload";
import { isAdminOrEditor } from "../access";
import { richTextEditor } from "../editor/config";
import { computeReadTime } from "../hooks/computeReadTime";
import { revalidateOnChange } from "../hooks/revalidateOnChange";

const { afterChange, afterDelete } = revalidateOnChange({ tags: ["sitemap"] });

export const Articles: CollectionConfig = {
  slug: "articles",
  custom: { sitemap: { enabled: true, urlPrefix: "/blog" } },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "author", "publishedAt", "updatedAt"],
    group: "Blog",
    livePreview: {
      url: ({ data }) => {
        const baseUrl =
          process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3100";
        const slug = typeof data?.slug === "string" ? data.slug : "";
        return `${baseUrl}/preview/blog/${slug}`;
      },
    },
    preview: (data) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3100";
      const slug = typeof data?.slug === "string" ? data.slug : "";
      return `${baseUrl}/preview/blog/${slug}`;
    },
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeChange: [computeReadTime],
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            {
              name: "heroImage",
              type: "upload",
              relationTo: "media",
              required: true,
            },
            {
              name: "excerpt",
              type: "textarea",
              required: true,
              admin: {
                description: "Short summary for cards and SEO fallback",
              },
            },
            {
              name: "body",
              type: "richText",
              required: true,
              editor: richTextEditor,
            },
          ],
        },
      ],
    },
    {
      name: "title",
      type: "text",
      required: true,
      admin: { position: "sidebar" },
    },
    slugField({ useAsSlug: "title" }),
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
      hasMany: false,
      admin: { position: "sidebar" },
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      name: "readTime",
      type: "number",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Auto-calculated from body content (minutes)",
      },
    },
    {
      name: "showAuthorOverride",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Override author display details for this article",
      },
    },
    {
      name: "authorOverride",
      type: "group",
      admin: {
        condition: (data) => data?.showAuthorOverride === true,
      },
      fields: [
        {
          name: "displayName",
          type: "text",
        },
        {
          name: "avatar",
          type: "upload",
          relationTo: "media",
        },
        {
          name: "bio",
          type: "textarea",
        },
      ],
    },
  ],
};
```

- [ ] **Step 3: Register in Payload config**

In `src/payload.config.ts`:

Add import:
```ts
import { Articles } from "./payload/collections/Articles";
```

Add to collections array (after Categories):
```ts
collections: [
  Users,
  Media,
  Pages,
  Categories,
  Articles,
  // ... BA collections
],
```

Add to mcpPlugin collections:
```ts
articles: { enabled: true, description: "Blog articles" },
```

Add `"articles"` to the seoPlugin collections array:
```ts
seoPlugin({
  collections: ["pages", "articles"],
  // ...
```

Update the `generateTitle`, `generateDescription`, `generateURL`, and `generateImage` callbacks to handle Articles. The key changes:

In `generateDescription`:
```ts
generateDescription: ({ doc }) => {
  // Articles have an excerpt field — use it directly
  if ("excerpt" in doc && typeof doc.excerpt === "string" && doc.excerpt) {
    return doc.excerpt;
  }
  const d = doc as { hero?: unknown[]; layout?: unknown[] };
  const blocks = [...(d.hero ?? []), ...(d.layout ?? [])] as Parameters<
    typeof extractFirstTextFromBlocks
  >[0];
  return extractFirstTextFromBlocks(blocks) ?? "";
},
```

In `generateURL`:
```ts
generateURL: async ({ doc, collectionConfig, req }) => {
  const settings = await req.payload.findGlobal({
    slug: "site-settings",
  });
  const isArticle = collectionConfig?.slug === "articles";
  const prefix = isArticle ? "/blog" : "";
  const pagePath = (doc as { path?: string }).path ?? doc.slug;
  const urlPath = !pagePath || pagePath === "" ? "" : pagePath;
  return `${settings.baseUrl || ""}${prefix}/${urlPath}`.replace(
    TRAILING_SLASH_RE,
    ""
  );
},
```

In `generateImage`:
```ts
generateImage: ({ doc }) => {
  // Articles use heroImage directly
  if ("heroImage" in doc && doc.heroImage) {
    return doc.heroImage as number;
  }
  const d = doc as { hero?: unknown[]; layout?: unknown[] };
  const blocks = [...(d.hero ?? []), ...(d.layout ?? [])] as Parameters<
    typeof extractFirstImageFromBlocks
  >[0];
  return extractFirstImageFromBlocks(blocks) as number;
},
```

- [ ] **Step 4: Run migration and generate types**

```bash
bun run migrate:create
bun run migrate && bun generate:types
```

- [ ] **Step 5: Verify**

```bash
bun check
```

- [ ] **Step 6: Commit**

```bash
git add src/payload/collections/Articles.ts src/payload/hooks/computeReadTime/ src/payload.config.ts src/migrations/ src/payload-types.ts
git commit -m "feat(blog): add Articles collection with SEO, read time, and live preview"
```

---

### Task 4: Cached Data Fetching

**Files:**
- Modify: `src/payload/lib/cached-payload/index.ts`

- [ ] **Step 1: Add article caching functions**

Append these functions to `src/payload/lib/cached-payload/index.ts`:

```ts
// ── Articles ────────────────────────────────────────────────────────

/**
 * Fetch a single article by slug with caching and relationship tagging.
 */
export const getCachedArticle = cache(async (slug: string) => {
  "use cache";
  cacheLife("hours");

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "articles",
    where: { slug: { equals: slug } },
    draft: false,
    limit: 1,
    depth: 2,
  });

  const article = result.docs[0] ?? null;

  if (article) {
    cacheTag("collection:articles", `doc:articles:${article.id}`);
    tagResolvedRelationships(article);
  }

  return article;
});

/**
 * Fetch a single article by slug WITHOUT caching. Used for draft/preview mode.
 */
export async function getArticleDirect(slug: string, draft = false) {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "articles",
    where: { slug: { equals: slug } },
    draft,
    limit: 1,
    depth: 2,
  });

  return result.docs[0] ?? null;
}

/**
 * Fetch paginated articles with optional category filter.
 */
export const getCachedArticles = cache(
  async (page = 1, limit = 9, categorySlug?: string) => {
    "use cache";
    cacheLife("hours");
    cacheTag("collection:articles", "collection:categories");

    const payload = await getPayload({ config });

    const where: Record<string, unknown> = {};

    if (categorySlug) {
      // Resolve category ID from slug first
      const catResult = await payload.find({
        collection: "categories",
        where: { slug: { equals: categorySlug } },
        limit: 1,
        select: { id: true },
      });
      const catId = catResult.docs[0]?.id;
      if (catId) {
        where.category = { equals: catId };
      }
    }

    const result = await payload.find({
      collection: "articles",
      where,
      draft: false,
      sort: "-publishedAt",
      page,
      limit,
      depth: 2,
    });

    return result;
  }
);

/**
 * Fetch all categories.
 */
export const getCachedCategories = cache(async () => {
  "use cache";
  cacheLife("hours");
  cacheTag("collection:categories");

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "categories",
    pagination: false,
    sort: "title",
  });

  return result.docs;
});
```

- [ ] **Step 2: Verify**

```bash
bun check
```

- [ ] **Step 3: Commit**

```bash
git add src/payload/lib/cached-payload/index.ts
git commit -m "feat(blog): add cached article and category fetchers"
```

---

### Task 5: Blog Archive Page (`/blog`)

**Files:**
- Create: `src/app/(frontend)/blog/page.tsx`
- Create: `src/components/features/blog/article-card.tsx`
- Create: `src/components/features/blog/category-filter.tsx`
- Create: `src/components/features/blog/pagination.tsx`
- Create: `src/components/features/blog/featured-card.tsx`

- [ ] **Step 1: Create the shared ArticleCard component**

This component is shared between the archive page and article detail. It normalizes article data (handling author overrides).

```tsx
// src/components/features/blog/article-card.tsx
import Image from "next/image";
import Link from "next/link";
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
      name: article.authorOverride.displayName || user?.name || user?.email || "Unknown",
      avatarUrl: getMediaUrl(article.authorOverride.avatar as number | Media | undefined),
      bio: article.authorOverride.bio || "",
      jobTitle: "",
    };
  }
  return {
    name: user?.name || user?.email || "Unknown",
    avatarUrl: getMediaUrl((user as User & { avatar?: number | Media })?.avatar),
    bio: (user as User & { bio?: string })?.bio || "",
    jobTitle: (user as User & { jobTitle?: string })?.jobTitle || "",
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
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
        {imageSrc && (
          <Image
            alt={article.title}
            blurDataURL={blurData}
            className="object-cover brightness-[0.97] transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:brightness-105"
            fill
            placeholder={blurData ? "blur" : "empty"}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            src={imageSrc}
          />
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
        <h3 className="mt-2.5 line-clamp-2 font-semibold text-base leading-snug">
          {article.title}
        </h3>
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
```

- [ ] **Step 2: Create the FeaturedCard component**

```tsx
// src/components/features/blog/featured-card.tsx
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
```

- [ ] **Step 3: Create the CategoryFilter component**

```tsx
// src/components/features/blog/category-filter.tsx
import Link from "next/link";
import { cn } from "@/core/lib/utils";
import type { Category } from "@/payload-types";

interface CategoryFilterProps {
  categories: Category[];
  activeSlug?: string;
}

export function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Link
        className={cn(
          "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          !activeSlug
            ? "bg-foreground text-background"
            : "border border-border text-muted-foreground hover:text-foreground"
        )}
        href="/blog"
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
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
```

- [ ] **Step 4: Create the Pagination component**

```tsx
// src/components/features/blog/pagination.tsx
import Link from "next/link";
import { cn } from "@/core/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseHref: string;
}

export function Pagination({ currentPage, totalPages, baseHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const separator = baseHref.includes("?") ? "&" : "?";

  return (
    <div className="flex justify-center gap-1">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          className={cn(
            "flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
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
```

- [ ] **Step 5: Create the blog archive page**

```tsx
// src/app/(frontend)/blog/page.tsx
import type { Metadata } from "next";
import { ArticleCard } from "@/components/features/blog/article-card";
import { CategoryFilter } from "@/components/features/blog/category-filter";
import { FeaturedCard } from "@/components/features/blog/featured-card";
import { Pagination } from "@/components/features/blog/pagination";
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
    description: "Insights, updates, and dispatches from the severed floor and beyond.",
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
            <CategoryFilter activeSlug={categorySlug} categories={categories} />
          </div>
        </div>

        {/* Featured article */}
        {featured && (
          <div className="pb-5">
            <FeaturedCard article={featured} />
          </div>
        )}

        {/* Article grid */}
        {gridArticles.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 pb-8 sm:grid-cols-2 lg:grid-cols-3">
            {gridArticles.map((article) => (
              <ArticleCard article={article} key={article.id} />
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
  );
}
```

- [ ] **Step 6: Verify**

```bash
bun check
```

- [ ] **Step 7: Commit**

```bash
git add src/app/\(frontend\)/blog/ src/components/features/blog/
git commit -m "feat(blog): add archive page with category filtering and pagination"
```

---

### Task 6: Article Detail Page (`/blog/[slug]`)

**Files:**
- Create: `src/app/(frontend)/blog/[slug]/page.tsx`
- Create: `src/components/features/blog/article-author.tsx`
- Create: `src/components/features/blog/article-json-ld.tsx`
- Modify: `src/payload/lib/seo/generate-page-metadata.ts`

- [ ] **Step 1: Create the article metadata generator**

The existing `generatePageMetadata` is typed specifically for `Page`. Create a parallel function for articles, or generalize it. Simplest approach — a dedicated function:

```tsx
// src/payload/lib/seo/generate-article-metadata.ts
import type { Metadata } from "next";
import { TRAILING_SLASH_RE } from "@/core/lib/utils";
import type { Article, Media, SiteSetting } from "@/payload-types";

function resolveMediaUrl(
  media: number | Media | null | undefined,
  baseUrl: string | undefined
): { url: string; width?: number | null; height?: number | null } | undefined {
  if (!media || typeof media === "number") return undefined;
  if (!media.url) return undefined;
  const url =
    media.url.startsWith("http://") || media.url.startsWith("https://")
      ? media.url
      : baseUrl
        ? `${baseUrl}${media.url}`
        : media.url;
  return { url, width: media.width, height: media.height };
}

export function generateArticleMetadata(
  article: Article,
  settings: SiteSetting
): Metadata {
  const isDraft = article._status === "draft";
  const siteName = settings.siteName?.trim() || undefined;
  const separator = settings.separator || " | ";
  const title =
    article.meta?.title ||
    (siteName ? `${article.title}${separator}${siteName}` : article.title);
  const description =
    article.meta?.description || article.excerpt || undefined;
  const baseUrl = settings.baseUrl || undefined;
  const canonical = baseUrl
    ? `${baseUrl}/blog/${article.slug}`.replace(TRAILING_SLASH_RE, "")
    : undefined;

  const heroResolved = resolveMediaUrl(
    article.heroImage as number | Media,
    baseUrl
  );
  const metaResolved = resolveMediaUrl(
    article.meta?.image as number | Media | undefined,
    baseUrl
  );
  const ogImage = metaResolved || heroResolved;

  return {
    title,
    description,
    keywords: article.meta?.keywords || undefined,
    alternates: canonical ? { canonical } : undefined,
    robots: isDraft ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description: description || undefined,
      url: canonical || undefined,
      siteName: settings.siteName || undefined,
      type: "article",
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage.url,
                ...(ogImage.width ? { width: ogImage.width } : {}),
                ...(ogImage.height ? { height: ogImage.height } : {}),
              },
            ],
          }
        : {}),
    },
  };
}
```

- [ ] **Step 2: Create the ArticleAuthor component**

```tsx
// src/components/features/blog/article-author.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ArticleAuthorProps {
  name: string;
  avatarUrl: string;
  jobTitle?: string;
  bio?: string;
  variant: "inline" | "bio";
}

export function ArticleAuthor({
  name,
  avatarUrl,
  jobTitle,
  bio,
  variant,
}: ArticleAuthorProps) {
  if (variant === "inline") {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="size-9 ring-1 ring-border/50">
          <AvatarImage alt={name} src={avatarUrl} />
          <AvatarFallback className="text-xs">{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-foreground text-sm">{name}</div>
          {jobTitle && (
            <div className="text-muted-foreground text-xs">{jobTitle}</div>
          )}
        </div>
      </div>
    );
  }

  // Bio variant — larger, with description
  return (
    <div className="flex gap-4">
      <Avatar className="size-12 shrink-0 ring-1 ring-border/50">
        <AvatarImage alt={name} src={avatarUrl} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
          Written by
        </div>
        <div className="mt-1 font-medium text-foreground">{name}</div>
        {bio && (
          <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
            {bio}
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the ArticleJsonLd component**

```tsx
// src/components/features/blog/article-json-ld.tsx
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
```

- [ ] **Step 4: Create the article detail page**

```tsx
// src/app/(frontend)/blog/[slug]/page.tsx
import config from "@payload-config";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { Badge } from "@/components/ui/badge";
import { formatDate, resolveAuthor } from "@/components/features/blog/article-card";
import { ArticleAuthor } from "@/components/features/blog/article-author";
import { ArticleJsonLd } from "@/components/features/blog/article-json-ld";
import { RichText } from "@/components/features/rich-text/rich-text";
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { Category, Media } from "@/payload-types";
import {
  getCachedArticle,
  getCachedSiteSettings,
} from "@/payload/lib/cached-payload";
import { generateArticleMetadata } from "@/payload/lib/seo/generate-article-metadata";

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

    return articles.docs.map((article) => ({ slug: article.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCachedArticle(slug);
  const settings = await getCachedSiteSettings();

  if (!article) return {};

  return generateArticleMetadata(article, settings);
}

export default async function ArticlePage({ params }: Args) {
  const { slug } = await params;
  const article = await getCachedArticle(slug);

  if (!article) notFound();

  const settings = await getCachedSiteSettings();
  const imageSrc = getMediaUrl(article.heroImage as number | Media);
  const blurData = getBlurDataURL(article.heroImage as number | Media);
  const category = article.category as Category | undefined;
  const author = resolveAuthor(article);

  return (
    <article>
      <ArticleJsonLd article={article} settings={settings} />

      {/* Hero image */}
      <div className="relative">
        <div className="relative h-[280px] sm:h-[340px] lg:h-[420px]">
          {imageSrc && (
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
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Article header */}
      <div className="relative mx-auto -mt-10 max-w-[680px] px-4 lg:px-6">
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
        <h1 className="mt-3 font-semibold text-3xl leading-tight tracking-tight sm:text-4xl">
          {article.title}
        </h1>

        {/* Author */}
        <div className="mt-5 border-b border-border pb-6">
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
          >
            <svg
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
  );
}
```

- [ ] **Step 5: Verify**

```bash
bun check
```

- [ ] **Step 6: Commit**

```bash
git add src/app/\(frontend\)/blog/\[slug\]/ src/components/features/blog/article-author.tsx src/components/features/blog/article-json-ld.tsx src/payload/lib/seo/generate-article-metadata.ts
git commit -m "feat(blog): add article detail page with SEO, JSON-LD, and author bios"
```

---

### Task 7: Article Live Preview

**Files:**
- Modify: `src/app/(frontend)/preview/[...slug]/page.tsx`
- Modify: `src/app/(frontend)/preview/[...slug]/preview-client.tsx`

- [ ] **Step 1: Update the preview page to handle article routes**

The existing preview page only fetches from `pages`. We need to detect `preview/blog/{slug}` routes and fetch from `articles` instead.

In `src/app/(frontend)/preview/[...slug]/page.tsx`, update the `PreviewPage` component:

```tsx
// Replace the existing default export:
export default async function PreviewPage({ params }: Args) {
  const { slug: slugSegments } = await params;
  const slug = slugSegments.join("/") || "";

  const isAuthorized = await authenticate();
  if (!isAuthorized) {
    const publicPath = !slug ? "/" : `/${slug}`;
    redirect(publicPath);
  }

  // Detect article preview: preview/blog/{articleSlug}
  const isBlogPreview = slugSegments[0] === "blog" && slugSegments.length === 2;

  if (isBlogPreview) {
    const articleSlug = slugSegments[1];
    const { getArticleDirect } = await import("@/payload/lib/cached-payload");
    const article = await getArticleDirect(articleSlug, true);
    if (!article) notFound();
    return <PreviewClient initialData={article} type="article" />;
  }

  const page = await getPageDirect(slug, true);
  if (!page) notFound();

  return <PreviewClient initialData={page} type="page" />;
}
```

Also update `generateMetadata` to handle articles:

```tsx
export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: slugSegments } = await params;
  const slug = slugSegments.join("/") || "";

  const isAuthorized = await authenticate();
  if (!isAuthorized) return {};

  const isBlogPreview = slugSegments[0] === "blog" && slugSegments.length === 2;

  if (isBlogPreview) {
    const articleSlug = slugSegments[1];
    const { getArticleDirect } = await import("@/payload/lib/cached-payload");
    const article = await getArticleDirect(articleSlug, true);
    if (!article) return {};
    return {
      title: `Preview: ${article.meta?.title || article.title}`,
      robots: { index: false, follow: false },
    };
  }

  const page = await getPageDirect(slug, true);
  if (!page) return {};

  const settings = await getCachedSiteSettings();
  const metadata = generatePageMetadata(page, settings);

  return {
    ...metadata,
    title: `Preview: ${page.meta?.title || page.title}`,
    robots: { index: false, follow: false },
  };
}
```

- [ ] **Step 2: Update the preview client to render articles**

Replace `src/app/(frontend)/preview/[...slug]/preview-client.tsx`:

```tsx
"use client";

import { useLivePreview } from "@payloadcms/live-preview-react";
import { RenderBlocks, RenderHero } from "@/components/blocks/render-blocks";
import { RichText } from "@/components/features/rich-text/rich-text";
import type { Article, Page } from "@/payload-types";

interface PagePreviewProps {
  initialData: Page;
  type: "page";
}

interface ArticlePreviewProps {
  initialData: Article;
  type: "article";
}

type PreviewClientProps = PagePreviewProps | ArticlePreviewProps;

export function PreviewClient(props: PreviewClientProps) {
  const serverURL =
    process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3100";

  if (props.type === "article") {
    return <ArticlePreview initialData={props.initialData} serverURL={serverURL} />;
  }

  return <PagePreview initialData={props.initialData} serverURL={serverURL} />;
}

function PagePreview({
  initialData,
  serverURL,
}: {
  initialData: Page;
  serverURL: string;
}) {
  const { data } = useLivePreview<Page>({
    initialData,
    serverURL,
    depth: 2,
  });

  return (
    <div className="flex flex-col gap-16 lg:gap-32">
      <RenderHero blocks={data.hero ?? []} />
      <RenderBlocks blocks={data.layout ?? []} />
    </div>
  );
}

function ArticlePreview({
  initialData,
  serverURL,
}: {
  initialData: Article;
  serverURL: string;
}) {
  const { data } = useLivePreview<Article>({
    initialData,
    serverURL,
    depth: 2,
  });

  return (
    <article className="mx-auto max-w-[680px] px-4 py-12 lg:px-6">
      <h1 className="font-semibold text-3xl leading-tight tracking-tight sm:text-4xl">
        {data.title}
      </h1>
      <div className="mt-8">
        <RichText data={data.body} />
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Verify**

```bash
bun check
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(frontend\)/preview/
git commit -m "feat(blog): add article live preview support"
```

---

### Task 8: LatestArticles Block Refactor

**Files:**
- Modify: `src/payload/block-schemas/LatestArticles.ts`
- Modify: `src/components/blocks/latest-articles/latest-articles.tsx`
- Modify: `src/components/blocks/latest-articles/article-card.tsx`
- Modify: `src/components/blocks/__fixtures__/block-fixtures.ts`
- Modify: `src/types/block-types.ts`

- [ ] **Step 1: Update the block schema**

Replace `src/payload/block-schemas/LatestArticles.ts`:

```ts
import type { Block } from "payload";

export const LatestArticlesBlock: Block = {
  slug: "latestArticles",
  labels: { singular: "Latest Articles", plural: "Latest Articles" },
  admin: {
    group: "Content",
    images: {
      thumbnail: "/block-thumbnails/latest-articles.png",
    },
    custom: {
      description:
        "Displays the latest articles from the blog. Shows a featured card and supporting grid.",
    },
  },
  fields: [
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    {
      name: "limit",
      type: "number",
      defaultValue: 5,
      min: 1,
      max: 10,
      admin: {
        description: "Number of articles to display (default: 5)",
      },
    },
  ],
};
```

- [ ] **Step 2: Run migration and generate types**

The schema change to the LatestArticles block needs a migration:

```bash
bun run migrate:create
bun run migrate && bun generate:types
```

- [ ] **Step 3: Rewrite the LatestArticles component**

The component becomes a server component that fetches data, with a client wrapper for animations.

Replace `src/components/blocks/latest-articles/latest-articles.tsx`:

```tsx
import { getCachedArticles } from "@/payload/lib/cached-payload";
import type { LatestArticlesBlock } from "@/types/block-types";
import { LatestArticlesClient } from "./latest-articles-client";

export async function LatestArticles({
  headline,
  subtext,
  limit,
}: LatestArticlesBlock) {
  const result = await getCachedArticles(1, limit || 5);
  const articles = result.docs;

  if (articles.length === 0) return null;

  return (
    <LatestArticlesClient
      articles={articles}
      headline={headline}
      subtext={subtext}
    />
  );
}
```

- [ ] **Step 4: Create the client animation wrapper**

Create `src/components/blocks/latest-articles/latest-articles-client.tsx`:

```tsx
"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import {
  ArticleCard,
} from "@/components/features/blog/article-card";
import { FeaturedCard } from "@/components/features/blog/featured-card";
import type { Article } from "@/payload-types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface LatestArticlesClientProps {
  headline: string;
  subtext: string;
  articles: Article[];
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
```

- [ ] **Step 5: Delete the old article-card.tsx**

Delete `src/components/blocks/latest-articles/article-card.tsx` — replaced by `src/components/features/blog/article-card.tsx` and `src/components/features/blog/featured-card.tsx`.

- [ ] **Step 6: Update block-types.ts**

The `LatestArticlesBlock` type is auto-derived from `Page["layout"]` — no manual change needed since `bun generate:types` already updated the type. Verify that the type now has `headline`, `subtext`, `limit` fields and no longer has `articles`.

- [ ] **Step 7: Update the Storybook fixture**

In `src/components/blocks/__fixtures__/block-fixtures.ts`, replace the `latestArticles` fixture:

```ts
latestArticles: {
  blockType: "latestArticles",
  headline: "Latest from the blog",
  subtext:
    "Insights, updates, and dispatches from the severed floor and beyond.",
  limit: 5,
},
```

Note: The Storybook version won't render articles since it can't query Payload. The component will return `null` (no articles found). This is acceptable — the block is best tested against a running dev server. If needed later, add a Storybook-specific wrapper that passes mock article data.

- [ ] **Step 8: Update render-blocks to handle async component**

The `LatestArticles` component is now async (server component). The `renderBlock` function in `src/components/blocks/render-blocks.tsx` should work as-is since Next.js App Router supports async server components in JSX. No changes needed — verify this works.

- [ ] **Step 9: Verify**

```bash
bun check
```

- [ ] **Step 10: Commit**

```bash
git add src/payload/block-schemas/LatestArticles.ts src/components/blocks/latest-articles/ src/components/blocks/__fixtures__/block-fixtures.ts src/types/block-types.ts src/migrations/ src/payload-types.ts
git rm src/components/blocks/latest-articles/article-card.tsx
git commit -m "refactor(blog): convert LatestArticles block to dynamic collection queries"
```

---

### Task 9: Final Integration — Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Run the full build to catch any type errors**

```bash
bun build
```

This catches TypeScript errors that Biome misses. Fix any issues before proceeding.

- [ ] **Step 2: Verify the dev server loads correctly**

Tell the user to restart the dev server (config changes don't hot-reload), then verify:
- `/admin` — Categories and Articles collections appear under "Blog" group
- `/blog` — archive page loads (empty state: "No articles found.")
- Create a test category and article in admin
- `/blog` — article appears
- `/blog/{slug}` — article detail page renders

- [ ] **Step 3: Commit any fixes**

If Step 1 or 2 revealed issues, fix and commit:

```bash
git add -A
git commit -m "fix(blog): address build and integration issues"
```
