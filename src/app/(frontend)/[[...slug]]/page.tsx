import config from "@payload-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { RenderBlocks, RenderHero } from "@/components/blocks/render-blocks";
import { JsonLd } from "@/components/features/seo/json-ld";
import {
  getCachedPage,
  getCachedSiteSettings,
} from "@/payload/lib/cached-payload";
import { generatePageMetadata } from "@/payload/lib/seo/generate-page-metadata";

interface Args {
  params: Promise<{ slug?: string[] }>;
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config });
    const pages = await payload.find({
      collection: "pages",
      limit: 100,
      select: { slug: true },
      draft: false,
    });

    const params = pages.docs.map((page) => ({
      slug: page.slug === "home" ? undefined : page.slug.split("/"),
    }));

    return params.length > 0 ? params : [{ slug: undefined }];
  } catch {
    // Fallback when DB isn't ready (e.g. dev startup, schema migration)
    return [{ slug: undefined }];
  }
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: slugSegments } = await params;
  const slug = slugSegments?.join("/") || "home";

  const page = await getCachedPage(slug);
  const settings = await getCachedSiteSettings();

  if (!page) {
    return {};
  }

  return generatePageMetadata(page, settings);
}

export default async function Page({ params }: Args) {
  const { slug: slugSegments } = await params;
  const slug = slugSegments?.join("/") || "home";

  const page = await getCachedPage(slug);

  if (!page) {
    notFound();
  }

  const settings = await getCachedSiteSettings();

  return (
    <>
      <JsonLd page={page} settings={settings} />
      <RenderHero blocks={page.hero ?? []} />
      <RenderBlocks blocks={page.layout ?? []} />
    </>
  );
}
