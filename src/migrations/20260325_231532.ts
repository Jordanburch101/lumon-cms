import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_latest_articles_articles\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_latest_articles_articles\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_latest_articles\` ADD \`limit\` numeric DEFAULT 5;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_latest_articles\` ADD \`limit\` numeric DEFAULT 5;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_latest_articles_articles\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`excerpt\` text,
  	\`category\` text,
  	\`image_id\` integer,
  	\`image_alt\` text,
  	\`author_name\` text,
  	\`author_avatar_id\` integer,
  	\`read_time\` text,
  	\`href\` text,
  	\`published_at\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`author_avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_latest_articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_latest_articles_articles_order_idx\` ON \`pages_blocks_latest_articles_articles\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_latest_articles_articles_parent_id_idx\` ON \`pages_blocks_latest_articles_articles\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_latest_articles_articles_image_idx\` ON \`pages_blocks_latest_articles_articles\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_latest_articles_articles_author_author_avat_idx\` ON \`pages_blocks_latest_articles_articles\` (\`author_avatar_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_latest_articles_articles\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`excerpt\` text,
  	\`category\` text,
  	\`image_id\` integer,
  	\`image_alt\` text,
  	\`author_name\` text,
  	\`author_avatar_id\` integer,
  	\`read_time\` text,
  	\`href\` text,
  	\`published_at\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`author_avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_latest_articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_latest_articles_articles_order_idx\` ON \`_pages_v_blocks_latest_articles_articles\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_latest_articles_articles_parent_id_idx\` ON \`_pages_v_blocks_latest_articles_articles\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_latest_articles_articles_image_idx\` ON \`_pages_v_blocks_latest_articles_articles\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_latest_articles_articles_author_author_a_idx\` ON \`_pages_v_blocks_latest_articles_articles\` (\`author_avatar_id\`);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_latest_articles\` DROP COLUMN \`limit\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_latest_articles\` DROP COLUMN \`limit\`;`)
}
