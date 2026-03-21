import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`ba_sessions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`token\` text NOT NULL,
  	\`user_id\` numeric NOT NULL,
  	\`expires_at\` text NOT NULL,
  	\`ip_address\` text,
  	\`user_agent\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  try { await db.run(sql`CREATE UNIQUE INDEX \`ba_sessions_token_idx\` ON \`ba_sessions\` (\`token\`);`) } catch {}
  try { await db.run(sql`CREATE INDEX \`ba_sessions_user_id_idx\` ON \`ba_sessions\` (\`user_id\`);`) } catch {}
  try { await db.run(sql`CREATE INDEX \`ba_sessions_updated_at_idx\` ON \`ba_sessions\` (\`updated_at\`);`) } catch {}
  try { await db.run(sql`CREATE INDEX \`ba_sessions_created_at_idx\` ON \`ba_sessions\` (\`created_at\`);`) } catch {}
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`ba_accounts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`account_id\` text NOT NULL,
  	\`provider_id\` text NOT NULL,
  	\`user_id\` numeric NOT NULL,
  	\`access_token\` text,
  	\`refresh_token\` text,
  	\`access_token_expires_at\` text,
  	\`refresh_token_expires_at\` text,
  	\`scope\` text,
  	\`password\` text,
  	\`id_token\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  try { await db.run(sql`CREATE INDEX \`ba_accounts_user_id_idx\` ON \`ba_accounts\` (\`user_id\`);`) } catch {}
  try { await db.run(sql`CREATE INDEX \`ba_accounts_updated_at_idx\` ON \`ba_accounts\` (\`updated_at\`);`) } catch {}
  try { await db.run(sql`CREATE INDEX \`ba_accounts_created_at_idx\` ON \`ba_accounts\` (\`created_at\`);`) } catch {}
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`ba_verifications\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`identifier\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`expires_at\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  try { await db.run(sql`CREATE INDEX \`ba_verifications_identifier_idx\` ON \`ba_verifications\` (\`identifier\`);`) } catch {}
  try { await db.run(sql`CREATE INDEX \`ba_verifications_updated_at_idx\` ON \`ba_verifications\` (\`updated_at\`);`) } catch {}
  try { await db.run(sql`CREATE INDEX \`ba_verifications_created_at_idx\` ON \`ba_verifications\` (\`created_at\`);`) } catch {}
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`ba_two_factors\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`secret\` text NOT NULL,
  	\`backup_codes\` text NOT NULL,
  	\`user_id\` numeric NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  try { await db.run(sql`CREATE INDEX \`ba_two_factors_secret_idx\` ON \`ba_two_factors\` (\`secret\`);`) } catch {}
  try { await db.run(sql`CREATE INDEX \`ba_two_factors_user_id_idx\` ON \`ba_two_factors\` (\`user_id\`);`) } catch {}
  try { await db.run(sql`CREATE INDEX \`ba_two_factors_updated_at_idx\` ON \`ba_two_factors\` (\`updated_at\`);`) } catch {}
  try { await db.run(sql`CREATE INDEX \`ba_two_factors_created_at_idx\` ON \`ba_two_factors\` (\`created_at\`);`) } catch {}
  // Users columns may already exist from dev-mode push — safe to skip if duplicate
  try { await db.run(sql`ALTER TABLE \`users\` ADD \`email_verified\` integer DEFAULT false;`) } catch {}
  try { await db.run(sql`ALTER TABLE \`users\` ADD \`image\` text;`) } catch {}
  try { await db.run(sql`ALTER TABLE \`users\` ADD \`two_factor_enabled\` integer DEFAULT false;`) } catch {}
  // MCP columns may already exist from dev-mode push — safe to skip if duplicate
  try { await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`payload_mcp_tool_list_hero_blocks\` integer DEFAULT true;`) } catch {}
  try { await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`payload_mcp_tool_list_content_blocks\` integer DEFAULT true;`) } catch {}
  try { await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`payload_mcp_tool_list_blocks\`;`) } catch {}
  try { await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`ba_sessions_id\` integer REFERENCES ba_sessions(id);`) } catch {}
  try { await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`ba_accounts_id\` integer REFERENCES ba_accounts(id);`) } catch {}
  try { await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`ba_verifications_id\` integer REFERENCES ba_verifications(id);`) } catch {}
  try { await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`ba_two_factors_id\` integer REFERENCES ba_two_factors(id);`) } catch {}
  try { await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_ba_sessions_id_idx\` ON \`payload_locked_documents_rels\` (\`ba_sessions_id\`);`) } catch {}
  try { await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_ba_accounts_id_idx\` ON \`payload_locked_documents_rels\` (\`ba_accounts_id\`);`) } catch {}
  try { await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_ba_verifications_id_idx\` ON \`payload_locked_documents_rels\` (\`ba_verifications_id\`);`) } catch {}
  try { await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_ba_two_factors_id_idx\` ON \`payload_locked_documents_rels\` (\`ba_two_factors_id\`);`) } catch {}
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`ba_sessions\`;`)
  await db.run(sql`DROP TABLE \`ba_accounts\`;`)
  await db.run(sql`DROP TABLE \`ba_verifications\`;`)
  await db.run(sql`DROP TABLE \`ba_two_factors\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
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
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "pages_id", "payload_mcp_api_keys_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "pages_id", "payload_mcp_api_keys_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_payload_mcp_api_keys_id_idx\` ON \`payload_locked_documents_rels\` (\`payload_mcp_api_keys_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`payload_mcp_tool_list_blocks\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`payload_mcp_tool_list_hero_blocks\`;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`payload_mcp_tool_list_content_blocks\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`email_verified\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`image\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`two_factor_enabled\`;`)
}
