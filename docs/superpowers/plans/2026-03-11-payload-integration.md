# Payload CMS Integration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Payload CMS so every homepage section is a CMS-editable block, with an admin panel at `/admin` and SSR page rendering.

**Architecture:** Monolithic page builder — one `Pages` collection with a `layout` blocks field containing 10 block types. SQLite database, S3 media storage, Lexical rich text. MCP plugin for Claude-driven content management.

**Tech Stack:** Payload CMS 3.x, `@payloadcms/db-sqlite`, `@payloadcms/storage-s3`, `@payloadcms/richtext-lexical`, `@payloadcms/plugin-mcp`

**Spec:** `docs/superpowers/specs/2026-03-11-payload-integration-design.md`

---

## Chunk 1: Foundation — Install, Configure, Route Groups

### Task 1: Install Payload dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Payload core and adapters**

```bash
bun add payload @payloadcms/next @payloadcms/db-sqlite @payloadcms/richtext-lexical @payloadcms/storage-s3 @payloadcms/plugin-mcp sharp graphql
```

- [ ] **Step 2: Verify installation**

Run: `bun pm ls | grep payload`
Expected: All `@payloadcms/*` packages listed

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: install Payload CMS dependencies"
```

---

### Task 2: Create environment variables

**Files:**
- Create: `.env`
- Create: `.env.example`

- [ ] **Step 1: Create `.env.example` with all required variables**

```env
# Payload
PAYLOAD_SECRET=replace-with-random-string

# Database (SQLite)
DATABASE_URI=file:./payload.db

# S3 Storage (Railway bucket)
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=
```

- [ ] **Step 2: Create `.env` with development values**

```env
PAYLOAD_SECRET=dev-secret-change-in-production
DATABASE_URI=file:./payload.db
```

Note: S3 vars left empty for now — local dev uses disk storage fallback. S3 is configured when deploying to Railway.

- [ ] **Step 3: Add Payload artifacts to `.gitignore` now (before dev server creates them)**

Add these lines to `.gitignore`:
```
# Payload
payload.db
payload.db-journal
src/app/(payload)/admin/importMap.js
```

Also verify `.gitignore` contains `.env` and `.env*.local` but NOT `.env.example`.

- [ ] **Step 4: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add environment variable template and Payload gitignore entries"
```

---

### Task 3: Create Payload config

**Files:**
- Create: `src/payload.config.ts`

- [ ] **Step 1: Create the Payload config file**

```ts
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'CHANGE-ME',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./payload.db',
    },
  }),
  sharp,
  plugins: [
    // S3 storage — only enabled when S3 vars are set (Railway deployment)
    ...(process.env.S3_BUCKET
      ? [
          s3Storage({
            collections: { media: true },
            bucket: process.env.S3_BUCKET,
            config: {
              region: process.env.S3_REGION || 'us-east-1',
              endpoint: process.env.S3_ENDPOINT,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
              },
              forcePathStyle: true,
            },
          }),
        ]
      : []),
    // MCP plugin for Claude-driven content management
    mcpPlugin({
      collections: {
        pages: { enabled: true, description: 'Site pages with layout blocks' },
        media: { enabled: true, description: 'Uploaded images and videos' },
      },
      experimental: {
        tools: {
          collections: {
            enabled: process.env.NODE_ENV === 'development',
            collectionsDirPath: path.resolve(dirname, 'collections'),
          },
          config: {
            enabled: process.env.NODE_ENV === 'development',
            configFilePath: path.resolve(dirname, 'payload.config.ts'),
          },
        },
      },
    }),
  ],
})
```

- [ ] **Step 2: Commit**

```bash
git add src/payload.config.ts
git commit -m "feat: add Payload CMS config with SQLite, S3, and MCP plugin"
```

---

### Task 4: Create Users collection

**Files:**
- Create: `src/collections/Users.ts`

- [ ] **Step 1: Create the Users collection**

```ts
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
}
```

- [ ] **Step 2: Commit**

```bash
git add src/collections/Users.ts
git commit -m "feat: add Users collection"
```

---

### Task 5: Create Media collection

**Files:**
- Create: `src/collections/Media.ts`

- [ ] **Step 1: Create the Media collection**

```ts
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ['image/*', 'video/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
```

- [ ] **Step 2: Commit**

```bash
git add src/collections/Media.ts
git commit -m "feat: add Media collection with public read access"
```

---

