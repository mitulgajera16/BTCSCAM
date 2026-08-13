/**
 * The picture desk's intake pipeline.
 *
 * Reads the plate registry (src/lib/plates.ts, parsed as data), pulls each
 * painting from Wikimedia Commons at source resolution, applies the house
 * grade, and writes the graded master into public/covers.
 *
 * The grade is BAKED INTO THE FILE rather than applied as a CSS filter,
 * because the social-card renderer (satori) cannot run CSS filters. One
 * graded file is the single source of truth for every surface — page, thumb,
 * and link unfurl all show the same picture.
 *
 * Run: node scripts/fetch-plates.mjs [--force] [plateKey ...]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "covers");

/**
 * House grade — "the whisper". Chosen in review over an untouched
 * reproduction (line engravings read as a different publication next to oils)
 * and over a heavier sepia (it drains the vermilion that makes these
 * paintings stop a scroll). The numbers are the smallest intervention that
 * puts a 1557 engraving and a 1663 Vermeer in the same air.
 *
 * The warm cast is per-channel gain, NOT sharp's tint(): tint() maps the
 * image through its lightness channel and returns a duotone, which silently
 * turns every Caravaggio monochrome. Measured mean channel spread on the
 * Cardsharps — source 45.4, this grade 48.1, tint() 4.1.
 */
const GRADE = {
  saturation: 0.94,
  /** Per-channel multipliers and offsets: lift red, hold green, drop blue. */
  channelGain: [1.0, 0.995, 0.978],
  channelOffset: [2, 1, -2],
};

/** Master width. Covers the 1200px social card and the widest hero at 2x
 *  without shipping museum-scale files. */
const MASTER_WIDTH = 1600;
const QUALITY = 82;

const UA = "btcscam-picture-desk/1.0 (https://btcscam.com; desk@btcscam.com)";

function commonsUrl(file, width) {
  const name = file.replace(/^File:/, "").replace(/ /g, "_");
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=${width}`;
}

async function download(url, attempt = 0) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 20000) throw new Error(`suspiciously small: ${buf.length}b`);
    return buf;
  } catch (err) {
    if (attempt >= 3) throw err;
    const wait = 5000 * (attempt + 1);
    console.log(`    retry in ${wait / 1000}s (${err.message})`);
    await new Promise((r) => setTimeout(r, wait));
    return download(url, attempt + 1);
  }
}

/**
 * Import the registry itself rather than parsing it. Node strips the types at
 * load, so there is exactly one definition of what a plate is and the
 * pipeline cannot silently disagree with the site about which plates exist.
 * Requires --experimental-strip-types; `npm run plates` passes it.
 */
async function readRegistry() {
  const { PLATES } = await import(
    pathToFileURL(path.join(ROOT, "src", "lib", "plates.ts")).href
  );
  return Object.entries(PLATES).map(([key, p]) => ({ key, ...p }));
}

/** `sourceCrop` trims junk baked into a museum scan — a gilded frame, a
 *  gallery wall, a brass label. Expressed as percentages of the source:
 *  "left,top,width,height". */
async function applyCrop(img, crop) {
  const [l, t, w, h] = crop.split(",").map(Number);
  const meta = await img.metadata();
  return img.extract({
    left: Math.round((l / 100) * meta.width),
    top: Math.round((t / 100) * meta.height),
    width: Math.round((w / 100) * meta.width),
    height: Math.round((h / 100) * meta.height),
  });
}

/**
 * Mean per-pixel spread between colour channels. Zero is greyscale. Used as a
 * regression alarm on the grade — an earlier version of this pipeline used
 * sharp's tint(), which duotones, and quietly shipped every oil painting in
 * black and white until someone looked at a page.
 */
async function colourSpread(file) {
  const { data } = await sharp(file)
    .resize(40)
    .raw()
    .toBuffer({ resolveWithObject: true });
  let total = 0;
  let pixels = 0;
  for (let i = 0; i < data.length; i += 3) {
    total += Math.abs(data[i] - data[i + 1]) + Math.abs(data[i + 1] - data[i + 2]);
    pixels++;
  }
  return (total / pixels).toFixed(1);
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const only = args.filter((a) => !a.startsWith("--"));

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const plates = (await readRegistry()).filter(
    (p) => only.length === 0 || only.includes(p.key),
  );

  console.log(`${plates.length} plates in the registry\n`);
  let fetched = 0, skipped = 0;
  const failures = [];

  for (const plate of plates) {
    const out = path.join(OUT_DIR, `${plate.file}.jpg`);
    if (!force && fs.existsSync(out)) {
      skipped++;
      continue;
    }
    process.stdout.write(`  ${plate.key} … `);
    try {
      const buf = await download(commonsUrl(plate.commonsFile, 2400));
      let img = sharp(buf);
      if (plate.sourceCrop) img = await applyCrop(img, plate.sourceCrop);

      await img
        .resize({ width: MASTER_WIDTH, withoutEnlargement: true })
        .modulate({ saturation: GRADE.saturation })
        .linear(GRADE.channelGain, GRADE.channelOffset)
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toFile(out);

      const { width, height } = await sharp(out).metadata();
      const spread = await colourSpread(out);
      console.log(
        `${width}×${height}, ${Math.round(fs.statSync(out).size / 1024)}KB, colour ${spread}`,
      );
      // Low colour means one of two things, both worth stopping for: the
      // grade broke, or the "reproduction" is a conservation X-radiograph
      // rather than the painting. Commons is full of the latter. The lowest
      // legitimate plate in the archive is Rembrandt's Judas at 16.
      if (Number(spread) < 12) {
        console.log(
          `    ⚠ ${plate.key} has almost no colour (${spread}) — is this really the painting?`,
        );
      }
      fetched++;
      // Commons asks for gentle pacing; the desk obliges.
      await new Promise((r) => setTimeout(r, 3000));
    } catch (err) {
      console.log(`FAILED — ${err.message}`);
      failures.push({ key: plate.key, error: err.message });
    }
  }

  console.log(`\n${fetched} fetched, ${skipped} already on file, ${failures.length} failed`);
  if (failures.length) {
    for (const f of failures) console.log(`  ✗ ${f.key}: ${f.error}`);
    process.exitCode = 1;
  }
}

main();
