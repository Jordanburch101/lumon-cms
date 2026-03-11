import type { CollectionAfterChangeHook } from "payload";
import { isFFmpegAvailable } from "@/lib/ffmpeg";

export const optimizeVideo: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
  context,
}) => {
  // Prevent infinite loop
  if (context.skipVideoOptimization) {
    return doc;
  }

  // Only process videos
  if (!doc.mimeType?.startsWith("video/")) {
    return doc;
  }

  // Determine if we should process
  const isNewUpload = operation === "create";
  const isFileReupload = operation === "update" && !!req.file;
  const isAudioToggle =
    operation === "update" && previousDoc?.stripAudio !== doc.stripAudio;

  if (!(isNewUpload || isFileReupload || isAudioToggle)) {
    return doc;
  }

  // Check ffmpeg availability
  if (!(await isFFmpegAvailable())) {
    req.payload.logger.warn({
      msg: "ffmpeg not available — video stored without optimization",
    });
    return doc;
  }

  // Queue the optimization job
  try {
    await req.payload.jobs.queue({
      task: "optimizeVideo",
      input: { mediaId: doc.id },
      req,
    });

    req.payload.logger.info({
      msg: `Queued video optimization for media ${doc.id}`,
    });
  } catch (err) {
    req.payload.logger.error({
      msg: "Failed to queue video optimization job",
      err: err instanceof Error ? err : new Error(String(err)),
    });
  }

  return doc;
};
