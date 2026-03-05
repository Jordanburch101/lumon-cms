import { bentoSectionData } from "./bento-data";
import { ChartCard } from "./chart-card";
import { FormCard } from "./form-card";
import { ImageCard } from "./image-card";
import { StatsCard } from "./stats-card";
import { ThemeCard } from "./theme-card";

export function BentoShowcase() {
  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
            {bentoSectionData.headline}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {bentoSectionData.subtext}
          </p>
        </div>
        <div className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Chart: 2 cols, 2 rows */}
          <div className="sm:col-span-2 sm:row-span-2">
            <ChartCard />
          </div>
          {/* Image: 1 col, 2 rows */}
          <div className="sm:row-span-2 lg:col-span-1">
            <ImageCard />
          </div>
          {/* Theme: 1x1 */}
          <div className="lg:col-span-1">
            <ThemeCard />
          </div>
          {/* Stats: 2 cols, 1 row */}
          <div className="sm:col-span-2">
            <StatsCard />
          </div>
          {/* Form: 1x1 — only visible on lg where we have 4 cols */}
          <div className="lg:col-span-1">
            <FormCard />
          </div>
        </div>
      </div>
    </section>
  );
}
