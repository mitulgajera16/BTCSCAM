#!/usr/bin/env node
/**
 * Clone watch — brand-impersonation monitor (PRD §7 Tiger 5, I-14).
 *
 * Owner decision 2026-08-11: typo/TLD purchases deferred; we monitor instead.
 * Run on Monday Sweep days: `node scripts/clone-watch.mjs`
 *
 * Two checks, both against public data:
 *  1. Certificate transparency (crt.sh) — any newly issued cert whose name
 *     contains "btcscam" that is not ours. Catches clones the moment they
 *     get TLS, which is how chainabuse.report was catchable early.
 *  2. Typo/adjacent domains — DNS resolution check. A domain that starts
 *     resolving is a signal to investigate (and the cue to revisit the
 *     deferred-purchase decision).
 */

const OURS = new Set(["btcscam.com", "www.btcscam.com", "btcscam.vercel.app"]);

const TYPO_CANDIDATES = [
  // adjacent TLDs
  "btcscam.net", "btcscam.org", "btcscam.io", "btcscam.co", "btcscam.xyz",
  "btcscam.info", "btcscam.app", "btcscam.report", "btcscam.site",
  // common typos / lookalikes
  "btscam.com", "bctscam.com", "btcsam.com", "btcscams.com", "btc-scam.com",
  "btcscan.com" /* existing unrelated site — watch for impersonation only */,
];

async function crtsh() {
  const res = await fetch("https://crt.sh/?q=%25btcscam%25&output=json", {
    headers: { "user-agent": "btcscam-clone-watch/1.0 (abuse contact: via btcscam.com/standards)" },
  });
  if (!res.ok) {
    console.error(`crt.sh returned ${res.status} — retry later or check manually: https://crt.sh/?q=%25btcscam%25`);
    return;
  }
  const rows = await res.json();
  const names = new Set();
  for (const row of rows) {
    for (const name of String(row.name_value).split("\n")) {
      const clean = name.trim().toLowerCase().replace(/^\*\./, "");
      if (clean && !OURS.has(clean)) names.add(clean);
    }
  }
  if (names.size === 0) {
    console.log("crt.sh: no non-BTCSCAM certificates found for *btcscam*.");
  } else {
    console.log("crt.sh: certificates issued for names we do NOT control:");
    for (const n of [...names].sort()) console.log(`  ⚠ ${n}`);
  }
}

async function resolves(domain) {
  // DNS-over-HTTPS keeps this dependency-free and works everywhere.
  const res = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data.Answer) && data.Answer.length > 0;
}

async function typoSweep() {
  console.log("\nTypo/adjacent domain resolution sweep:");
  for (const domain of TYPO_CANDIDATES) {
    const up = await resolves(domain);
    if (up === null) console.log(`  ? ${domain} — DNS query failed, check manually`);
    else if (up) console.log(`  ⚠ ${domain} — RESOLVES. Investigate: content, cert, registrar.`);
    else console.log(`  ✓ ${domain} — not resolving`);
  }
}

console.log(`Clone watch — ${new Date().toISOString().slice(0, 10)}\n`);
await crtsh();
await typoSweep();
console.log(
  "\nIf a clone is found: screenshot + archive it, report to registrar abuse and " +
    "hosting provider, add a dossier if victims are being targeted, and revisit " +
    "the deferred typo-domain purchase decision (PRD §7 Tiger 5).",
);
