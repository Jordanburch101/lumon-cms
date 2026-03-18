import config from "@payload-config";
import type { Metadata } from "next";
import { cookies, draftMode } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getPayload } from "payload";
import { cache } from "react";
import { RenderBlocks } from "@/components/blocks/render-blocks";
import {
  getCachedSiteSettings,
  getPageDirect,
} from "@/payload/lib/cached-payload";
import { generatePageMetadata } from "@/payload/lib/seo/generate-page-metadata";

interface Args {
  params: Promise<{ slug: string[] }>;
}

// Wrapped in cache() to deduplicate within a single request
// (called from both PreviewPage and generateMetadata)
const authenticate = cache(async function authenticate() {
  const draft = await draftMode();
  if (!draft.isEnabled) {
    return false;
  }

  // Verify the user is still authenticated via Payload
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
  const slug = slugSegments.join("/") || "home";

  const isAuthorized = await authenticate();
  if (!isAuthorized) {
    const publicPath = slug === "home" ? "/" : `/${slug}`;
    redirect(publicPath);
  }

  const page = await getPageDirect(slug, true);

  if (!page) {
    notFound();
  }

  return <RenderBlocks blocks={page.layout ?? []} />;
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: slugSegments } = await params;
  const slug = slugSegments.join("/") || "home";

  const isAuthorized = await authenticate();
  if (!isAuthorized) {
    return {};
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
