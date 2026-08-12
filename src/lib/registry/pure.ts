import type { Incident } from "@/lib/incidents";

/**
 * Pure registry logic — no fs, no network, no Node imports, so `node --test`
 * can exercise it directly and client code could import types safely.
 */

export type StepResult = { step: string; ok: boolean; detail: string };

/** Mirrors scripts/seed-incidents.mjs — the seed script stays authoritative
 *  for bulk reseeds; publish must enforce the same floor. */
export const REQUIRED_FIELDS = [
  "id",
  "slug",
  "title",
  "summary",
  "trustState",
  "severity",
  "categories",
  "firstObserved",
  "published",
  "lastUpdated",
  "actions",
  "sources",
] as const;

export function validateForPublish(doc: Record<string, unknown>): string[] {
  const problems: string[] = [];
  for (const key of REQUIRED_FIELDS) {
    if (doc[key] === undefined || doc[key] === null) {
      problems.push(`missing required field: ${key}`);
    }
  }
  if (!Array.isArray(doc.sources) || doc.sources.length === 0) {
    problems.push("no sources — no source, no publish");
  }
  return problems;
}

export function incidentToRow(doc: Incident): Record<string, unknown> {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    trust_state: doc.trustState,
    severity: doc.severity,
    categories: doc.categories,
    first_observed: doc.firstObserved,
    published: doc.published,
    last_updated: doc.lastUpdated,
    ongoing: doc.ongoing ?? false,
    data: doc,
  };
}

/** Published files are named by id (e.g. 2023-milk-sad-libbitcoin.json). */
export function publishedFileName(doc: Pick<Incident, "id">): string {
  return `${doc.id}.json`;
}

/** Draft files are named by bare slug. */
export function draftFileName(doc: Pick<Incident, "slug">): string {
  return `${doc.slug}.json`;
}

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Paths touched per `git status --porcelain`. Rename lines carry both sides.
 * Dossier filenames are plain slugs, so quoted-path handling is not needed.
 */
export function parsePorcelain(out: string): Set<string> {
  const changed = new Set<string>();
  for (const line of out.split("\n")) {
    if (line.trim().length === 0) continue;
    const rest = line.slice(3);
    const arrow = rest.indexOf(" -> ");
    if (arrow >= 0) {
      changed.add(rest.slice(0, arrow));
      changed.add(rest.slice(arrow + 4));
    } else {
      changed.add(rest);
    }
  }
  return changed;
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (a && b && typeof a === "object") {
    const ka = Object.keys(a as object).sort();
    const kb = Object.keys(b as object).sort();
    if (!deepEqual(ka, kb)) return false;
    return ka.every((k) =>
      deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
    );
  }
  return false;
}

export type DbRowLite = { lastUpdated: string | null; data: unknown } | null;
export type SyncBadge = { label: string; ok: boolean };

/**
 * Sync badges for a published dossier: DB presence/freshness plus git state.
 * lastUpdated is the cheap check; deep-equal catches a file edited without a
 * date bump.
 */
export function deriveSyncBadges(
  fileDoc: Incident,
  row: DbRowLite,
  uncommitted: boolean,
): SyncBadge[] {
  const badges: SyncBadge[] = [];
  if (!row) {
    badges.push({ label: "NOT IN DATABASE — seed pending", ok: false });
  } else if (row.lastUpdated !== fileDoc.lastUpdated) {
    badges.push({
      label: `DB DATE ${row.lastUpdated ?? "?"} ≠ FILE ${fileDoc.lastUpdated} — reseed`,
      ok: false,
    });
  } else if (!deepEqual(row.data, fileDoc)) {
    badges.push({ label: "DB CONTENT DIFFERS FROM FILE — reseed", ok: false });
  } else {
    badges.push({ label: "DB ✓ MATCHES FILE", ok: true });
  }
  badges.push(
    uncommitted
      ? { label: "UNCOMMITTED — push pending", ok: false }
      : { label: "COMMITTED ✓", ok: true },
  );
  return badges;
}
