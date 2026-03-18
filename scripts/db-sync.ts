/**
 * Sync entire database between local SQLite and remote libsql (Railway).
 *
 * Usage:
 *   bun run db:pull   — Remote → Local  (overwrite local with remote data)
 *   bun run db:push   — Local → Remote  (overwrite remote with local data)
 */

import { createClient } from "@libsql/client";

const LOCAL_URL = "file:./payload.db";

function getRemoteConfig() {
  const url = process.env.DATABASE_URI;
  if (!url || url.startsWith("file:")) {
    console.error(
      "ERROR: DATABASE_URI in .env must be a remote libsql URL (not file:).",
    );
    console.error("Current value:", url ?? "(not set)");
    process.exit(1);
  }
  return {
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  };
}

async function getTables(
  client: ReturnType<typeof createClient>,
): Promise<string[]> {
  const result = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream_%' ORDER BY name",
  );
  return result.rows.map((r) => r.name as string);
}

async function getRowCount(
  client: ReturnType<typeof createClient>,
  table: string,
): Promise<number> {
  const result = await client.execute(`SELECT COUNT(*) as c FROM "${table}"`);
  return Number(result.rows[0].c);
}

async function syncTable(
  source: ReturnType<typeof createClient>,
  dest: ReturnType<typeof createClient>,
  table: string,
) {
  // Get all rows from source
  const rows = await source.execute(`SELECT * FROM "${table}"`);
  const count = rows.rows.length;

  // Clear destination table
  await dest.execute(`DELETE FROM "${table}"`);

  if (count === 0) {
    console.log(`  ${table}: empty (cleared)`);
    return;
  }

  // Get column names from the result
  const columns = rows.columns;

  // Batch insert (100 rows at a time to avoid huge statements)
  const BATCH = 100;
  for (let i = 0; i < count; i += BATCH) {
    const batch = rows.rows.slice(i, i + BATCH);
    const placeholders = batch
      .map(() => `(${columns.map(() => "?").join(", ")})`)
      .join(", ");
    const values = batch.flatMap((row) =>
      columns.map((col) => row[col] ?? null),
    );

    const quotedCols = columns.map((c) => `"${c}"`).join(", ");
    await dest.execute({
      sql: `INSERT INTO "${table}" (${quotedCols}) VALUES ${placeholders}`,
      args: values,
    });
  }

  console.log(`  ${table}: ${count} rows`);
}

async function sync(direction: "pull" | "push") {
  const remoteConfig = getRemoteConfig();
  const remote = createClient(remoteConfig);
  const local = createClient({ url: LOCAL_URL });

  const [source, dest, sourceLabel, destLabel] =
    direction === "pull"
      ? [remote, local, "remote", "local"]
      : [local, remote, "local", "remote"];

  console.log(`\nSyncing: ${sourceLabel} → ${destLabel}`);
  console.log(`Remote: ${remoteConfig.url}`);
  console.log(`Local:  ${LOCAL_URL}\n`);

  // Get tables from source
  const sourceTables = await getTables(source);
  const destTables = await getTables(dest);

  if (sourceTables.length === 0) {
    console.error("ERROR: Source database has no tables. Run migrations first.");
    process.exit(1);
  }

  // Only sync tables that exist in both source and destination
  const tables = sourceTables.filter((t) => destTables.includes(t));
  const skipped = sourceTables.filter((t) => !destTables.includes(t));

  if (skipped.length > 0) {
    console.log(
      `Skipping ${skipped.length} tables not in destination: ${skipped.join(", ")}\n`,
    );
  }

  console.log(`Syncing ${tables.length} tables...\n`);

  // Disable foreign keys during sync
  await dest.execute("PRAGMA foreign_keys = OFF");

  try {
    for (const table of tables) {
      await syncTable(source, dest, table);
    }
  } finally {
    await dest.execute("PRAGMA foreign_keys = ON");
  }

  console.log("\nDone.");

  // Close connections
  remote.close();
  local.close();
}

// --- CLI ---
const arg = process.argv[2];
if (arg !== "pull" && arg !== "push") {
  console.log("Usage: bun run db:pull | bun run db:push");
  console.log("  pull  — Overwrite local DB with remote data");
  console.log("  push  — Overwrite remote DB with local data");
  process.exit(1);
}

if (arg === "push") {
  console.log("\n⚠️  This will OVERWRITE the remote database with local data.");
  console.log("Press Ctrl+C within 3 seconds to cancel...");
  await new Promise((r) => setTimeout(r, 3000));
}

await sync(arg);
