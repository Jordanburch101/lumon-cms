/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Regenerate blurDataURL for all image media documents.
 * Run: node scripts/regenerate-blur.js
 *
 * Uses the Payload REST API to fetch images, generate blur placeholders
 * via sharp, and update each document.
 *
 * Environment variables:
 *   NEXT_PUBLIC_SERVER_URL  — Payload server URL (default: http://localhost:3000)
 *   PAYLOAD_ADMIN_EMAIL     — Admin email
 *   PAYLOAD_ADMIN_PASSWORD  — Admin password
 */

const sharp = require("sharp");

const BASE = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
const EMAIL = process.env.PAYLOAD_ADMIN_EMAIL || "jordanburch.dev@gmail.com";
const PASSWORD = process.env.PAYLOAD_ADMIN_PASSWORD || "meta1234";

async function main() {
  // Login
  const loginRes = await fetch(`${BASE}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  if (!token) {
    console.error("Login failed:", loginData);
    process.exit(1);
  }

  const auth = `JWT ${token}`;

  // Fetch all media (paginate if needed)
  let page = 1;
  let allDocs = [];
  while (true) {
    const mediaRes = await fetch(
      `${BASE}/api/media?limit=100&depth=0&page=${page}`,
      { headers: { Authorization: auth } }
    );
    const mediaData = await mediaRes.json();
    allDocs = allDocs.concat(mediaData.docs);
    if (!mediaData.hasNextPage) {
      break;
    }
    page++;
  }

  const images = allDocs.filter(
    (doc) =>
      doc.mimeType?.startsWith("image/") && doc.mimeType !== "image/svg+xml"
  );

  console.log(
    `Found ${images.length} raster images out of ${allDocs.length} total media`
  );

  // For each image without a blurDataURL, download and generate one
  let updated = 0;
  let skipped = 0;

  for (const doc of images) {
    if (doc.blurDataURL) {
      console.log(`  Skip ${doc.filename} (already has blur)`);
      skipped++;
      continue;
    }

    try {
      const url = doc.url?.startsWith("http") ? doc.url : `${BASE}${doc.url}`;

      const imgRes = await fetch(url);
      if (!imgRes.ok) {
        console.error(`  Failed to fetch ${doc.filename}: ${imgRes.status}`);
        continue;
      }

      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const blurBuffer = await sharp(buffer)
        .resize(16)
        .blur(10)
        .webp({ quality: 20 })
        .toBuffer();

      const blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

      // Update via REST API
      const updateRes = await fetch(`${BASE}/api/media/${doc.id}`, {
        method: "PATCH",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blurDataURL }),
      });

      if (updateRes.ok) {
        console.log(`  ✓ ${doc.filename} → blur (${blurDataURL.length} chars)`);
        updated++;
      } else {
        const err = await updateRes.text();
        console.error(`  ✗ ${doc.filename} update failed: ${err}`);
      }
    } catch (err) {
      console.error(`  ✗ ${doc.filename} error:`, err.message);
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
}

main().catch(console.error);
