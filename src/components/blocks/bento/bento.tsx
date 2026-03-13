import type { BentoBlock } from "@/types/block-types";
import { ChartCard } from "./chart-card";
import { GlobeCard } from "./globe-card";
import { ImageCard } from "./image-card";
import { IntegrationsCard } from "./integrations-card";
import { NotificationsCard } from "./notifications-card";
import { ShowcaseCard } from "./showcase-card";

export function BentoShowcase({
  headline,
  subtext,
  image,
  chartData,
}: BentoBlock) {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-8 max-w-2xl">
          <h2
            className="font-semibold text-3xl leading-tight sm:text-4xl"
            data-field="headline"
          >
            {headline}
          </h2>
          <p
            className="mt-3 text-base text-muted-foreground"
            data-field="subtext"
          >
            {subtext}
          </p>
        </div>
        <div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[240px_240px_56px]">
            {/* Row 1: Chart (2col) + Globe (1col) + Image (1col, spans 2 rows) */}
            <div className="sm:col-span-2">
              <ChartCard chartData={chartData ?? undefined} />
            </div>
            <div className="hidden lg:block">
              <GlobeCard />
            </div>
            <div className="sm:col-span-2 lg:col-span-1 lg:row-span-2">
              <ImageCard image={image} />
            </div>

            {/* Row 2: Showcase (2col) + Notifications (1col) */}
            <div className="sm:col-span-2">
              <ShowcaseCard />
            </div>
            <div className="hidden lg:block">
              <NotificationsCard />
            </div>

            {/* Row 3: Integrations strip (full width) */}
            <div className="hidden lg:col-span-4 lg:block">
              <IntegrationsCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
