"use server";

// ── THE CHECK DESK — lookup action.
//
// Honesty rules (product law):
//   - We report exactly what was consulted and nothing more.
//   - "NOT FOUND" is never rendered as "safe" — absence from the lists we
//     mirror is not evidence of absence.
//   - When Supabase is not attached, the lookup against the mirrored
//     blocklists DOES NOT RUN and we say so plainly (mode "offline"). The
//     bundled published dossiers are still genuinely scanned — that part of
//     the answer is real either way.

import { headers } from "next/headers";
import {
  getAllIncidents,
  type Incident,
  type TrustState,
} from "@/lib/incidents";
import { getServiceClient, hasSupabase } from "@/components/check/db";
import { identifyQuery, type QueryKind } from "@/components/check/identify";
import { clientKeyFrom, takeToken } from "@/lib/rate-limit";

const MAX_QUERY_LENGTH = 300;

export type BlacklistHit = {
  /** Which list our mirror got it from: scamsniffer | metamask | btcscam-registry. */
  source: string;
  /** When OUR mirror first recorded it — not when the upstream list did. */
  listedAt: string | null;
  /** The exact key that matched (e.g. the www. variant of a domain). */
  value: string;
};

export type IncidentMatch = {
  slug: string;
  title: string;
  trustState: TrustState;
  severity: Incident["severity"];
  lastUpdated: string;
};

export type CheckResult =
  | { ok: false; error: string; query: string }
  | {
      ok: true;
      mode: "offline";
      /** unconfigured: no database attached. unreachable: attached but the
       *  query failed — different sentence, same honesty. */
      reason: "unconfigured" | "unreachable";
      kind: QueryKind;
      query: string;
      normalized: string;
      /** Matches from the published dossiers bundled with this build — this
       *  scan really ran even without a database. */
      incidents: IncidentMatch[];
      bundledCount: number;
      chainabuseUrl: string;
    }
  | {
      ok: true;
      mode: "live";
      verdict: "flagged" | "not-found";
      kind: QueryKind;
      query: string;
      normalized: string;
      hits: BlacklistHit[];
      incidents: IncidentMatch[];
      chainabuseUrl: string;
      checkedAt: string;
    };

function toMatch(i: Incident): IncidentMatch {
  return {
    slug: i.slug,
    title: i.title,
    trustState: i.trustState,
    severity: i.severity,
    lastUpdated: i.lastUpdated,
  };
}

function chainabuseUrl(kind: QueryKind, normalized: string): string {
  return kind === "domain"
    ? `https://www.chainabuse.com/domain/${encodeURIComponent(normalized)}`
    : `https://www.chainabuse.com/address/${encodeURIComponent(normalized)}`;
}

/** Scan the dossiers bundled with this build. Case-insensitive; domains are
 *  compared with and without a www. prefix. If the bundled JSON is not
 *  present in this function's bundle (file-tracing gap), returns
 *  bundledCount 0 so the UI never claims a scan that did not run. */
function matchBundledIncidents(
  kind: QueryKind,
  candidates: string[],
): { matches: IncidentMatch[]; bundledCount: number } {
  const wanted = new Set(candidates.map((c) => c.toLowerCase()));
  let all: Incident[];
  try {
    all = getAllIncidents();
  } catch (err) {
    console.error("[check] bundled incident scan unavailable:", err);
    return { matches: [], bundledCount: 0 };
  }
  const matches = all
    .filter((i) => {
      const pool =
        (kind === "domain" ? i.entities?.domains : i.entities?.addresses) ??
        [];
      return pool.some((v) => {
        const lower = v.toLowerCase();
        return wanted.has(lower) || wanted.has(lower.replace(/^www\./, ""));
      });
    })
    .map(toMatch);
  return { matches, bundledCount: all.length };
}

type IncidentRow = {
  slug: string;
  title: string;
  trust_state: string;
  severity: string;
  last_updated: string | null;
};

/** Incidents published straight to the database (the desk can publish rows
 *  that are not in the repo). Failures fall back to bundled-only — the
 *  bundled scan already covers everything shipped with this build. */
