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
 * which is what makes retries safe. The data/ pathspec keeps unrelated
 * dirty files (e.g. scripts/.archive-log) out of publish commits.
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
  else
    steps.push({
      step: "seed",
      ok: true,
      detail: `row ${doc.id} upserted — prod serves it within ~5 min`,
    });
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
    else
      steps.push({
        step: "remove-db",
        ok: true,
        detail: `row ${doc.id} deleted — prod drops it within ~5 min`,
      });
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
