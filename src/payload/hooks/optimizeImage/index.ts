import type { CollectionBeforeValidateHook } from "payload";
import sharp from "sharp";

const MAX_WIDTH = 2048;
const WEBP_QUALITY = 80;
const FILE_EXT_RE = /\.[^.]+$/;

/**
 * Optimizes uploaded images before Payload processes them:
 * - Resizes to a maximum width of 2048px (preserves aspect ratio)
 * - Converts to WebP format for smaller file sizes
 * - Skips videos and SVGs
 *
 * Runs in beforeValidate so the optimized buffer is what Payload
 * stores and generates imageSizes from.
 */
export const optimizeImage: CollectionBeforeValidateHook = async ({
  data,
  req,
  operation,
}) => {
  if (operation !== "create" && !req.file) {
    return data;
  }

  const mimeType = req.file?.mimetype || data?.mimeType;
  if (!mimeType?.startsWith("image/") || mimeType === "image/svg+xml") {
    return data;
  }

  if (!req.file?.data) {
    return data;
  }

  try {
    const buffer = Buffer.isBuffer(req.file.data)
      ? req.file.data
      : Buffer.from(req.file.data);

    const optimized = await sharp(buffer)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    const webpName = req.file.name.replace(FILE_EXT_RE, ".webp");

    req.file.data = optimized;
    req.file.size = optimized.length;
    req.file.mimetype = "image/webp";
    req.file.name = webpName;

    // Also update the document data so Payload records the correct
    // mimeType and filename in the database.
    if (data) {
      data.mimeType = "image/webp";
      data.filename = webpName;
    }
  } catch (err) {
    req.payload.logger.error({
      msg: "Failed to optimize image",
      err: err instanceof Error ? err : new Error(String(err)),
    });
  }

  return data;
};
