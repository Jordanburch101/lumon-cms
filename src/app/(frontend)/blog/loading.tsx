import { ViewTransition } from "react";

export default function Loading() {
  return (
    <ViewTransition exit="slide-down">
      <section className="w-full animate-pulse">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="pt-8 pb-6 lg:pt-12">
            <div className="h-3 w-32 rounded bg-muted/20" />
            <div className="mt-3 h-9 w-64 rounded bg-muted/20" />
            <div className="mt-2 h-4 w-80 rounded bg-muted/20" />
          </div>
          <div className="h-[280px] rounded-xl bg-muted/20 lg:h-[340px]" />
          <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-8 pb-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i}>
                <div className="aspect-[16/9] rounded-lg bg-muted/20" />
                <div className="mt-4 h-4 w-16 rounded bg-muted/20" />
                <div className="mt-2.5 h-5 w-3/4 rounded bg-muted/20" />
                <div className="mt-1.5 h-4 w-full rounded bg-muted/20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </ViewTransition>
  );
}
