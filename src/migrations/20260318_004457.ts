import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-sqlite";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(
    sql`ALTER TABLE \`pages_blocks_bento\` ADD \`showcase_src_id\` integer REFERENCES media(id);`
  );
  await db.run(
    sql`ALTER TABLE \`pages_blocks_bento\` ADD \`showcase_alt\` text;`
  );
  await db.run(
    sql`ALTER TABLE \`pages_blocks_bento\` ADD \`showcase_title\` text;`
  );
  await db.run(
    sql`ALTER TABLE \`pages_blocks_bento\` ADD \`showcase_description\` text;`
  );
  await db.run(
    sql`ALTER TABLE \`pages_blocks_bento\` ADD \`showcase_badge\` text;`
  );
  await db.run(
    sql`CREATE INDEX \`pages_blocks_bento_showcase_showcase_src_idx\` ON \`pages_blocks_bento\` (\`showcase_src_id\`);`
  );
  await db.run(
    sql`ALTER TABLE \`_pages_v_blocks_bento\` ADD \`showcase_src_id\` integer REFERENCES media(id);`
  );
  await db.run(
    sql`ALTER TABLE \`_pages_v_blocks_bento\` ADD \`showcase_alt\` text;`
  );
  await db.run(
    sql`ALTER TABLE \`_pages_v_blocks_bento\` ADD \`showcase_title\` text;`
  );
  await db.run(
    sql`ALTER TABLE \`_pages_v_blocks_bento\` ADD \`showcase_description\` text;`
  );
  await db.run(
    sql`ALTER TABLE \`_pages_v_blocks_bento\` ADD \`showcase_badge\` text;`
  );
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_bento_showcase_showcase_src_idx\` ON \`_pages_v_blocks_bento\` (\`showcase_src_id\`);`
  );
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`);
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_bento\` (
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
    sql`INSERT INTO \`__new_pages_blocks_bento\`("_order", "_parent_id", "_path", "id", "headline", "subtext", "image_src_id", "image_alt", "image_title", "image_description", "image_badge", "block_name") SELECT "_order", "_parent_id", "_path", "id", "headline", "subtext", "image_src_id", "image_alt", "image_title", "image_description", "image_badge", "block_name" FROM \`pages_blocks_bento\`;`
  );
  await db.run(sql`DROP TABLE \`pages_blocks_bento\`;`);
  await db.run(
    sql`ALTER TABLE \`__new_pages_blocks_bento\` RENAME TO \`pages_blocks_bento\`;`
  );
  await db.run(sql`PRAGMA foreign_keys=ON;`);
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
  await db.run(sql`CREATE TABLE \`__new__pages_v_blocks_bento\` (
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
    sql`INSERT INTO \`__new__pages_v_blocks_bento\`("_order", "_parent_id", "_path", "id", "headline", "subtext", "image_src_id", "image_alt", "image_title", "image_description", "image_badge", "_uuid", "block_name") SELECT "_order", "_parent_id", "_path", "id", "headline", "subtext", "image_src_id", "image_alt", "image_title", "image_description", "image_badge", "_uuid", "block_name" FROM \`_pages_v_blocks_bento\`;`
  );
  await db.run(sql`DROP TABLE \`_pages_v_blocks_bento\`;`);
  await db.run(
    sql`ALTER TABLE \`__new__pages_v_blocks_bento\` RENAME TO \`_pages_v_blocks_bento\`;`
  );
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
}
