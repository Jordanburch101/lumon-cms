import config from "@payload-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { RenderBlocks } from "@/components/blocks/render-blocks";

interface Args {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: Args) {
  const { slug: slugSegments } = await params;
  const slug = slugSegments?.join("/") || "home";

  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    draft: false,
    limit: 1,
  });

  const page = result.docs[0];

  if (!page) {
    notFound();
  }

  return <RenderBlocks blocks={page.layout || []} />;
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: slugSegments } = await params;
  const slug = slugSegments?.join("/") || "home";

  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    draft: false,
    limit: 1,
    select: { meta: true, title: true },
  });

  const page = result.docs[0];

  if (!page) {
    return {};
  }

  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description || undefined,
  };
}
