import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

type S3ClientType = InstanceType<typeof import("@aws-sdk/client-s3").S3Client>;
let cachedS3Client: S3ClientType | null = null;

/** Try downloading from S3 directly. Returns true if successful. */
async function tryS3Download(
  filename: string,
  destPath: string,
  prefix?: string
): Promise<boolean> {
  if (!(process.env.S3_BUCKET && process.env.S3_ENDPOINT)) {
    return false;
  }

  const { GetObjectCommand, S3Client } = await import("@aws-sdk/client-s3");

  if (!cachedS3Client) {
    cachedS3Client = new S3Client({
      region: process.env.S3_REGION || "us-east-1",
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
      },
      forcePathStyle: true,
    });
  }

  const key = prefix ? `${prefix}/${filename}` : filename;
  const response = await cachedS3Client.send(
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    })
  );

  if (!response.Body) {
    return false;
  }

  await pipeline(
    Readable.from(response.Body as AsyncIterable<Uint8Array>),
    createWriteStream(destPath)
  );
  return true;
}

/** Download via HTTP fetch (for local dev or when S3 is unavailable). */
async function httpDownload(url: string, destPath: string): Promise<void> {
  const absoluteUrl = url.startsWith("http")
    ? url
    : `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}${url}`;

  const response = await fetch(absoluteUrl);
  if (!response.ok) {
    throw new Error(`Failed to download media: ${response.status}`);
  }

  const body = response.body;
  if (!body) {
    throw new Error("Response body is null");
  }

  await pipeline(
    Readable.fromWeb(body as import("node:stream/web").ReadableStream),
    createWriteStream(destPath)
  );
}

/**
 * Download a media file to disk, using S3 direct access when configured,
 * falling back to HTTP fetch for local development.
 */
export async function downloadMediaToDisk(
  url: string,
  filename: string,
  destPath: string,
  prefix?: string
): Promise<void> {
  try {
    if (await tryS3Download(filename, destPath, prefix)) {
      return;
    }
  } catch (err: unknown) {
    // Fall through to HTTP only on S3 not-found; rethrow real errors
    const name = err instanceof Error ? err.name : "";
    if (name !== "NoSuchKey" && name !== "NotFound") {
      throw err;
    }
  }

  await httpDownload(url, destPath);
}
