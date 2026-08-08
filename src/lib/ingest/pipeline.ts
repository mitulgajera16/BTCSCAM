import { getAllIncidents } from "@/lib/incidents";
import { getServiceClient } from "./db";
import { parseFeed, type FeedItem } from "./feed";
import { fetchJson, fetchText } from "./http";
import {
  normalizeFeedItem,
  normalizeLlamaHack,
  truncate,
  type DraftRow,
  type LlamaHack,
} from "./normalize";
import {
  CRYPTO_KEYWORDS,
  FEED_SOURCES,
  LLAMA_HACKS_URL,
  type FeedSource,
} from "./sources";

/**
 * Daily ingestion run ("The Wire", 05:00 UTC):
 * 1. DeFiLlama hacks JSON → draft_incidents (all chains kept; the Desk
 *    editor filters at review).
 * 2. Four regulator RSS feeds + Bitcoin Optech Atom feed, filtered by crypto
 *    keywords → draft_incidents.
 * 3. ticker_items refresh: our latest published incidents + public-domain
 *    regulator headlines (verbatim) + Optech (with credit).
 *
 * Every source runs in its own try/catch — one dead feed never kills the
 * run. Dedupe is enforced by draft_incidents.dedupe_key (unique); upserts
 * use ignoreDuplicates so re-runs are idempotent and counts stay honest.
 */

export interface SourceResult {
  ok: boolean;
  /** Items in the raw response. */
  fetched?: number;
  /** Items that passed the crypto-keyword / recency filter. */
  matched?: number;
  /** Rows actually inserted (existing dedupe keys are skipped, not counted). */
  inserted?: number;
  error?: string;
}

export interface TickerResult {
  ok: boolean;
  upserted?: number;
  pruned?: number;
  error?: string;
}

export interface IngestRunResult {
  ranAt: string;
  sources: Record<string, SourceResult>;
  ticker: TickerResult;
}

/** DeFiLlama backfill window. Dedupe makes re-scanning this window idempotent. */
const LLAMA_WINDOW_DAYS = 180;
const LLAMA_MAX_PER_RUN = 100;
const TICKER_MAX_AGE_DAYS = 60;
const TICKER_INCIDENTS = 6;
const TICKER_PER_FEED = 2;

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

async function upsertDrafts(rows: DraftRow[]): Promise<number> {
  if (rows.length === 0) return 0;
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("draft_incidents")
    .upsert(rows, { onConflict: "dedupe_key", ignoreDuplicates: true })
    .select("id");
  if (error) throw new Error(`draft_incidents upsert: ${error.message}`);
  return data?.length ?? 0;
}

async function ingestLlama(): Promise<SourceResult> {
  const hacks = await fetchJson<LlamaHack[]>(LLAMA_HACKS_URL);
  if (!Array.isArray(hacks)) {
    throw new Error("DeFiLlama /hacks did not return an array");
  }
  const cutoff = Date.now() / 1000 - LLAMA_WINDOW_DAYS * 86_400;
  const recent = hacks
    .filter(
      (h) =>
        typeof h?.date === "number" &&
        h.date >= cutoff &&
        typeof h?.name === "string" &&
        h.name.trim().length > 0,
    )
    .sort((a, b) => b.date - a.date)
    .slice(0, LLAMA_MAX_PER_RUN);
  const inserted = await upsertDrafts(recent.map(normalizeLlamaHack));
  return { ok: true, fetched: hacks.length, matched: recent.length, inserted };
}

async function ingestFeed(
  feed: FeedSource,
): Promise<{ result: SourceResult; matched: FeedItem[] }> {
  const xml = await fetchText(feed.url);
  const items = parseFeed(xml);
  const matched = items.filter((i) =>
    CRYPTO_KEYWORDS.test(`${i.title} ${i.summary}`),
  );
  const inserted = await upsertDrafts(
    matched.map((i) => normalizeFeedItem(feed, i)),
  );
  return {
    result: { ok: true, fetched: items.length, matched: matched.length, inserted },
    matched,
  };
}

interface TickerRow {
  kind: "incident" | "advisory" | "optech";
  label: string;
  url: string;
  published_at: string;
  dedupe_key: string;
}

/**
 * Ticker refresh. Editorial rules enforced here:
 * - kind "incident": our own published incidents (Supabase incidents table
 *   when populated, else the bundled JSON registry — both are our editorial
 *   content).
 * - kind "advisory": headline verbatim ONLY for public-domain regulator
 *   feeds (U.S. government work), prefixed with the agency for attribution.
 * - kind "optech": Bitcoin Optech items always carry the Optech credit
 *   (CC BY-SA).
 */
