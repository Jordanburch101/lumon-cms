/**
 * One-time backfill: set path = slug for all existing top-level pages.
 * Run: bun scripts/backfill-paths.ts
 */
import config from "../src/payload.config";
import { getPayload } from "payload";

async function backfill() {
  const payload = await getPayload({ config });

  const pages = await payload.find({
    collection: "pages",
    where: { path: { exists: false } },
    pagination: false,
    depth: 0,
  });

  // Also get pages where path is null
  const nullPages = await payload.find({
    collection: "pages",
    pagination: false,
    depth: 0,
  });

  const toFix = nullPages.docs.filter((p) => p.path === null || p.path === undefined);

  for (const page of toFix) {
    const path = page.slug === "home" ? "" : page.slug;
    await payload.update({
      collection: "pages",
      id: page.id,
      data: { path },
      context: { cascadingPaths: true },
    });
    console.log(`  ${page.title}: path = "${path}"`);
  }

  console.log(`Done — ${toFix.length} pages updated.`);
  process.exit(0);
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
