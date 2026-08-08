#!/usr/bin/env node
// ============================================================================
// BTCSCAM — seed bundled incident dossiers into Supabase.
//
// Reads every data/incidents/*.json and upserts it into public.incidents via
// the service-role client (RLS bypass). Prints a per-incident result line and
// exits nonzero if any incident fails.
//
// Run from the repo root with Node 20.6+ (no dotenv dependency needed):
//
//   node --env-file=.env.local scripts/seed-incidents.mjs
//
// In CI/Vercel, where env vars are already present:
//
//   node scripts/seed-incidents.mjs
//
// Requires: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and
// SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY).
// ============================================================================

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing Supabase env. Need SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY).",
  );
  console.error(
    "Run with: node --env-file=.env.local scripts/seed-incidents.mjs",
  );
  process.exit(1);
}

// Required fields per data/schemas/incident.schema.json.
const REQUIRED_FIELDS = [
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
];

const incidentsDir = path.join(process.cwd(), "data", "incidents");

let files;
try {
  files = (await readdir(incidentsDir)).filter((f) => f.endsWith(".json")).sort();
} catch (err) {
  console.error(
    `Cannot read ${incidentsDir}: ${err instanceof Error ? err.message : err}`,
  );
  console.error("Run this script from the repo root.");
  process.exit(1);
}

if (files.length === 0) {
  console.error(`No incident JSON files found in ${incidentsDir}.`);
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let failures = 0;

for (const file of files) {
  try {
    const doc = JSON.parse(
      await readFile(path.join(incidentsDir, file), "utf-8"),
    );

    const missing = REQUIRED_FIELDS.filter(
      (key) => doc[key] === undefined || doc[key] === null,
    );
    if (missing.length > 0) {
      throw new Error(`missing required fields: ${missing.join(", ")}`);
    }
    if (!Array.isArray(doc.sources) || doc.sources.length === 0) {
      throw new Error("no sources — no source, no publish");
    }

    const row = {
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

    const { error } = await supabase
      .from("incidents")
      .upsert(row, { onConflict: "id" });
    if (error) {
      throw new Error(error.message);
    }

    console.log(
      `OK      ${doc.id}  (${file})  trust=${doc.trustState}  severity=${doc.severity}`,
    );
  } catch (err) {
    failures += 1;
    console.error(
      `FAILED  ${file}: ${err instanceof Error ? err.message : err}`,
    );
  }
}

if (failures > 0) {
  console.error(`${failures} of ${files.length} incidents failed to seed.`);
  process.exit(1);
}

console.log(`Seeded ${files.length} incidents.`);
