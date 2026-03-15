export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-[70vh] bg-muted/20" />
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-24 lg:px-6">
        <div className="h-8 w-1/3 rounded bg-muted/20" />
        <div className="h-4 w-2/3 rounded bg-muted/20" />
        <div className="h-4 w-1/2 rounded bg-muted/20" />
      </div>
    </div>
  );
}
