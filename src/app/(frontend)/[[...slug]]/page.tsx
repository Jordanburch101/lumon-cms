import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { RenderBlocks } from "@/components/blocks/render-blocks";
import { getCachedPage, getPageDirect } from "@/payload/lib/cached-payload";

interface Args {
  params: Promise<{ slug?: string[] }>;
}

async function getPage(slug: string) {
  const { isEnabled: isDraft } = await draftMode();

  return isDraft ? getPageDirect(slug, true) : getCachedPage(slug);
}

export default async function Page({ params }: Args) {
  const { slug: slugSegments } = await params;
  const slug = slugSegments?.join("/") || "home";

  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return <RenderBlocks blocks={page.layout ?? []} />;
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: slugSegments } = await params;
  const slug = slugSegments?.join("/") || "home";

  const page = await getPage(slug);

  if (!page) {
    return {};
  }

  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description || undefined,
  };
}
