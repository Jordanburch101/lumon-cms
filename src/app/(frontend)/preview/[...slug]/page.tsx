import config from "@payload-config";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getPayload } from "payload";
import { cache } from "react";
import {
  getCachedSiteSettings,
  getPageDirect,
} from "@/payload/lib/cached-payload";
import { generatePageMetadata } from "@/payload/lib/seo/generate-page-metadata";
import { PreviewClient } from "./preview-client";

interface Args {
  params: Promise<{ slug: string[] }>;
}

// Wrapped in cache() to deduplicate within a single request
// (called from both PreviewPage and generateMetadata)
const authenticate = cache(async function authenticate() {
  // Allow access if the user is authenticated via Payload (payload-token cookie).
  // Draft mode is not required — the live preview iframe doesn't have it,
  // but it shares the same-origin auth cookies from the admin panel.
  const payload = await getPayload({ config });
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const { user } = await payload.auth({
    headers: new Headers({ Cookie: cookieHeader }),
  });

  return !!user;
});

export default async function PreviewPage({ params }: Args) {
  const { slug: slugSegments } = await params;
  const slug = slugSegments.join("/") || "";

  const isAuthorized = await authenticate();
  if (!isAuthorized) {
    const publicPath = slug ? `/${slug}` : "/";
    redirect(publicPath);
  }

  // Detect article preview: preview/blog/{articleSlug}
  const isBlogPreview = slugSegments[0] === "blog" && slugSegments.length === 2;

  if (isBlogPreview) {
    const articleSlug = slugSegments[1];
    const { getArticleDirect } = await import("@/payload/lib/cached-payload");
    const article = await getArticleDirect(articleSlug, true);
    if (!article) {
      notFound();
    }
    return <PreviewClient initialData={article} type="article" />;
  }

  const page = await getPageDirect(slug, true);

  if (!page) {
    notFound();
  }

  return <PreviewClient initialData={page} type="page" />;
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: slugSegments } = await params;
  const slug = slugSegments.join("/") || "";

  const isAuthorized = await authenticate();
  if (!isAuthorized) {
    return {};
  }

  const isBlogPreview = slugSegments[0] === "blog" && slugSegments.length === 2;

  if (isBlogPreview) {
    const articleSlug = slugSegments[1];
    const { getArticleDirect } = await import("@/payload/lib/cached-payload");
    const article = await getArticleDirect(articleSlug, true);
    if (!article) {
      return {};
    }
    return {
      title: `Preview: ${article.meta?.title || article.title}`,
      robots: { index: false, follow: false },
    };
  }

  const page = await getPageDirect(slug, true);
  if (!page) {
    return {};
  }

  const settings = await getCachedSiteSettings();
  const metadata = generatePageMetadata(page, settings);

  // Preview pages always noindex/nofollow
  return {
    ...metadata,
    title: `Preview: ${page.meta?.title || page.title}`,
    robots: { index: false, follow: false },
  };
}
