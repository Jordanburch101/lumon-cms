"use client";

import { useLivePreview } from "@payloadcms/live-preview-react";
import { RenderBlocks, RenderHero } from "@/components/blocks/render-blocks";
import type { Page } from "@/payload-types";

export function PreviewClient({ initialData }: { initialData: Page }) {
  const { data } = useLivePreview<Page>({
    initialData,
    serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3100",
    depth: 2,
  });

  return (
    <>
      <RenderHero blocks={data.hero ?? []} />
      <RenderBlocks blocks={data.layout ?? []} />
    </>
  );
}
