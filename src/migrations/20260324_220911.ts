import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`description\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` DROP COLUMN \`version_description\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages\` ADD \`description\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_description\` text;`)
}
