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
