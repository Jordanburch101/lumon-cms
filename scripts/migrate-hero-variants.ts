/**
 * One-time migration: Convert hero blocks with variant field
 * to separate block types (heroCentered, heroStats, heroMinimal).
 *
 * Run: source .env && bun scripts/migrate-hero-variants.ts
 */
import { getPayload } from "payload";
import config from "../src/payload.config";

const VARIANT_TO_BLOCK_TYPE: Record<string, string> = {
  centered: "heroCentered",
  split: "heroStats",
  minimal: "heroMinimal",
};

async function migrate() {
  const payload = await getPayload({ config });

  const { docs: pages } = await payload.find({
    collection: "pages",
    limit: 100,
    depth: 0,
  });

  let totalMigrated = 0;

  for (const page of pages) {
    const layout = page.layout as Record<string, unknown>[] | undefined;
    if (!layout?.length) continue;

    let changed = false;

    const updatedLayout = layout.map((block) => {
      if (block.blockType !== "hero") return block;

      const variant = block.variant as string | undefined;
      if (!variant || variant === "default") {
        // Default hero — strip the variant field, keep everything else
        const { variant: _, ...rest } = block;
        if (variant) changed = true;
        return rest;
      }

      const newBlockType = VARIANT_TO_BLOCK_TYPE[variant];
      if (!newBlockType) return block;

      // Convert to new block type, remove variant field
      const { variant: _, blockType: __, ...fields } = block;
      changed = true;
      totalMigrated++;

      console.log(
        `  Page "${page.title}" (${page.slug}): hero variant="${variant}" → ${newBlockType}`
      );

      return { ...fields, blockType: newBlockType };
    });

    if (changed) {
      await payload.update({
        collection: "pages",
        id: page.id,
        data: { layout: updatedLayout as typeof page.layout },
      });
      console.log(`  ✓ Updated page "${page.title}"`);
    }
  }

  if (totalMigrated === 0) {
    console.log("No hero variant blocks found — nothing to migrate.");
  } else {
    console.log(`\nDone. Migrated ${totalMigrated} block(s).`);
  }

  process.exit(0);
}

migrate().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
