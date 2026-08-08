import type { NextRequest } from "next/server";
import { getAllIncidents } from "@/lib/incidents";
import { getServiceClient, hasSupabase } from "@/components/check/db";
import {
  normalizeFeedAddress,
  normalizeFeedDomain,
} from "@/components/check/identify";
import { safeEqual } from "@/lib/safe-equal";

// ── Blacklist mirror cron (vercel.json: 0 6 * * * → GET here with
//    Authorization: Bearer ${CRON_SECRET}, sent by Vercel automatically).
//
// Mirrors, for lookup purposes ONLY (never re-exported):
//   - ScamSniffer scam-database addresses + domains (GPL-3.0, free feed is
//     ~7 days behind their live data)
//   - MetaMask eth-phishing-detect domain blocklist
//   - Addresses/domains named in our OWN published incidents' entities
//     (bundled JSON + the incidents table, which the desk can extend)
//
// Upserts use ON CONFLICT DO NOTHING (ignoreDuplicates) so listed_at keeps
// its first-seen-by-our-mirror meaning and the first source to list an entry
// keeps the credit. Each source is wrapped in its own try/catch — one dead
// feed never kills the run. Counts in the response are honest: "fetched" is
// what the feed returned, "valid" what survived normalization, "submitted"
// what was sent to the database; inserted-row counts are not reported
// because DO NOTHING does not tell us how many rows were new.

export const maxDuration = 300; // ~460k domain rows in chunks takes a while

const UA = "BTCSCAM/1.0 (contact@btcscam.com)";
const SCAMSNIFFER_ADDRESSES_URL =
  "https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/address.json";
const SCAMSNIFFER_DOMAINS_URL =
  "https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/domains.json";
const METAMASK_CONFIG_URL =
  "https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/main/src/config.json";
const CHUNK_SIZE = 2000;

type SourceReport =
  | {
      ok: true;
      fetched: number;
      valid: number;
      submitted: number;
      chunkErrors: string[];
    }
  | { ok: false; error: string };

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

async function upsertChunked(
  table: "blacklist_addresses" | "blacklist_domains",
  keyColumn: "address" | "domain",
  values: string[],
  source: string,
  listedAt: string,
): Promise<{ submitted: number; chunkErrors: string[] }> {
  const sb = getServiceClient();
  const rows = Array.from(new Set(values)).map((v) => ({
    [keyColumn]: v,
    source,
    listed_at: listedAt,
  }));
  let submitted = 0;
  const chunkErrors: string[] = [];
  for (const part of chunk(rows, CHUNK_SIZE)) {
    const { error } = await sb
      .from(table)
      .upsert(part, { onConflict: keyColumn, ignoreDuplicates: true });
    if (error) {
      chunkErrors.push(error.message);
    } else {
      submitted += part.length;
    }
  }
  return { submitted, chunkErrors };
}

