import type { Incident } from "@/lib/incidents";
import type { FeedItem } from "./feed";
import type { FeedSource, IngestSourceId } from "./sources";

/**
 * Normalizers: raw source records → incident-shaped drafts.
 *
 * Editorial law, enforced here in code:
 * - Every draft is trustState "reported". Nothing auto-publishes; the Desk
 *   reviews every row before it can become an incident.
 * - Severity is a draft suggestion for the editor, never a verification claim.
 * - Numbers are attributed to their source and marked "estimated".
 */

/** Row shape for the draft_incidents table (see migration 0001_init.sql). */
export interface DraftRow {
  source: IngestSourceId;
  source_url: string;
  guid: string;
  dedupe_key: string;
  title: string;
  raw: unknown;
  normalized: Incident;
  status: "draft";
}

/** Shape of one record from https://api.llama.fi/hacks (verified live). */
export interface LlamaHack {
  date: number; // unix seconds
  name: string;
  classification?: string | null;
  technique?: string | null;
  amount?: number | null; // USD (raw dollars, e.g. 4800000)
  chain?: string[] | null;
  bridgeHack?: boolean | null;
  targetType?: string | null;
  source?: string | null; // URL of the original report DeFiLlama cites
  returnedFunds?: number | null;
  defillamaId?: string | null;
  language?: string | null;
}

export function slugify(input: string, maxLength = 60): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

