# Registry Desk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A local-only `/desk/registry` page that shows file-based dossiers as DRAFTS vs PUBLISHED and gives one-click publish (validate → date → move file → seed Supabase → revalidate → commit → push) and back-to-draft (the reverse), per the approved spec at `docs/superpowers/specs/2026-08-12-registry-desk-design.md`.

**Architecture:** Pure, unit-testable logic in `src/lib/registry/pure.ts` + `review-flags.ts`; server-only fs/git/DB wrappers in `src/lib/registry/fs-state.ts` + `publish.ts`; thin server actions in `src/app/desk/registry/actions.ts`; client cards in `src/components/desk/registry/`; page at `src/app/desk/registry/page.tsx`. The filesystem is the state store — draft = file in `data/drafts/`, published = file in `data/incidents/`.

**Tech Stack:** Next.js 16.3 App Router (server actions, `useActionState`, `revalidateTag(tag, "max")` — two-arg form, the one-arg form is deprecated in this version), Supabase JS service client via `@/lib/db`, Node built-ins (`node:fs/promises`, `node:child_process`), `node --test` with native TS type-stripping (local Node is v25.8.1).

## Global Constraints

- No new npm dependencies. Tests use Node's built-in `node:test`.
- House copy style: ALL-CAPS mono labels, plain-language failures, "EVERY PUBLISH IS A HUMAN DECISION". No italics anywhere (site-wide rule).
- Every server action re-verifies auth itself (Basic auth via `verifyEditorAuth` OR mod session via `getModActor`) — never trust that the proxy ran.
- Local gate everywhere: page renders `notFound()` and actions refuse unless `NODE_ENV === "development"` AND `data/` is writable.
- `revalidateTag("incidents", "max")` + `revalidatePath("/", "page")` + `revalidatePath("/scam/<slug>", "page")` — exactly the desk's existing call style (see `src/app/desk/actions.ts`).
- Client-consumed files must have no Node imports (house rule from `src/components/desk/types.ts`).
- Filenames: published = `<id>.json` (id = `<firstObserved-year>-<slug>`, verified against all 3 live files), draft = `<slug>.json`.
- Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Test infra + pure registry helpers

