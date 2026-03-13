export function HorizontalRuleConverter() {
  return (
    <div
      aria-hidden="true"
      className="my-8 h-px"
      style={{
        background:
          "linear-gradient(90deg, transparent, var(--border), transparent)",
      }}
    />
  );
}
