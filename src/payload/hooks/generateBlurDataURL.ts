import type { CollectionBeforeChangeHook } from "payload";
import sharp from "sharp";

export const generateBlurDataURL: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  // Only on create or when a new file is uploaded
  if (operation !== "create" && !req.file) {
    return data;
  }

  // Only process raster images (skip videos and SVGs)
  const mimeType = req.file?.mimetype || data.mimeType;
  if (!mimeType?.startsWith("image/") || mimeType === "image/svg+xml") {
    return data;
  }

  // Clear stale blur on re-upload so a failed regeneration doesn't leave old data
  if (operation === "update" && req.file) {
    data.blurDataURL = undefined;
  }

  try {
    let buffer: Buffer | undefined;

    if (req.file?.data) {
      buffer = Buffer.isBuffer(req.file.data)
        ? req.file.data
        : Buffer.from(req.file.data);
    }

    if (!buffer) {
      return data;
    }

    // Generate a tiny blurred WebP placeholder
    const blurBuffer = await sharp(buffer)
      .resize(16) // 16px wide, preserve aspect ratio
      .blur(10)
      .webp({ quality: 20 })
      .toBuffer();

    const base64 = blurBuffer.toString("base64");
    data.blurDataURL = `data:image/webp;base64,${base64}`;
  } catch (err) {
    req.payload.logger.error({
      msg: "Failed to generate blur placeholder",
      err: err instanceof Error ? err : new Error(String(err)),
    });
  }

  return data;
};