### Task 6: Set up route groups and admin panel

**Files:**
- Modify: `src/app/layout.tsx` (strip down to root-only concerns)
- Create: `src/app/(frontend)/layout.tsx` (move Providers, Navbar, Footer here)
- Move: `src/app/page.tsx` → `src/app/(frontend)/page.tsx`
- Create: `src/app/(payload)/layout.tsx` (Payload admin layout)
- Create: `src/app/(payload)/admin/[[...segments]]/page.tsx`
- Create: `src/app/(payload)/admin/[[...segments]]/not-found.tsx`
- Create: `src/app/(payload)/custom.scss` (empty, required by Payload)

- [ ] **Step 1: Create the Payload admin layout and route**

`src/app/(payload)/layout.tsx` — required for the admin panel to function:
```tsx
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { ServerFunctionClient } from 'payload'
import config from '@payload-config'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import { importMap } from './admin/importMap'
import './custom.scss'

type Args = { children: React.ReactNode }

const serverFunctions: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunctions}>
    {children}
  </RootLayout>
)

export default Layout
```

Then create the admin route files:

`src/app/(payload)/admin/[[...segments]]/page.tsx`:
```tsx
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { AdminViewProps } from 'payload'

import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string | string[]>>
}

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config: '@/payload.config', params, searchParams })

const Page = ({ params, searchParams }: AdminViewProps) =>
  RootPage({ config: '@/payload.config', importMap, params, searchParams })

export default Page
```

`src/app/(payload)/admin/[[...segments]]/not-found.tsx`:
```tsx
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { AdminViewProps } from 'payload'

import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string | string[]>>
}

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config: '@/payload.config', params, searchParams })

const NotFound = ({ params, searchParams }: AdminViewProps) =>
  NotFoundPage({ config: '@/payload.config', importMap, params, searchParams })

export default NotFound
```

`src/app/(payload)/custom.scss`:
```scss
// Custom Payload admin styles (empty — required by Payload)
```

- [ ] **Step 2: Split root layout into root + frontend layout**

The current `src/app/layout.tsx` has fonts, Providers, Navbar, Footer. Split it:

**Root layout** (`src/app/layout.tsx`) — shared by admin and frontend:
```tsx
import type { Metadata } from 'next'
import { Geist_Mono, Nunito_Sans } from 'next/font/google'
import './globals.css'

const nunitoSans = Nunito_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Lumon',
  description: 'Next.js + Payload CMS template and component showcase',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunitoSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
```

**Frontend layout** (`src/app/(frontend)/layout.tsx`):
```tsx
import { Footer } from '@/components/layout/footer/footer'
import { Navbar } from '@/components/layout/navbar/navbar'
import { Providers } from '@/providers/providers'

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Providers>
      {process.env.NODE_ENV === 'development' && (
        <script
          src="https://mcp.figma.com/mcp/html-to-design/capture.js"
          async
        />
      )}
      <Navbar />
      <main>{children}</main>
      <Footer />
    </Providers>
  )
}
```

- [ ] **Step 3: Move page.tsx to frontend route group**

```bash
mkdir -p src/app/\(frontend\)
mv src/app/page.tsx src/app/\(frontend\)/page.tsx
```

- [ ] **Step 4: Update next.config.ts to use Payload's withPayload wrapper**

```ts
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default withPayload(nextConfig)
```

- [ ] **Step 5: Add `@payload-config` path alias to tsconfig.json**

Add to `compilerOptions.paths`:
```json
"@payload-config": ["./src/payload.config.ts"]
```

- [ ] **Step 6: Add Payload scripts to package.json**

Add to `scripts`:
```json
"generate:types": "payload generate:types"
```

- [ ] **Step 7: Verify Payload artifacts are already in `.gitignore`**

Confirm that `.gitignore` already has `payload.db`, `payload.db-journal`, and `importMap.js` entries (added in Task 2).

- [ ] **Step 8: Verify dev server starts and admin panel loads**

Run: `bun dev`
Expected:
- No build errors
- `http://localhost:3000` shows the existing site (via frontend layout)
- `http://localhost:3000/admin` shows Payload admin panel setup screen
- Create first admin user through the setup screen

- [ ] **Step 9: Commit**

```bash
git add src/app/ next.config.ts tsconfig.json package.json
git commit -m "feat: set up Payload admin panel with route groups"
```

---

## Chunk 2: Block Schemas and Pages Collection

