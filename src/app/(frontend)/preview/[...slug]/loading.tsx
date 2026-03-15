export default function PreviewLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex h-[70vh] items-center justify-center bg-muted/10">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Loading preview
        </p>
      </div>
    </div>
  );
}
