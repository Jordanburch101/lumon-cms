export default function PreviewLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex h-[70vh] items-center justify-center bg-muted/10">
        <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]">
          Loading preview
        </p>
      </div>
    </div>
  );
}
