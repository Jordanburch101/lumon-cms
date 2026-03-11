import type { CollectionAfterChangeHook } from "payload";
import sharp from "sharp";

export const generateBlurDataURL: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  context,
}) => {
  // Prevent infinite loop — skip if we triggered this via our own update
  if (context.skipBlurGeneration) {
    return doc;
  }

  // Only process images
  if (!doc.mimeType?.startsWith("image/")) {
    return doc;
  }

  // Only on create or when a new file is uploaded
  if (operation !== "create" && !req.file) {
    return doc;
  }

  try {
    // Get the image buffer — try req.file first, fall back to fetching from URL
    let buffer: Buffer | undefined = req.file?.data
      ? Buffer.from(req.file.data)
      : undefined;

    if (!buffer && doc.url) {
      const response = await fetch(doc.url);
      if (response.ok) {
        buffer = Buffer.from(await response.arrayBuffer());
      }
    }

    if (!buffer) {
      return doc;
    }

    // Generate a tiny blurred WebP placeholder
    const blurBuffer = await sharp(buffer)
      .resize(16) // 16px wide, preserve aspect ratio
      .blur(10)
      .webp({ quality: 20 })
      .toBuffer();

    const base64 = blurBuffer.toString("base64");
    const blurDataURL = `data:image/webp;base64,${base64}`;

    // Update the document with the blur placeholder
    await req.payload.update({
      collection: "media",
      id: doc.id,
      data: { blurDataURL },
      context: { skipBlurGeneration: true },
      req,
    });
  } catch (err) {
    req.payload.logger.error({
      msg: "Failed to generate blur placeholder",
      err: err instanceof Error ? err : new Error(String(err)),
    });
  }

  return doc;
};
