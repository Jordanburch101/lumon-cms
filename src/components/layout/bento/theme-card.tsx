import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function MiniPreview({ mode }: { mode: "light" | "dark" }) {
  const isLight = mode === "light";
  return (
    <div
      className={`flex-1 rounded-md p-3 ${
        isLight
          ? "bg-white text-zinc-900 ring-1 ring-zinc-200"
          : "bg-zinc-900 text-zinc-100 ring-1 ring-zinc-700"
      }`}
    >
      <div
        className={`mb-2 h-1.5 w-8 rounded-full ${isLight ? "bg-zinc-900" : "bg-zinc-100"}`}
      />
      <div
        className={`mb-1 h-1 w-full rounded-full ${isLight ? "bg-zinc-200" : "bg-zinc-700"}`}
      />
      <div
        className={`h-1 w-3/4 rounded-full ${isLight ? "bg-zinc-200" : "bg-zinc-700"}`}
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