export function truncate(input: string, max: number): string {
  if (input.length <= max) return input;
  const cut = input.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max / 2 ? lastSpace : max).trimEnd()}…`;
}

function formatUSD(amount: number): string {
  if (amount >= 1e9) return `$${trimZero(amount / 1e9)}B`;
  if (amount >= 1e6) return `$${trimZero(amount / 1e6)}M`;
  if (amount >= 1e3) return `$${trimZero(amount / 1e3)}K`;
  return `$${Math.round(amount)}`;
}

function trimZero(n: number): string {
  const fixed = n.toFixed(1);
  return fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed;
}

/**
 * Best-effort category suggestion from free text. Categories come from the
 * incident schema enum; the fallback is a per-source editorial default.
 */
export function categoriesFromText(text: string, fallback: string): string[] {
  const t = text.toLowerCase();
  const cats: string[] = [];
  if (/rug ?pull/.test(t)) cats.push("rug-pull");
  if (/phish/.test(t)) cats.push("phishing");
  if (/ponzi|pyramid scheme/.test(t)) cats.push("ponzi");
  if (/impersonat/.test(t)) cats.push("impersonation");
  if (/romance|pig[- ]butcher|social engineer/.test(t))
    cats.push("social-engineering");
  if (/malware|ransomware|drainer/.test(t)) cats.push("malware");
  if (/supply[- ]chain/.test(t)) cats.push("supply-chain");
  if (/recovery (scam|service|fraud)/.test(t)) cats.push("recovery-scam");
  if (/exchange (collapse|failure)|insolvenc/.test(t))
    cats.push("exchange-failure");
  if (/vulnerab|exploit/.test(t)) cats.push("vulnerability");
  if (cats.length === 0) cats.push(fallback);
  return cats;
}

export function normalizeLlamaHack(hack: LlamaHack): DraftRow {
  const isoDate = new Date(hack.date * 1000).toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();
  const slug = `llama-${slugify(hack.name)}-${isoDate}`;
  const chains = (hack.chain ?? []).filter(Boolean);
  const technique = hack.technique?.trim() || undefined;
  const classification = hack.classification?.trim() || undefined;
  const amount =
    typeof hack.amount === "number" && hack.amount > 0 ? hack.amount : undefined;
  const originalUrl =
    typeof hack.source === "string" && /^https?:\/\//.test(hack.source)
      ? hack.source
      : undefined;

  const title = amount
    ? `${hack.name}: reported ${formatUSD(amount)} loss${technique ? ` (${technique})` : ""}`
    : `${hack.name}: reported exploit${technique ? ` (${technique})` : ""}`;

  const summaryParts: string[] = [
    `DeFiLlama's hacks dataset records ${
      amount ? `a loss of approximately ${formatUSD(amount)}` : "an exploit"
    } at ${hack.name} on ${isoDate}.`,
  ];
  const detail = [
    classification ? `classification: ${classification}` : null,
    technique ? `technique: ${technique}` : null,
    chains.length > 0 ? `chains: ${chains.join(", ")}` : null,
    hack.targetType ? `target: ${hack.targetType}` : null,
  ].filter(Boolean);
  if (detail.length > 0) summaryParts.push(`Details — ${detail.join("; ")}.`);
  if (typeof hack.returnedFunds === "number" && hack.returnedFunds > 0) {
    summaryParts.push(
      `DeFiLlama records ${formatUSD(hack.returnedFunds)} returned.`,
    );
  }
  summaryParts.push(
    "Figures are attributed to DeFiLlama and are unverified by BTCSCAM.",
  );

  // Severity suggestion only: recent losses S2, older records S4. The Desk
  // editor sets the real severity before anything publishes.
  const ageDays = (Date.now() - hack.date * 1000) / 86_400_000;
  const severity: Incident["severity"] = ageDays <= 30 ? "S2" : "S4";

  const normalized: Incident = {
    id: slug,
    slug,
    title,
    summary: summaryParts.join(" "),
    trustState: "reported",
    severity,
    ongoing: false,
    categories: categoriesFromText(
      `${classification ?? ""} ${technique ?? ""}`,
      "theft",
    ),
    firstObserved: isoDate,
    published: nowIso,
    lastUpdated: nowIso,
    actions: [],
    sources: [
      {
        url: "https://defillama.com/hacks",
        publisher: "DeFiLlama",
        date: isoDate,
        type: "research",
      },
      ...(originalUrl
        ? [
            {
              url: originalUrl,
              publisher: "Original report (cited by DeFiLlama)",
              date: isoDate,
              type: "news",
            },
          ]
        : []),
    ],
    tags: [
      "defillama",
      ...chains.map((c) => c.toLowerCase()),
      ...(hack.bridgeHack ? ["bridge"] : []),
    ],
  };

  return {
    source: "llama",
    source_url: originalUrl ?? "https://defillama.com/hacks",
    guid: `${slugify(hack.name)}:${isoDate}`,
    dedupe_key: `llama:${slugify(hack.name)}:${isoDate}`,
    title,
    raw: hack,
    normalized,
    status: "draft",
  };
}

export function normalizeFeedItem(feed: FeedSource, item: FeedItem): DraftRow {
  const nowIso = new Date().toISOString();
  const isoDate = (item.publishedAt ?? nowIso).slice(0, 10);
  const slug = `${feed.id}-${slugify(item.title || item.guid)}-${isoDate}`;

  const attribution = feed.publicDomain
    ? `Source: ${feed.publisher} (public domain).`
    : `Source: ${feed.publisher} (${feed.license ?? "credit required"}).`;
  const excerpt = item.summary && item.summary !== item.title
    ? truncate(item.summary, 400)
    : "";
  const summary = [excerpt || item.title, attribution]
    .filter(Boolean)
    .join(" ");

  const normalized: Incident = {
    id: slug,
    slug,
    title: item.title || truncate(item.link, 120),
    summary,
    trustState: "reported",
    // Severity suggestion only — advisories/enforcement default S3 until an
    // editor assesses them at the Desk.
    severity: "S3",
    ongoing: false,
    categories: categoriesFromText(
      `${item.title} ${item.summary}`,
      feed.fallbackCategory,
    ),
    firstObserved: isoDate,
    published: nowIso,
    lastUpdated: nowIso,
    actions: [],
    sources: [
      {
        url: item.link,
        publisher: feed.publisher,
        date: isoDate,
        type: feed.sourceType,
      },
    ],
    tags: [feed.id],
  };

  return {
    source: feed.id,
    source_url: item.link,
    guid: item.guid,
    dedupe_key: `${feed.id}:${item.guid}`,
    title: normalized.title,
    raw: item,
    normalized,
    status: "draft",
  };
}
