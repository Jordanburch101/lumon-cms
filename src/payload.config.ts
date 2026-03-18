import path from "node:path";
import { fileURLToPath } from "node:url";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { mcpPlugin } from "@payloadcms/plugin-mcp";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { TRAILING_SLASH_RE } from "./core/lib/utils";
import { Media } from "./payload/collections/Media";
import { Pages } from "./payload/collections/Pages";
import { Users } from "./payload/collections/Users";
import { SiteSettings } from "./payload/globals/SiteSettings";
import { optimizeVideoTask } from "./payload/jobs/optimize-video";
import {
  extractFirstImageFromBlocks,
  extractFirstTextFromBlocks,
} from "./payload/lib/seo/extract-block-content";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    autoLogin:
      process.env.NODE_ENV === "development" && process.env.AUTOLOGIN_EMAIL
        ? { email: process.env.AUTOLOGIN_EMAIL }
        : false,
  },
  collections: [Users, Media, Pages],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret:
    process.env.PAYLOAD_SECRET ??
    (() => {
      throw new Error("PAYLOAD_SECRET environment variable is required");
    })(),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || "file:./payload.db",
      ...(process.env.DATABASE_AUTH_TOKEN && {
        authToken: process.env.DATABASE_AUTH_TOKEN,
      }),
    },
    push: !process.env.DATABASE_AUTH_TOKEN,
  }),
  sharp,
  jobs: {
    tasks: [optimizeVideoTask],
    autoRun: [{ cron: "* * * * *" }],
    jobsCollectionOverrides: ({ defaultJobsCollection }) => ({
      ...defaultJobsCollection,
      admin: {
        ...defaultJobsCollection.admin,
        hidden: false,
      },
    }),
  },
  plugins: [
    ...(process.env.S3_BUCKET
      ? [
          s3Storage({
            collections: { media: true },
            bucket: process.env.S3_BUCKET,
            config: {
              region: process.env.S3_REGION || "us-east-1",
              endpoint: process.env.S3_ENDPOINT,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
              },
              forcePathStyle: true,
            },
          }),
        ]
      : []),
    mcpPlugin({
      collections: {
        pages: { enabled: true, description: "Site pages with layout blocks" },
        media: { enabled: true, description: "Uploaded images and videos" },
      },
      mcp: {
        tools: [
          {
            name: "listBlocks",
            description:
              "Returns all available layout block types with their slugs, labels, and descriptions. Call this before building a new page to know which blocks to use and what content each expects.",
            parameters: {},
            handler: (_args, req) => {
              const pagesCollection = req.payload.config.collections.find(
                (c) => c.slug === "pages"
              );
              const layoutField = pagesCollection?.fields.find(
                (f) => "name" in f && f.name === "layout"
              );
              const blocks =
                layoutField && "blocks" in layoutField
                  ? layoutField.blocks.map((b) => ({
                      slug: b.slug,
                      label: b.labels?.singular ?? b.slug,
                      description:
                        (b.admin?.custom as Record<string, unknown> | undefined)
                          ?.description ?? null,
                    }))
                  : [];
              return {
                content: [
                  {
                    type: "text" as const,
                    text: JSON.stringify(blocks, null, 2),
                  },
                ],
              };
            },
          },
        ],
      },
      experimental: {
        tools: {
          collections: {
            enabled: process.env.NODE_ENV === "development",
            collectionsDirPath: path.resolve(dirname, "payload/collections"),
          },
          config: {
            enabled: process.env.NODE_ENV === "development",
            configFilePath: path.resolve(dirname, "payload.config.ts"),
          },
        },
      },
    }),
    seoPlugin({
      collections: ["pages"],
      uploadsCollection: "media",
      tabbedUI: true,
      generateTitle: async ({ doc, req }) => {
        const settings = await req.payload.findGlobal({
          slug: "site-settings",
        });
        const siteName = settings.siteName?.trim();
        const separator = settings.separator || " | ";
        return siteName ? `${doc.title}${separator}${siteName}` : doc.title;
      },
      generateDescription: ({ doc }) => {
        // Plugin requires string return — empty string is converted to undefined
        // by the metadata helper at render time (page.meta?.description || undefined).
        // Editors see an empty auto-generated field and can fill it manually.
        return (
          extractFirstTextFromBlocks(
            (doc as { layout?: unknown[] }).layout as Parameters<
              typeof extractFirstTextFromBlocks
            >[0]
          ) ?? ""
        );
      },
      generateURL: async ({ doc, req }) => {
        const settings = await req.payload.findGlobal({
          slug: "site-settings",
        });
        const slug = doc.slug === "home" ? "" : doc.slug;
        return `${settings.baseUrl || ""}/${slug}`.replace(
          TRAILING_SLASH_RE,
          ""
        );
      },
      generateImage: ({ doc }) => {
        // Cast: plugin type requires number but handles undefined gracefully at runtime
        // (auto-generate button shows nothing when no image found). Verified in plugin-seo@3.79.
        return extractFirstImageFromBlocks(
          (doc as { layout?: unknown[] }).layout as Parameters<
            typeof extractFirstImageFromBlocks
          >[0]
        ) as number;
      },
      fields: ({ defaultFields }) => [
        // Add filterOptions to the plugin's image field to restrict to raster images only
        ...defaultFields.map((field) =>
          "name" in field && field.name === "image"
            ? {
                ...field,
                filterOptions: {
                  mimeType: { not_in: ["image/svg+xml"] },
                  _or: [{ mimeType: { contains: "image/" } }],
                },
              }
            : field
        ),
        {
          name: "canonicalUrl",
          type: "text" as const,
          label: "Canonical URL",
          validate: (value: string | null | undefined) => {
            if (!value) {
              return true;
            }
            if (
              !(value.startsWith("https://") || value.startsWith("http://"))
            ) {
              return "URL must start with https:// or http://";
            }
            return true;
          },
          admin: {
            description:
              "Override the auto-generated canonical URL. Leave blank to use the default.",
          },
        },
        {
          name: "robots",
          type: "group" as const,
          label: "Robots",
          fields: [
            {
              name: "override",
              type: "checkbox" as const,
              defaultValue: false,
              label: "Override global robots settings",
              admin: {
                description:
                  "Enable to set custom robots directives for this page.",
              },
            },
            {
              name: "index",
              type: "checkbox" as const,
              defaultValue: true,
              label: "Allow indexing",
              admin: {
                condition: (
                  _: Record<string, unknown>,
                  siblingData: Record<string, unknown>
                ) => siblingData?.override === true,
              },
            },
            {
              name: "follow",
              type: "checkbox" as const,
              defaultValue: true,
              label: "Allow link following",
              admin: {
                condition: (
                  _: Record<string, unknown>,
                  siblingData: Record<string, unknown>
                ) => siblingData?.override === true,
              },
            },
          ],
        },
        {
          name: "keywords",
          type: "text" as const,
          label: "Keywords",
          admin: {
            description: "Comma-separated keywords (optional).",
          },
        },
        {
          name: "excludeFromSitemap",
          type: "checkbox" as const,
          defaultValue: false,
          label: "Exclude from sitemap",
          admin: {
            description:
              "Hide this page from the sitemap. It can still be indexed if linked to externally.",
          },
        },
      ],
    }),
  ],
});
