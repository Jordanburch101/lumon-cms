/**
 * Sync entire database between local SQLite and remote libsql (Railway).
 *
 * Usage:
 *   bun run db:pull   — Remote → Local  (overwrite local with remote data)
 *   bun run db:push   — Local → Remote  (overwrite remote with local data)
 *
 * Push uses sqlite3 .dump → executeMultiple to avoid FK constraint issues
 * with libsql's HTTP transport (PRAGMA foreign_keys doesn't persist across
 * HTTP requests). Pull uses table-by-table sync since local SQLite supports
 * PRAGMA natively.
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createClient } from "@libsql/client";

const LOCAL_URL = "file:./payload.db";

function getRemoteConfig() {
  const url = process.env.DATABASE_URI;
  if (!url || url.startsWith("file:")) {
    console.error(
      "ERROR: DATABASE_URI in .env must be a remote libsql URL (not file:)."
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
  client: ReturnType<typeof createClient>
): Promise<string[]> {
  const result = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream_%' ORDER BY name"
  );
  return result.rows.map((r) => r.name as string);
}

// ---------------------------------------------------------------------------
// Pull: Remote → Local (table-by-table, PRAGMA works on local SQLite)
// ---------------------------------------------------------------------------
async function syncTablePull(
  source: ReturnType<typeof createClient>,
  dest: ReturnType<typeof createClient>,
  table: string
) {
  const rows = await source.execute(`SELECT * FROM "${table}"`);
  const count = rows.rows.length;

  await dest.execute(`DELETE FROM "${table}"`);

  if (count === 0) {
    console.log(`  ${table}: empty (cleared)`);
    return;
  }

  const columns = rows.columns;
  const BATCH = 100;
  for (let i = 0; i < count; i += BATCH) {
    const batch = rows.rows.slice(i, i + BATCH);
    const placeholders = batch
      .map(() => `(${columns.map(() => "?").join(", ")})`)
      .join(", ");
    const values = batch.flatMap((row) =>
      columns.map((col) => row[col] ?? null)
    );

    const quotedCols = columns.map((c) => `"${c}"`).join(", ");
    await dest.execute({
      sql: `INSERT INTO "${table}" (${quotedCols}) VALUES ${placeholders}`,
      args: values,
    });
  }

  console.log(`  ${table}: ${count} rows`);
}

async function pull() {
  const remoteConfig = getRemoteConfig();
  const remote = createClient(remoteConfig);
  const local = createClient({ url: LOCAL_URL });

  console.log(`\nSyncing: remote → local`);
  console.log(`Remote: ${remoteConfig.url}`);
  console.log(`Local:  ${LOCAL_URL}\n`);

  const sourceTables = await getTables(remote);
  const destTables = await getTables(local);

  if (sourceTables.length === 0) {
    console.error("ERROR: Remote database has no tables. Run migrations first.");
    process.exit(1);
  }

  const tables = sourceTables.filter((t) => destTables.includes(t));
  const skipped = sourceTables.filter((t) => !destTables.includes(t));

  if (skipped.length > 0) {
    console.log(
      `Skipping ${skipped.length} tables not in destination: ${skipped.join(", ")}\n`
    );
  }

  console.log(`Syncing ${tables.length} tables...\n`);

  // Local SQLite supports PRAGMA natively
  await local.execute("PRAGMA foreign_keys = OFF");

  try {
    for (const table of tables) {
      await syncTablePull(remote, local, table);
    }
  } finally {
    await local.execute("PRAGMA foreign_keys = ON");
  }

  console.log("\nDone.");
  remote.close();
  local.close();
}

// ---------------------------------------------------------------------------
// Push: Local → Remote (dump-based to avoid libsql HTTP PRAGMA issue)
//
// libsql's HTTP transport doesn't support PRAGMA foreign_keys — each request
// is a separate connection. We use sqlite3 .dump to generate SQL, then send
// the entire dump via executeMultiple() in a single connection context with
// PRAGMA foreign_keys = OFF prepended.
// ---------------------------------------------------------------------------
async function push() {
  const remoteConfig = getRemoteConfig();
  const remote = createClient(remoteConfig);

  console.log(`\nSyncing: local → remote`);
  console.log(`Remote: ${remoteConfig.url}`);
  console.log(`Local:  ${LOCAL_URL}\n`);

  // Step 1: Drop all remote tables
  console.log("Dropping remote tables...");
  const tables = await getTables(remote);
  if (tables.length > 0) {
    const dropStmts = [
      "PRAGMA foreign_keys = OFF",
      ...tables.map((t) => `DROP TABLE IF EXISTS "${t}"`),
      "PRAGMA foreign_keys = ON",
    ];
    await remote.executeMultiple(dropStmts.join(";\n"));
    console.log(`  Dropped ${tables.length} tables`);
  } else {
    console.log("  No tables to drop");
  }

  // Step 2: Dump local DB to SQL
  console.log("\nDumping local database...");
  const dumpPath = "/tmp/payload-db-push-dump.sql";
  execSync(`sqlite3 payload.db ".dump" > ${dumpPath}`);
  const dump = readFileSync(dumpPath, "utf-8");
  const lineCount = dump.split("\n").length;
  console.log(`  ${lineCount} lines of SQL`);

  // Step 3: Execute the full dump on the remote
  // executeMultiple runs everything in a single connection context,
  // so PRAGMA foreign_keys = OFF actually takes effect.
  console.log("\nRestoring to remote...");
  await remote.executeMultiple(
    `PRAGMA foreign_keys = OFF;\n${dump}\nPRAGMA foreign_keys = ON;`
  );

  // Step 4: Verify
  const newTables = await getTables(remote);
  console.log(`\nDone — ${newTables.length} tables restored.`);

  remote.close();
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

if (arg === "pull") {
  await pull();
} else {
  await push();
}