async function mirrorList(
  table: "blacklist_addresses" | "blacklist_domains",
  keyColumn: "address" | "domain",
  source: string,
  listedAt: string,
  loadRaw: () => Promise<unknown[]>,
  normalize: (raw: unknown) => string | null,
): Promise<SourceReport> {
  try {
    const raw = await loadRaw();
    const valid = raw
      .map(normalize)
      .filter((v): v is string => v !== null);
    const { submitted, chunkErrors } = await upsertChunked(
      table,
      keyColumn,
      valid,
      source,
      listedAt,
    );
    return {
      ok: true,
      fetched: raw.length,
      valid: valid.length,
      submitted,
      chunkErrors,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

type Entities = { addresses: string[]; domains: string[] };

/** Entities from our own published incidents: the JSON bundled with this
 *  build plus rows the desk published straight to the incidents table. */
async function collectRegistryEntities(): Promise<Entities> {
  const addresses = new Set<string>();
  const domains = new Set<string>();

  const absorb = (ent?: { addresses?: string[]; domains?: string[] }) => {
    for (const a of ent?.addresses ?? []) {
      const n = normalizeFeedAddress(a);
      if (n) addresses.add(n);
    }
    for (const d of ent?.domains ?? []) {
      const n = normalizeFeedDomain(d);
      if (n) domains.add(n);
    }
  };

  try {
    for (const incident of getAllIncidents()) absorb(incident.entities);
  } catch {
    // Bundled JSON not traced into this function's bundle — the incidents
    // table below still covers everything that has been seeded/published.
  }

  try {
    const sb = getServiceClient();
    const { data, error } = await sb.from("incidents").select("data");
    if (!error) {
      for (const row of (data ?? []) as { data: unknown }[]) {
        const doc = row.data as {
          entities?: { addresses?: string[]; domains?: string[] };
        } | null;
        if (doc && typeof doc === "object") absorb(doc.entities);
      }
    }
  } catch {
    // Bundled incidents already collected — the DB half is best-effort.
  }

  return { addresses: Array.from(addresses), domains: Array.from(domains) };
}

export async function GET(req: NextRequest) {
  // Fail closed when CRON_SECRET is unset; compare in constant time (same
  // hash-then-timingSafeEqual pattern as the desk auth).
  const secret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");
  if (!secret || !authorization || !safeEqual(authorization, `Bearer ${secret}`)) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!hasSupabase()) {
    return Response.json(
      {
        ok: false,
        error:
          "Supabase is not connected — the blacklist mirror has nowhere to write. Attach the database and re-run.",
      },
      { status: 503 },
    );
  }

  const listedAt = new Date().toISOString();

  // Our own registry first, so entities we published keep source credit
  // even when an upstream list carries the same entry.
  const registry = await collectRegistryEntities();
  const registryAddresses = await mirrorList(
    "blacklist_addresses",
    "address",
    "btcscam-registry",
    listedAt,
    async () => registry.addresses,
    normalizeFeedAddress,
  );
  const registryDomains = await mirrorList(
    "blacklist_domains",
    "domain",
    "btcscam-registry",
    listedAt,
    async () => registry.domains,
    normalizeFeedDomain,
  );

  const scamsnifferAddresses = await mirrorList(
    "blacklist_addresses",
    "address",
    "scamsniffer",
    listedAt,
    async () => {
      const data = await fetchJson(SCAMSNIFFER_ADDRESSES_URL);
      if (!Array.isArray(data)) throw new Error("address.json is not an array");
      return data;
    },
    normalizeFeedAddress,
  );

  const scamsnifferDomains = await mirrorList(
    "blacklist_domains",
    "domain",
    "scamsniffer",
    listedAt,
    async () => {
      const data = await fetchJson(SCAMSNIFFER_DOMAINS_URL);
      if (!Array.isArray(data)) throw new Error("domains.json is not an array");
      return data;
    },
    normalizeFeedDomain,
  );

  const metamaskDomains = await mirrorList(
    "blacklist_domains",
    "domain",
    "metamask",
    listedAt,
    async () => {
      const data = (await fetchJson(METAMASK_CONFIG_URL)) as {
        blacklist?: unknown;
      };
      if (!Array.isArray(data?.blacklist)) {
        throw new Error("config.json has no blacklist array");
      }
      return data.blacklist;
    },
    normalizeFeedDomain,
  );

  const sources = {
    "btcscam-registry": {
      addresses: registryAddresses,
      domains: registryDomains,
    },
    scamsniffer: {
      addresses: scamsnifferAddresses,
      domains: scamsnifferDomains,
    },
    metamask: { domains: metamaskDomains },
  };

  const reports = [
    registryAddresses,
    registryDomains,
    scamsnifferAddresses,
    scamsnifferDomains,
    metamaskDomains,
  ];
  const allFailed = reports.every((r) => !r.ok);

  return Response.json(
    { ok: !allFailed, ranAt: listedAt, sources },
    { status: allFailed ? 502 : 200 },
  );
}
