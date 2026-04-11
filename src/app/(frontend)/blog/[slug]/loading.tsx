import { ViewTransition } from "react";

export default function Loading() {
  return (
    <ViewTransition exit="slide-down">
      <article className="animate-pulse">
        <div className="h-[280px] bg-muted/20 sm:h-[340px] lg:h-[420px]" />
        <div className="mx-auto -mt-10 max-w-3xl px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 rounded bg-muted/20" />
            <div className="h-4 w-20 rounded bg-muted/20" />
          </div>
          <div className="mt-3 h-9 w-3/4 rounded bg-muted/20" />
          <div className="mt-5 border-border border-b pb-6">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-muted/20" />
              <div className="h-4 w-24 rounded bg-muted/20" />
            </div>
          </div>
          <div className="space-y-3 py-8">
            <div className="h-4 w-full rounded bg-muted/20" />
            <div className="h-4 w-5/6 rounded bg-muted/20" />
            <div className="h-4 w-full rounded bg-muted/20" />
            <div className="h-4 w-2/3 rounded bg-muted/20" />
            <div className="h-4 w-full rounded bg-muted/20" />
            <div className="h-4 w-4/5 rounded bg-muted/20" />
          </div>
        </div>
      </article>
    </ViewTransition>
  );
}
