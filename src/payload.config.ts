import path from "node:path";
import { fileURLToPath } from "node:url";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { formBuilderPlugin } from "@payloadcms/plugin-form-builder";
import { mcpPlugin } from "@payloadcms/plugin-mcp";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { TRAILING_SLASH_RE } from "./core/lib/utils";
import { Articles } from "./payload/collections/Articles";
import { BaAccounts } from "./payload/collections/auth/BaAccounts";
import { BaSessions } from "./payload/collections/auth/BaSessions";
import { BaTwoFactors } from "./payload/collections/auth/BaTwoFactors";
import { BaVerifications } from "./payload/collections/auth/BaVerifications";
import { Categories } from "./payload/collections/Categories";
import { Media } from "./payload/collections/Media";
import { Pages } from "./payload/collections/Pages";
import { Users } from "./payload/collections/Users";
import { Footer as FooterGlobal } from "./payload/globals/Footer";
import { Header } from "./payload/globals/Header";
import { SiteSettings } from "./payload/globals/SiteSettings";
import { optimizeVideoTask } from "./payload/jobs/optimize-video";
import {
  extractFirstImageFromBlocks,
  extractFirstTextFromBlocks,
} from "./payload/lib/seo/extract-block-content";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/** Extract block descriptors from a named blocks field inside Pages' tabs. */
function getBlocksFromField(
  // biome-ignore lint/suspicious/noExplicitAny: MCP handler req type is loosely typed by plugin.
  req: any,
  fieldName: string
) {
  const pagesCollection = req.payload.config.collections.find(
    (c: { slug: string }) => c.slug === "pages"
  );
  const tabsField = pagesCollection?.fields.find(
    (f: Record<string, unknown>) => "type" in f && f.type === "tabs"
  );
  if (!(tabsField && "tabs" in tabsField)) {
    return [];
  }
  for (const tab of tabsField.tabs) {
    for (const field of tab.fields) {
      if ("name" in field && field.name === fieldName && "blocks" in field) {
        return field.blocks.map(
          (b: {
            slug: string;
            labels?: { singular?: string };
            admin?: { custom?: Record<string, unknown> };
          }) => ({
            slug: b.slug,
            label: b.labels?.singular ?? b.slug,
            description: b.admin?.custom?.description ?? null,
          })
        );
      }
    }
  }
  return [];
}

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
  collections: [
    Users,
    Media,
    Pages,
    Categories,
    Articles,
    BaSessions,
    BaAccounts,
    BaVerifications,
    BaTwoFactors,
  ],
  globals: [SiteSettings, Header, FooterGlobal],
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sharp: sharp as any,
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
        categories: { enabled: true, description: "Article categories" },
        articles: { enabled: true, description: "Blog articles" },
        forms: {
          enabled: true,
          description: "Form definitions (fields, confirmation, emails)",
        },
        "form-submissions": {
          enabled: true,
          description: "Submitted form entries",
        },
      },
      mcp: {
        tools: [
          {
            name: "listHeroBlocks",
            description:
              "Returns available hero block types (max 1 per page) with slugs, labels, and descriptions. Use when choosing a hero variant for a page.",
            parameters: {},
            handler: (_args, req) => {
              const blocks = getBlocksFromField(req, "hero");
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
          {
            name: "listContentBlocks",
            description:
              "Returns available content/layout block types with slugs, labels, and descriptions. Use when building a page's content sections.",
            parameters: {},
            handler: (_args, req) => {
              const blocks = getBlocksFromField(req, "layout");
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
    formBuilderPlugin({
      fields: {
        text: true,
        textarea: true,
        select: true,
        radio: true,
        email: true,
        state: true,
        country: true,
        checkbox: true,
        number: true,
        message: true,
        date: true,
        payment: false,
      },
      redirectRelationships: ["pages"],
      formOverrides: {
        admin: {
          group: "Forms",
        },
      },
      formSubmissionOverrides: {
        admin: {
          group: "Forms",
        },
      },
    }),
    seoPlugin({
      collections: ["pages", "articles"],
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
        // Articles have an excerpt field — use it directly
        if (
          "excerpt" in doc &&
          typeof doc.excerpt === "string" &&
          doc.excerpt
        ) {
          return doc.excerpt;
        }
        const d = doc as { hero?: unknown[]; layout?: unknown[] };
        const blocks = [...(d.hero ?? []), ...(d.layout ?? [])] as Parameters<
          typeof extractFirstTextFromBlocks
        >[0];
        return extractFirstTextFromBlocks(blocks) ?? "";
      },
      generateURL: async ({ doc, collectionConfig, req }) => {
        const settings = await req.payload.findGlobal({
          slug: "site-settings",
        });
        const isArticle = collectionConfig?.slug === "articles";
        const prefix = isArticle ? "/blog" : "";
        const pagePath = (doc as { path?: string }).path ?? doc.slug;
        const urlPath = !pagePath || pagePath === "" ? "" : pagePath;
        return `${settings.baseUrl || ""}${prefix}/${urlPath}`.replace(
          TRAILING_SLASH_RE,
          ""
        );
      },
      generateImage: ({ doc }) => {
        // Articles use heroImage directly
        if ("heroImage" in doc && doc.heroImage) {
          return doc.heroImage as number;
        }
        // Cast: plugin type requires number but handles undefined gracefully at runtime
        // (auto-generate button shows nothing when no image found). Verified in plugin-seo@3.79.
        const d = doc as { hero?: unknown[]; layout?: unknown[] };
        const blocks = [...(d.hero ?? []), ...(d.layout ?? [])] as Parameters<
          typeof extractFirstImageFromBlocks
        >[0];
        return extractFirstImageFromBlocks(blocks) as number;
      },
      fields: ({ defaultFields }) => [
        // Add filterOptions to the plugin's image field to restrict to raster images only
        ...defaultFields.map((field) =>
          "name" in field && field.name === "image"
            ? ({
                ...field,
                filterOptions: {
                  mimeType: { contains: "image/", not_in: ["image/svg+xml"] },
                },
              } as typeof field)
            : field
        ),
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
