/**
 * generate-displacement-map.ts
 *
 * Generates a base64-encoded PNG displacement map for an SVG feDisplacementMap
 * filter used in a liquid glass navbar effect.
 *
 * Output: a `data:image/png;base64,...` string to stdout
 * Dimensions: 1920 x 56 (full viewport width, navbar height h-14)
 * Surface: convex lens — curvature runs top-to-bottom
 * Encoding: R = X displacement, G = Y displacement, 128 = neutral
 * Refraction: Snell's law with refractionIndex = 1.5
 *
 * No external dependencies — uses only Node.js built-ins (zlib).
 *
 * Usage:
 *   bun run scripts/generate-displacement-map.ts
 */

import { deflateSync } from "node:zlib";

const WIDTH = 1920;
const HEIGHT = 56;
const REFRACTION_INDEX = 1.5;

// --- PNG helpers (minimal encoder, no dependencies) ---

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeU32BE(buf: Uint8Array, offset: number, value: number): void {
  buf[offset] = (value >>> 24) & 0xff;
  buf[offset + 1] = (value >>> 16) & 0xff;
  buf[offset + 2] = (value >>> 8) & 0xff;
  buf[offset + 3] = value & 0xff;
}

function makeChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(4 + 4 + data.length + 4);
  writeU32BE(chunk, 0, data.length);

  // Type bytes
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i);
  }

  // Data
  chunk.set(data, 8);

  // CRC over type + data
  const crcInput = chunk.subarray(4, 8 + data.length);
  writeU32BE(chunk, 8 + data.length, crc32(crcInput));

  return chunk;
}

function encodePNG(
  width: number,
  height: number,
  rgba: Uint8Array
): Uint8Array {
  // IHDR
  const ihdr = new Uint8Array(13);
  writeU32BE(ihdr, 0, width);
  writeU32BE(ihdr, 4, height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // IDAT — build filtered scanlines (filter type 0 = None for each row)
  const rowBytes = width * 4;
  const raw = new Uint8Array(height * (1 + rowBytes));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + rowBytes)] = 0; // filter: None
    raw.set(
      rgba.subarray(y * rowBytes, y * rowBytes + rowBytes),
      y * (1 + rowBytes) + 1
    );
  }
  const compressed = deflateSync(Buffer.from(raw));

  // IEND (empty)
  const iend = new Uint8Array(0);

  // Signature
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrChunk = makeChunk("IHDR", ihdr);
  const idatChunk = makeChunk("IDAT", new Uint8Array(compressed));
  const iendChunk = makeChunk("IEND", iend);

  // Concatenate
  const png = new Uint8Array(
    sig.length + ihdrChunk.length + idatChunk.length + iendChunk.length
  );
  let offset = 0;
  for (const part of [sig, ihdrChunk, idatChunk, iendChunk]) {
    png.set(part, offset);
    offset += part.length;
  }

  return png;
}

// --- Displacement map generation ---

function generate(): Uint8Array {
  const rgba = new Uint8Array(WIDTH * HEIGHT * 4);

  for (let y = 0; y < HEIGHT; y++) {
    // Normalised vertical position [0, 1] where 0 = top, 1 = bottom
    const t = y / (HEIGHT - 1);

    // Convex circle surface profile: y = sqrt(1 - (1-x)^2)
    // Map t across the full diameter: x ranges from 0 to 1
    // Surface height h(t) = sqrt(1 - (2t - 1)^2)  (semicircle centered at 0.5)
    const centered = 2 * t - 1; // [-1, 1]
    const r2 = centered * centered;

    // Surface normal direction (derivative of the semicircle)
    // h(t) = sqrt(1 - (2t-1)^2), dh/dt = -(2t-1) / sqrt(1 - (2t-1)^2)
    // At edges (|centered| >= 1) the surface is flat — no refraction
    if (r2 >= 1) {
      // Neutral — no displacement
      for (let x = 0; x < WIDTH; x++) {
        const idx = (y * WIDTH + x) * 4;
        rgba[idx] = 128; // R
        rgba[idx + 1] = 128; // G
        rgba[idx + 2] = 128; // B (unused by filter but set for completeness)
        rgba[idx + 3] = 255; // A
      }
      continue;
    }

    const h = Math.sqrt(1 - r2);
    // Slope of the surface in the vertical direction
    const slope = -centered / h;

    // Surface normal angle from vertical (pointing inward)
    // The surface normal tilts by arctan(slope) from the vertical
    const normalAngle = Math.atan(slope);

    // Snell's law: sin(theta_out) = sin(theta_in) / n
    // theta_in is the angle of the incoming ray (vertical, 0) with the surface normal
    // For a vertical incoming ray hitting a tilted surface, incidence angle = |normalAngle|
    const incidenceAngle = Math.abs(normalAngle);
    const sinOut = Math.sin(incidenceAngle) / REFRACTION_INDEX;

    // Total internal reflection check (shouldn't happen with n=1.5 and these angles)
    if (Math.abs(sinOut) > 1) {
      for (let x = 0; x < WIDTH; x++) {
        const idx = (y * WIDTH + x) * 4;
        rgba[idx] = 128;
        rgba[idx + 1] = 128;
        rgba[idx + 2] = 128;
        rgba[idx + 3] = 255;
      }
      continue;
    }

    const refractionAngle = Math.asin(sinOut);

    // Deviation = difference between refracted angle and original (0)
    // The displacement direction follows the sign of the normal angle
    const deviation = (refractionAngle - incidenceAngle) * Math.sign(normalAngle);

    // The displacement is primarily vertical (Y channel, green)
    // Magnitude scaled so that the peak effect is visible but subtle
    // Map deviation to [0, 255] where 128 = neutral
    const magnitude = deviation / (Math.PI / 4); // normalise to reasonable range
    const dy = Math.round(128 + magnitude * 127);

    // X displacement: uniform across each row (the navbar is a horizontal bar,
    // curvature is only vertical), so dx stays neutral
    const dx = 128;

    const clampedDy = Math.max(0, Math.min(255, dy));

    for (let x = 0; x < WIDTH; x++) {
      const idx = (y * WIDTH + x) * 4;
      rgba[idx] = dx; // R = X displacement
      rgba[idx + 1] = clampedDy; // G = Y displacement
      rgba[idx + 2] = 128; // B
      rgba[idx + 3] = 255; // A
    }
  }

  return rgba;
}

// --- Main ---

const rgba = generate();
const png = encodePNG(WIDTH, HEIGHT, rgba);

// Convert to base64 data URL
const base64 = Buffer.from(png).toString("base64");
const dataUrl = `data:image/png;base64,${base64}`;

process.stdout.write(dataUrl);