### Task 7: Create block schema files

**Files:**
- Create: `src/blocks/Hero.ts`
- Create: `src/blocks/Bento.ts`
- Create: `src/blocks/SplitMedia.ts`
- Create: `src/blocks/Testimonials.ts`
- Create: `src/blocks/ImageGallery.ts`
- Create: `src/blocks/LatestArticles.ts`
- Create: `src/blocks/CinematicCta.ts`
- Create: `src/blocks/Pricing.ts`
- Create: `src/blocks/Faq.ts`
- Create: `src/blocks/Trust.ts`

Each block is a Payload `Block` type definition. Create all 10 files.

- [ ] **Step 1: Create `src/blocks/Hero.ts`**

```ts
import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Hero' },
  fields: [
    { name: 'mediaSrc', type: 'upload', relationTo: 'media', required: true },
    { name: 'headline', type: 'text', required: true },
    { name: 'subtext', type: 'text', required: true },
    {
      name: 'primaryCta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'secondaryCta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
  ],
}
```

- [ ] **Step 2: Create `src/blocks/Bento.ts`**

```ts
import type { Block } from 'payload'

export const BentoBlock: Block = {
  slug: 'bento',
  labels: { singular: 'Bento Showcase', plural: 'Bento Showcases' },
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'subtext', type: 'text', required: true },
    {
      name: 'image',
      type: 'group',
      fields: [
        { name: 'src', type: 'upload', relationTo: 'media', required: true },
        { name: 'alt', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'badge', type: 'text' },
      ],
    },
    {
      name: 'chartData',
      type: 'array',
      fields: [
        { name: 'month', type: 'text', required: true },
        { name: 'visitors', type: 'number', required: true },
      ],
    },
  ],
}
```

- [ ] **Step 3: Create `src/blocks/SplitMedia.ts`**

```ts
import type { Block } from 'payload'

export const SplitMediaBlock: Block = {
  slug: 'splitMedia',
  labels: { singular: 'Split Media', plural: 'Split Media' },
  fields: [
    {
      name: 'rows',
      type: 'array',
      required: true,
      fields: [
        { name: 'headline', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
        { name: 'mediaLabel', type: 'text', required: true },
        { name: 'mediaSrc', type: 'upload', relationTo: 'media', required: true },
        { name: 'mediaAlt', type: 'text', required: true },
        {
          name: 'cta',
          type: 'group',
          fields: [
            { name: 'label', type: 'text' },
            { name: 'href', type: 'text' },
          ],
        },
        {
          name: 'mediaOverlay',
          type: 'group',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'badge', type: 'text' },
            { name: 'description', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
```

- [ ] **Step 4: Create `src/blocks/Testimonials.ts`**

```ts
import type { Block } from 'payload'

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { singular: 'Testimonials', plural: 'Testimonials' },
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'subtext', type: 'text', required: true },
    {
      name: 'testimonials',
      type: 'array',
      required: true,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text', required: true },
        { name: 'department', type: 'text', required: true },
        { name: 'quote', type: 'textarea', required: true },
        { name: 'avatar', type: 'upload', relationTo: 'media' },
        { name: 'featured', type: 'checkbox', defaultValue: false },
        {
          name: 'featuredQuote',
          type: 'textarea',
          admin: {
            condition: (_, siblingData) => siblingData?.featured,
          },
        },
      ],
    },
  ],
}
```

- [ ] **Step 5: Create `src/blocks/ImageGallery.ts`**

```ts
import type { Block } from 'payload'

export const ImageGalleryBlock: Block = {
  slug: 'imageGallery',
  labels: { singular: 'Image Gallery', plural: 'Image Galleries' },
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'caption', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'imageAlt', type: 'text', required: true },
      ],
    },
  ],
}
```

- [ ] **Step 6: Create `src/blocks/LatestArticles.ts`**

```ts
import type { Block } from 'payload'

export const LatestArticlesBlock: Block = {
  slug: 'latestArticles',
  labels: { singular: 'Latest Articles', plural: 'Latest Articles' },
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'subtext', type: 'text', required: true },
    {
      name: 'articles',
      type: 'array',
      required: true,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'excerpt', type: 'textarea', required: true },
        { name: 'category', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'imageAlt', type: 'text', required: true },
        {
          name: 'author',
          type: 'group',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'avatar', type: 'upload', relationTo: 'media' },
          ],
        },
        { name: 'readTime', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        { name: 'publishedAt', type: 'date', required: true },
      ],
    },
  ],
}
```

