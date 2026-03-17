import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-sqlite";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text DEFAULT 'guest' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `);
  await db.run(
    sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`
  );
  await db.run(
    sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`
  );
  await db.run(
    sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`
  );
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`strip_audio\` integer DEFAULT false,
  	\`blur_data_u_r_l\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_card_url\` text,
  	\`sizes_card_width\` numeric,
  	\`sizes_card_height\` numeric,
  	\`sizes_card_mime_type\` text,
  	\`sizes_card_filesize\` numeric,
  	\`sizes_card_filename\` text,
  	\`sizes_hero_url\` text,
  	\`sizes_hero_width\` numeric,
  	\`sizes_hero_height\` numeric,
  	\`sizes_hero_mime_type\` text,
  	\`sizes_hero_filesize\` numeric,
  	\`sizes_hero_filename\` text
  );
  `);
  await db.run(
    sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`
  );
  await db.run(
    sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`
  );
  await db.run(
    sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`
  );
  await db.run(
    sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`
  );
  await db.run(
    sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`
  );
  await db.run(
    sql`CREATE INDEX \`media_sizes_hero_sizes_hero_filename_idx\` ON \`media\` (\`sizes_hero_filename\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_src_id\` integer,
  	\`poster_src_id\` integer,
  	\`headline\` text,
  	\`subtext\` text,
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
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_hero_order_idx\` ON \`pages_blocks_hero\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_hero_parent_id_idx\` ON \`pages_blocks_hero\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_hero_path_idx\` ON \`pages_blocks_hero\` (\`_path\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_hero_media_src_idx\` ON \`pages_blocks_hero\` (\`media_src_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_hero_poster_src_idx\` ON \`pages_blocks_hero\` (\`poster_src_id\`);`
  );
  await db.run(sql`CREATE TABLE \`heroCtrd\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_src_id\` integer,
  	\`poster_src_id\` integer,
  	\`headline\` text,
  	\`subtext\` text,
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
  `);
  await db.run(
    sql`CREATE INDEX \`heroCtrd_order_idx\` ON \`heroCtrd\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`heroCtrd_parent_id_idx\` ON \`heroCtrd\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`heroCtrd_path_idx\` ON \`heroCtrd\` (\`_path\`);`
  );
  await db.run(
    sql`CREATE INDEX \`heroCtrd_media_src_idx\` ON \`heroCtrd\` (\`media_src_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`heroCtrd_poster_src_idx\` ON \`heroCtrd\` (\`poster_src_id\`);`
  );
  await db.run(sql`CREATE TABLE \`heroStat_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`heroStat\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`heroStat_stats_order_idx\` ON \`heroStat_stats\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`heroStat_stats_parent_id_idx\` ON \`heroStat_stats\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`heroStat\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
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
  `);
  await db.run(
    sql`CREATE INDEX \`heroStat_order_idx\` ON \`heroStat\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`heroStat_parent_id_idx\` ON \`heroStat\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`heroStat_path_idx\` ON \`heroStat\` (\`_path\`);`
  );
  await db.run(
    sql`CREATE INDEX \`heroStat_media_src_idx\` ON \`heroStat\` (\`media_src_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`heroStat_poster_src_idx\` ON \`heroStat\` (\`poster_src_id\`);`
  );
  await db.run(sql`CREATE TABLE \`heroMin\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`headline\` text,
  	\`subtext\` text,
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`heroMin_order_idx\` ON \`heroMin\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`heroMin_parent_id_idx\` ON \`heroMin\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`heroMin_path_idx\` ON \`heroMin\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_bento_chart_data\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`month\` text,
  	\`visitors\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_bento\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_bento_chart_data_order_idx\` ON \`pages_blocks_bento_chart_data\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_bento_chart_data_parent_id_idx\` ON \`pages_blocks_bento_chart_data\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_bento\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`headline\` text,
  	\`subtext\` text,
  	\`image_src_id\` integer,
  	\`image_alt\` text,
  	\`image_title\` text,
  	\`image_description\` text,
  	\`image_badge\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_src_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_bento_order_idx\` ON \`pages_blocks_bento\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_bento_parent_id_idx\` ON \`pages_blocks_bento\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_bento_path_idx\` ON \`pages_blocks_bento\` (\`_path\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_bento_image_image_src_idx\` ON \`pages_blocks_bento\` (\`image_src_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_split_media_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`headline\` text,
  	\`body\` text,
  	\`media_label\` text,
  	\`media_src_id\` integer,
  	\`media_alt\` text,
  	\`cta_type\` text DEFAULT 'external',
  	\`cta_new_tab\` integer DEFAULT false,
  	\`cta_url\` text,
  	\`cta_label\` text,
  	\`cta_appearance_type\` text DEFAULT 'link',
  	\`cta_link_variant\` text DEFAULT 'arrow',
  	\`media_overlay_title\` text,
  	\`media_overlay_badge\` text,
  	\`media_overlay_description\` text,
  	FOREIGN KEY (\`media_src_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_split_media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_split_media_rows_order_idx\` ON \`pages_blocks_split_media_rows\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_split_media_rows_parent_id_idx\` ON \`pages_blocks_split_media_rows\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_split_media_rows_media_src_idx\` ON \`pages_blocks_split_media_rows\` (\`media_src_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_split_media\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_split_media_order_idx\` ON \`pages_blocks_split_media\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_split_media_parent_id_idx\` ON \`pages_blocks_split_media\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_split_media_path_idx\` ON \`pages_blocks_split_media\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_testimonials_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text,
  	\`department\` text,
  	\`quote\` text,
  	\`avatar_id\` integer,
  	\`featured\` integer DEFAULT false,
  	\`featured_quote\` text,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_testimonials_testimonials_order_idx\` ON \`pages_blocks_testimonials_testimonials\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_testimonials_testimonials_parent_id_idx\` ON \`pages_blocks_testimonials_testimonials\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_testimonials_testimonials_avatar_idx\` ON \`pages_blocks_testimonials_testimonials\` (\`avatar_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`headline\` text,
  	\`subtext\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_testimonials_order_idx\` ON \`pages_blocks_testimonials\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_testimonials_parent_id_idx\` ON \`pages_blocks_testimonials\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_testimonials_path_idx\` ON \`pages_blocks_testimonials\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_image_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`caption\` text,
  	\`image_id\` integer,
  	\`image_alt\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_image_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_image_gallery_items_order_idx\` ON \`pages_blocks_image_gallery_items\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_image_gallery_items_parent_id_idx\` ON \`pages_blocks_image_gallery_items\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_image_gallery_items_image_idx\` ON \`pages_blocks_image_gallery_items\` (\`image_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_image_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_image_gallery_order_idx\` ON \`pages_blocks_image_gallery\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_image_gallery_parent_id_idx\` ON \`pages_blocks_image_gallery\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_image_gallery_path_idx\` ON \`pages_blocks_image_gallery\` (\`_path\`);`
  );
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
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_latest_articles_articles_order_idx\` ON \`pages_blocks_latest_articles_articles\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_latest_articles_articles_parent_id_idx\` ON \`pages_blocks_latest_articles_articles\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_latest_articles_articles_image_idx\` ON \`pages_blocks_latest_articles_articles\` (\`image_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_latest_articles_articles_author_author_avat_idx\` ON \`pages_blocks_latest_articles_articles\` (\`author_avatar_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_latest_articles\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`headline\` text,
  	\`subtext\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_latest_articles_order_idx\` ON \`pages_blocks_latest_articles\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_latest_articles_parent_id_idx\` ON \`pages_blocks_latest_articles\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_latest_articles_path_idx\` ON \`pages_blocks_latest_articles\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_cinematic_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`video_src_id\` integer,
  	\`label\` text,
  	\`headline\` text,
  	\`subtext\` text,
  	\`cta_type\` text DEFAULT 'external',
  	\`cta_new_tab\` integer DEFAULT false,
  	\`cta_url\` text,
  	\`cta_label\` text,
  	\`cta_appearance_type\` text DEFAULT 'button',
  	\`cta_button_variant\` text DEFAULT 'default',
  	\`cta_button_size\` text DEFAULT 'lg',
  	\`block_name\` text,
  	FOREIGN KEY (\`video_src_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_cinematic_cta_order_idx\` ON \`pages_blocks_cinematic_cta\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_cinematic_cta_parent_id_idx\` ON \`pages_blocks_cinematic_cta\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_cinematic_cta_path_idx\` ON \`pages_blocks_cinematic_cta\` (\`_path\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_cinematic_cta_video_src_idx\` ON \`pages_blocks_cinematic_cta\` (\`video_src_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_cta_band\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`subtext\` text,
  	\`variant\` text DEFAULT 'primary',
  	\`primary_cta_type\` text DEFAULT 'external',
  	\`primary_cta_new_tab\` integer DEFAULT false,
  	\`primary_cta_url\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_appearance_type\` text DEFAULT 'button',
  	\`primary_cta_button_variant\` text DEFAULT 'default',
  	\`primary_cta_button_size\` text DEFAULT 'default',
  	\`secondary_cta_type\` text DEFAULT 'external',
  	\`secondary_cta_new_tab\` integer DEFAULT false,
  	\`secondary_cta_url\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_appearance_type\` text DEFAULT 'button',
  	\`secondary_cta_button_variant\` text DEFAULT 'outline',
  	\`secondary_cta_button_size\` text DEFAULT 'default',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_cta_band_order_idx\` ON \`pages_blocks_cta_band\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_cta_band_parent_id_idx\` ON \`pages_blocks_cta_band\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_cta_band_path_idx\` ON \`pages_blocks_cta_band\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_pricing_tiers_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_pricing_tiers\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_pricing_tiers_features_order_idx\` ON \`pages_blocks_pricing_tiers_features\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_pricing_tiers_features_parent_id_idx\` ON \`pages_blocks_pricing_tiers_features\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_pricing_tiers\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`description\` text,
  	\`monthly_price\` numeric,
  	\`annual_price\` numeric,
  	\`cta_type\` text DEFAULT 'external',
  	\`cta_new_tab\` integer DEFAULT false,
  	\`cta_url\` text,
  	\`cta_label\` text,
  	\`cta_appearance_type\` text DEFAULT 'button',
  	\`cta_button_variant\` text DEFAULT 'default',
  	\`cta_button_size\` text DEFAULT 'lg',
  	\`badge\` text,
  	\`recommended\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_pricing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_pricing_tiers_order_idx\` ON \`pages_blocks_pricing_tiers\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_pricing_tiers_parent_id_idx\` ON \`pages_blocks_pricing_tiers\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_pricing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`headline\` text,
  	\`subtext\` text,
  	\`footnote\` text,
  	\`footnote_attribution\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_pricing_order_idx\` ON \`pages_blocks_pricing\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_pricing_parent_id_idx\` ON \`pages_blocks_pricing\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_pricing_path_idx\` ON \`pages_blocks_pricing\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_faq_items_order_idx\` ON \`pages_blocks_faq_items\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_faq_items_parent_id_idx\` ON \`pages_blocks_faq_items\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`subtext\` text,
  	\`cta_text\` text,
  	\`cta_type\` text DEFAULT 'external',
  	\`cta_new_tab\` integer DEFAULT false,
  	\`cta_url\` text,
  	\`cta_label\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_faq_order_idx\` ON \`pages_blocks_faq\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_faq_parent_id_idx\` ON \`pages_blocks_faq\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_faq_path_idx\` ON \`pages_blocks_faq\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_features_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`label\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`link_type\` text DEFAULT 'external',
  	\`link_new_tab\` integer DEFAULT false,
  	\`link_url\` text,
  	\`link_label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_features_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_features_grid_items_order_idx\` ON \`pages_blocks_features_grid_items\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_features_grid_items_parent_id_idx\` ON \`pages_blocks_features_grid_items\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_features_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_features_grid_order_idx\` ON \`pages_blocks_features_grid\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_features_grid_parent_id_idx\` ON \`pages_blocks_features_grid\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_features_grid_path_idx\` ON \`pages_blocks_features_grid\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_team_members_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`platform\` text,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_team_members\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_team_members_links_order_idx\` ON \`pages_blocks_team_members_links\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_team_members_links_parent_id_idx\` ON \`pages_blocks_team_members_links\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_team_members\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`photo_id\` integer,
  	\`name\` text,
  	\`role\` text,
  	\`department\` text,
  	\`bio\` text,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_team\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_team_members_order_idx\` ON \`pages_blocks_team_members\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_team_members_parent_id_idx\` ON \`pages_blocks_team_members\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_team_members_photo_idx\` ON \`pages_blocks_team_members\` (\`photo_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_team\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`variant\` text DEFAULT 'detailed',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_team_order_idx\` ON \`pages_blocks_team\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_team_parent_id_idx\` ON \`pages_blocks_team\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_team_path_idx\` ON \`pages_blocks_team\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_trust_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`value\` numeric,
  	\`decimals\` numeric DEFAULT 0,
  	\`format\` text DEFAULT 'none',
  	\`suffix\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_trust\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_trust_stats_order_idx\` ON \`pages_blocks_trust_stats\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_trust_stats_parent_id_idx\` ON \`pages_blocks_trust_stats\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_trust_logos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`logo_id\` integer,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_trust\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_trust_logos_order_idx\` ON \`pages_blocks_trust_logos\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_trust_logos_parent_id_idx\` ON \`pages_blocks_trust_logos\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_trust_logos_logo_idx\` ON \`pages_blocks_trust_logos\` (\`logo_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_trust\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_trust_order_idx\` ON \`pages_blocks_trust\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_trust_parent_id_idx\` ON \`pages_blocks_trust\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_trust_path_idx\` ON \`pages_blocks_trust\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_logo_cloud_logos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`logo_id\` integer,
  	\`name\` text,
  	\`link_type\` text DEFAULT 'external',
  	\`link_new_tab\` integer DEFAULT false,
  	\`link_url\` text,
  	\`link_label\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_logo_cloud\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_logo_cloud_logos_order_idx\` ON \`pages_blocks_logo_cloud_logos\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_logo_cloud_logos_parent_id_idx\` ON \`pages_blocks_logo_cloud_logos\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_logo_cloud_logos_logo_idx\` ON \`pages_blocks_logo_cloud_logos\` (\`logo_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_logo_cloud\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`variant\` text DEFAULT 'scroll',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_logo_cloud_order_idx\` ON \`pages_blocks_logo_cloud\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_logo_cloud_parent_id_idx\` ON \`pages_blocks_logo_cloud\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_logo_cloud_path_idx\` ON \`pages_blocks_logo_cloud\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_rich_text_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`max_width\` text DEFAULT 'default',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_rich_text_content_order_idx\` ON \`pages_blocks_rich_text_content\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_rich_text_content_parent_id_idx\` ON \`pages_blocks_rich_text_content\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_rich_text_content_path_idx\` ON \`pages_blocks_rich_text_content\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_stats_bar_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_stats_bar\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_stats_bar_stats_order_idx\` ON \`pages_blocks_stats_bar_stats\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_stats_bar_stats_parent_id_idx\` ON \`pages_blocks_stats_bar_stats\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_stats_bar\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`variant\` text DEFAULT 'default',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_stats_bar_order_idx\` ON \`pages_blocks_stats_bar\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_stats_bar_parent_id_idx\` ON \`pages_blocks_stats_bar\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_stats_bar_path_idx\` ON \`pages_blocks_stats_bar\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_partner_grid_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`logo_id\` integer,
  	\`name\` text,
  	\`description\` text,
  	\`link_type\` text DEFAULT 'external',
  	\`link_new_tab\` integer DEFAULT false,
  	\`link_url\` text,
  	\`link_label\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_partner_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_partner_grid_partners_order_idx\` ON \`pages_blocks_partner_grid_partners\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_partner_grid_partners_parent_id_idx\` ON \`pages_blocks_partner_grid_partners\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_partner_grid_partners_logo_idx\` ON \`pages_blocks_partner_grid_partners\` (\`logo_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_partner_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_partner_grid_order_idx\` ON \`pages_blocks_partner_grid\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_partner_grid_parent_id_idx\` ON \`pages_blocks_partner_grid\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_partner_grid_path_idx\` ON \`pages_blocks_partner_grid\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_timeline_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`date\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`stat\` text,
  	\`stat_label\` text,
  	\`category\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_timeline\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_timeline_items_order_idx\` ON \`pages_blocks_timeline_items\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_timeline_items_parent_id_idx\` ON \`pages_blocks_timeline_items\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_timeline\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_timeline_order_idx\` ON \`pages_blocks_timeline\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_timeline_parent_id_idx\` ON \`pages_blocks_timeline\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_timeline_path_idx\` ON \`pages_blocks_timeline\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_tabbed_content_tabs_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_tabbed_content_tabs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_tabbed_content_tabs_features_order_idx\` ON \`pages_blocks_tabbed_content_tabs_features\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_tabbed_content_tabs_features_parent_id_idx\` ON \`pages_blocks_tabbed_content_tabs_features\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_tabbed_content_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`image_id\` integer,
  	\`icon\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_tabbed_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_tabbed_content_tabs_order_idx\` ON \`pages_blocks_tabbed_content_tabs\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_tabbed_content_tabs_parent_id_idx\` ON \`pages_blocks_tabbed_content_tabs\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_tabbed_content_tabs_image_idx\` ON \`pages_blocks_tabbed_content_tabs\` (\`image_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_tabbed_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_tabbed_content_order_idx\` ON \`pages_blocks_tabbed_content\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_tabbed_content_parent_id_idx\` ON \`pages_blocks_tabbed_content\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_tabbed_content_path_idx\` ON \`pages_blocks_tabbed_content\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_comparison_table_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`tooltip\` text,
  	\`category\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_comparison_table\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_comparison_table_features_order_idx\` ON \`pages_blocks_comparison_table_features\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_comparison_table_features_parent_id_idx\` ON \`pages_blocks_comparison_table_features\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_comparison_table_plans_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`feature_index\` numeric,
  	\`value\` text,
  	\`text_value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_comparison_table_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_comparison_table_plans_values_order_idx\` ON \`pages_blocks_comparison_table_plans_values\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_comparison_table_plans_values_parent_id_idx\` ON \`pages_blocks_comparison_table_plans_values\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_comparison_table_plans\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`price\` text,
  	\`description\` text,
  	\`recommended\` integer DEFAULT false,
  	\`cta_type\` text DEFAULT 'external',
  	\`cta_new_tab\` integer DEFAULT false,
  	\`cta_url\` text,
  	\`cta_label\` text,
  	\`cta_appearance_type\` text DEFAULT 'button',
  	\`cta_button_variant\` text DEFAULT 'default',
  	\`cta_button_size\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_comparison_table\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_comparison_table_plans_order_idx\` ON \`pages_blocks_comparison_table_plans\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_comparison_table_plans_parent_id_idx\` ON \`pages_blocks_comparison_table_plans\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_comparison_table\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_comparison_table_order_idx\` ON \`pages_blocks_comparison_table\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_comparison_table_parent_id_idx\` ON \`pages_blocks_comparison_table\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_comparison_table_path_idx\` ON \`pages_blocks_comparison_table\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_job_listings_jobs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`department\` text,
  	\`location\` text,
  	\`type\` text,
  	\`salary\` text,
  	\`description\` text,
  	\`link_type\` text DEFAULT 'external',
  	\`link_new_tab\` integer DEFAULT false,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_appearance_type\` text DEFAULT 'button',
  	\`link_button_variant\` text DEFAULT 'default',
  	\`link_button_size\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_job_listings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_job_listings_jobs_order_idx\` ON \`pages_blocks_job_listings_jobs\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_job_listings_jobs_parent_id_idx\` ON \`pages_blocks_job_listings_jobs\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_blocks_job_listings\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_blocks_job_listings_order_idx\` ON \`pages_blocks_job_listings\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_job_listings_parent_id_idx\` ON \`pages_blocks_job_listings\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_job_listings_path_idx\` ON \`pages_blocks_job_listings\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `);
  await db.run(
    sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_meta_meta_image_idx\` ON \`pages\` (\`meta_image_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`
  );
  await db.run(sql`CREATE TABLE \`pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`pages_rels_order_idx\` ON \`pages_rels\` (\`order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_rels_parent_idx\` ON \`pages_rels\` (\`parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_rels_path_idx\` ON \`pages_rels\` (\`path\`);`
  );
  await db.run(
    sql`CREATE INDEX \`pages_rels_pages_id_idx\` ON \`pages_rels\` (\`pages_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_src_id\` integer,
  	\`poster_src_id\` integer,
  	\`headline\` text,
  	\`subtext\` text,
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
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_hero_order_idx\` ON \`_pages_v_blocks_hero\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_hero_parent_id_idx\` ON \`_pages_v_blocks_hero\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_hero_path_idx\` ON \`_pages_v_blocks_hero\` (\`_path\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_hero_media_src_idx\` ON \`_pages_v_blocks_hero\` (\`media_src_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_hero_poster_src_idx\` ON \`_pages_v_blocks_hero\` (\`poster_src_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_heroCtrd_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_src_id\` integer,
  	\`poster_src_id\` integer,
  	\`headline\` text,
  	\`subtext\` text,
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
  `);
  await db.run(
    sql`CREATE INDEX \`_heroCtrd_v_order_idx\` ON \`_heroCtrd_v\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_heroCtrd_v_parent_id_idx\` ON \`_heroCtrd_v\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_heroCtrd_v_path_idx\` ON \`_heroCtrd_v\` (\`_path\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_heroCtrd_v_media_src_idx\` ON \`_heroCtrd_v\` (\`media_src_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_heroCtrd_v_poster_src_idx\` ON \`_heroCtrd_v\` (\`poster_src_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_heroStat_v_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_heroStat_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_heroStat_v_stats_order_idx\` ON \`_heroStat_v_stats\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_heroStat_v_stats_parent_id_idx\` ON \`_heroStat_v_stats\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_heroStat_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
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
  `);
  await db.run(
    sql`CREATE INDEX \`_heroStat_v_order_idx\` ON \`_heroStat_v\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_heroStat_v_parent_id_idx\` ON \`_heroStat_v\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_heroStat_v_path_idx\` ON \`_heroStat_v\` (\`_path\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_heroStat_v_media_src_idx\` ON \`_heroStat_v\` (\`media_src_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_heroStat_v_poster_src_idx\` ON \`_heroStat_v\` (\`poster_src_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_heroMin_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`headline\` text,
  	\`subtext\` text,
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
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_heroMin_v_order_idx\` ON \`_heroMin_v\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_heroMin_v_parent_id_idx\` ON \`_heroMin_v\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_heroMin_v_path_idx\` ON \`_heroMin_v\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_bento_chart_data\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`month\` text,
  	\`visitors\` numeric,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_bento\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_bento_chart_data_order_idx\` ON \`_pages_v_blocks_bento_chart_data\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_bento_chart_data_parent_id_idx\` ON \`_pages_v_blocks_bento_chart_data\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_bento\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`headline\` text,
  	\`subtext\` text,
  	\`image_src_id\` integer,
  	\`image_alt\` text,
  	\`image_title\` text,
  	\`image_description\` text,
  	\`image_badge\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_src_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_bento_order_idx\` ON \`_pages_v_blocks_bento\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_bento_parent_id_idx\` ON \`_pages_v_blocks_bento\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_bento_path_idx\` ON \`_pages_v_blocks_bento\` (\`_path\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_bento_image_image_src_idx\` ON \`_pages_v_blocks_bento\` (\`image_src_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_split_media_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`headline\` text,
  	\`body\` text,
  	\`media_label\` text,
  	\`media_src_id\` integer,
  	\`media_alt\` text,
  	\`cta_type\` text DEFAULT 'external',
  	\`cta_new_tab\` integer DEFAULT false,
  	\`cta_url\` text,
  	\`cta_label\` text,
  	\`cta_appearance_type\` text DEFAULT 'link',
  	\`cta_link_variant\` text DEFAULT 'arrow',
  	\`media_overlay_title\` text,
  	\`media_overlay_badge\` text,
  	\`media_overlay_description\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`media_src_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_split_media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_split_media_rows_order_idx\` ON \`_pages_v_blocks_split_media_rows\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_split_media_rows_parent_id_idx\` ON \`_pages_v_blocks_split_media_rows\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_split_media_rows_media_src_idx\` ON \`_pages_v_blocks_split_media_rows\` (\`media_src_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_split_media\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_split_media_order_idx\` ON \`_pages_v_blocks_split_media\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_split_media_parent_id_idx\` ON \`_pages_v_blocks_split_media\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_split_media_path_idx\` ON \`_pages_v_blocks_split_media\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_testimonials_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text,
  	\`department\` text,
  	\`quote\` text,
  	\`avatar_id\` integer,
  	\`featured\` integer DEFAULT false,
  	\`featured_quote\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_testimonials_testimonials_order_idx\` ON \`_pages_v_blocks_testimonials_testimonials\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_testimonials_testimonials_parent_id_idx\` ON \`_pages_v_blocks_testimonials_testimonials\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_testimonials_testimonials_avatar_idx\` ON \`_pages_v_blocks_testimonials_testimonials\` (\`avatar_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`headline\` text,
  	\`subtext\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_testimonials_order_idx\` ON \`_pages_v_blocks_testimonials\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_testimonials_parent_id_idx\` ON \`_pages_v_blocks_testimonials\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_testimonials_path_idx\` ON \`_pages_v_blocks_testimonials\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_image_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`caption\` text,
  	\`image_id\` integer,
  	\`image_alt\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_image_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_image_gallery_items_order_idx\` ON \`_pages_v_blocks_image_gallery_items\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_image_gallery_items_parent_id_idx\` ON \`_pages_v_blocks_image_gallery_items\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_image_gallery_items_image_idx\` ON \`_pages_v_blocks_image_gallery_items\` (\`image_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_image_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_image_gallery_order_idx\` ON \`_pages_v_blocks_image_gallery\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_image_gallery_parent_id_idx\` ON \`_pages_v_blocks_image_gallery\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_image_gallery_path_idx\` ON \`_pages_v_blocks_image_gallery\` (\`_path\`);`
  );
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
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_latest_articles_articles_order_idx\` ON \`_pages_v_blocks_latest_articles_articles\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_latest_articles_articles_parent_id_idx\` ON \`_pages_v_blocks_latest_articles_articles\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_latest_articles_articles_image_idx\` ON \`_pages_v_blocks_latest_articles_articles\` (\`image_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_latest_articles_articles_author_author_a_idx\` ON \`_pages_v_blocks_latest_articles_articles\` (\`author_avatar_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_latest_articles\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`headline\` text,
  	\`subtext\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_latest_articles_order_idx\` ON \`_pages_v_blocks_latest_articles\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_latest_articles_parent_id_idx\` ON \`_pages_v_blocks_latest_articles\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_latest_articles_path_idx\` ON \`_pages_v_blocks_latest_articles\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cinematic_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`video_src_id\` integer,
  	\`label\` text,
  	\`headline\` text,
  	\`subtext\` text,
  	\`cta_type\` text DEFAULT 'external',
  	\`cta_new_tab\` integer DEFAULT false,
  	\`cta_url\` text,
  	\`cta_label\` text,
  	\`cta_appearance_type\` text DEFAULT 'button',
  	\`cta_button_variant\` text DEFAULT 'default',
  	\`cta_button_size\` text DEFAULT 'lg',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`video_src_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_cinematic_cta_order_idx\` ON \`_pages_v_blocks_cinematic_cta\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_cinematic_cta_parent_id_idx\` ON \`_pages_v_blocks_cinematic_cta\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_cinematic_cta_path_idx\` ON \`_pages_v_blocks_cinematic_cta\` (\`_path\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_cinematic_cta_video_src_idx\` ON \`_pages_v_blocks_cinematic_cta\` (\`video_src_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta_band\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`subtext\` text,
  	\`variant\` text DEFAULT 'primary',
  	\`primary_cta_type\` text DEFAULT 'external',
  	\`primary_cta_new_tab\` integer DEFAULT false,
  	\`primary_cta_url\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_appearance_type\` text DEFAULT 'button',
  	\`primary_cta_button_variant\` text DEFAULT 'default',
  	\`primary_cta_button_size\` text DEFAULT 'default',
  	\`secondary_cta_type\` text DEFAULT 'external',
  	\`secondary_cta_new_tab\` integer DEFAULT false,
  	\`secondary_cta_url\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_appearance_type\` text DEFAULT 'button',
  	\`secondary_cta_button_variant\` text DEFAULT 'outline',
  	\`secondary_cta_button_size\` text DEFAULT 'default',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_cta_band_order_idx\` ON \`_pages_v_blocks_cta_band\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_cta_band_parent_id_idx\` ON \`_pages_v_blocks_cta_band\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_cta_band_path_idx\` ON \`_pages_v_blocks_cta_band\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_pricing_tiers_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_pricing_tiers\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_pricing_tiers_features_order_idx\` ON \`_pages_v_blocks_pricing_tiers_features\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_pricing_tiers_features_parent_id_idx\` ON \`_pages_v_blocks_pricing_tiers_features\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_pricing_tiers\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`description\` text,
  	\`monthly_price\` numeric,
  	\`annual_price\` numeric,
  	\`cta_type\` text DEFAULT 'external',
  	\`cta_new_tab\` integer DEFAULT false,
  	\`cta_url\` text,
  	\`cta_label\` text,
  	\`cta_appearance_type\` text DEFAULT 'button',
  	\`cta_button_variant\` text DEFAULT 'default',
  	\`cta_button_size\` text DEFAULT 'lg',
  	\`badge\` text,
  	\`recommended\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_pricing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_pricing_tiers_order_idx\` ON \`_pages_v_blocks_pricing_tiers\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_pricing_tiers_parent_id_idx\` ON \`_pages_v_blocks_pricing_tiers\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_pricing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`headline\` text,
  	\`subtext\` text,
  	\`footnote\` text,
  	\`footnote_attribution\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_pricing_order_idx\` ON \`_pages_v_blocks_pricing\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_pricing_parent_id_idx\` ON \`_pages_v_blocks_pricing\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_pricing_path_idx\` ON \`_pages_v_blocks_pricing\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_faq_items_order_idx\` ON \`_pages_v_blocks_faq_items\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_faq_items_parent_id_idx\` ON \`_pages_v_blocks_faq_items\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`headline\` text,
  	\`subtext\` text,
  	\`cta_text\` text,
  	\`cta_type\` text DEFAULT 'external',
  	\`cta_new_tab\` integer DEFAULT false,
  	\`cta_url\` text,
  	\`cta_label\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_faq_order_idx\` ON \`_pages_v_blocks_faq\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_faq_parent_id_idx\` ON \`_pages_v_blocks_faq\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_faq_path_idx\` ON \`_pages_v_blocks_faq\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_features_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`label\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`link_type\` text DEFAULT 'external',
  	\`link_new_tab\` integer DEFAULT false,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_features_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_features_grid_items_order_idx\` ON \`_pages_v_blocks_features_grid_items\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_features_grid_items_parent_id_idx\` ON \`_pages_v_blocks_features_grid_items\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_features_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_features_grid_order_idx\` ON \`_pages_v_blocks_features_grid\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_features_grid_parent_id_idx\` ON \`_pages_v_blocks_features_grid\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_features_grid_path_idx\` ON \`_pages_v_blocks_features_grid\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_team_members_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`platform\` text,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_team_members\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_team_members_links_order_idx\` ON \`_pages_v_blocks_team_members_links\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_team_members_links_parent_id_idx\` ON \`_pages_v_blocks_team_members_links\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_team_members\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`photo_id\` integer,
  	\`name\` text,
  	\`role\` text,
  	\`department\` text,
  	\`bio\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_team\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_team_members_order_idx\` ON \`_pages_v_blocks_team_members\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_team_members_parent_id_idx\` ON \`_pages_v_blocks_team_members\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_team_members_photo_idx\` ON \`_pages_v_blocks_team_members\` (\`photo_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_team\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`variant\` text DEFAULT 'detailed',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_team_order_idx\` ON \`_pages_v_blocks_team\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_team_parent_id_idx\` ON \`_pages_v_blocks_team\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_team_path_idx\` ON \`_pages_v_blocks_team\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_trust_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`value\` numeric,
  	\`decimals\` numeric DEFAULT 0,
  	\`format\` text DEFAULT 'none',
  	\`suffix\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_trust\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_trust_stats_order_idx\` ON \`_pages_v_blocks_trust_stats\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_trust_stats_parent_id_idx\` ON \`_pages_v_blocks_trust_stats\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_trust_logos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`logo_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_trust\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_trust_logos_order_idx\` ON \`_pages_v_blocks_trust_logos\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_trust_logos_parent_id_idx\` ON \`_pages_v_blocks_trust_logos\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_trust_logos_logo_idx\` ON \`_pages_v_blocks_trust_logos\` (\`logo_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_trust\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_trust_order_idx\` ON \`_pages_v_blocks_trust\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_trust_parent_id_idx\` ON \`_pages_v_blocks_trust\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_trust_path_idx\` ON \`_pages_v_blocks_trust\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_logo_cloud_logos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`logo_id\` integer,
  	\`name\` text,
  	\`link_type\` text DEFAULT 'external',
  	\`link_new_tab\` integer DEFAULT false,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_logo_cloud\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_logo_cloud_logos_order_idx\` ON \`_pages_v_blocks_logo_cloud_logos\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_logo_cloud_logos_parent_id_idx\` ON \`_pages_v_blocks_logo_cloud_logos\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_logo_cloud_logos_logo_idx\` ON \`_pages_v_blocks_logo_cloud_logos\` (\`logo_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_logo_cloud\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`variant\` text DEFAULT 'scroll',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_logo_cloud_order_idx\` ON \`_pages_v_blocks_logo_cloud\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_logo_cloud_parent_id_idx\` ON \`_pages_v_blocks_logo_cloud\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_logo_cloud_path_idx\` ON \`_pages_v_blocks_logo_cloud\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_rich_text_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`max_width\` text DEFAULT 'default',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_rich_text_content_order_idx\` ON \`_pages_v_blocks_rich_text_content\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_rich_text_content_parent_id_idx\` ON \`_pages_v_blocks_rich_text_content\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_rich_text_content_path_idx\` ON \`_pages_v_blocks_rich_text_content\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_stats_bar_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_stats_bar\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_stats_bar_stats_order_idx\` ON \`_pages_v_blocks_stats_bar_stats\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_stats_bar_stats_parent_id_idx\` ON \`_pages_v_blocks_stats_bar_stats\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_stats_bar\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`variant\` text DEFAULT 'default',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_stats_bar_order_idx\` ON \`_pages_v_blocks_stats_bar\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_stats_bar_parent_id_idx\` ON \`_pages_v_blocks_stats_bar\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_stats_bar_path_idx\` ON \`_pages_v_blocks_stats_bar\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_partner_grid_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`logo_id\` integer,
  	\`name\` text,
  	\`description\` text,
  	\`link_type\` text DEFAULT 'external',
  	\`link_new_tab\` integer DEFAULT false,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_partner_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_partner_grid_partners_order_idx\` ON \`_pages_v_blocks_partner_grid_partners\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_partner_grid_partners_parent_id_idx\` ON \`_pages_v_blocks_partner_grid_partners\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_partner_grid_partners_logo_idx\` ON \`_pages_v_blocks_partner_grid_partners\` (\`logo_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_partner_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_partner_grid_order_idx\` ON \`_pages_v_blocks_partner_grid\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_partner_grid_parent_id_idx\` ON \`_pages_v_blocks_partner_grid\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_partner_grid_path_idx\` ON \`_pages_v_blocks_partner_grid\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_timeline_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`date\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`stat\` text,
  	\`stat_label\` text,
  	\`category\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_timeline\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_timeline_items_order_idx\` ON \`_pages_v_blocks_timeline_items\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_timeline_items_parent_id_idx\` ON \`_pages_v_blocks_timeline_items\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_timeline\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_timeline_order_idx\` ON \`_pages_v_blocks_timeline\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_timeline_parent_id_idx\` ON \`_pages_v_blocks_timeline\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_timeline_path_idx\` ON \`_pages_v_blocks_timeline\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_tabbed_content_tabs_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_tabbed_content_tabs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_tabbed_content_tabs_features_order_idx\` ON \`_pages_v_blocks_tabbed_content_tabs_features\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_tabbed_content_tabs_features_parent_id_idx\` ON \`_pages_v_blocks_tabbed_content_tabs_features\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_tabbed_content_tabs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`image_id\` integer,
  	\`icon\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_tabbed_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_tabbed_content_tabs_order_idx\` ON \`_pages_v_blocks_tabbed_content_tabs\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_tabbed_content_tabs_parent_id_idx\` ON \`_pages_v_blocks_tabbed_content_tabs\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_tabbed_content_tabs_image_idx\` ON \`_pages_v_blocks_tabbed_content_tabs\` (\`image_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_tabbed_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_tabbed_content_order_idx\` ON \`_pages_v_blocks_tabbed_content\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_tabbed_content_parent_id_idx\` ON \`_pages_v_blocks_tabbed_content\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_tabbed_content_path_idx\` ON \`_pages_v_blocks_tabbed_content\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_comparison_table_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`tooltip\` text,
  	\`category\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_comparison_table\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_comparison_table_features_order_idx\` ON \`_pages_v_blocks_comparison_table_features\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_comparison_table_features_parent_id_idx\` ON \`_pages_v_blocks_comparison_table_features\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_comparison_table_plans_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`feature_index\` numeric,
  	\`value\` text,
  	\`text_value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_comparison_table_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_comparison_table_plans_values_order_idx\` ON \`_pages_v_blocks_comparison_table_plans_values\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_comparison_table_plans_values_parent_id_idx\` ON \`_pages_v_blocks_comparison_table_plans_values\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_comparison_table_plans\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`price\` text,
  	\`description\` text,
  	\`recommended\` integer DEFAULT false,
  	\`cta_type\` text DEFAULT 'external',
  	\`cta_new_tab\` integer DEFAULT false,
  	\`cta_url\` text,
  	\`cta_label\` text,
  	\`cta_appearance_type\` text DEFAULT 'button',
  	\`cta_button_variant\` text DEFAULT 'default',
  	\`cta_button_size\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_comparison_table\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_comparison_table_plans_order_idx\` ON \`_pages_v_blocks_comparison_table_plans\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_comparison_table_plans_parent_id_idx\` ON \`_pages_v_blocks_comparison_table_plans\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_comparison_table\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_comparison_table_order_idx\` ON \`_pages_v_blocks_comparison_table\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_comparison_table_parent_id_idx\` ON \`_pages_v_blocks_comparison_table\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_comparison_table_path_idx\` ON \`_pages_v_blocks_comparison_table\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_job_listings_jobs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`department\` text,
  	\`location\` text,
  	\`type\` text,
  	\`salary\` text,
  	\`description\` text,
  	\`link_type\` text DEFAULT 'external',
  	\`link_new_tab\` integer DEFAULT false,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_appearance_type\` text DEFAULT 'button',
  	\`link_button_variant\` text DEFAULT 'default',
  	\`link_button_size\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_job_listings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_job_listings_jobs_order_idx\` ON \`_pages_v_blocks_job_listings_jobs\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_job_listings_jobs_parent_id_idx\` ON \`_pages_v_blocks_job_listings_jobs\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_job_listings\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_job_listings_order_idx\` ON \`_pages_v_blocks_job_listings\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_job_listings_parent_id_idx\` ON \`_pages_v_blocks_job_listings\` (\`_parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_job_listings_path_idx\` ON \`_pages_v_blocks_job_listings\` (\`_path\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version_slug_idx\` ON \`_pages_v\` (\`version_slug\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_meta_version_meta_image_idx\` ON \`_pages_v\` (\`version_meta_image_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`
  );
  await db.run(sql`CREATE TABLE \`_pages_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`_pages_v_rels_order_idx\` ON \`_pages_v_rels\` (\`order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_rels_parent_idx\` ON \`_pages_v_rels\` (\`parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_rels_path_idx\` ON \`_pages_v_rels\` (\`path\`);`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_rels_pages_id_idx\` ON \`_pages_v_rels\` (\`pages_id\`);`
  );
  await db.run(sql`CREATE TABLE \`payload_mcp_api_keys\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`label\` text,
  	\`description\` text,
  	\`pages_find\` integer DEFAULT false,
  	\`pages_create\` integer DEFAULT false,
  	\`pages_update\` integer DEFAULT false,
  	\`pages_delete\` integer DEFAULT false,
  	\`media_find\` integer DEFAULT false,
  	\`media_create\` integer DEFAULT false,
  	\`media_update\` integer DEFAULT false,
  	\`media_delete\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`enable_a_p_i_key\` integer,
  	\`api_key\` text,
  	\`api_key_index\` text,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `);
  await db.run(
    sql`CREATE INDEX \`payload_mcp_api_keys_user_idx\` ON \`payload_mcp_api_keys\` (\`user_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_mcp_api_keys_updated_at_idx\` ON \`payload_mcp_api_keys\` (\`updated_at\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_mcp_api_keys_created_at_idx\` ON \`payload_mcp_api_keys\` (\`created_at\`);`
  );
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `);
  await db.run(
    sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`
  );
  await db.run(sql`CREATE TABLE \`payload_jobs_log\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`executed_at\` text NOT NULL,
  	\`completed_at\` text NOT NULL,
  	\`task_slug\` text NOT NULL,
  	\`task_i_d\` text NOT NULL,
  	\`input\` text,
  	\`output\` text,
  	\`state\` text NOT NULL,
  	\`error\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`payload_jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`payload_jobs_log_order_idx\` ON \`payload_jobs_log\` (\`_order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_jobs_log_parent_id_idx\` ON \`payload_jobs_log\` (\`_parent_id\`);`
  );
  await db.run(sql`CREATE TABLE \`payload_jobs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`input\` text,
  	\`completed_at\` text,
  	\`total_tried\` numeric DEFAULT 0,
  	\`has_error\` integer DEFAULT false,
  	\`error\` text,
  	\`task_slug\` text,
  	\`queue\` text DEFAULT 'default',
  	\`wait_until\` text,
  	\`processing\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `);
  await db.run(
    sql`CREATE INDEX \`payload_jobs_completed_at_idx\` ON \`payload_jobs\` (\`completed_at\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_jobs_total_tried_idx\` ON \`payload_jobs\` (\`total_tried\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_jobs_has_error_idx\` ON \`payload_jobs\` (\`has_error\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_jobs_task_slug_idx\` ON \`payload_jobs\` (\`task_slug\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_jobs_queue_idx\` ON \`payload_jobs\` (\`queue\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_jobs_wait_until_idx\` ON \`payload_jobs\` (\`wait_until\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_jobs_processing_idx\` ON \`payload_jobs\` (\`processing\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_jobs_updated_at_idx\` ON \`payload_jobs\` (\`updated_at\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_jobs_created_at_idx\` ON \`payload_jobs\` (\`created_at\`);`
  );
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `);
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`
  );
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`pages_id\` integer,
  	\`payload_mcp_api_keys_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`payload_mcp_api_keys_id\`) REFERENCES \`payload_mcp_api_keys\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_payload_mcp_api_keys_id_idx\` ON \`payload_locked_documents_rels\` (\`payload_mcp_api_keys_id\`);`
  );
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `);
  await db.run(
    sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`
  );
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`payload_mcp_api_keys_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`payload_mcp_api_keys_id\`) REFERENCES \`payload_mcp_api_keys\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_payload_mcp_api_keys_id_idx\` ON \`payload_preferences_rels\` (\`payload_mcp_api_keys_id\`);`
  );
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `);
  await db.run(
    sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`
  );
  await db.run(
    sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`
  );
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`);
  await db.run(sql`DROP TABLE \`users\`;`);
  await db.run(sql`DROP TABLE \`media\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_hero\`;`);
  await db.run(sql`DROP TABLE \`heroCtrd\`;`);
  await db.run(sql`DROP TABLE \`heroStat_stats\`;`);
  await db.run(sql`DROP TABLE \`heroStat\`;`);
  await db.run(sql`DROP TABLE \`heroMin\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_bento_chart_data\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_bento\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_split_media_rows\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_split_media\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_testimonials_testimonials\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_testimonials\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_image_gallery_items\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_image_gallery\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_latest_articles_articles\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_latest_articles\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_cinematic_cta\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_cta_band\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_pricing_tiers_features\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_pricing_tiers\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_pricing\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_faq_items\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_faq\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_features_grid_items\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_features_grid\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_team_members_links\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_team_members\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_team\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_trust_stats\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_trust_logos\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_trust\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_logo_cloud_logos\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_logo_cloud\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_rich_text_content\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_stats_bar_stats\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_stats_bar\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_partner_grid_partners\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_partner_grid\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_timeline_items\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_timeline\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_tabbed_content_tabs_features\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_tabbed_content_tabs\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_tabbed_content\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_comparison_table_features\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_comparison_table_plans_values\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_comparison_table_plans\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_comparison_table\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_job_listings_jobs\`;`);
  await db.run(sql`DROP TABLE \`pages_blocks_job_listings\`;`);
  await db.run(sql`DROP TABLE \`pages\`;`);
  await db.run(sql`DROP TABLE \`pages_rels\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_hero\`;`);
  await db.run(sql`DROP TABLE \`_heroCtrd_v\`;`);
  await db.run(sql`DROP TABLE \`_heroStat_v_stats\`;`);
  await db.run(sql`DROP TABLE \`_heroStat_v\`;`);
  await db.run(sql`DROP TABLE \`_heroMin_v\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_bento_chart_data\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_bento\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_split_media_rows\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_split_media\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_testimonials_testimonials\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_testimonials\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_image_gallery_items\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_image_gallery\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_latest_articles_articles\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_latest_articles\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cinematic_cta\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta_band\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_pricing_tiers_features\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_pricing_tiers\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_pricing\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_faq_items\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_faq\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_features_grid_items\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_features_grid\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_team_members_links\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_team_members\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_team\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_trust_stats\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_trust_logos\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_trust\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_logo_cloud_logos\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_logo_cloud\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_rich_text_content\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_stats_bar_stats\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_stats_bar\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_partner_grid_partners\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_partner_grid\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_timeline_items\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_timeline\`;`);
  await db.run(
    sql`DROP TABLE \`_pages_v_blocks_tabbed_content_tabs_features\`;`
  );
  await db.run(sql`DROP TABLE \`_pages_v_blocks_tabbed_content_tabs\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_tabbed_content\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_comparison_table_features\`;`);
  await db.run(
    sql`DROP TABLE \`_pages_v_blocks_comparison_table_plans_values\`;`
  );
  await db.run(sql`DROP TABLE \`_pages_v_blocks_comparison_table_plans\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_comparison_table\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_job_listings_jobs\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_blocks_job_listings\`;`);
  await db.run(sql`DROP TABLE \`_pages_v\`;`);
  await db.run(sql`DROP TABLE \`_pages_v_rels\`;`);
  await db.run(sql`DROP TABLE \`payload_mcp_api_keys\`;`);
  await db.run(sql`DROP TABLE \`payload_kv\`;`);
  await db.run(sql`DROP TABLE \`payload_jobs_log\`;`);
  await db.run(sql`DROP TABLE \`payload_jobs\`;`);
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`);
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`);
  await db.run(sql`DROP TABLE \`payload_preferences\`;`);
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`);
  await db.run(sql`DROP TABLE \`payload_migrations\`;`);
}
