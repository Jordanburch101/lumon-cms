/**
 * Generate Payload import map using Bun runtime.
 *
 * Workaround for tsx + Node.js v24 ESM resolution incompatibility.
 * See: https://github.com/payloadcms/payload/issues/14994
 *
 * Usage: bun run scripts/gen-importmap.ts
 */
import config from "../src/payload.config.ts";
// @ts-ignore — internal Payload export, not part of public API
import { generateImportMap } from "../node_modules/payload/dist/bin/generateImportMap/index.js";

const resolvedConfig = await config;
await generateImportMap(resolvedConfig);
