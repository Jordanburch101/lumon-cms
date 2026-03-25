import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages\` ADD \`parent_id\` integer REFERENCES pages(id);`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`path\` text;`)
  await db.run(sql`CREATE INDEX \`pages_parent_idx\` ON \`pages\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_path_idx\` ON \`pages\` (\`path\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_parent_id\` integer REFERENCES pages(id);`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_path\` text;`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_parent_idx\` ON \`_pages_v\` (\`version_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_path_idx\` ON \`_pages_v\` (\`version_path\`);`)

  // Backfill path for existing pages (all top-level, no parents)
  await db.run(sql`UPDATE \`pages\` SET \`path\` = \`slug\` WHERE \`slug\` != 'home' AND \`path\` IS NULL;`)
  await db.run(sql`UPDATE \`pages\` SET \`path\` = '' WHERE \`slug\` = 'home' AND \`path\` IS NULL;`)
  // Also backfill version table
  await db.run(sql`UPDATE \`_pages_v\` SET \`version_path\` = \`version_slug\` WHERE \`version_slug\` != 'home' AND \`version_path\` IS NULL;`)
  await db.run(sql`UPDATE \`_pages_v\` SET \`version_path\` = '' WHERE \`version_slug\` = 'home' AND \`version_path\` IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`meta_robots_override\` integer DEFAULT false,
  	\`meta_robots_index\` integer DEFAULT true,
  	\`meta_robots_follow\` integer DEFAULT true,
  	\`meta_keywords\` text,
  	\`meta_exclude_from_sitemap\` integer DEFAULT false,
  	\`title\` text,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages\`("id", "meta_title", "meta_description", "meta_image_id", "meta_robots_override", "meta_robots_index", "meta_robots_follow", "meta_keywords", "meta_exclude_from_sitemap", "title", "generate_slug", "slug", "updated_at", "created_at", "_status") SELECT "id", "meta_title", "meta_description", "meta_image_id", "meta_robots_override", "meta_robots_index", "meta_robots_follow", "meta_keywords", "meta_exclude_from_sitemap", "title", "generate_slug", "slug", "updated_at", "created_at", "_status" FROM \`pages\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages\` RENAME TO \`pages\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages_meta_meta_image_idx\` ON \`pages\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`version_meta_robots_override\` integer DEFAULT false,
  	\`version_meta_robots_index\` integer DEFAULT true,
  	\`version_meta_robots_follow\` integer DEFAULT true,
  	\`version_meta_keywords\` text,
  	\`version_meta_exclude_from_sitemap\` integer DEFAULT false,
  	\`version_title\` text,
  	\`version_generate_slug\` integer DEFAULT true,
  	\`version_slug\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v\`("id", "parent_id", "version_meta_title", "version_meta_description", "version_meta_image_id", "version_meta_robots_override", "version_meta_robots_index", "version_meta_robots_follow", "version_meta_keywords", "version_meta_exclude_from_sitemap", "version_title", "version_generate_slug", "version_slug", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest") SELECT "id", "parent_id", "version_meta_title", "version_meta_description", "version_meta_image_id", "version_meta_robots_override", "version_meta_robots_index", "version_meta_robots_follow", "version_meta_keywords", "version_meta_exclude_from_sitemap", "version_title", "version_generate_slug", "version_slug", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest" FROM \`_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v\` RENAME TO \`_pages_v\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_meta_version_meta_image_idx\` ON \`_pages_v\` (\`version_meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_slug_idx\` ON \`_pages_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
}
