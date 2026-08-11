#!/usr/bin/env node
/**
 * Archive pass for docs/research/evidence/quotes.csv (Stage 0 ops, I-18).
 *
 * For every row with an empty archive_url:
 *   1. Ask the Wayback availability API for an existing snapshot — free, fast.
 *   2. If none, request a Save Page Now capture, then poll availability.
 *      Reddit URLs that fail SPN are retried via old.reddit.com.
 *
 * Writes the CSV back in place after every resolved row (safe to interrupt
 * and re-run — resolved rows are skipped). Progress log: scripts/.archive-log.
 */
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";

const CSV = new URL("../docs/research/evidence/quotes.csv", import.meta.url).pathname;
const LOG = new URL("./.archive-log", import.meta.url).pathname;
const UA = "btcscam-research-archiver/1.0 (solo research project; contact via btcscam.com/standards)";

function parseCsv(text) {
  const rows = [];
  let field = "", row = [], inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); field = ""; if (row.some(f => f !== "")) rows.push(row); row = []; }
    else if (c !== "\r") field += c;
  }
  if (field !== "" || row.length) { row.push(field); if (row.some(f => f !== "")) rows.push(row); }
  return rows;
}

const esc = (f) => (/[",\n]/.test(f) ? `"${f.replaceAll('"', '""')}"` : f);
const writeCsv = (rows) => writeFileSync(CSV, rows.map(r => r.map(esc).join(",")).join("\n") + "\n");
const log = (m) => { const line = `${new Date().toISOString()} ${m}`; console.log(line); appendFileSync(LOG, line + "\n"); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function existingSnapshot(url) {
  try {
    const res = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`, { headers: { "user-agent": UA } });
    if (!res.ok) return null;
    const data = await res.json();
    const snap = data?.archived_snapshots?.closest;
    return snap?.available ? snap.url.replace(/^http:/, "https:") : null;
  } catch { return null; }
}

async function savePageNow(url) {
  try {
    const res = await fetch(`https://web.archive.org/save/${url}`, {
      headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(90_000),
    });
    if (res.ok || res.status === 302) {
      // capture is queued/processed; poll availability
      for (let i = 0; i < 4; i++) { await sleep(15_000); const s = await existingSnapshot(url); if (s) return s; }
    } else { log(`  SPN HTTP ${res.status} for ${url}`); }
  } catch (e) { log(`  SPN error for ${url}: ${e.message}`); }
  return null;
}

const rows = parseCsv(readFileSync(CSV, "utf8"));
const header = rows[0];
const urlIdx = header.indexOf("url"), archIdx = header.indexOf("archive_url");
const pending = rows.slice(1).filter(r => !r[archIdx]);
log(`Archive pass start: ${pending.length} of ${rows.length - 1} rows unarchived.`);

let ok = 0, fail = 0;
for (const row of rows.slice(1)) {
  if (row[archIdx]) continue;
  const url = row[urlIdx];

  let snap = await existingSnapshot(url);
  if (snap) { row[archIdx] = snap; writeCsv(rows); ok++; log(`existing: ${url} -> ${snap}`); continue; }

  log(`saving:   ${url}`);
  snap = await savePageNow(url);
  if (!snap && url.includes("www.reddit.com")) {
    const alt = url.replace("www.reddit.com", "old.reddit.com");
    log(`  retrying via ${alt}`);
    snap = await savePageNow(alt);
  }
  if (snap) { row[archIdx] = snap; writeCsv(rows); ok++; log(`  saved -> ${snap}`); }
  else { fail++; log(`  FAILED: ${url}`); }
  await sleep(20_000); // SPN anonymous rate limit courtesy
}
log(`Archive pass done: ${ok} archived, ${fail} failed, ${rows.length - 1 - ok - fail} were already done.`);
