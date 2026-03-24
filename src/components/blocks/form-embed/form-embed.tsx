import type { ReactNode } from "react";
import { RichText, type RichTextProps } from "@/components/features/rich-text";
import type { FormEmbedBlock as FormEmbedBlockType } from "@/types/block-types";
import { AnimateIn } from "./animate-in";
import { FormRenderer } from "./form-renderer";
import { MapPanel } from "./map-panel";
import type { FormConfig } from "./types";

export function FormEmbed(props: FormEmbedBlockType) {
  const {
    variant,
    heading,
    content,
    form,
    mapCenter,
    mapZoom,
    mapMarkerLabel,
  } = props;

  // Guard: form must be a populated object, not just an ID
  if (!form || typeof form === "number") {
    return null;
  }
  const formData = form as unknown as FormConfig;

  // Pre-render confirmation message as a server component so RichText stays on the server
  const confirmationNode = formData.confirmationMessage ? (
    <RichText
      data={formData.confirmationMessage as unknown as RichTextProps["data"]}
    />
  ) : undefined;

  return (
    <section aria-label={heading || "Form"} className="w-full">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {variant === "stacked" && (
          <StackedLayout
            confirmationNode={confirmationNode}
            content={content}
            form={formData}
            heading={heading}
          />
        )}

        {variant === "split" && (
          <SplitLayout
            confirmationNode={confirmationNode}
            content={content}
            form={formData}
            heading={heading}
          />
        )}

        {variant === "map" && (
          <MapLayout
            confirmationNode={confirmationNode}
            content={content}
            form={formData}
            heading={heading}
            mapCenter={mapCenter}
            mapMarkerLabel={mapMarkerLabel}
            mapZoom={mapZoom}
          />
        )}
      </div>
    </section>
  );
}

function SectionHeading({ heading }: { heading?: string | null }) {
  if (!heading) {
    return null;
  }
  return (
    <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
      {heading}
    </h2>
  );
}

function SectionContent({
  content,
}: {
  content?: Record<string, unknown> | null;
}) {
  if (!content) {
    return null;
  }
  return <RichText data={content as unknown as RichTextProps["data"]} />;
}

function StackedLayout({
  heading,
  content,
  form,
  confirmationNode,
}: {
  heading?: string | null;
  content?: unknown;
  form: FormConfig;
  confirmationNode?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <AnimateIn className="flex max-w-2xl flex-col gap-4">
        <SectionHeading heading={heading} />
        <SectionContent content={content as Record<string, unknown>} />
      </AnimateIn>
      <AnimateIn className="w-full max-w-xl text-left" delay={0.1}>
        <FormRenderer confirmationNode={confirmationNode} form={form} />
      </AnimateIn>
    </div>
  );
}

function SplitLayout({
  heading,
  content,
  form,
  confirmationNode,
}: {
  heading?: string | null;
  content?: unknown;
  form: FormConfig;
  confirmationNode?: ReactNode;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
      <AnimateIn className="flex flex-col gap-4">
        <SectionHeading heading={heading} />
        <SectionContent content={content as Record<string, unknown>} />
      </AnimateIn>
      <AnimateIn delay={0.15}>
        <FormRenderer confirmationNode={confirmationNode} form={form} />
      </AnimateIn>
    </div>
  );
}

function MapLayout({
  heading,
  content,
  form,
  confirmationNode,
  mapCenter,
  mapZoom,
  mapMarkerLabel,
}: {
  heading?: string | null;
  content?: unknown;
  form: FormConfig;
  confirmationNode?: ReactNode;
  mapCenter?: { latitude?: number | null; longitude?: number | null } | null;
  mapZoom?: number | null;
  mapMarkerLabel?: string | null;
}) {
  const hasMap = mapCenter?.latitude != null && mapCenter?.longitude != null;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-6">
        <AnimateIn className="flex flex-col gap-4">
          <SectionHeading heading={heading} />
          <SectionContent content={content as Record<string, unknown>} />
        </AnimateIn>
        <AnimateIn delay={0.1}>
          <FormRenderer confirmationNode={confirmationNode} form={form} />
        </AnimateIn>
      </div>
      {hasMap && (
        <AnimateIn className="order-last self-stretch" delay={0.2}>
          <MapPanel
            latitude={Number(mapCenter.latitude)}
            longitude={Number(mapCenter.longitude)}
            markerLabel={mapMarkerLabel}
            zoom={mapZoom ?? 2}
          />
        </AnimateIn>
      )}
    </div>
  );
}
