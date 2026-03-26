import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`heroSpec\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`icon_id\` integer,
  	\`headline\` text,
  	\`subtext\` text,
  	\`media_src_id\` integer,
  	\`primary_cta_type\` text DEFAULT 'external',
  	\`primary_cta_new_tab\` integer DEFAULT false,
  	\`primary_cta_url\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_appearance_type\` text DEFAULT 'button',
  	\`primary_cta_button_variant\` text DEFAULT 'default',
  	\`primary_cta_button_size\` text DEFAULT 'lg',
  	\`secondary_cta_type\` text DEFAULT 'external',
  	\`secondary_cta_new_tab\` integer DEFAULT false,
  	\`secondary_cta_url\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_appearance_type\` text DEFAULT 'button',
  	\`secondary_cta_button_variant\` text DEFAULT 'outline',
  	\`secondary_cta_button_size\` text DEFAULT 'lg',
  	\`block_name\` text,
  	FOREIGN KEY (\`icon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`media_src_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`heroSpec_order_idx\` ON \`heroSpec\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`heroSpec_parent_id_idx\` ON \`heroSpec\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`heroSpec_path_idx\` ON \`heroSpec\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`heroSpec_icon_idx\` ON \`heroSpec\` (\`icon_id\`);`)
  await db.run(sql`CREATE INDEX \`heroSpec_media_src_idx\` ON \`heroSpec\` (\`media_src_id\`);`)
  await db.run(sql`CREATE TABLE \`heroBrief\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`subtext\` text,
  	\`media_src_id\` integer,
  	\`poster_src_id\` integer,
  	\`primary_cta_type\` text DEFAULT 'external',
  	\`primary_cta_new_tab\` integer DEFAULT false,
  	\`primary_cta_url\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_appearance_type\` text DEFAULT 'button',
  	\`primary_cta_button_variant\` text DEFAULT 'default',
  	\`primary_cta_button_size\` text DEFAULT 'lg',
  	\`secondary_cta_type\` text DEFAULT 'external',
  	\`secondary_cta_new_tab\` integer DEFAULT false,
  	\`secondary_cta_url\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_appearance_type\` text DEFAULT 'button',
  	\`secondary_cta_button_variant\` text DEFAULT 'outline',
  	\`secondary_cta_button_size\` text DEFAULT 'lg',
  	\`block_name\` text,
  	FOREIGN KEY (\`media_src_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`poster_src_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`heroBrief_order_idx\` ON \`heroBrief\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`heroBrief_parent_id_idx\` ON \`heroBrief\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`heroBrief_path_idx\` ON \`heroBrief\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`heroBrief_media_src_idx\` ON \`heroBrief\` (\`media_src_id\`);`)
  await db.run(sql`CREATE INDEX \`heroBrief_poster_src_idx\` ON \`heroBrief\` (\`poster_src_id\`);`)
  await db.run(sql`CREATE TABLE \`_heroSpec_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`icon_id\` integer,
  	\`headline\` text,
  	\`subtext\` text,
  	\`media_src_id\` integer,
  	\`primary_cta_type\` text DEFAULT 'external',
  	\`primary_cta_new_tab\` integer DEFAULT false,
  	\`primary_cta_url\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_appearance_type\` text DEFAULT 'button',
  	\`primary_cta_button_variant\` text DEFAULT 'default',
  	\`primary_cta_button_size\` text DEFAULT 'lg',
  	\`secondary_cta_type\` text DEFAULT 'external',
  	\`secondary_cta_new_tab\` integer DEFAULT false,
  	\`secondary_cta_url\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_appearance_type\` text DEFAULT 'button',
  	\`secondary_cta_button_variant\` text DEFAULT 'outline',
  	\`secondary_cta_button_size\` text DEFAULT 'lg',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`icon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`media_src_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_heroSpec_v_order_idx\` ON \`_heroSpec_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_heroSpec_v_parent_id_idx\` ON \`_heroSpec_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_heroSpec_v_path_idx\` ON \`_heroSpec_v\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_heroSpec_v_icon_idx\` ON \`_heroSpec_v\` (\`icon_id\`);`)
  await db.run(sql`CREATE INDEX \`_heroSpec_v_media_src_idx\` ON \`_heroSpec_v\` (\`media_src_id\`);`)
  await db.run(sql`CREATE TABLE \`_heroBrief_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`subtext\` text,
  	\`media_src_id\` integer,
  	\`poster_src_id\` integer,
  	\`primary_cta_type\` text DEFAULT 'external',
  	\`primary_cta_new_tab\` integer DEFAULT false,
  	\`primary_cta_url\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_appearance_type\` text DEFAULT 'button',
  	\`primary_cta_button_variant\` text DEFAULT 'default',
  	\`primary_cta_button_size\` text DEFAULT 'lg',
  	\`secondary_cta_type\` text DEFAULT 'external',
  	\`secondary_cta_new_tab\` integer DEFAULT false,
  	\`secondary_cta_url\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_appearance_type\` text DEFAULT 'button',
  	\`secondary_cta_button_variant\` text DEFAULT 'outline',
  	\`secondary_cta_button_size\` text DEFAULT 'lg',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_src_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`poster_src_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_heroBrief_v_order_idx\` ON \`_heroBrief_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_heroBrief_v_parent_id_idx\` ON \`_heroBrief_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_heroBrief_v_path_idx\` ON \`_heroBrief_v\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_heroBrief_v_media_src_idx\` ON \`_heroBrief_v\` (\`media_src_id\`);`)
  await db.run(sql`CREATE INDEX \`_heroBrief_v_poster_src_idx\` ON \`_heroBrief_v\` (\`poster_src_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`heroSpec\`;`)
  await db.run(sql`DROP TABLE \`heroBrief\`;`)
  await db.run(sql`DROP TABLE \`_heroSpec_v\`;`)
  await db.run(sql`DROP TABLE \`_heroBrief_v\`;`)
}
