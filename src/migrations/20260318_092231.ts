import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`meta_canonical_url\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` DROP COLUMN \`version_meta_canonical_url\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages\` ADD \`meta_canonical_url\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_meta_canonical_url\` text;`)
}
