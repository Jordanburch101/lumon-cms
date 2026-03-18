import path from "node:path";
import { fileURLToPath } from "node:url";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { mcpPlugin } from "@payloadcms/plugin-mcp";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Media } from "./payload/collections/Media";
import { Pages } from "./payload/collections/Pages";
import { Users } from "./payload/collections/Users";
import { optimizeVideoTask } from "./payload/jobs/optimize-video";

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
  ],
});
