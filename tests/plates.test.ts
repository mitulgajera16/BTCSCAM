/**
 * The picture desk's standing checks.
 *
 * These are the failures that would embarrass the publication rather than
 * crash it: a case file whose plate file was never fetched, two paintings
 * sharing an accession number, a story quietly running on a category fallback
 * nobody chose. None of them break a build on their own, which is exactly why
 * they need a test.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PLATES } from "../src/lib/plates.ts";
import { assignedKeys, coverFor } from "../src/lib/covers.ts";
import { getAllIncidents } from "../src/lib/incidents.ts";
import { LIVE_GUIDES } from "../src/lib/guides.ts";

const COVERS_DIR = path.join(process.cwd(), "public", "covers");

test("every plate has its image on disk", () => {
  for (const [key, plate] of Object.entries(PLATES)) {
    const file = path.join(COVERS_DIR, `${plate.file}.jpg`);
    assert.ok(
      fs.existsSync(file),
      `plate "${key}" has no image — run: npm run plates`,
    );
  }
});

test("recorded dimensions match the files on disk", async () => {
  // next/image reserves space from these, and the case file lead caps tall
  // plates by them. A stale number here is a page that jumps as it loads.
  const sharp = (await import("sharp")).default;
  for (const [key, plate] of Object.entries(PLATES)) {
    const file = path.join(COVERS_DIR, `${plate.file}.jpg`);
    if (!fs.existsSync(file)) continue;
    const { width, height } = await sharp(file).metadata();
    assert.equal(
      `${width}x${height}`,
      `${plate.width}x${plate.height}`,
      `"${key}" is recorded as ${plate.width}x${plate.height} but the file is ${width}x${height}`,
    );
  }
});

test("plate numbers are unique and stable", () => {
  const seen = new Map<number, string>();
  for (const [key, plate] of Object.entries(PLATES)) {
    const clash = seen.get(plate.no);
    assert.equal(
      clash,
      undefined,
      `plate No. ${plate.no} is used by both "${clash}" and "${key}" — numbers are permanent, assign a new one`,
    );
    seen.set(plate.no, key);
  }
});

test("no image file is shared by two plates", () => {
  const seen = new Map<string, string>();
  for (const [key, plate] of Object.entries(PLATES)) {
    const clash = seen.get(plate.file);
    assert.equal(
      clash,
      undefined,
      `"${key}" and "${clash}" both write ${plate.file}.jpg — one would overwrite the other`,
    );
    seen.set(plate.file, key);
  }
});

test("every published case file has a written assignment, not a fallback", () => {
  const written = new Set(assignedKeys());
  const missing = getAllIncidents()
    .filter((i) => !written.has(i.slug))
    .map((i) => i.slug);
  assert.deepEqual(
    missing,
    [],
    `these case files are running on a category fallback — write them an assignment in covers.ts: ${missing.join(", ")}`,
  );
});

test("every live guide has a written assignment", () => {
  const written = new Set(assignedKeys());
  const missing = LIVE_GUIDES.filter(
    (g) => !written.has(`guide:${g.slug}`),
  ).map((g) => g.slug);
  assert.deepEqual(missing, [], `guides without a plate: ${missing.join(", ")}`);
});

test("coverFor always returns a cover, even for an unknown story", () => {
  const orphan = coverFor("no-such-story-exists");
  assert.ok(orphan.src.startsWith("/covers/"));
  assert.ok(orphan.allegory.length > 0);
  assert.equal(orphan.isDefault, true);
});

test("an unassigned story falls back on its category, not the house plate", () => {
  const cover = coverFor("no-such-story-exists", ["malware"]);
  assert.equal(cover.plate.file, "trojan-horse");
  assert.equal(cover.isDefault, true);
});

test("allegory lines stay caption-length", () => {
  // Long enough to argue, short enough to read under a plate. Past ~200
  // characters the caption starts competing with the story's own lede.
  for (const key of assignedKeys()) {
    const { allegory } = coverFor(key);
    assert.ok(
      allegory.length <= 200,
      `allegory for "${key}" is ${allegory.length} chars — tighten it under 200`,
    );
  }
});

test("credit lines carry artist and collection, never a bare title", () => {
  // Two plates are titled "The Fortune Teller" and two are by Caravaggio, so
  // a title-only credit would read as the same plate reused.
  const byTitle = new Map<string, string[]>();
  for (const plate of Object.values(PLATES)) {
    byTitle.set(plate.painting, [
      ...(byTitle.get(plate.painting) ?? []),
      `${plate.artist} · ${plate.collection}`,
    ]);
  }
  for (const [title, credits] of byTitle) {
    assert.equal(
      new Set(credits).size,
      credits.length,
      `two plates titled "${title}" share an artist and collection — readers cannot tell them apart`,
    );
  }
});