**Files:**
- Modify: `package.json` (add `test` script)
- Modify: `tsconfig.json` (add `"allowImportingTsExtensions": true` — legal because `noEmit` is already true; lets test files import `.ts` paths, which Node's type-stripping requires)
- Create: `src/lib/registry/pure.ts`
- Test: `tests/registry-pure.test.ts`

**Interfaces:**
- Produces: `StepResult`, `REQUIRED_FIELDS`, `validateForPublish(doc): string[]`, `incidentToRow(doc): Record<string, unknown>`, `publishedFileName(doc): string`, `draftFileName(doc): string`, `todayUTC(): string`, `parsePorcelain(out): Set<string>`, `deepEqual(a, b): boolean`, `deriveSyncBadges(fileDoc, row, uncommitted): SyncBadge[]`, types `DbRowLite`, `SyncBadge`.

- [ ] **Step 1: Add the test script and tsconfig option**

In `package.json` scripts:

```json
"test": "node --test tests/"
```

In `tsconfig.json` compilerOptions, after `"noEmit": true,`:

```json
"allowImportingTsExtensions": true,
```

- [ ] **Step 2: Write the failing test**

Create `tests/registry-pure.test.ts`:

```ts
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

test("validateForPublish passes a complete dossier", () => {
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

  const stale = deriveSyncBadges(doc, { lastUpdated: "2026-08-01", data: doc }, false);
  assert.ok(stale.some((b) => !b.ok));

  const uncommitted = deriveSyncBadges(doc, { lastUpdated: "2026-08-11", data: doc }, true);
  assert.ok(uncommitted.some((b) => !b.ok && b.label.includes("UNCOMMITTED")));
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot find module `../src/lib/registry/pure.ts`

- [ ] **Step 4: Write the implementation**

Create `src/lib/registry/pure.ts`:

```ts
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: all tests in `tests/registry-pure.test.ts` PASS

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json src/lib/registry/pure.ts tests/registry-pure.test.ts
git commit -m "registry desk: pure helpers (validation, row mapping, filenames, sync badges) + node:test infra

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Review-flags parser

**Files:**
- Create: `src/lib/registry/review-flags.ts`
- Test: `tests/registry-review-flags.test.ts`

**Interfaces:**
- Produces: `parseReviewFlags(markdown: string): Map<string, string[]>` — keyed by draft file name (e.g. `bitcoin-atm-impersonation-shakedowns.json`), values are "Check before approving" checklist items.

- [ ] **Step 1: Write the failing test**

Create `tests/registry-review-flags.test.ts` (fixture mirrors the real structure of `docs/review/wave1-dossiers-review.md`):

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { parseReviewFlags } from "../src/lib/registry/review-flags.ts";

const FIXTURE = `# Wave-1 Seed Dossiers — Review Queue

Intro table here.

---

## 1. First dossier headline

**File:** \`data/drafts/first-dossier.json\` · trustState \`verified\` · S1 · categories: impersonation

**Verifier's one-liner:** fine.

**Check before approving:**
- [ ] Confirm the statute from the official source before publish.
- [ ] Archive captures pending for two URLs.

---

## 2. Second dossier headline

**File:** \`data/drafts/second-dossier.json\` · trustState \`resolved\` · S4

No checklist section in this one.

---
`;

test("parses checklist items keyed by draft file name", () => {
  const flags = parseReviewFlags(FIXTURE);
  assert.deepEqual(flags.get("first-dossier.json"), [
    "Confirm the statute from the official source before publish.",
    "Archive captures pending for two URLs.",
  ]);
});

test("a dossier section without a checklist maps to an empty list", () => {
  const flags = parseReviewFlags(FIXTURE);
  assert.deepEqual(flags.get("second-dossier.json"), []);
});

test("garbage input yields an empty map, never a throw", () => {
  assert.equal(parseReviewFlags("").size, 0);
  assert.equal(parseReviewFlags("# nothing relevant\n---\nplain text").size, 0);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot find module `../src/lib/registry/review-flags.ts`

- [ ] **Step 3: Write the implementation**

Create `src/lib/registry/review-flags.ts`:

```ts
/**
 * Tolerant parser for docs/review/*-review.md. Convention (wave 1 sets it):
 * dossier sections are separated by --- rules, each carries a
 * **File:** `data/drafts/<name>.json` line and, usually, a
 * "**Check before approving:**" checkbox list. Anything that does not match
 * is skipped — a malformed review doc must never break the registry desk.
 */
export function parseReviewFlags(markdown: string): Map<string, string[]> {
  const flags = new Map<string, string[]>();
  for (const section of markdown.split(/\n---\n/)) {
    const fileMatch = section.match(/\*\*File:\*\*\s*`data\/drafts\/([^`]+)`/);
    if (!fileMatch) continue;
    const name = fileMatch[1];
    const checkIdx = section.indexOf("**Check before approving:**");
    if (checkIdx < 0) {
      flags.set(name, []);
      continue;
    }
    const items: string[] = [];
    for (const line of section.slice(checkIdx).split("\n")) {
      const m = line.match(/^\s*-\s*\[\s*[xX ]?\s*\]\s*(.+)$/);
      if (m) items.push(m[1].trim());
    }
    flags.set(name, items);
  }
  return flags;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (both test files)

- [ ] **Step 5: Sanity-check against the real review doc**

Run:

```bash
node --input-type=module -e "
import { readFileSync } from 'node:fs';
import { parseReviewFlags } from './src/lib/registry/review-flags.ts';
const m = parseReviewFlags(readFileSync('docs/review/wave1-dossiers-review.md','utf-8'));
console.log('sections parsed:', m.size);
for (const [k, v] of m) console.log(k, v.length);
"
```

Expected: `sections parsed: 12`, each of the 12 draft file names with its flag count (per the review doc's table: 5, 6, 6, 5, 5, 6, 4, 7, 6, 6, 6, 5 — order by section). If counts are off, fix the parser, not the doc.

- [ ] **Step 6: Commit**

```bash
git add src/lib/registry/review-flags.ts tests/registry-review-flags.test.ts
git commit -m "registry desk: review-flags parser for docs/review checklists

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Server fs state + local gate

**Files:**
- Create: `src/lib/registry/fs-state.ts`

**Interfaces:**
- Consumes: `parseReviewFlags` from Task 2.
- Produces: `isLocalRegistry(): Promise<boolean>`, `DRAFTS_DIR`, `INCIDENTS_DIR`, `RegistryFile = { fileName: string; doc: Incident; parseError?: string }`, `listDrafts(): Promise<RegistryFile[]>`, `listPublished(): Promise<RegistryFile[]>`, `loadReviewFlags(): Promise<Map<string, string[]>>`.

This file is a thin fs wrapper over tested pure logic — covered by the Task 8 walkthrough, not unit tests.

- [ ] **Step 1: Write the implementation**

Create `src/lib/registry/fs-state.ts`:

```ts
import "server-only";

import { access, constants, readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { Incident } from "@/lib/incidents";
import { parseReviewFlags } from "./review-flags";

const ROOT = process.cwd();
export const DRAFTS_DIR = path.join(ROOT, "data", "drafts");
export const INCIDENTS_DIR = path.join(ROOT, "data", "incidents");
const REVIEW_DIR = path.join(ROOT, "docs", "review");

/**
 * The registry desk mutates the working tree, so it exists ONLY on a local
 * dev server: next dev (NODE_ENV=development) with a writable data/ dir.
 * On Vercel both conditions fail and the page 404s like any unauthorized
 * desk hit. Fail closed.
 */
export async function isLocalRegistry(): Promise<boolean> {
  if (process.env.NODE_ENV !== "development") return false;
  try {
    await access(DRAFTS_DIR, constants.W_OK);
    await access(INCIDENTS_DIR, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export type RegistryFile = {
  fileName: string;
  doc: Incident;
  parseError?: string;
};

async function readIncidentDir(dir: string): Promise<RegistryFile[]> {
  let names: string[];
  try {
    names = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
  } catch {
    return [];
  }
  const out: RegistryFile[] = [];
  for (const fileName of names) {
    try {
      const doc = JSON.parse(
        await readFile(path.join(dir, fileName), "utf-8"),
      ) as Incident;
      out.push({ fileName, doc });
    } catch (err) {
      // A broken JSON file still shows up — with its error, never silently.
      out.push({
        fileName,
        doc: { slug: fileName.replace(/\.json$/, "") } as Incident,
        parseError: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return out;
}

export function listDrafts(): Promise<RegistryFile[]> {
  return readIncidentDir(DRAFTS_DIR);
}

export function listPublished(): Promise<RegistryFile[]> {
  return readIncidentDir(INCIDENTS_DIR);
}

/** Merge every docs/review/*-review.md checklist, later files winning. */
export async function loadReviewFlags(): Promise<Map<string, string[]>> {
  const merged = new Map<string, string[]>();
  let names: string[] = [];
  try {
    names = (await readdir(REVIEW_DIR)).filter((f) => f.endsWith("-review.md")).sort();
  } catch {
    return merged;
  }
  for (const name of names) {
    try {
      const parsed = parseReviewFlags(
        await readFile(path.join(REVIEW_DIR, name), "utf-8"),
      );
      for (const [k, v] of parsed) merged.set(k, v);
    } catch {
      // tolerant: a bad review doc never breaks the desk
    }
  }
  return merged;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/registry/fs-state.ts
git commit -m "registry desk: fs state readers + local-only gate

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Publish/unpublish pipeline

**Files:**
- Create: `src/lib/registry/publish.ts`

**Interfaces:**
- Consumes: Task 1 pure helpers; Task 3 `DRAFTS_DIR`/`INCIDENTS_DIR`/`listPublished`/`listDrafts`; `getServiceClient`, `hasServiceRole` from `@/lib/db`.
- Produces: `publishDossier(slug: string): Promise<StepResult[]>`, `unpublishDossier(slug: string): Promise<StepResult[]>`, `changedDataPaths(): Promise<Set<string> | null>` (null = git itself failed).

- [ ] **Step 1: Write the implementation**

Create `src/lib/registry/publish.ts`:

```ts
import "server-only";

import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { revalidatePath, revalidateTag } from "next/cache";

import { getServiceClient, hasServiceRole } from "@/lib/db";
import type { Incident } from "@/lib/incidents";
import {
  draftFileName,
  incidentToRow,
  parsePorcelain,
  publishedFileName,
  todayUTC,
  validateForPublish,
  type StepResult,
} from "./pure";
import { DRAFTS_DIR, INCIDENTS_DIR, listDrafts, listPublished } from "./fs-state";

const run = promisify(execFile);
const ROOT = process.cwd();

async function git(...args: string[]): Promise<string> {
  const { stdout } = await run("git", args, { cwd: ROOT });
  return stdout;
}

/** data/ paths with uncommitted changes; null when git itself errored. */
export async function changedDataPaths(): Promise<Set<string> | null> {
  try {
    return parsePorcelain(await git("status", "--porcelain", "--", "data/"));
  } catch {
    return null;
  }
}

function fail(steps: StepResult[], step: string, err: unknown): StepResult[] {
  steps.push({
    step,
    ok: false,
    detail: err instanceof Error ? err.message : String(err),
  });
  return steps;
}

function revalidateIncident(slug: string): void {
  // Exactly the desk's style (src/app/desk/actions.ts): tag with the "max"
  // profile — the one-arg form is deprecated in this Next version.
  revalidateTag("incidents", "max");
  revalidatePath("/", "page");
  revalidatePath(`/scam/${slug}`, "page");
  revalidatePath("/registry", "page");
}

/**
 * Shared tail for publish and unpublish: commit whatever changed under
 * data/ and push. Both steps skip themselves when there is nothing to do,
 * which is what makes retries safe.
 */
async function commitAndPush(steps: StepResult[], message: string): Promise<void> {
  try {
    await git("add", "-A", "--", "data/");
    const pending = await git("status", "--porcelain", "--", "data/");
    if (pending.trim().length === 0) {
      steps.push({ step: "commit", ok: true, detail: "nothing to commit — already committed" });
    } else {
      await git(
        "commit",
        "-m",
        `${message}\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>`,
        "--",
        "data/",
      );
      steps.push({ step: "commit", ok: true, detail: message });
    }
  } catch (err) {
    fail(steps, "commit", err);
    return; // no commit, nothing to push
  }
  try {
    const ahead = (await git("rev-list", "--count", "@{u}..HEAD")).trim();
    if (ahead === "0") {
      steps.push({ step: "push", ok: true, detail: "nothing to push" });
      return;
    }
    await git("push");
    steps.push({
      step: "push",
      ok: true,
      detail: `pushed ${ahead} commit(s) — Vercel deploy follows`,
    });
  } catch (err) {
    fail(steps, "push", err);
  }
}

async function seedRow(steps: StepResult[], doc: Incident): Promise<void> {
  if (!hasServiceRole()) {
    fail(steps, "seed", "no Supabase service key in this environment");
    return;
  }
  const { error } = await getServiceClient()
    .from("incidents")
    .upsert(incidentToRow(doc), { onConflict: "id" });
  if (error) fail(steps, "seed", error.message);
  else steps.push({ step: "seed", ok: true, detail: `row ${doc.id} upserted — prod serves it within ~5 min` });
}

/**
 * The one-click publish pipeline. Idempotent: a retry after a partial
 * failure finds the file already dated/moved and completes only what is
 * missing. Hard-stops only when there is nothing valid to publish.
 */
export async function publishDossier(slug: string): Promise<StepResult[]> {
  const steps: StepResult[] = [];

  // Locate: fresh publish reads the draft; retry finds it already moved.
  const draftPath = path.join(DRAFTS_DIR, `${slug}.json`);
  let doc: Incident | null = null;
  let alreadyMoved = false;
  try {
    doc = JSON.parse(await readFile(draftPath, "utf-8")) as Incident;
  } catch {
    for (const f of await listPublished()) {
      if (f.doc.slug === slug && !f.parseError) {
        doc = f.doc;
        alreadyMoved = true;
        break;
      }
    }
  }
  if (!doc) {
    return fail(steps, "validate", `no dossier with slug "${slug}" in data/drafts or data/incidents`);
  }

  const problems = validateForPublish(doc as unknown as Record<string, unknown>);
  if (problems.length > 0) {
    return fail(steps, "validate", problems.join("; "));
  }
  steps.push({ step: "validate", ok: true, detail: "required fields + sources present" });

  if (alreadyMoved) {
    steps.push({ step: "date", ok: true, detail: `already moved — published stays ${doc.published}` });
    steps.push({ step: "move", ok: true, detail: `already at data/incidents/${publishedFileName(doc)}` });
  } else {
    const today = todayUTC();
    doc.published = today;
    doc.lastUpdated = today;
    try {
      await writeFile(draftPath, JSON.stringify(doc, null, 2) + "\n", "utf-8");
      steps.push({ step: "date", ok: true, detail: `published + lastUpdated set to ${today}` });
    } catch (err) {
      return fail(steps, "date", err);
    }
    try {
      await rename(draftPath, path.join(INCIDENTS_DIR, publishedFileName(doc)));
      steps.push({ step: "move", ok: true, detail: `→ data/incidents/${publishedFileName(doc)}` });
    } catch (err) {
      return fail(steps, "move", err);
    }
  }

  await seedRow(steps, doc);
  revalidateIncident(slug);
  steps.push({ step: "revalidate", ok: true, detail: "incidents tag + front page + /scam page" });
  await commitAndPush(steps, `publish dossier ${slug}`);
  return steps;
}

/**
 * Back to draft: DB row out first (prod drops it inside the 5-min cache
 * window), file back to data/drafts/, then commit + push — the page is fully
 * off-site only when that deploy lands, because the previous bundle still
 * contains the file. Same idempotency contract as publish.
 */
export async function unpublishDossier(slug: string): Promise<StepResult[]> {
  const steps: StepResult[] = [];

  let doc: Incident | null = null;
  let publishedPath: string | null = null;
  for (const f of await listPublished()) {
    if (f.doc.slug === slug && !f.parseError) {
      doc = f.doc;
      publishedPath = path.join(INCIDENTS_DIR, f.fileName);
      break;
    }
  }
  let alreadyMovedBack = false;
  if (!doc) {
    for (const f of await listDrafts()) {
      if (f.doc.slug === slug && !f.parseError) {
        doc = f.doc;
        alreadyMovedBack = true;
        break;
      }
    }
  }
  if (!doc) {
    return fail(steps, "remove-db", `no dossier with slug "${slug}" found on disk`);
  }

  if (!hasServiceRole()) {
    fail(steps, "remove-db", "no Supabase service key in this environment");
  } else {
    const { error } = await getServiceClient().from("incidents").delete().eq("id", doc.id);
    if (error) fail(steps, "remove-db", error.message);
    else steps.push({ step: "remove-db", ok: true, detail: `row ${doc.id} deleted — prod drops it within ~5 min` });
  }

  if (alreadyMovedBack) {
    steps.push({ step: "move-back", ok: true, detail: `already at data/drafts/${draftFileName(doc)}` });
  } else {
    try {
      await rename(publishedPath!, path.join(DRAFTS_DIR, draftFileName(doc)));
      steps.push({ step: "move-back", ok: true, detail: `→ data/drafts/${draftFileName(doc)}` });
    } catch (err) {
      return fail(steps, "move-back", err);
    }
  }

  revalidateIncident(slug);
  steps.push({ step: "revalidate", ok: true, detail: "incidents tag + front page + /scam page" });
  await commitAndPush(steps, `unpublish dossier ${slug} — back to draft`);
  return steps;
}
```

- [ ] **Step 2: Type-check and run existing tests**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors, tests still PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/registry/publish.ts
git commit -m "registry desk: idempotent publish/unpublish pipelines (file + db + git)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Client-safe types + server actions

**Files:**
- Create: `src/components/desk/registry/types.ts`
- Create: `src/app/desk/registry/actions.ts`

**Interfaces:**
- Consumes: `isLocalRegistry` (Task 3), `publishDossier`/`unpublishDossier` (Task 4), `verifyEditorAuth`/`getModActor` from `@/components/desk/auth`.
- Produces: `RegistryActionState`, `StepView`, `DraftView`, `PublishedView`, `DbOnlyView` (types.ts — NO Node imports, client-consumed); `publishAction(prev, formData)`, `unpublishAction(prev, formData)` — both `useActionState`-shaped.

- [ ] **Step 1: Write the types**

Create `src/components/desk/registry/types.ts`:

```ts
/**
 * Registry desk view types. No Node imports — client components consume
 * this file (house rule, see src/components/desk/types.ts).
 */

export type StepView = { step: string; ok: boolean; detail: string };

export type RegistryActionState = {
  ok: boolean;
  steps: StepView[];
  error: string | null;
};

export type DraftView = {
  slug: string;
  fileName: string;
  title: string;
  trustState: string;
  severity: string;
  categories: string[];
  flags: string[];
  sourceCount: number;
  parseError: string | null;
};

export type PublishedView = {
  slug: string;
  id: string;
  title: string;
  publishedDate: string;
  badges: { label: string; ok: boolean }[];
};

export type DbOnlyView = { id: string; slug: string; title: string };

/** The pipeline shown in the confirm panel — mirrors publish.ts step order. */
export const PUBLISH_PIPELINE = [
  "validate schema + sources",
  "set published date to today",
  "move file to data/incidents/",
  "seed Supabase row (prod live within ~5 min)",
  "revalidate caches",
  "git commit + push (Vercel deploys)",
] as const;

export const UNPUBLISH_PIPELINE = [
  "delete Supabase row (prod drops it within ~5 min)",
  "move file back to data/drafts/",
  "revalidate caches",
  "git commit + push (deploy clears the bundled copy)",
] as const;
```

- [ ] **Step 2: Write the actions**

Create `src/app/desk/registry/actions.ts`:

```ts
"use server";

import { headers } from "next/headers";

import { getModActor, verifyEditorAuth } from "@/components/desk/auth";
import type { RegistryActionState } from "@/components/desk/registry/types";
import { isLocalRegistry } from "@/lib/registry/fs-state";
import { publishDossier, unpublishDossier } from "@/lib/registry/publish";

// Registry actions mutate the working tree. Two gates, both re-verified here
// because server actions are directly POST-reachable:
//   1. local-only — dev server with writable data/, refuses anywhere else
//   2. desk auth — editor Basic auth OR mod session, same as every desk action

async function requireLocalDesk(): Promise<string | null> {
  if (!(await isLocalRegistry())) {
    return "REGISTRY IS LOCAL-ONLY — this action runs only on a local dev server with a writable data/ directory.";
  }
  const h = await headers();
  if (verifyEditorAuth(h.get("authorization"))) return null;
  if (await getModActor()) return null;
  return "NOT AUTHORIZED — desk credentials required.";
}

function refused(error: string): RegistryActionState {
  return { ok: false, steps: [], error };
}

export async function publishAction(
  _prev: RegistryActionState | null,
  formData: FormData,
): Promise<RegistryActionState> {
  const denied = await requireLocalDesk();
  if (denied) return refused(denied);
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return refused("missing slug");
  const steps = await publishDossier(slug);
  const ok = steps.every((s) => s.ok);
  return {
    ok,
    steps,
    error: ok ? null : "some steps failed — completed steps skip themselves, so fixing the cause and clicking again finishes the job",
  };
}

export async function unpublishAction(
  _prev: RegistryActionState | null,
  formData: FormData,
): Promise<RegistryActionState> {
  const denied = await requireLocalDesk();
  if (denied) return refused(denied);
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return refused("missing slug");
  const steps = await unpublishDossier(slug);
  const ok = steps.every((s) => s.ok);
  return {
    ok,
    steps,
    error: ok ? null : "some steps failed — completed steps skip themselves, so fixing the cause and clicking again finishes the job",
  };
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/desk/registry/types.ts src/app/desk/registry/actions.ts
git commit -m "registry desk: client-safe view types + gated publish/unpublish server actions

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Client components

**Files:**
- Create: `src/components/desk/registry/RegistryDraftCard.tsx`
- Create: `src/components/desk/registry/RegistryPublishedRow.tsx`

**Interfaces:**
- Consumes: `publishAction`/`unpublishAction` (Task 5), types (Task 5), styles from `../ui` (`mono`, `display`, `capsLabel`, `button`, `buttonQuiet`, `buttonDanger`, `resultStyle`).
- Produces: `<RegistryDraftCard draft={DraftView} />`, `<RegistryPublishedRow row={PublishedView} />`.

Confirm UX is a two-step arm/confirm panel inside the card (house idiom — no browser popups): PUBLISH arms it, the panel lists the pipeline + unresolved flags, CONFIRM submits the form, CANCEL disarms.

- [ ] **Step 1: Write RegistryDraftCard**

Create `src/components/desk/registry/RegistryDraftCard.tsx`:

```tsx
"use client";

import { useActionState, useState } from "react";

import { publishAction } from "@/app/desk/registry/actions";
import {
  PUBLISH_PIPELINE,
  type DraftView,
  type RegistryActionState,
} from "./types";
import { button, buttonQuiet, capsLabel, display, mono, resultStyle } from "../ui";

function StepList({ state }: { state: RegistryActionState }) {
  return (
    <div style={resultStyle(state.ok)}>
      {state.steps.map((s) => (
        <div key={s.step}>
          {s.ok ? "OK     " : "FAILED "}
          {s.step.toUpperCase()} — {s.detail}
        </div>
      ))}
      {state.error ? <div>{state.error}</div> : null}
    </div>
  );
}

export default function RegistryDraftCard({ draft }: { draft: DraftView }) {
  const [state, formAction, pending] = useActionState(publishAction, null);
  const [armed, setArmed] = useState(false);
  const published = state?.ok ?? false;

  return (
    <article
      style={{
        border: "1px solid var(--rule)",
        padding: "16px 20px",
        marginTop: 12,
        background: "var(--paper)",
        ...(published ? { opacity: 0.55 } : {}),
      }}
    >
      <div style={{ ...mono, fontSize: 12, color: "var(--meta)", display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span>{draft.fileName}</span>
        <span>{draft.trustState.toUpperCase()}</span>
        <span>{draft.severity}</span>
        <span>{draft.sourceCount} SOURCES</span>
      </div>
      <h3 style={{ ...display, fontSize: 20, margin: "8px 0 4px" }}>{draft.title}</h3>
      <p style={{ ...mono, fontSize: 12, color: "var(--meta)", margin: 0 }}>
        {draft.categories.join(", ")}
      </p>

      {draft.parseError ? (
        <p style={resultStyle(false)}>BROKEN JSON — {draft.parseError}</p>
      ) : null}

      <details style={{ borderTop: "1px solid var(--rule)", marginTop: 12, padding: "10px 0 0" }}>
        <summary style={{ ...capsLabel, cursor: "pointer", color: "var(--link)" }}>
          CHECK BEFORE APPROVING · {draft.flags.length}
        </summary>
        {draft.flags.length === 0 ? (
          <p style={{ ...mono, fontSize: 12, color: "var(--meta)" }}>
            No review notes found for this dossier.
          </p>
        ) : (
          <ul style={{ ...mono, fontSize: 12, lineHeight: 1.6, paddingLeft: 18, margin: "10px 0 0" }}>
            {draft.flags.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
      </details>

      {!armed && !published ? (
        <button
          type="button"
          style={{ ...button, marginTop: 12 }}
          disabled={pending || Boolean(draft.parseError)}
          onClick={() => setArmed(true)}
        >
          PUBLISH
        </button>
      ) : null}

      {armed && !published ? (
        <div style={{ borderTop: "2px solid var(--ink)", marginTop: 12, paddingTop: 12 }}>
          <p style={{ ...capsLabel, margin: 0 }}>THIS WILL, IN ORDER:</p>
          <ol style={{ ...mono, fontSize: 12, lineHeight: 1.6, paddingLeft: 18, margin: "8px 0" }}>
            {PUBLISH_PIPELINE.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {draft.flags.length > 0 ? (
            <p style={{ ...mono, fontSize: 12, color: "var(--danger)", margin: "8px 0" }}>
              {draft.flags.length} REVIEW FLAG(S) STILL LISTED ABOVE — publishing anyway is
              safe but weaker. This is a warning, not a blocker.
            </p>
          ) : null}
          <form action={formAction} style={{ display: "inline-flex", gap: 8 }}>
            <input type="hidden" name="slug" value={draft.slug} />
            <button type="submit" style={button} disabled={pending}>
              {pending ? "PUBLISHING…" : "CONFIRM PUBLISH"}
            </button>
            <button type="button" style={buttonQuiet} disabled={pending} onClick={() => setArmed(false)}>
              CANCEL
            </button>
          </form>
        </div>
      ) : null}

      {state ? <StepList state={state} /> : null}
      {published ? (
        <p style={{ ...capsLabel, marginTop: 8 }}>
          PUBLISHED — refresh the page to see it under PUBLISHED with sync badges.
        </p>
      ) : null}
    </article>
  );
}
```

- [ ] **Step 2: Write RegistryPublishedRow**

Create `src/components/desk/registry/RegistryPublishedRow.tsx`:

```tsx
"use client";

import { useActionState, useState } from "react";

import { unpublishAction } from "@/app/desk/registry/actions";
import {
  UNPUBLISH_PIPELINE,
  type PublishedView,
  type RegistryActionState,
} from "./types";
import { buttonDanger, buttonQuiet, capsLabel, display, mono, resultStyle } from "../ui";

function StepList({ state }: { state: RegistryActionState }) {
  return (
    <div style={resultStyle(state.ok)}>
      {state.steps.map((s) => (
        <div key={s.step}>
          {s.ok ? "OK     " : "FAILED "}
          {s.step.toUpperCase()} — {s.detail}
        </div>
      ))}
      {state.error ? <div>{state.error}</div> : null}
    </div>
  );
}

export default function RegistryPublishedRow({ row }: { row: PublishedView }) {
  const [state, formAction, pending] = useActionState(unpublishAction, null);
  const [armed, setArmed] = useState(false);
  const pulled = state?.ok ?? false;

  return (
    <article
      style={{
        border: "1px solid var(--rule)",
        padding: "14px 20px",
        marginTop: 12,
        background: "var(--paper)",
        ...(pulled ? { opacity: 0.55 } : {}),
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ ...display, fontSize: 18, margin: 0 }}>{row.title}</h3>
          <p style={{ ...mono, fontSize: 12, color: "var(--meta)", margin: "4px 0 0" }}>
            PUBLISHED {row.publishedDate} · {row.id}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
          <a
            href={`/scam/${row.slug}`}
            target="_blank"
            rel="noreferrer"
            style={{ ...buttonQuiet, textDecoration: "none", display: "inline-block" }}
          >
            VIEW LIVE
          </a>
          {!armed && !pulled ? (
            <button type="button" style={buttonDanger} disabled={pending} onClick={() => setArmed(true)}>
              BACK TO DRAFT
            </button>
          ) : null}
        </div>
      </div>

      <div style={{ ...mono, fontSize: 11, fontWeight: 600, letterSpacing: ".05em", display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10 }}>
        {row.badges.map((b) => (
          <span key={b.label} style={{ color: b.ok ? "var(--ink)" : "var(--danger)" }}>
            {b.label}
          </span>
        ))}
      </div>

      {armed && !pulled ? (
        <div style={{ borderTop: "2px solid var(--danger)", marginTop: 12, paddingTop: 12 }}>
          <p style={{ ...capsLabel, margin: 0 }}>THIS WILL, IN ORDER:</p>
          <ol style={{ ...mono, fontSize: 12, lineHeight: 1.6, paddingLeft: 18, margin: "8px 0" }}>
            {UNPUBLISH_PIPELINE.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p style={{ ...mono, fontSize: 12, color: "var(--danger)", margin: "8px 0" }}>
            THE PAGE IS FULLY OFF-SITE ONLY WHEN THE DEPLOY LANDS — until then the
            previous bundle still contains the file.
          </p>
          <form action={formAction} style={{ display: "inline-flex", gap: 8 }}>
            <input type="hidden" name="slug" value={row.slug} />
            <button type="submit" style={buttonDanger} disabled={pending}>
              {pending ? "PULLING…" : "CONFIRM BACK TO DRAFT"}
            </button>
            <button type="button" style={buttonQuiet} disabled={pending} onClick={() => setArmed(false)}>
              CANCEL
            </button>
          </form>
        </div>
      ) : null}

      {state ? <StepList state={state} /> : null}
      {pulled ? (
        <p style={{ ...capsLabel, marginTop: 8 }}>
          BACK IN DRAFTS — refresh the page to see it under DRAFTS.
        </p>
      ) : null}
    </article>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/desk/registry/
git commit -m "registry desk: draft card + published row with arm/confirm panels

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: The page + desk link

**Files:**
- Create: `src/app/desk/registry/page.tsx`
- Modify: `src/app/desk/page.tsx` (header links block — add a REGISTRY link, dev only)

**Interfaces:**
- Consumes: everything above; `getServiceClient`/`hasServiceRole` from `@/lib/db`; `deriveSyncBadges`, `changedDataPaths`; `notFound` from `next/navigation`.

- [ ] **Step 1: Write the page**

Create `src/app/desk/registry/page.tsx`:

```tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";

import { getModActor, verifyEditorAuth } from "@/components/desk/auth";
import RegistryDraftCard from "@/components/desk/registry/RegistryDraftCard";
import RegistryPublishedRow from "@/components/desk/registry/RegistryPublishedRow";
import type {
  DbOnlyView,
  DraftView,
  PublishedView,
} from "@/components/desk/registry/types";
import { getServiceClient, hasServiceRole } from "@/lib/db";
import {
  isLocalRegistry,
  listDrafts,
  listPublished,
  loadReviewFlags,
} from "@/lib/registry/fs-state";
import { changedDataPaths } from "@/lib/registry/publish";
import { deriveSyncBadges, type DbRowLite } from "@/lib/registry/pure";

// The Registry — local-only lifecycle desk for file-based dossiers.
// Draft = data/drafts/, published = data/incidents/; publish and back-to-
// draft move files, seed/clear Supabase, and commit — so this page exists
// ONLY on a local dev server (isLocalRegistry) and 404s everywhere else,
// exactly like an unauthorized desk hit. A review queue must never show a
// cached yesterday: always rendered fresh.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Registry · The Desk — BTCSCAM",
  description: "Local-only dossier lifecycle desk. Every publish is a human decision.",
  robots: { index: false, follow: false },
};

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif" };

const sectionHead = {
  ...mono,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: ".05em",
  borderBottom: "2px solid var(--ink)",
  paddingBottom: 8,
  marginTop: 40,
} as const;

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ ...mono, fontSize: 12, color: "var(--meta)", marginTop: 16 }}>
      {children}
    </p>
  );
}

type DbIncidentRow = {
  id: string;
  slug: string;
  title: string;
  last_updated: string | null;
  data: unknown;
};

async function loadDbRows(): Promise<{ rows: DbIncidentRow[]; error?: string }> {
  if (!hasServiceRole()) return { rows: [], error: "no Supabase service key in this environment" };
  const { data, error } = await getServiceClient()
    .from("incidents")
    .select("id, slug, title, last_updated, data")
    .order("last_updated", { ascending: false })
    .limit(500);
  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as DbIncidentRow[] };
}

export default async function RegistryPage() {
  if (!(await isLocalRegistry())) notFound();

  // Same access gate as the desk page: Basic auth OR mod session, verified
  // here regardless of the proxy.
  const h = await headers();
  let accessLabel: string | null = null;
  if (verifyEditorAuth(h.get("authorization"))) {
    accessLabel = "EDITOR · BASIC AUTH";
  } else {
    const mod = await getModActor();
    if (mod) accessLabel = `MOD · ${(mod.handle ?? mod.id.slice(0, 8)).toUpperCase()}`;
  }
  if (!accessLabel) notFound();

  const [drafts, published, flags, changed, db] = await Promise.all([
    listDrafts(),
    listPublished(),
    loadReviewFlags(),
    changedDataPaths(),
    loadDbRows(),
  ]);

  const draftViews: DraftView[] = drafts.map((f) => ({
    slug: f.doc.slug,
    fileName: f.fileName,
    title: f.doc.title ?? "(untitled)",
    trustState: String(f.doc.trustState ?? "?"),
    severity: String(f.doc.severity ?? "?"),
    categories: Array.isArray(f.doc.categories) ? f.doc.categories : [],
    flags: flags.get(f.fileName) ?? [],
    sourceCount: Array.isArray(f.doc.sources) ? f.doc.sources.length : 0,
    parseError: f.parseError ?? null,
  }));

  const rowBySlug = new Map(db.rows.map((r) => [r.slug, r]));
  const publishedViews: PublishedView[] = published.map((f) => {
    const row = rowBySlug.get(f.doc.slug);
    const dbRow: DbRowLite = row
      ? { lastUpdated: row.last_updated, data: row.data }
      : null;
    const uncommitted =
      changed === null ||
      changed.has(`data/incidents/${f.fileName}`) ||
      changed.has(`data/drafts/${f.fileName}`);
    const badges = f.parseError
      ? [{ label: `BROKEN JSON — ${f.parseError}`, ok: false }]
      : deriveSyncBadges(f.doc, db.error ? null : dbRow, uncommitted);
    if (db.error) badges.unshift({ label: `DB UNREADABLE — ${db.error}`, ok: false });
    if (changed === null) badges.push({ label: "GIT STATUS UNAVAILABLE", ok: false });
    return {
      slug: f.doc.slug,
      id: f.doc.id ?? f.fileName.replace(/\.json$/, ""),
      title: f.doc.title ?? f.fileName,
      publishedDate: String(f.doc.published ?? "?"),
      badges,
    };
  });

  const fileSlugs = new Set(published.map((f) => f.doc.slug));
  const dbOnly: DbOnlyView[] = db.rows
    .filter((r) => !fileSlugs.has(r.slug))
    .map((r) => ({ id: r.id, slug: r.slug, title: r.title }));

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 64px" }}>
      <div
        style={{
          ...mono,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          padding: "8px 0",
          fontSize: 12,
          fontWeight: 500,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <span>{today}</span>
        <span>{accessLabel} · LOCAL ONLY · NOT INDEXED</span>
      </div>

      <header style={{ padding: "32px 0 20px" }}>
        <h1 style={{ ...display, fontSize: 40, fontWeight: 600, margin: 0 }}>
          The Registry
        </h1>
        <p
          style={{
            ...mono,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: ".05em",
            color: "var(--meta)",
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          DOSSIER LIFECYCLE · EVERY PUBLISH IS A HUMAN DECISION · RUNS ON YOUR
          MACHINE, WRITES FILES + DATABASE + GIT
        </p>
        <p style={{ marginTop: 12, marginBottom: 0 }}>
          <Link href="/desk" style={{ ...mono, fontSize: 12, fontWeight: 600, color: "var(--link)" }}>
            ← THE DESK
          </Link>
        </p>
      </header>
      <div className="double-rule" />

      <section>
        <h2 style={sectionHead}>DRAFTS · {draftViews.length}</h2>
        {draftViews.length === 0 ? (
          <EmptyState>No file drafts. New dossiers land in data/drafts/.</EmptyState>
        ) : (
          draftViews.map((d) => <RegistryDraftCard key={d.fileName} draft={d} />)
        )}
      </section>

      <section>
        <h2 style={sectionHead}>PUBLISHED · {publishedViews.length}</h2>
        {publishedViews.length === 0 ? (
          <EmptyState>Nothing published from files yet.</EmptyState>
        ) : (
          publishedViews.map((p) => <RegistryPublishedRow key={p.id} row={p} />)
        )}
      </section>

      <section>
        <h2 style={sectionHead}>DB-ONLY · {dbOnly.length}</h2>
        <p style={{ ...mono, fontSize: 12, color: "var(--meta)", marginTop: 12 }}>
          Published from the ingest queue at /desk — they have no file in
          data/incidents/, so this desk lists them read-only.
        </p>
        {dbOnly.map((r) => (
          <p key={r.id} style={{ ...mono, fontSize: 12, margin: "6px 0" }}>
            {r.id} ·{" "}
            <a href={`/scam/${r.slug}`} target="_blank" rel="noreferrer" style={{ color: "var(--link)" }}>
              {r.title}
            </a>
          </p>
        ))}
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Add the desk → registry link**

In `src/app/desk/page.tsx`, find the header links paragraph:

```tsx
        <p style={{ marginTop: 12, marginBottom: 0 }}>
          <Link
            href="/"
            style={{ ...mono, fontSize: 12, fontWeight: 600, color: "var(--link)" }}
          >
            ← FRONT PAGE
          </Link>
        </p>
```

Replace with:

```tsx
        <p style={{ marginTop: 12, marginBottom: 0, display: "flex", gap: 20 }}>
          <Link
            href="/"
            style={{ ...mono, fontSize: 12, fontWeight: 600, color: "var(--link)" }}
          >
            ← FRONT PAGE
          </Link>
          {process.env.NODE_ENV === "development" ? (
            <Link
              href="/desk/registry"
              style={{ ...mono, fontSize: 12, fontWeight: 600, color: "var(--link)" }}
            >
              THE REGISTRY (LOCAL) →
            </Link>
          ) : null}
        </p>
```

- [ ] **Step 3: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: both clean. The build compiles the registry page even though it 404s in production — that is correct.

- [ ] **Step 4: Commit**

```bash
git add src/app/desk/registry/page.tsx src/app/desk/page.tsx
git commit -m "registry desk: /desk/registry page (drafts, published, sync badges, db-only) + desk link

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Verification — tests, build, manual E2E with a throwaway dossier

**Files:**
- No new files. Temporary throwaway dossier `data/drafts/registry-desk-smoke-test.json`, removed before the final commit.

- [ ] **Step 1: Full test + build pass**

Run: `npm test && npx tsc --noEmit && npm run build`
Expected: all green.

- [ ] **Step 2: Create the throwaway dossier**

Write `data/drafts/registry-desk-smoke-test.json`:

```json
{
  "id": "2026-registry-desk-smoke-test",
  "slug": "registry-desk-smoke-test",
  "title": "REGISTRY DESK SMOKE TEST — never approve this",
  "summary": "Throwaway dossier used to verify the registry desk publish and back-to-draft pipelines end to end. If you can read this on the live site, unpublish it immediately.",
  "trustState": "reported",
  "severity": "S4",
  "categories": ["impersonation"],
  "firstObserved": "2026-08-12",
  "published": "2026-08-12",
  "lastUpdated": "2026-08-12",
  "actions": ["Delete this dossier."],
  "sources": [
    {
      "url": "https://example.com/registry-desk-smoke-test",
      "publisher": "BTCSCAM internal test",
      "type": "research"
    }
  ]
}
```

Do NOT commit it (the walkthrough's publish step will commit its move — that is part of the test; the cleanup step reverts everything).

- [ ] **Step 3: Manual walkthrough on the dev server**

With `npm run dev` running (NOT on :3000 if Bitwill holds it — accept whatever port next picks) and desk credentials at hand:

1. Open `/desk/registry`, authenticate. Expect: DRAFTS · 13 (12 wave-1 + smoke test), PUBLISHED · 3 with `DB ✓ MATCHES FILE` + `COMMITTED ✓` badges, DB-ONLY list, wave-1 cards showing their real flag counts (5 for the ATM dossier, etc.).
2. On the smoke-test card: expand CHECK BEFORE APPROVING (expect "No review notes found"), click PUBLISH → confirm panel lists the 6 pipeline steps → CONFIRM PUBLISH. Expect: every step OK (validate/date/move/seed/revalidate/commit/push — push OK only if the network allows; a push failure must render FAILED PUSH with the git message and everything else OK).
3. Verify effects: `data/incidents/2026-registry-desk-smoke-test.json` exists, draft file gone, Supabase row present (`/scam/registry-desk-smoke-test` renders locally), `git log -1` shows "publish dossier registry-desk-smoke-test".
4. Refresh `/desk/registry`. Expect the smoke test under PUBLISHED with all badges OK.
5. Click BACK TO DRAFT → confirm panel shows the deploy caveat → CONFIRM. Expect: remove-db/move-back/revalidate/commit/push all OK.
6. Verify effects: file back at `data/drafts/registry-desk-smoke-test.json`, DB row gone, `git log -1` shows the unpublish commit.
7. Negative check: `curl -s -o /dev/null -w "%{http_code}" https://btcscam.com/desk/registry` → expect 401 (proxy Basic challenge) or 404 — never 200 content.

- [ ] **Step 4: Clean up the throwaway**

```bash
rm data/drafts/registry-desk-smoke-test.json
git add -A -- data/
git commit -m "registry desk: remove smoke-test dossier after E2E walkthrough

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git push
```

(The two walkthrough commits plus this one leave `data/` exactly as it started; the history documents the test.)

- [ ] **Step 5: Report**

Summarize walkthrough results — every step's observed outcome, any deviation — before calling the feature done.