async function refreshTicker(
  feedMatches: Map<FeedSource, FeedItem[]>,
): Promise<TickerResult> {
  try {
    const sb = getServiceClient();
    const nowIso = new Date().toISOString();
    const rows: TickerRow[] = [];

    // Our latest published incidents: Supabase incidents table when it is
    // populated, else the bundled JSON registry (both our editorial content).
    let published: { slug: string; title: string; lastUpdated: string }[] = [];
    try {
      const { data, error } = await sb
        .from("incidents")
        .select("slug,title,last_updated")
        .order("last_updated", { ascending: false })
        .limit(TICKER_INCIDENTS);
      if (error) throw new Error(error.message);
      published = (data ?? [])
        .filter((r) => r.slug && r.title)
        .map((r) => ({
          slug: r.slug as string,
          title: r.title as string,
          lastUpdated: (r.last_updated as string | null) ?? nowIso,
        }));
    } catch {
      // incidents table unreachable (e.g. not migrated yet) — use fallback.
    }
    if (published.length === 0) {
      try {
        published = getAllIncidents()
          .slice(0, TICKER_INCIDENTS)
          .map((i) => ({
            slug: i.slug,
            title: i.title,
            lastUpdated: i.lastUpdated,
          }));
      } catch {
        // Bundled registry unreadable — ticker still gets advisories.
      }
    }
    for (const inc of published) {
      const at = new Date(inc.lastUpdated);
      rows.push({
        kind: "incident",
        label: truncate(inc.title, 140),
        url: `/scam/${inc.slug}`,
        published_at: Number.isNaN(at.getTime()) ? nowIso : at.toISOString(),
        dedupe_key: `incident:${inc.slug}`,
      });
    }

    for (const [feed, items] of feedMatches) {
      const newest = items.slice(0, TICKER_PER_FEED);
      for (const item of newest) {
        if (!item.title || !item.link) continue;
        if (feed.kind === "advisory") {
          // Verbatim headlines only for public-domain regulator content.
          if (!feed.publicDomain) continue;
          rows.push({
            kind: "advisory",
            label: truncate(`${feed.agencyShort}: ${item.title}`, 160),
            url: item.link,
            published_at: item.publishedAt ?? nowIso,
            dedupe_key: `advisory:${feed.id}:${item.guid}`,
          });
        } else {
          rows.push({
            kind: "optech",
            label: truncate(`Bitcoin Optech: ${item.title}`, 160),
            url: item.link,
            published_at: item.publishedAt ?? nowIso,
            dedupe_key: `optech:${item.guid}`,
          });
        }
      }
    }

    // Dedupe within the batch: ON CONFLICT DO UPDATE rejects the whole
    // statement if two rows share a dedupe_key (e.g. a feed emitting two
    // items with the same guid). Last row wins, matching upsert semantics.
    const uniqueRows = [...new Map(rows.map((r) => [r.dedupe_key, r])).values()];

    let upserted = 0;
    if (uniqueRows.length > 0) {
      const { data, error } = await sb
        .from("ticker_items")
        .upsert(uniqueRows, { onConflict: "dedupe_key" })
        .select("id");
      if (error) throw new Error(`ticker_items upsert: ${error.message}`);
      upserted = data?.length ?? uniqueRows.length;
    }

    const pruneBefore = new Date(
      Date.now() - TICKER_MAX_AGE_DAYS * 86_400_000,
    ).toISOString();
    const { count, error: pruneError } = await sb
      .from("ticker_items")
      .delete({ count: "exact" })
      .lt("published_at", pruneBefore);
    if (pruneError) {
      throw new Error(`ticker_items prune: ${pruneError.message}`);
    }

    return { ok: true, upserted, pruned: count ?? 0 };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function runIngest(): Promise<IngestRunResult> {
  const sources: Record<string, SourceResult> = {};
  const feedMatches = new Map<FeedSource, FeedItem[]>();

  await Promise.all([
    (async () => {
      try {
        sources.llama = await ingestLlama();
      } catch (e) {
        sources.llama = { ok: false, error: errorMessage(e) };
      }
    })(),
    ...FEED_SOURCES.map((feed) =>
      (async () => {
        try {
          const { result, matched } = await ingestFeed(feed);
          sources[feed.id] = result;
          feedMatches.set(feed, matched);
        } catch (e) {
          sources[feed.id] = { ok: false, error: errorMessage(e) };
        }
      })(),
    ),
  ]);

  const ticker = await refreshTicker(feedMatches);

  return { ranAt: new Date().toISOString(), sources, ticker };
}
