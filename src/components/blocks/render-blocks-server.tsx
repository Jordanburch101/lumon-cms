import type { LayoutBlock } from "@/types/block-types";
import { LatestArticlesServer } from "./latest-articles/latest-articles-server";
import { renderBlock } from "./render-blocks";

/**
 * Server-only block renderer that substitutes async data-fetching versions
 * of blocks that query the database (e.g., LatestArticles).
 *
 * Use this in server page routes. The base `RenderBlocks` is safe for both
 * server and client contexts but renders LatestArticles as a placeholder.
 */
function renderBlockServer(block: LayoutBlock) {
  if (block.blockType === "latestArticles") {
    return <LatestArticlesServer {...block} />;
  }
  return renderBlock(block);
}

export function RenderBlocksServer({ blocks }: { blocks: LayoutBlock[] }) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-16 lg:gap-32">
      {blocks.map((block, index) => (
        <div
          data-block-index={index}
          data-block-type={block.blockType}
          key={block.id}
        >
          {renderBlockServer(block)}
        </div>
      ))}
    </div>
  );
}
