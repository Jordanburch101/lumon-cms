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
        <div className="mb-8 max-w-2xl">
          <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
            {bentoSectionData.headline}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {bentoSectionData.subtext}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[180px_180px_100px]">
          {/* Chart: 2 cols, 2 rows — the hero card */}
          <div className="sm:col-span-2 sm:row-span-2">
            <ChartCard />
          </div>
          {/* Image: 1 col, 2 rows — full bleed image */}
          <div className="sm:row-span-2">
            <ImageCard />
          </div>
          {/* Theme: 1x1 */}
          <div>
            <ThemeCard />
          </div>
          {/* Form: 1x1 */}
          <div>
            <FormCard />
          </div>
          {/* Stats: full width bottom bar */}
          <div className="sm:col-span-2 lg:col-span-4">
            <StatsCard />
          </div>
        </div>
      </div>
    </section>
  );
}
