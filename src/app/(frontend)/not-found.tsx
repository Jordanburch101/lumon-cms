import type { Metadata } from "next";
import { NotFoundTerminal } from "./not-found-terminal";

export const metadata: Metadata = {
  title: "404 — File Not Found | Lumon",
  description: "The requested file has not been assigned to this department.",
};

export default function NotFound() {
  return <NotFoundTerminal />;
}
