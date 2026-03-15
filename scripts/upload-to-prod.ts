import { readFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://lumon-app-production.up.railway.app";
const PUBLIC = join(import.meta.dirname, "../public");

interface MediaFile {
  id: number;
  path: string;
  alt: string;
  mime?: string;
}

const files: MediaFile[] = [
  // Images
  { id: 1, path: "hero-bg.jpg", alt: "Hero background" },
  { id: 2, path: "lumon-logo.svg", alt: "Lumon Industries logo" },
  { id: 3, path: "gallery/elevator-descent.jpg", alt: "Mark Scout in elevator" },
  { id: 4, path: "gallery/break-room-session.jpg", alt: "Break room statement" },
  { id: 5, path: "gallery/the-you-you-are.jpg", alt: "Irving with book" },
  { id: 6, path: "gallery/macrodata-refinement.jpg", alt: "Helly at desk" },
  { id: 7, path: "gallery/mdr-team.jpg", alt: "MDR team" },
  { id: 8, path: "gallery/helly-portrait.jpg", alt: "Helly portrait" },
  { id: 9, path: "testimonials/cobel.jpg", alt: "Harmony Cobel" },
  { id: 10, path: "testimonials/milchick.png", alt: "Seth Milchick" },
  { id: 11, path: "testimonials/mark.png", alt: "Mark S." },
  { id: 12, path: "testimonials/helly.jpg", alt: "Helly R." },
  { id: 13, path: "icons/nextjs.svg", alt: "Next.js logo" },
  { id: 14, path: "icons/payload.svg", alt: "Payload CMS logo" },
  { id: 15, path: "icons/react.svg", alt: "React logo" },
  { id: 16, path: "icons/tailwind.svg", alt: "Tailwind CSS logo" },
  { id: 17, path: "icons/typescript.svg", alt: "TypeScript logo" },
  { id: 18, path: "icons/vercel.svg", alt: "Vercel logo" },
  { id: 25, path: "testimonials/kier.webp", alt: "Kier Eagan", mime: "image/webp" },
  { id: 26, path: "testimonials/irving.webp", alt: "Irving B.", mime: "image/webp" },
  { id: 27, path: "testimonials/dylan.webp", alt: "Dylan G.", mime: "image/webp" },
  // Videos
  { id: 19, path: "hero-vid-new.mp4", alt: "Hero video", mime: "video/mp4" },
  { id: 20, path: "hero-vid.mp4", alt: "Macrodata refinement video", mime: "video/mp4" },
  { id: 21, path: "cinematic-cta-vid.mp4", alt: "Cinematic CTA video", mime: "video/mp4" },
  { id: 22, path: "split-vid-building.mp4", alt: "Perpetuity Wing video", mime: "video/mp4" },
  { id: 23, path: "split-vid-hana.mp4", alt: "Employee wellness video", mime: "video/mp4" },
  { id: 24, path: "bento-vid.mp4", alt: "Bento section video", mime: "video/mp4" },
];

const mimeMap: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
};

async function main() {
  // Wake the server (cold start can take up to 2 minutes)
  console.log("Waking server...");
  for (let i = 0; i < 12; i++) {
    try {
      const res = await fetch(BASE, { signal: AbortSignal.timeout(15000) });
      if (res.ok) {
        console.log("Server is up!");
        break;
      }
    } catch {
      console.log(`  Attempt ${i + 1}/12 — waiting for cold start...`);
      await new Promise((r) => setTimeout(r, 10000));
    }
  }

  // Login
  const loginRes = await fetch(`${BASE}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "jordanburch101@gmail.com",
      password: "meta1234",
    }),
  });
  const { token } = (await loginRes.json()) as { token: string };
  console.log("Logged in.\n");

  for (const file of files) {
    const filePath = join(PUBLIC, file.path);
    const buffer = readFileSync(filePath);
    const ext = file.path.slice(file.path.lastIndexOf("."));
    const mime = file.mime || mimeMap[ext] || "application/octet-stream";
    const filename = file.path.split("/").pop()!;

    const form = new FormData();
    form.append("file", new Blob([buffer], { type: mime }), filename);
    form.append("_payload", JSON.stringify({ alt: file.alt }));

    try {
      const res = await fetch(`${BASE}/api/media/${file.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
        signal: AbortSignal.timeout(120000),
      });

      const data = (await res.json()) as {
        doc?: { filename: string; filesize: number };
        errors?: { message: string }[];
      };

      if (data.doc) {
        const sizeMB = (data.doc.filesize / 1024 / 1024).toFixed(1);
        console.log(`  ✓ ID ${file.id}: ${filename} → ${data.doc.filename} (${sizeMB}MB)`);
      } else {
        console.log(`  ✗ ID ${file.id}: ${filename} — ${data.errors?.[0]?.message || "unknown error"}`);
      }
    } catch (err) {
      console.log(`  ✗ ID ${file.id}: ${filename} — ${(err as Error).message}`);
    }
  }

  console.log("\nDone!");
}

main();
