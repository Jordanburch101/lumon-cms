import { ViewTransition } from "react";

export function DirectionalTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransition
      default="none"
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
    >
      {children}
    </ViewTransition>
  );
}
