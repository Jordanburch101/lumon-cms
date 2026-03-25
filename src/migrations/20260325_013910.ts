import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`header_blocks_direct_link\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'external',
  	\`link_new_tab\` integer DEFAULT false,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`header_blocks_direct_link_order_idx\` ON \`header_blocks_direct_link\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`header_blocks_direct_link_parent_id_idx\` ON \`header_blocks_direct_link\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`header_blocks_direct_link_path_idx\` ON \`header_blocks_direct_link\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`header_blocks_dropdown_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'external',
  	\`link_new_tab\` integer DEFAULT false,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`icon\` text,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header_blocks_dropdown\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`header_blocks_dropdown_items_order_idx\` ON \`header_blocks_dropdown_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`header_blocks_dropdown_items_parent_id_idx\` ON \`header_blocks_dropdown_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`header_blocks_dropdown\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`header_blocks_dropdown_order_idx\` ON \`header_blocks_dropdown\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`header_blocks_dropdown_parent_id_idx\` ON \`header_blocks_dropdown\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`header_blocks_dropdown_path_idx\` ON \`header_blocks_dropdown\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`header_blocks_mega_menu_groups_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'external',
  	\`link_new_tab\` integer DEFAULT false,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	\`icon\` text,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header_blocks_mega_menu_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`header_blocks_mega_menu_groups_items_order_idx\` ON \`header_blocks_mega_menu_groups_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`header_blocks_mega_menu_groups_items_parent_id_idx\` ON \`header_blocks_mega_menu_groups_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`header_blocks_mega_menu_groups\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`group_label\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header_blocks_mega_menu\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`header_blocks_mega_menu_groups_order_idx\` ON \`header_blocks_mega_menu_groups\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`header_blocks_mega_menu_groups_parent_id_idx\` ON \`header_blocks_mega_menu_groups\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`header_blocks_mega_menu\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`header_blocks_mega_menu_order_idx\` ON \`header_blocks_mega_menu\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`header_blocks_mega_menu_parent_id_idx\` ON \`header_blocks_mega_menu\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`header_blocks_mega_menu_path_idx\` ON \`header_blocks_mega_menu\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`header\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`logo_type\` text DEFAULT 'text',
  	\`logo_text\` text,
  	\`logo_text_accent\` text,
  	\`logo_image_id\` integer,
  	\`logo_image_height\` numeric,
  	\`cta_show\` integer DEFAULT true,
  	\`cta_link_type\` text DEFAULT 'external',
  	\`cta_link_new_tab\` integer DEFAULT false,
  	\`cta_link_url\` text,
  	\`cta_link_label\` text,
  	\`cta_link_appearance_type\` text DEFAULT 'button',
  	\`cta_link_button_variant\` text DEFAULT 'default',
  	\`cta_link_button_size\` text DEFAULT 'sm',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`header_logo_logo_image_idx\` ON \`header\` (\`logo_image_id\`);`)
  await db.run(sql`CREATE TABLE \`header_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`header\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`header_rels_order_idx\` ON \`header_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`header_rels_parent_idx\` ON \`header_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`header_rels_path_idx\` ON \`header_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`header_rels_pages_id_idx\` ON \`header_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_columns_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'external',
  	\`link_new_tab\` integer DEFAULT false,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_columns_links_order_idx\` ON \`footer_columns_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_columns_links_parent_id_idx\` ON \`footer_columns_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_columns_order_idx\` ON \`footer_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_columns_parent_id_idx\` ON \`footer_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_social_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`platform\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_social_links_order_idx\` ON \`footer_social_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_social_links_parent_id_idx\` ON \`footer_social_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_legal_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'external',
  	\`link_new_tab\` integer DEFAULT false,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_legal_links_order_idx\` ON \`footer_legal_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_legal_links_parent_id_idx\` ON \`footer_legal_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`footer\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`logo_type\` text DEFAULT 'text',
  	\`logo_text\` text,
  	\`logo_text_accent\` text,
  	\`logo_image_id\` integer,
  	\`logo_image_height\` numeric,
  	\`tagline\` text,
  	\`copyright_text\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_logo_logo_image_idx\` ON \`footer\` (\`logo_image_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_rels_order_idx\` ON \`footer_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`footer_rels_parent_idx\` ON \`footer_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`footer_rels_path_idx\` ON \`footer_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`footer_rels_pages_id_idx\` ON \`footer_rels\` (\`pages_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`forms_find\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`forms_create\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`forms_update\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`forms_delete\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`form_submissions_find\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`form_submissions_create\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`form_submissions_update\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`form_submissions_delete\` integer DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`header_blocks_direct_link\`;`)
  await db.run(sql`DROP TABLE \`header_blocks_dropdown_items\`;`)
  await db.run(sql`DROP TABLE \`header_blocks_dropdown\`;`)
  await db.run(sql`DROP TABLE \`header_blocks_mega_menu_groups_items\`;`)
  await db.run(sql`DROP TABLE \`header_blocks_mega_menu_groups\`;`)
  await db.run(sql`DROP TABLE \`header_blocks_mega_menu\`;`)
  await db.run(sql`DROP TABLE \`header\`;`)
  await db.run(sql`DROP TABLE \`header_rels\`;`)
  await db.run(sql`DROP TABLE \`footer_columns_links\`;`)
  await db.run(sql`DROP TABLE \`footer_columns\`;`)
  await db.run(sql`DROP TABLE \`footer_social_links\`;`)
  await db.run(sql`DROP TABLE \`footer_legal_links\`;`)
  await db.run(sql`DROP TABLE \`footer\`;`)
  await db.run(sql`DROP TABLE \`footer_rels\`;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`forms_find\`;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`forms_create\`;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`forms_update\`;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`forms_delete\`;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`form_submissions_find\`;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`form_submissions_create\`;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`form_submissions_update\`;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`form_submissions_delete\`;`)
}