- [ ] **Step 7: Create `src/blocks/CinematicCta.ts`**

```ts
import type { Block } from 'payload'

export const CinematicCtaBlock: Block = {
  slug: 'cinematicCta',
  labels: { singular: 'Cinematic CTA', plural: 'Cinematic CTAs' },
  fields: [
    { name: 'videoSrc', type: 'upload', relationTo: 'media', required: true },
    { name: 'label', type: 'text', required: true },
    { name: 'headline', type: 'text', required: true },
    { name: 'subtext', type: 'text', required: true },
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
  ],
}
```

- [ ] **Step 8: Create `src/blocks/Pricing.ts`**

```ts
import type { Block } from 'payload'

export const PricingBlock: Block = {
  slug: 'pricing',
  labels: { singular: 'Pricing', plural: 'Pricing' },
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'subtext', type: 'text', required: true },
    { name: 'footnote', type: 'text' },
    { name: 'footnoteAttribution', type: 'text' },
    {
      name: 'tiers',
      type: 'array',
      required: true,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'monthlyPrice', type: 'number', required: true },
        { name: 'annualPrice', type: 'number', required: true },
        {
          name: 'features',
          type: 'array',
          fields: [{ name: 'text', type: 'text', required: true }],
        },
        {
          name: 'cta',
          type: 'group',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text', required: true },
          ],
        },
        { name: 'badge', type: 'text' },
        { name: 'recommended', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}
```

- [ ] **Step 9: Create `src/blocks/Faq.ts`**

```ts
import type { Block } from 'payload'

export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'headline', type: 'text', required: true },
    { name: 'subtext', type: 'text' },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'text', type: 'text' },
        { name: 'label', type: 'text' },
        { name: 'href', type: 'text' },
      ],
    },
  ],
}
```

- [ ] **Step 10: Create `src/blocks/Trust.ts`**

```ts
import type { Block } from 'payload'

export const TrustBlock: Block = {
  slug: 'trust',
  labels: { singular: 'Trust', plural: 'Trust' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    {
      name: 'stats',
      type: 'array',
      required: true,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'number', required: true },
        { name: 'decimals', type: 'number', defaultValue: 0 },
        {
          name: 'format',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'K (thousands)', value: 'k' },
          ],
          defaultValue: 'none',
        },
        { name: 'suffix', type: 'text' },
      ],
    },
    {
      name: 'logos',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'logo', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
```

- [ ] **Step 11: Commit all block schemas**

```bash
git add src/blocks/
git commit -m "feat: add all 10 Payload block schemas"
```

---

### Task 8: Create Pages collection with layout blocks field

**Files:**
- Create: `src/collections/Pages.ts`

- [ ] **Step 1: Create the Pages collection**

```ts
import type { CollectionConfig } from 'payload'

import { HeroBlock } from '../blocks/Hero'
import { BentoBlock } from '../blocks/Bento'
import { SplitMediaBlock } from '../blocks/SplitMedia'
import { TestimonialsBlock } from '../blocks/Testimonials'
import { ImageGalleryBlock } from '../blocks/ImageGallery'
import { LatestArticlesBlock } from '../blocks/LatestArticles'
import { CinematicCtaBlock } from '../blocks/CinematicCta'
import { PricingBlock } from '../blocks/Pricing'
import { FaqBlock } from '../blocks/Faq'
import { TrustBlock } from '../blocks/Trust'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        HeroBlock,
        BentoBlock,
        SplitMediaBlock,
        TestimonialsBlock,
        ImageGalleryBlock,
        LatestArticlesBlock,
        CinematicCtaBlock,
        PricingBlock,
        FaqBlock,
        TrustBlock,
      ],
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
```

- [ ] **Step 2: Verify the Pages collection is already imported in `payload.config.ts`**

The config from Task 3 already imports and includes Pages. Confirm it's there.

- [ ] **Step 3: Restart dev server and verify blocks appear in admin**

Run: `bun dev`

Navigate to `http://localhost:3000/admin` → Pages → Create New → Add Block.
Expected: All 10 block types appear in the block picker.

- [ ] **Step 4: Commit**

```bash
git add src/collections/Pages.ts
git commit -m "feat: add Pages collection with 10 layout blocks"
```

---

## Chunk 3: Frontend Rendering — Catch-all Route and Block Renderer

