import { readFile, stat, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TaskConfig } from "payload";
import sharp from "sharp";
import { downloadMediaToDisk } from "@/lib/download-media";
import { isFFmpegAvailable, runFFmpeg } from "@/lib/ffmpeg";

const FILE_EXT_REGEX = /\.[^.]+$/;

export const optimizeVideoTask: TaskConfig<"optimizeVideo"> = {
  slug: "optimizeVideo",
  inputSchema: [{ name: "mediaId", type: "number", required: true }],
  retries: 2,
  handler: async ({ input, req }) => {
    const mediaId = (input as { mediaId: number }).mediaId;

    // Fetch the media document
    const media = await req.payload.findByID({
      collection: "media",
      id: mediaId,
    });

    if (!(media?.url && media.filename)) {
      // Transient — file may still be uploading to S3
      throw new Error(`Media ${mediaId} has no URL or filename`);
    }

    // Verify it's still a video (could have been replaced between queue and execution)
    if (!media.mimeType?.startsWith("video/")) {
      req.payload.logger.info({
        msg: `Media ${mediaId} is no longer a video, skipping`,
      });
      return { output: {} };
    }

    // Check ffmpeg availability
    if (!(await isFFmpegAvailable())) {
      req.payload.logger.error({
        msg: "ffmpeg not available — cannot optimize video",
      });
      return { output: {} };
    }

    const runId = `${mediaId}-${Date.now()}`;
    const inputPath = join(tmpdir(), `payload-video-input-${runId}`);
    const outputPath = join(tmpdir(), `payload-video-output-${runId}.mp4`);
    const framePath = join(tmpdir(), `payload-video-frame-${runId}.jpg`);

    try {
      // Download the video — streams to disk via S3 (production) or HTTP (dev)
      await downloadMediaToDisk(
        media.url,
        media.filename,
        inputPath,
        (media as Record<string, unknown>).prefix as string | undefined
      );

      // Build ffmpeg arguments
      const ffmpegArgs: string[] = [
        "-y", // overwrite output
        "-i",
        inputPath,
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-b:v",
        "5M",
        "-maxrate",
        "6M",
        "-bufsize",
        "12M",
        "-vf",
        "scale=min(1920\\,iw):min(1080\\,ih):force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-movflags",
        "+faststart",
      ];

      // Audio handling
      if (media.stripAudio) {
        ffmpegArgs.push("-an");
      } else {
        ffmpegArgs.push("-c:a", "aac", "-b:a", "128k");
      }

      ffmpegArgs.push(outputPath);

      // Run ffmpeg
      await runFFmpeg(ffmpegArgs);

      // Extract a frame for blur placeholder
      await runFFmpeg([
        "-y",
        "-ss",
        "0.1",
        "-i",
        inputPath,
        "-vframes",
        "1",
        "-q:v",
        "10",
        framePath,
      ]);

      // Generate blur placeholder from the extracted frame
      let blurDataURL: string | undefined;
      try {
        const frameBuffer = await readFile(framePath);
        const blurBuffer = await sharp(frameBuffer)
          .resize(16)
          .blur(10)
          .webp({ quality: 20 })
          .toBuffer();
        blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
      } catch (err) {
        req.payload.logger.warn({
          msg: "Failed to generate video blur placeholder",
          err: err instanceof Error ? err : new Error(String(err)),
        });
      }

      // Read the optimized video and upload back via Payload local API
      const optimizedBuffer = await readFile(outputPath);
      const newFilename =
        media.filename?.replace(FILE_EXT_REGEX, ".mp4") || "video.mp4";

      await req.payload.update({
        collection: "media",
        id: mediaId,
        data: {
          ...(blurDataURL && { blurDataURL }),
        },
        file: {
          data: optimizedBuffer,
          mimetype: "video/mp4",
          name: newFilename,
          size: optimizedBuffer.length,
        },
        overwriteExistingFiles: true,
        context: {
          skipVideoOptimization: true,
        },
        req,
      });

      const inputSize = (await stat(inputPath)).size;
      req.payload.logger.info({
        msg: `Video ${mediaId} optimized: ${(inputSize / 1024 / 1024).toFixed(1)}MB → ${(optimizedBuffer.length / 1024 / 1024).toFixed(1)}MB`,
      });
    } finally {
      // Clean up temp files
      await Promise.allSettled([
        unlink(inputPath),
        unlink(outputPath),
        unlink(framePath),
      ]);
    }

    return { output: {} };
  },
};
