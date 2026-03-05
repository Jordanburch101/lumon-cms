import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/core/lib/utils";

function MiniPreview({ mode }: { mode: "light" | "dark" }) {
  const isLight = mode === "light";
  return (
    <div
      className={cn(
        "flex-1 rounded-md p-3 ring-1",
        isLight
          ? "bg-white text-zinc-900 ring-zinc-200"
          : "bg-zinc-900 text-zinc-100 ring-zinc-700"
      )}
    >
      <div
        className={cn(
          "mb-2 h-1.5 w-8 rounded-full",
          isLight ? "bg-zinc-900" : "bg-zinc-100"
        )}
      />
      <div
        className={cn(
          "mb-1 h-1 w-full rounded-full",
          isLight ? "bg-zinc-200" : "bg-zinc-700"
        )}
      />
      <div
        className={cn(
          "h-1 w-3/4 rounded-full",
          isLight ? "bg-zinc-200" : "bg-zinc-700"
        )}
      />
    </div>
  );
}

export function ThemeCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Theming</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <MiniPreview mode="light" />
          <MiniPreview mode="dark" />
        </div>
      </CardContent>
    </Card>
  );
}
