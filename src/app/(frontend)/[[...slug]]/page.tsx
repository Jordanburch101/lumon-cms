import config from "@payload-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { RenderBlocks } from "@/components/blocks/render-blocks";
import { getCachedPage } from "@/payload/lib/cached-payload";

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

export default async function Page({ params }: Args) {
  const { slug: slugSegments } = await params;
  const slug = slugSegments?.join("/") || "home";

  const page = await getCachedPage(slug);

  if (!page) {
    notFound();
  }

  return <RenderBlocks blocks={page.layout ?? []} />;
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: slugSegments } = await params;
  const slug = slugSegments?.join("/") || "home";

  const page = await getCachedPage(slug);

  if (!page) {
    return {};
  }

  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description || undefined,
  };
}
