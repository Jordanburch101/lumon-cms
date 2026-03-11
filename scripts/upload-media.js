/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs/promises");
const path = require("node:path");

const PUBLIC = path.resolve(__dirname, "../public");

const FILES = [
  // Videos
  { path: `${PUBLIC}/hero-vid-new.mp4`, alt: "Hero background video", key: "HERO_VID" },
  { path: `${PUBLIC}/hero-vid.mp4`, alt: "Macrodata refinement process", key: "HERO_VID2" },
  { path: `${PUBLIC}/split-vid-building.mp4`, alt: "The Perpetuity Wing", key: "SPLIT_BUILDING" },
  { path: `${PUBLIC}/split-vid-hana.mp4`, alt: "Lumon employee benefits", key: "SPLIT_HANA" },
  { path: `${PUBLIC}/cinematic-cta-vid.mp4`, alt: "Cinematic CTA background video", key: "CTA_VID" },
  { path: `${PUBLIC}/bento-vid.mp4`, alt: "Bento background video", key: "BENTO_VID" },
  // Images
  { path: `${PUBLIC}/hero-bg.jpg`, alt: "Hero background image", key: "HERO_BG" },
  { path: `${PUBLIC}/gallery/elevator-descent.jpg`, alt: "Mark Scout in the elevator descending to the severed floor", key: "ELEVATOR" },
  { path: `${PUBLIC}/gallery/break-room-session.jpg`, alt: "A woman reading the break room statement", key: "BREAKROOM" },
  { path: `${PUBLIC}/gallery/the-you-you-are.jpg`, alt: "Irving holding The You You Are", key: "YOUYOUARE" },
  { path: `${PUBLIC}/gallery/macrodata-refinement.jpg`, alt: "Helly at her desk in MDR", key: "MACRODATA" },
  { path: `${PUBLIC}/gallery/mdr-team.jpg`, alt: "The MDR team gathered together", key: "MDRTEAM" },
  { path: `${PUBLIC}/gallery/helly-portrait.jpg`, alt: "Helly peering over a cubicle divider", key: "HELLYPORT" },
  // Testimonials
  { path: `${PUBLIC}/testimonials/cobel.jpg`, alt: "Harmony Cobel", key: "COBEL" },
  { path: `${PUBLIC}/testimonials/milchick.png`, alt: "Seth Milchick", key: "MILCHICK" },
  { path: `${PUBLIC}/testimonials/kier.webp`, alt: "Kier Eagan", key: "KIER" },
  { path: `${PUBLIC}/testimonials/mark.png`, alt: "Mark S.", key: "MARK" },
  { path: `${PUBLIC}/testimonials/helly.jpg`, alt: "Helly R.", key: "HELLY" },
  { path: `${PUBLIC}/testimonials/irving.webp`, alt: "Irving B.", key: "IRVING" },
  { path: `${PUBLIC}/testimonials/dylan.webp`, alt: "Dylan G.", key: "DYLAN" },
  // SVGs & logos
  { path: `${PUBLIC}/lumon-logo.svg`, alt: "Lumon Industries logo", key: "LOGO" },
  { path: `${PUBLIC}/icons/nextjs.svg`, alt: "Next.js logo", key: "NEXTJS" },
  { path: `${PUBLIC}/icons/payload.svg`, alt: "Payload CMS logo", key: "PAYLOAD_LOGO" },
  { path: `${PUBLIC}/icons/react.svg`, alt: "React logo", key: "REACT" },
  { path: `${PUBLIC}/icons/tailwind.svg`, alt: "Tailwind CSS logo", key: "TAILWIND" },
  { path: `${PUBLIC}/icons/typescript.svg`, alt: "TypeScript logo", key: "TYPESCRIPT" },
  { path: `${PUBLIC}/icons/vercel.svg`, alt: "Vercel logo", key: "VERCEL" },
];

const MIME_MAP = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
};

module.exports = async function run({ payload }) {
  // Step 1: Delete all existing media
  console.log("=== Deleting all existing media ===");
  const existing = await payload.find({
    collection: "media",
    limit: 200,
  });
  for (const doc of existing.docs) {
    console.log(`  Deleting id=${doc.id} (${doc.filename})`);
    await payload.delete({ collection: "media", id: doc.id });
  }
  console.log(`  Deleted ${existing.docs.length} documents.\n`);

  // Step 2: Upload all files
  console.log("=== Uploading media files ===");
  const idMap = {};

  for (const file of FILES) {
    const ext = path.extname(file.path);
    const mimetype = MIME_MAP[ext] || "application/octet-stream";
    const name = path.basename(file.path);

    try {
      const data = await fs.readFile(file.path);

      const doc = await payload.create({
        collection: "media",
        data: { alt: file.alt },
        file: {
          data: Buffer.from(data),
          mimetype,
          name,
          size: data.length,
        },
      });

      idMap[file.key] = doc.id;
      console.log(`  ✓ ${name} → id=${doc.id}`);
    } catch (err) {
      console.error(`  ✗ ${name} FAILED:`, err?.message || err);
    }
  }

  console.log("\n=== ID Mapping ===");
  console.log(JSON.stringify(idMap, null, 2));

  // Write mapping to file for the page update step
  const envContent = Object.entries(idMap)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  await fs.writeFile("/tmp/media-ids.env", envContent);
  console.log("\nSaved to /tmp/media-ids.env");
};