### Task 9: Create the block renderer component

**Files:**
- Create: `src/components/blocks/render-blocks.tsx`

- [ ] **Step 1: Create render-blocks.tsx**

This is a Server Component that maps block types to section components:

```tsx
import { BentoShowcase } from '@/components/layout/bento/bento'
import { CinematicCta } from '@/components/layout/cinematic-cta/cinematic-cta'
import { Faq } from '@/components/layout/faq/faq'
import { Hero } from '@/components/layout/hero/hero'
import { ImageGallery } from '@/components/layout/image-gallery/image-gallery'
import { LatestArticles } from '@/components/layout/latest-articles/latest-articles'
import { Pricing } from '@/components/layout/pricing/pricing'
import { SplitMedia } from '@/components/layout/split-media/split-media'
import { Testimonials } from '@/components/layout/testimonials/testimonials'
import { Trust } from '@/components/layout/trust/trust'

import type { Page } from '@/payload-types'

type LayoutBlock = NonNullable<Page['layout']>[number]

const blockComponents: Record<string, React.ComponentType<any>> = {
  hero: Hero,
  bento: BentoShowcase,
  splitMedia: SplitMedia,
  testimonials: Testimonials,
  imageGallery: ImageGallery,
  latestArticles: LatestArticles,
  cinematicCta: CinematicCta,
  pricing: Pricing,
  faq: Faq,
  trust: Trust,
}

export function RenderBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  if (!blocks || blocks.length === 0) return null

  return (
    <div className="flex flex-col gap-16 lg:gap-32">
      {blocks.map((block) => {
        const Component = blockComponents[block.blockType]
        if (!Component) return null

        return (
          <div key={block.id} data-section={block.blockType}>
            <Component {...block} />
          </div>
        )
      })}
    </div>
  )
}
```

Note: This initially imports the existing components. They still use their own `-data.ts` imports internally, so the props won't be used yet. Component migration (swapping imports for props) happens in Chunk 4.

- [ ] **Step 2: Commit**

```bash
git add src/components/blocks/render-blocks.tsx
git commit -m "feat: add block renderer component"
```

---

### Task 10: Create SSR catch-all page route

**Files:**
- Modify: `src/app/(frontend)/page.tsx` → replace with catch-all
- Create: `src/app/(frontend)/[[...slug]]/page.tsx`

- [ ] **Step 1: Delete the existing static page.tsx**

```bash
rm src/app/\(frontend\)/page.tsx
```

- [ ] **Step 2: Create the catch-all route**

`src/app/(frontend)/[[...slug]]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { RenderBlocks } from '@/components/blocks/render-blocks'

import type { Metadata } from 'next'

type Args = {
  params: Promise<{ slug?: string[] }>
}

export default async function Page({ params }: Args) {
  const { slug: slugSegments } = await params
  const slug = slugSegments?.join('/') || 'home'

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    draft: false,
    limit: 1,
  })

  const page = result.docs[0]

  if (!page) {
    notFound()
  }

  return <RenderBlocks blocks={page.layout || []} />
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: slugSegments } = await params
  const slug = slugSegments?.join('/') || 'home'

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    draft: false,
    limit: 1,
    select: { meta: true, title: true },
  })

  const page = result.docs[0]

  if (!page) return {}

  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description || undefined,
  }
}
```

- [ ] **Step 3: Verify the catch-all route works**

Run: `bun dev`

At this point, `http://localhost:3000` will show a 404 because there's no page with slug `"home"` in the database yet. This is expected.

Go to `/admin` → Pages → Create:
- Title: "Home"
- Slug: "home"
- Add a Hero block with placeholder text
- Publish

Then visit `http://localhost:3000` — it should render (though the Hero component still uses its own data file internally).

- [ ] **Step 4: Commit**

```bash
git add src/app/\(frontend\)/
git commit -m "feat: add SSR catch-all page route with Payload data fetching"
```

---

## Chunk 4: Component Migration (Part 1) — Hero, Bento, SplitMedia, Testimonials, ImageGallery

Each component needs to:
1. Accept block data as props instead of importing from `-data.ts`
2. Map Payload Media objects (`{ url }`) where string paths were used
3. Keep all animation, styling, and interactivity unchanged

The general pattern for each migration:
- Read the current component and its `-data.ts` file
- Add a props interface matching the Payload block fields
- Replace data imports with props
- Update any `imageSrc` → `image.url` type mappings
- Keep the `-data.ts` file for now (remove in final cleanup)

