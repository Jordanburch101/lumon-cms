/**
 * Re-optimizes all existing image uploads through the optimizeImage hook.
 *
 * Downloads each image from the server, then re-uploads it via the Payload
 * REST API. The optimizeImage beforeChange hook handles the actual
 * conversion (max 2048px, WebP).
 *
 * Usage: bun scripts/reoptimize-images.ts [--base-url URL]
 *
 * Requires the server to be running. Defaults to http://localhost:3000.
 */

const BASE_URL = process.argv.includes("--base-url")
  ? process.argv[process.argv.indexOf("--base-url") + 1]
  : "http://localhost:3000";

const EMAIL = "jordanburch.dev@gmail.com";
const PASSWORD = "meta1234";

async function login(): Promise<string> {
  const resp = await fetch(`${BASE_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!resp.ok) {
    throw new Error(`Login failed: ${resp.status}`);
  }
  const data = await resp.json();
  return data.token;
}

interface MediaDoc {
  alt: string;
  filename: string;
  filesize: number;
  id: number;
  mimeType: string;
  url: string;
}

async function fetchAllImages(token: string): Promise<MediaDoc[]> {
  const images: MediaDoc[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const resp = await fetch(
      `${BASE_URL}/api/media?limit=100&page=${page}&where[mimeType][contains]=image/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await resp.json();
    images.push(...data.docs);
    hasMore = data.hasNextPage;
    page++;
  }

  // Skip SVGs — sharp can't optimize them and they don't need it
  return images.filter((img) => img.mimeType !== "image/svg+xml");
}

async function reupload(
  token: string,
  doc: MediaDoc
): Promise<{ before: number; after: number }> {
  // Download the current file
  const fileResp = await fetch(`${BASE_URL}${doc.url}`);
  if (!fileResp.ok) {
    throw new Error(`Failed to download ${doc.filename}: ${fileResp.status}`);
  }
  const blob = await fileResp.blob();
  const beforeSize = blob.size;

  // Re-upload — the optimizeImage hook will process it
  const form = new FormData();
  form.append("file", blob, doc.filename);
  form.append(
    "_payload",
    JSON.stringify({ alt: doc.alt, overwriteExistingFiles: true })
  );

  const uploadResp = await fetch(`${BASE_URL}/api/media/${doc.id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!uploadResp.ok) {
    const text = await uploadResp.text();
    throw new Error(
      `Failed to re-upload ${doc.filename}: ${uploadResp.status} ${text.slice(0, 200)}`
    );
  }

  const updated = await uploadResp.json();
  const afterSize = updated.doc?.filesize ?? beforeSize;

  return { before: beforeSize, after: afterSize };
}

async function main() {
  console.log(`Re-optimizing images on ${BASE_URL}\n`);

  const token = await login();
  console.log("Logged in\n");

  const images = await fetchAllImages(token);
  console.log(`Found ${images.length} images to optimize\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const img of images) {
    try {
      const { before, after } = await reupload(token, img);
      totalBefore += before;
      totalAfter += after;
      const saved = ((1 - after / before) * 100).toFixed(0);
      console.log(
        `  ✓ ${img.filename}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB (${saved}% saved)`
      );
    } catch (err) {
      console.error(
        `  ✗ ${img.filename}: ${err instanceof Error ? err.message : err}`
      );
    }
  }

  console.log(
    `\nTotal: ${(totalBefore / 1024 / 1024).toFixed(1)}MB → ${(totalAfter / 1024 / 1024).toFixed(1)}MB (${((1 - totalAfter / totalBefore) * 100).toFixed(0)}% saved)`
  );
}

main().catch(console.error);
