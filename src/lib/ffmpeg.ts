import { execFile } from "node:child_process";

let ffmpegAvailable: boolean | null = null;

/**
 * Check if ffmpeg is available on the system.
 * Result is cached for the process lifetime.
 */
export async function isFFmpegAvailable(): Promise<boolean> {
  if (ffmpegAvailable !== null) {
    return ffmpegAvailable;
  }

  try {
    await runFFmpeg(["-version"]);
    ffmpegAvailable = true;
  } catch {
    ffmpegAvailable = false;
  }

  return ffmpegAvailable;
}

/**
 * Run an ffmpeg command with the given arguments.
 * Returns stdout/stderr on success, throws on failure.
 */
export function runFFmpeg(
  args: string[],
  timeoutMs = 5 * 60 * 1000
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = execFile(
      "ffmpeg",
      args,
      { timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(`ffmpeg failed: ${error.message}\nstderr: ${stderr}`)
          );
          return;
        }
        resolve({ stdout, stderr });
      }
    );

    proc.on("error", (err) => {
      reject(new Error(`ffmpeg not found or failed to start: ${err.message}`));
    });
  });
}
