import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_name\` text NOT NULL,
  	\`base_url\` text NOT NULL,
  	\`separator\` text DEFAULT ' | ',
  	\`default_og_image_id\` integer,
  	\`robots_index\` integer DEFAULT true,
  	\`robots_follow\` integer DEFAULT true,
  	\`social_twitter\` text,
  	\`social_twitter_card_type\` text DEFAULT 'summary_large_image',
  	\`json_ld_organization_name\` text,
  	\`json_ld_organization_logo_id\` integer,
  	\`json_ld_organization_url\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`default_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`json_ld_organization_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_default_og_image_idx\` ON \`site_settings\` (\`default_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_json_ld_json_ld_organization_logo_idx\` ON \`site_settings\` (\`json_ld_organization_logo_id\`);`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`meta_canonical_url\` text;`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`meta_robots_override\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`meta_robots_index\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`meta_robots_follow\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`meta_keywords\` text;`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`meta_exclude_from_sitemap\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_meta_canonical_url\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_meta_robots_override\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_meta_robots_index\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_meta_robots_follow\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_meta_keywords\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_meta_exclude_from_sitemap\` integer DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`meta_canonical_url\`;`)
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`meta_robots_override\`;`)
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`meta_robots_index\`;`)
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`meta_robots_follow\`;`)
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`meta_keywords\`;`)
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`meta_exclude_from_sitemap\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` DROP COLUMN \`version_meta_canonical_url\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` DROP COLUMN \`version_meta_robots_override\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` DROP COLUMN \`version_meta_robots_index\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` DROP COLUMN \`version_meta_robots_follow\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` DROP COLUMN \`version_meta_keywords\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` DROP COLUMN \`version_meta_exclude_from_sitemap\`;`)
}