### Task 11: Migrate Hero component

**Files:**
- Modify: `src/components/layout/hero/hero.tsx`

- [ ] **Step 1: Read the current hero component and data file**

Read `src/components/layout/hero/hero.tsx` and `src/components/layout/hero/hero-data.ts` to understand current usage.

- [ ] **Step 2: Update Hero to accept props**

Replace the data import with a props interface. The component should accept:
```ts
type HeroProps = {
  mediaSrc: { url: string } | string  // Media object from Payload or string fallback
  headline: string
  subtext: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
}
```

- Change the component signature from `export function Hero()` to `export function Hero(props: HeroProps)`
- Remove `import { heroData } from './hero-data'` (or similar)
- Replace `heroData.mediaSrc` with: `typeof props.mediaSrc === 'string' ? props.mediaSrc : props.mediaSrc.url`
- Replace all other `heroData.X` references with `props.X`

- [ ] **Step 3: Verify the site still renders**

Run: `bun dev`, visit `http://localhost:3000`
The RenderBlocks component passes block data as props.

- [ ] **Step 4: Run lint check**

Run: `bun check`
Fix any issues.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/hero/
git commit -m "feat: migrate Hero component to accept Payload block props"
```

---

### Task 12: Migrate Bento component

**Files:**
- Modify: `src/components/layout/bento/bento.tsx`

- [ ] **Step 1: Read the current bento component and data file**

Read `src/components/layout/bento/bento.tsx` and `src/components/layout/bento/bento-data.ts`.

- [ ] **Step 2: Update BentoShowcase to accept props**

The BentoBlock only drives `headline`, `subtext`, `image`, and `chartData`. All sub-cards (GlobeCard, StatsCard, etc.) stay hardcoded.

Props interface:
```ts
type BentoProps = {
  headline: string
  subtext: string
  image: {
    src: { url: string } | string
    alt: string
    title: string
    description: string
    badge?: string
  }
  chartData: { month: string; visitors: number }[]
}
```

- Replace section heading/subtext with `props.headline` and `props.subtext`
- Pass `props.image` data to ImageCard
- Pass `props.chartData` to ChartCard
- Leave all other sub-cards importing their own hardcoded data

- [ ] **Step 3: Update ImageCard and ChartCard to accept props**

These sub-components may need their own prop interfaces to receive data from the parent.

- [ ] **Step 4: Verify and lint**

Run: `bun dev` and `bun check`

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/bento/
git commit -m "feat: migrate Bento component to accept Payload block props"
```

---

### Task 13: Migrate SplitMedia component

**Files:**
- Modify: `src/components/layout/split-media/split-media.tsx`

- [ ] **Step 1: Read the current component and data file**

Read `src/components/layout/split-media/split-media.tsx` and `src/components/layout/split-media/split-media-data.ts`.

- [ ] **Step 2: Update SplitMedia to accept props**

Props interface:
```ts
type SplitMediaProps = {
  rows: {
    headline: string
    body: string
    mediaLabel: string
    mediaSrc: { url: string } | string
    mediaAlt: string
    cta?: { label: string; href: string }
    mediaOverlay: { title: string; badge?: string; description: string }
  }[]
}
```

- Replace `splitMediaRows` import with `props.rows`
- Map `mediaSrc` to handle Media objects: `typeof row.mediaSrc === 'string' ? row.mediaSrc : row.mediaSrc.url`

- [ ] **Step 3: Verify and lint**

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/split-media/
git commit -m "feat: migrate SplitMedia component to accept Payload block props"
```

---

### Task 14: Migrate Testimonials component

**Files:**
- Modify: `src/components/layout/testimonials/testimonials.tsx`
- Modify: `src/components/layout/testimonials/quote-card.tsx`
- Modify: `src/components/layout/testimonials/featured-quote.tsx`

- [ ] **Step 1: Read the current component files and data**

Read all testimonials component files and `testimonials-data.ts`.

- [ ] **Step 2: Update Testimonials to accept props**

Props interface:
```ts
type TestimonialsProps = {
  headline: string
  subtext: string
  testimonials: {
    id?: string
    name: string
    role: string
    department: string
    quote: string
    avatar?: { url: string } | string
    featured?: boolean
    featuredQuote?: string
  }[]
}
```

Key changes:
- Replace data imports with props
- Compute `featuredTestimonials` and `shortTestimonials` from `props.testimonials`
- Map `avatarSrc` → `avatar`: use `typeof t.avatar === 'string' ? t.avatar : t.avatar?.url`
- Update QuoteCard and FeaturedQuote sub-components to receive data via props

- [ ] **Step 3: Verify and lint**

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/testimonials/
git commit -m "feat: migrate Testimonials component to accept Payload block props"
```

