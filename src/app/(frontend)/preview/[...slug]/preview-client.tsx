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
    return (
      <ArticlePreview initialData={props.initialData} serverURL={serverURL} />
    );
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
