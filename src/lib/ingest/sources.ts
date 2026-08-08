/**
 * Source registry for the daily ingestion cron.
 *
 * URLs verified live 2026-08-08. Licensing notes are load-bearing:
 * - IC3 / SEC / CFTC / FTC output is U.S. federal government work
 *   (17 U.S.C. § 105) — public domain, titles republishable verbatim.
 * - Bitcoin Optech is CC BY-SA — credit required on every use.
 * - Rekt and SlowMist content is NEVER republished, only cited; neither
 *   appears here by design.
 */

export type IngestSourceId = "llama" | "ic3" | "sec" | "cftc" | "ftc" | "optech";

export const LLAMA_HACKS_URL = "https://api.llama.fi/hacks";

/**
 * Crypto keyword filter for regulator/optech items. Leading \b only —
 * "crypto" must also match "cryptocurrency".
 */
export const CRYPTO_KEYWORDS =
  /\b(bitcoin|crypto|digital asset|virtual currency|stablecoin|wallet)/i;

export interface FeedSource {
  id: Exclude<IngestSourceId, "llama">;
  url: string;
  /** Full attribution name used in normalized sources[]. */
  publisher: string;
  /** Short prefix used in ticker labels. */
  agencyShort: string;
  /** U.S. government work — title may appear verbatim on the ticker. */
  publicDomain: boolean;
  kind: "advisory" | "optech";
  sourceType: "regulator" | "research";
  /** Category used when no keyword maps — an editorial draft suggestion only. */
  fallbackCategory: string;
  license?: string;
}

export const FEED_SOURCES: FeedSource[] = [
  {
    id: "ic3",
    url: "https://www.ic3.gov/PSA/RSS",
    publisher: "FBI Internet Crime Complaint Center (IC3)",
    agencyShort: "IC3",
    publicDomain: true,
    kind: "advisory",
    sourceType: "regulator",
    fallbackCategory: "social-engineering",
  },
  {
    id: "sec",
    url: "https://www.sec.gov/enforcement-litigation/litigation-releases/rss",
    publisher: "U.S. Securities and Exchange Commission",
    agencyShort: "SEC",
    publicDomain: true,
    kind: "advisory",
    sourceType: "regulator",
    fallbackCategory: "theft",
  },
  {
    id: "cftc",
    url: "https://www.cftc.gov/RSS/RSSGP/rssgp.xml",
    publisher: "U.S. Commodity Futures Trading Commission",
    agencyShort: "CFTC",
    publicDomain: true,
    kind: "advisory",
    sourceType: "regulator",
    fallbackCategory: "theft",
  },
  {
    id: "ftc",
    url: "https://www.ftc.gov/feeds/press-release-consumer-protection.xml",
    publisher: "U.S. Federal Trade Commission",
    agencyShort: "FTC",
    publicDomain: true,
    kind: "advisory",
    sourceType: "regulator",
    fallbackCategory: "social-engineering",
  },
  {
    id: "optech",
    url: "https://bitcoinops.org/feed.xml",
    publisher: "Bitcoin Optech",
    agencyShort: "OPTECH",
    publicDomain: false,
    kind: "optech",
    sourceType: "research",
    fallbackCategory: "vulnerability",
    license: "CC BY-SA 4.0",
  },
];