---

### Task 15: Migrate ImageGallery component

**Files:**
- Modify: `src/components/layout/image-gallery/image-gallery.tsx`
- Modify: `src/components/layout/image-gallery/gallery-card.tsx`

- [ ] **Step 1: Read current component files and data**

- [ ] **Step 2: Update ImageGallery to accept props**

Props interface:
```ts
type ImageGalleryProps = {
  items: {
    id?: string
    label: string
    caption: string
    image: { url: string } | string
    imageAlt: string
  }[]
}
```

Key changes:
- Replace `galleryItems` import with `props.items`
- Map `imageSrc` → `image`: `typeof item.image === 'string' ? item.image : item.image.url`
- Update GalleryCard to receive image URL via props

- [ ] **Step 3: Verify and lint**

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/image-gallery/
git commit -m "feat: migrate ImageGallery component to accept Payload block props"
```

---

## Chunk 5: Component Migration (Part 2) — LatestArticles, CinematicCta, Pricing, Faq, Trust

### Task 16: Migrate LatestArticles component

**Files:**
- Modify: `src/components/layout/latest-articles/latest-articles.tsx`
- Modify: `src/components/layout/latest-articles/article-card.tsx`

- [ ] **Step 1: Read current component files and data**

- [ ] **Step 2: Update LatestArticles to accept props**

Props interface:
```ts
type LatestArticlesProps = {
  headline: string
  subtext: string
  articles: {
    id?: string
    title: string
    excerpt: string
    category: string
    image: { url: string } | string
    imageAlt: string
    author: { name: string; avatar?: { url: string } | string }
    readTime: string
    href: string
    publishedAt: string
  }[]
}
```

Key changes:
- Replace data imports with props
- Compute derived values from `props.articles`:
  - `const featuredArticle = props.articles[0]` (first article is featured)
  - `const supportingArticles = props.articles.slice(1)` (rest are supporting)
- Map `imageSrc` → `image.url`, `author.avatarSrc` → `author.avatar.url`

- [ ] **Step 3: Verify and lint**

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/latest-articles/
git commit -m "feat: migrate LatestArticles component to accept Payload block props"
```

---

### Task 17: Migrate CinematicCta component

**Files:**
- Modify: `src/components/layout/cinematic-cta/cinematic-cta.tsx`

- [ ] **Step 1: Read current component and data**

- [ ] **Step 2: Update CinematicCta to accept props**

Props interface:
```ts
type CinematicCtaProps = {
  videoSrc: { url: string } | string
  label: string
  headline: string
  subtext: string
  cta?: { label: string; href: string }
}
```

Key changes:
- Replace data imports with props
- Map `videoSrc` to handle Media objects
- **New UI element:** The current component has no CTA button/link. Add a CTA button that renders when `props.cta` is provided. Style it to match the existing design language (use the same button patterns from Hero or other sections). If `props.cta` is absent, render nothing — backwards compatible with current behavior.

- [ ] **Step 3: Verify and lint**

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/cinematic-cta/
git commit -m "feat: migrate CinematicCta component to accept Payload block props"
```

---

### Task 18: Migrate Pricing component

**Files:**
- Modify: `src/components/layout/pricing/pricing.tsx`
- Modify: `src/components/layout/pricing/pricing-card.tsx`

- [ ] **Step 1: Read current component files and data**

- [ ] **Step 2: Update Pricing to accept props**

Props interface:
```ts
type PricingProps = {
  headline: string
  subtext: string
  footnote?: string
  footnoteAttribution?: string
  tiers: {
    name: string
    description: string
    monthlyPrice: number
    annualPrice: number
    features: { text: string }[]
    cta: { label: string; href: string }
    badge?: string
    recommended?: boolean
  }[]
}
```

Key changes:
- Replace data imports with props
- **CRITICAL field shape change:** The current `PricingTier` has `features: string[]` but Payload requires arrays of objects. The new shape is `features: { text: string }[]`. You MUST update every place that iterates features:
  - **Before:** `tier.features.map((feature) => <span>{feature}</span>)`
  - **After:** `tier.features.map((feature) => <span>{feature.text}</span>)`
  - If you miss this, features will render as `[object Object]`.

- [ ] **Step 3: Verify and lint**

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/pricing/
git commit -m "feat: migrate Pricing component to accept Payload block props"
```

