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
