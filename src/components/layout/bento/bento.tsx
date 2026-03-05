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
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[220px_220px_160px]">
          {/* Chart: 2 cols, 2 rows — hero card */}
          <div className="sm:col-span-2 sm:row-span-2 lg:col-span-2">
            <ChartCard />
          </div>
          {/* Image: 1 col, 2 rows */}
          <div className="sm:row-span-2">
            <ImageCard />
          </div>
          {/* Stats: wide bottom-left */}
          <div>
            <StatsCard />
          </div>
          {/* Theme: bottom-center */}
          <div>
            <ThemeCard />
          </div>
          {/* Form: bottom-right */}
          <div>
            <FormCard />
          </div>
        </div>
      </div>
    </section>
  );
}