---

### Task 19: Migrate Faq component

**Files:**
- Modify: `src/components/layout/faq/faq.tsx`

- [ ] **Step 1: Read current component and data**

- [ ] **Step 2: Update Faq to accept props**

Props interface:
```ts
type FaqProps = {
  eyebrow?: string
  headline: string
  subtext?: string
  items: { question: string; answer: string }[]
  cta?: { text?: string; label?: string; href?: string }
}
```

Key changes:
- Replace data imports with props
- Replace hardcoded "Still have questions?" CTA with `props.cta` fields (with fallback to current text if not provided)

- [ ] **Step 3: Verify and lint**

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/faq/
git commit -m "feat: migrate Faq component to accept Payload block props"
```

---

### Task 20: Migrate Trust component

**Files:**
- Modify: `src/components/layout/trust/trust.tsx`
- Modify: `src/components/layout/trust/flip-counter.tsx` (if needed)

- [ ] **Step 1: Read current component files and data**

- [ ] **Step 2: Update Trust to accept props**

Props interface:
```ts
type TrustProps = {
  eyebrow?: string
  stats: {
    label: string
    value: number
    decimals?: number
    format?: string
    suffix?: string
  }[]
  logos: { name: string; logo?: { url: string } | string }[]
}
```

Key changes:
- Replace data imports with props
- Logo rendering: if `logo.logo` (the upload) exists, render an `<Image>` tag. Otherwise fall back to rendering `logo.name` as text (current behavior).

- [ ] **Step 3: Verify and lint**

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/trust/
git commit -m "feat: migrate Trust component to accept Payload block props"
```

---

## Chunk 6: Finalization — Cleanup and Verification

### Task 21: Remove `-data.ts` files

**Files:**
- Delete: all `-data.ts` files in `src/components/layout/*/`

- [ ] **Step 1: Verify no component still imports from `-data.ts` files**

Search for any remaining imports:
```bash
grep -r "from.*-data" src/components/layout/ --include="*.tsx" --include="*.ts"
```

If any imports remain, they need to be resolved first.

- [ ] **Step 2: Delete all `-data.ts` files**

```bash
rm src/components/layout/hero/hero-data.ts
rm src/components/layout/bento/bento-data.ts
rm src/components/layout/split-media/split-media-data.ts
rm src/components/layout/testimonials/testimonials-data.ts
rm src/components/layout/image-gallery/image-gallery-data.ts
rm src/components/layout/latest-articles/latest-articles-data.ts
rm src/components/layout/cinematic-cta/cinematic-cta-data.ts
rm src/components/layout/pricing/pricing-data.ts
rm src/components/layout/faq/faq-data.ts
rm src/components/layout/trust/trust-data.ts
```

Note: Keep `navbar-data.ts`, `footer-data.ts`, and `search-data.ts` — these stay hardcoded until the Globals integration cycle.

Also keep `mdr-terminal-data.ts` — MdrTerminal is out of scope.

- [ ] **Step 3: Verify build succeeds**

Run: `bun build`
Expected: Clean build with no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/
git commit -m "chore: remove hardcoded data files (now CMS-driven)"
```

---

### Task 22: Full verification

- [ ] **Step 1: Run lint**

Run: `bun check`
Expected: No errors

- [ ] **Step 2: Run production build**

Run: `bun build`
Expected: Clean build

- [ ] **Step 3: Start dev server and verify admin**

Run: `bun dev`

1. Go to `/admin` → Pages → Create a "Home" page with slug "home"
2. Add blocks: Hero, a few sections with placeholder content
3. Publish the page
4. Visit `http://localhost:3000` — verify sections render with CMS data

- [ ] **Step 4: Verify MCP endpoint**

Run: `curl -X POST http://localhost:3000/api/mcp -H "Content-Type: application/json"`
Expected: MCP JSON-RPC response (error about missing auth is fine — it means the endpoint exists)

- [ ] **Step 5: Final commit if any fixes were needed**

Stage only the specific files that were fixed, then commit:
```bash
git commit -m "fix: address integration issues found during verification"
```
