# Data Sources — verified 2026-08-08

Every source below was probed (endpoint curled, feed fetched, or docs confirmed) on 2026-08-08. Re-verify before building; "uncertain" items must be tested with a real signup first. **Rule: public-domain government feeds are the only content we republish verbatim. Everything else is headline + attribution + link, or query-and-display.**

## MVP ingestion stack (R2)

### (a) Daily incident ingestion
| Priority | Source | Why |
|---|---|---|
| 1 | **DeFiLlama Hacks** — `https://api.llama.fi/hacks` | Free, keyless, clean JSON (612 records, current to Aug 3 2026: name/date/USD/chain/technique). The structured backbone. Attribute + link. |
| 2 | **Regulator RSS (public domain — republishable verbatim)**: FBI IC3 PSAs `https://www.ic3.gov/PSA/RSS` · SEC litigation `https://www.sec.gov/enforcement-litigation/litigation-releases/rss` · CFTC press `https://www.cftc.gov/RSS/RSSGP/rssgp.xml` · FTC consumer protection `https://www.ftc.gov/feeds/press-release-consumer-protection.xml` | Filter by crypto keywords. **SEC requires a declared User-Agent with contact email** (else 403). Zero licensing risk. |
| 3 | **Rekt.news RSS** `https://rekt.news/rss/feed.xml` + **SlowMist Hacked** `https://hacked.slowmist.io/en/` | Enrichment/cross-check ONLY. Both all-rights-reserved: **never mirror their text** — headline + link, cite as source in dossiers. |

### (b) News ticker
1. **CryptoPanic API v2** — `https://cryptopanic.com/api/{PLAN}/v2/posts/`, free dev token at `cryptopanic.com/developers/api/keys`. 5 req/s; RSS endpoint caps at 20 items. Free tier historically requires visible attribution/link-back — **confirm terms at signup**.
2. **Bitcoin Optech** — `https://bitcoinops.org/feed.xml` (weekly; #417 Aug 7 2026). CC BY-SA — republishable with credit; best Bitcoin-specific security items.
3. Regulator RSS interleaved as "OFFICIAL ADVISORY" ticker entries.
- ❌ **CoinDesk Data API**: free tier retired May 21 2026; Lite is $499/mo. Skip.

### (c) Wallet/address check (layered, cheapest first)
1. **ScamSniffer scam-database** — `https://github.com/scamsniffer/scam-database` (address + domain blacklists; pushed daily, actively maintained). Free tier is **7-day delayed**; real-time API is $999/mo. **GPL-3.0**: querying is fine; wholesale redistribution triggers copyleft — serve lookups, don't re-export the dataset.
2. **MetaMask eth-phishing-detect** — `https://github.com/MetaMask/eth-phishing-detect` `src/config.json` (domains, not addresses; still updated). License = NOASSERTION — check LICENSE before redistribution; server-side lookups low-risk.
3. **Chainalysis free sanctions screening** — was `https://public.chainalysis.com/api/v1/address/{addr}` (free key, binary sanctioned/not). Docs relocated + Cloudflare-blocked in 2026 probes: **status uncertain — validate with real signup before building on it.**
4. **Chainabuse (TRM)** — docs at `docs.chainabuse.com`. Free key = **10 calls/month** → live lookups impossible on free tier. MVP: deep-link out to `chainabuse.com/address/{addr}`; in parallel apply for partner tier (5,000 calls/hr) via hello@chainabuse.com with a professional email.

## Dead / merged — do not build on
- **CryptoScamDB** — API returns 502; repo dead since Apr 2023.
- **BitcoinAbuse** — merged into Chainabuse (stated on its own homepage).
- **Whale Alert** — alive but paid, weak fit for anti-scam; skip.

## ToS red flags (memorize)
1. Rekt.news + SlowMist: all rights reserved — cite, never republish text.
2. ScamSniffer: GPL-3.0 copyleft on redistribution; $999/mo for real-time.
3. CryptoPanic: attribution/link-back likely required on free tier — confirm at signup.
4. SEC: declared User-Agent header (`BTCSCAM contact@btcscam.com`) or you get rate-limit 403s.
5. Chainabuse API omits evidence/geolocation data; deeper data is Pro-gated.

## Ingestion architecture (R2 sketch)
```
Vercel cron (daily)
  → fetch: llama.fi/hacks + 4 regulator RSS + optech feed + cryptopanic
  → normalize into draft incidents (schema: data/schemas/incident.schema.json)
  → dedupe vs existing registry (by entity + date window)
  → DRAFT QUEUE (Supabase) — trustState capped at "reported"
  → human review (Monday Sweep) promotes to corroborated/verified → publish
```
Nothing auto-publishes above "reported." The trust ladder is editorial, not algorithmic.
