/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

import config from "@payload-config";
import { generatePageMetadata, NotFoundPage } from "@payloadcms/next/views";
import { connection } from "next/server";
import { importMap } from "../importMap";

interface Args {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
}

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config, params, searchParams });

const NotFound = async ({ params, searchParams }: Args) => {
  await connection();
  return NotFoundPage({ config, importMap, params, searchParams });
};

export default NotFound;
