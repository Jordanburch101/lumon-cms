import { readFile, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TaskConfig } from "payload";
import sharp from "sharp";
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

    if (!media?.url) {
      req.payload.logger.error({ msg: `Media ${mediaId} has no URL` });
      return { output: {} };
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
      req.payload.logger.warn({
        msg: "ffmpeg not available — skipping video optimization",
      });
      return { output: {} };
    }

    const inputPath = join(tmpdir(), `payload-video-input-${mediaId}`);
    const outputPath = join(tmpdir(), `payload-video-output-${mediaId}.mp4`);
    const framePath = join(tmpdir(), `payload-video-frame-${mediaId}.jpg`);

    try {
      // Download the video from its URL
      const response = await fetch(media.url);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.status}`);
      }
      const videoBuffer = Buffer.from(await response.arrayBuffer());
      await writeFile(inputPath, videoBuffer);

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
        "1",
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
      } catch {
        req.payload.logger.warn({
          msg: "Failed to generate video blur placeholder",
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
          skipBlurGeneration: true,
        },
        req,
      });

      req.payload.logger.info({
        msg: `Video ${mediaId} optimized: ${videoBuffer.length} → ${optimizedBuffer.length} bytes`,
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