async function matchDbIncidents(
  kind: QueryKind,
  candidates: string[],
): Promise<IncidentMatch[]> {
  const sb = getServiceClient();
  const key = kind === "domain" ? "domains" : "addresses";
  const found = new Map<string, IncidentMatch>();
  for (const candidate of candidates) {
    const { data, error } = await sb
      .from("incidents")
      .select("slug, title, trust_state, severity, last_updated")
      .contains("data", { entities: { [key]: [candidate] } });
    if (error) continue;
    for (const row of (data ?? []) as IncidentRow[]) {
      found.set(row.slug, {
        slug: row.slug,
        title: row.title,
        trustState: row.trust_state as TrustState,
        severity: row.severity as Incident["severity"],
        lastUpdated: row.last_updated ?? "",
      });
    }
  }
  return Array.from(found.values());
}

export async function runCheck(
  _prev: CheckResult | null,
  formData: FormData,
): Promise<CheckResult> {
  // A Server Action is a public POST endpoint — validate everything here.
  const query = String(formData.get("query") ?? "").trim();

  if (!query) {
    return {
      ok: false,
      error: "Paste an address or a domain to check.",
      query,
    };
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return {
      ok: false,
      error: `That is longer than any address or domain (${MAX_QUERY_LENGTH} characters max). Paste one item at a time.`,
      query: query.slice(0, MAX_QUERY_LENGTH),
    };
  }

  // Per-IP throttle. Each single lookup is permitted, but unmetered bulk
  // querying would let a script reconstruct the mirrored ScamSniffer
  // blacklist item by item — breaking the "lookups only, never re-export"
  // stance /check states — and burn database quota. 20/minute is generous
  // for a human and useless for extraction.
  const requestHeaders = await headers();
  if (!takeToken("check", clientKeyFrom(requestHeaders), 20, 60_000)) {
    return {
      ok: false,
      error:
        "Too many checks from this connection in the last minute. Wait a moment and try again — the lookup did not run.",
      query,
    };
  }

  const identified = identifyQuery(query);
  if (!identified) {
    return {
      ok: false,
      error:
        "That does not look like anything we can check. Accepted: a Bitcoin address (starts 1, 3, or bc1), an Ethereum-style address (starts 0x, 42 characters), or a domain like example.com.",
      query,
    };
  }
  const { kind, normalized, candidates } = identified;
  const chainabuse = chainabuseUrl(kind, normalized);
  const bundled = matchBundledIncidents(kind, candidates);

  if (!hasSupabase()) {
    return {
      ok: true,
      mode: "offline",
      reason: "unconfigured",
      kind,
      query,
      normalized,
      incidents: bundled.matches,
      bundledCount: bundled.bundledCount,
      chainabuseUrl: chainabuse,
    };
  }

  try {
    const sb = getServiceClient();
    const table = kind === "domain" ? "blacklist_domains" : "blacklist_addresses";
    const column = kind === "domain" ? "domain" : "address";

    const { data, error } = await sb
      .from(table)
      .select(`${column}, source, listed_at`)
      .in(column, candidates);
    if (error) throw new Error(error.message);

    const hits: BlacklistHit[] = (
      (data ?? []) as Record<string, string | null>[]
    ).map((row) => ({
      source: row.source ?? "unknown",
      listedAt: row.listed_at ?? null,
      value: row[column] ?? normalized,
    }));

    // Union DB-published incidents with the bundled matches, deduped by slug.
    const incidents = new Map<string, IncidentMatch>();
    for (const m of bundled.matches) incidents.set(m.slug, m);
    for (const m of await matchDbIncidents(kind, candidates)) {
      if (!incidents.has(m.slug)) incidents.set(m.slug, m);
    }
    const incidentMatches = Array.from(incidents.values());

    return {
      ok: true,
      mode: "live",
      verdict:
        hits.length > 0 || incidentMatches.length > 0 ? "flagged" : "not-found",
      kind,
      query,
      normalized,
      hits,
      incidents: incidentMatches,
      chainabuseUrl: chainabuse,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[check] blacklist lookup failed:", err);
    // The lookup did not run — never pretend it did.
    return {
      ok: true,
      mode: "offline",
      reason: "unreachable",
      kind,
      query,
      normalized,
      incidents: bundled.matches,
      bundledCount: bundled.bundledCount,
      chainabuseUrl: chainabuse,
    };
  }
}
