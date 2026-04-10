import type { Metadata } from "next";
import { NotFoundContent } from "@/components/features/not-found-content";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
};

export default function NotFound() {
  return <NotFoundContent />;
}
