/**
 * Canonical production origin — single source of truth for absolute URLs.
 * Resolution order: explicit override → Vercel's production URL (tracks the
 * live domain automatically, so attaching btcscam.com later needs no code
 * change) → the intended final domain as fallback.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://btcscam.com");

/**
 * The bare host of SITE_URL (e.g. "btcscam.vercel.app" while staging,
 * "btcscam.com" once the apex domain is attached). Single source of truth for
 * every "our only domain" trust line so the footer, llms.txt, and the Sweep
 * can never disagree — and so none of them ever point readers at a domain we
 * do not yet control. Flip SITE_URL and all of them flip together.
 */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");
