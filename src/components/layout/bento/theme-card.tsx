import { cn } from "@/core/lib/utils";

function MiniPreview({ mode }: { mode: "light" | "dark" }) {
  const isLight = mode === "light";
  return (
    <div
      className={cn(
        "flex flex-1 flex-col justify-between rounded-md p-3",
        isLight
          ? "bg-white text-zinc-900 ring-1 ring-zinc-200"
          : "bg-zinc-900 text-zinc-100 ring-1 ring-zinc-800"
      )}
    >
      <div>
        <div
          className={cn(
            "mb-2 h-1.5 w-10 rounded-full",
            isLight ? "bg-zinc-900" : "bg-zinc-100"
          )}
        />
        <div
          className={cn(
            "mb-1 h-1 w-full rounded-full",
            isLight ? "bg-zinc-200" : "bg-zinc-800"
          )}
        />
        <div
          className={cn(
            "mb-1 h-1 w-4/5 rounded-full",
            isLight ? "bg-zinc-200" : "bg-zinc-800"
          )}
        />
        <div
          className={cn(
            "h-1 w-3/5 rounded-full",
            isLight ? "bg-zinc-100" : "bg-zinc-800/60"
          )}
        />
      </div>
      <div className="flex gap-1.5">
        <div
          className={cn(
            "h-1.5 w-8 rounded-full",
            isLight ? "bg-zinc-900" : "bg-zinc-100"
          )}
        />
        <div
          className={cn(
            "h-1.5 w-6 rounded-full",
            isLight ? "bg-zinc-200" : "bg-zinc-700"
          )}
        />
      </div>
    </div>
  );
}

export function ThemeCard() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-background p-4">
      <span className="mb-2 text-[11px] text-muted-foreground uppercase tracking-wider">
        Theming
      </span>
      <div className="flex min-h-0 flex-1 gap-2">
        <MiniPreview mode="light" />
        <MiniPreview mode="dark" />
      </div>
    </div>
  );
}
