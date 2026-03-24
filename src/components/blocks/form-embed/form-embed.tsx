import type { ReactNode } from "react";
import { RichText } from "@/components/features/rich-text";
import type { FormEmbedBlock as FormEmbedBlockType } from "@/types/block-types";
import { FormRenderer } from "./form-renderer";
import { MapPanel } from "./map-panel";

interface FormConfig {
  confirmationMessage?: Record<string, unknown> | null;
  confirmationType?: "message" | "redirect" | null;
  fields?: unknown[] | null;
  id: number;
  redirect?: { url?: string } | null;
  submitButtonLabel?: string | null;
}

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
    <RichText data={formData.confirmationMessage} />
  ) : undefined;

  return (
    <section className="w-full">
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
  return <RichText data={content} />;
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
      <div className="flex max-w-2xl flex-col gap-4">
        <SectionHeading heading={heading} />
        <SectionContent content={content as Record<string, unknown>} />
      </div>
      <div className="w-full max-w-xl text-left">
        <FormRenderer confirmationNode={confirmationNode} form={form} />
      </div>
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
      <div className="flex flex-col gap-4">
        <SectionHeading heading={heading} />
        <SectionContent content={content as Record<string, unknown>} />
      </div>
      <div>
        <FormRenderer confirmationNode={confirmationNode} form={form} />
      </div>
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
        <div className="flex flex-col gap-4">
          <SectionHeading heading={heading} />
          <SectionContent content={content as Record<string, unknown>} />
        </div>
        <FormRenderer confirmationNode={confirmationNode} form={form} />
      </div>
      {hasMap && (
        <div className="order-last">
          <MapPanel
            latitude={Number(mapCenter.latitude)}
            longitude={Number(mapCenter.longitude)}
            markerLabel={mapMarkerLabel}
            zoom={mapZoom ?? 14}
          />
        </div>
      )}
    </div>
  );
}
