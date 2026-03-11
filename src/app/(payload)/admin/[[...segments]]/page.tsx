/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

import { generatePageMetadata, RootPage } from "@payloadcms/next/views";
import type { AdminViewProps } from "payload";
import { importMap } from "../importMap";

interface Args {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
}

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config: "@/payload.config", params, searchParams });

const Page = ({ params, searchParams }: AdminViewProps) =>
  RootPage({ config: "@/payload.config", importMap, params, searchParams });

export default Page;
