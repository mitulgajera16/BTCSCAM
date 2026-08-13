import test from "node:test";
import assert from "node:assert/strict";
import {
  validateForPublish,
  incidentToRow,
  publishedFileName,
  draftFileName,
  parsePorcelain,
  deepEqual,
  deriveSyncBadges,
} from "../src/lib/registry/pure.ts";

const doc = {
  id: "2021-bitcoin-atm-impersonation-shakedowns",
  slug: "bitcoin-atm-impersonation-shakedowns",
  title: "T",
  summary: "S",
  trustState: "verified",
  severity: "S1",
  categories: ["impersonation"],
  firstObserved: "2021-11-04",
  published: "2026-08-11",
  lastUpdated: "2026-08-11",
  actions: ["a"],
  sources: [{ url: "https://x", publisher: "P", type: "regulator" }],
} as never;

test("filename mapping follows house convention", () => {
  assert.equal(publishedFileName(doc), "2021-bitcoin-atm-impersonation-shakedowns.json");
  assert.equal(draftFileName(doc), "bitcoin-atm-impersonation-shakedowns.json");
});

test("validateForPublish passes a complete case file", () => {
  assert.deepEqual(validateForPublish(doc as never), []);
});

test("validateForPublish names each missing field and empty sources", () => {
  const bad = { ...(doc as Record<string, unknown>) };
  delete bad.summary;
  bad.sources = [];
  const problems = validateForPublish(bad);
  assert.ok(problems.some((p) => p.includes("summary")));
  assert.ok(problems.some((p) => p.includes("no source, no publish")));
});

test("incidentToRow mirrors the seed script mapping", () => {
  const row = incidentToRow(doc);
  assert.equal(row.trust_state, "verified");
  assert.equal(row.first_observed, "2021-11-04");
  assert.equal(row.ongoing, false);
  assert.deepEqual(row.data, doc);
});

test("parsePorcelain reads plain and renamed entries", () => {
  const out = ' M data/incidents/a.json\nR  data/drafts/b.json -> data/incidents/b.json\n';
  const changed = parsePorcelain(out);
  assert.ok(changed.has("data/incidents/a.json"));
  assert.ok(changed.has("data/drafts/b.json"));
  assert.ok(changed.has("data/incidents/b.json"));
  assert.equal(parsePorcelain("").size, 0);
});

test("deepEqual handles nested structures", () => {
  assert.ok(deepEqual({ a: [1, { b: "c" }] }, { a: [1, { b: "c" }] }));
  assert.ok(!deepEqual({ a: [1] }, { a: [1, 2] }));
  assert.ok(!deepEqual({ a: 1 }, { a: "1" }));
});

test("deriveSyncBadges reports missing row, stale row, and git state", () => {
  const noRow = deriveSyncBadges(doc, null, false);
  assert.ok(noRow.some((b) => !b.ok && b.label.includes("NOT IN DATABASE")));

  const inSync = deriveSyncBadges(doc, { lastUpdated: "2026-08-11", data: doc }, false);
  assert.ok(inSync.every((b) => b.ok));

  // Supabase returns last_updated as timestamptz; the file stores a plain
  // date. Same day must count as in sync.
  const tzRow = deriveSyncBadges(
    doc,
    { lastUpdated: "2026-08-11T00:00:00+00:00", data: doc },
    false,
  );
  assert.ok(tzRow.every((b) => b.ok));

  const stale = deriveSyncBadges(doc, { lastUpdated: "2026-08-01", data: doc }, false);
  assert.ok(stale.some((b) => !b.ok));

  const uncommitted = deriveSyncBadges(doc, { lastUpdated: "2026-08-11", data: doc }, true);
  assert.ok(uncommitted.some((b) => !b.ok && b.label.includes("UNCOMMITTED")));
});
