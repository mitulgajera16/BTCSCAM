# BTCSCAM.com — Product Requirements & Strategy
**Version 1.0 · 2026-08-08 · Owner: Mitul Gajera**
Status: Approved for build · Design contract: `design-reference/BTCSCAM Portal v4.dc.html` (locked identity)

---

## 0. The one-sentence product

**BTCSCAM is the anti-scam paper of record: a newsroom-with-tools where anyone can check a wallet, a device, or a "too good to be true" offer against verified real incidents — before they lose money.**

---

## 1. Why this, why now (Real Problem™)

- Crypto scam losses run to billions per year and the *reporting* of them is fragmented: enterprise tools (Chainabuse/TRM) serve investigators, exploit trackers (Rekt, DeFiLlama hacks) serve DeFi degens, and victims' first touchpoint is usually Reddit threads or too-late regulator press releases.
- The moment of highest intent — "is this a scam?" typed into Google at 11pm before someone sends funds — is served by SEO spam, affiliate blogs, and outdated forums. Nobody owns that moment with **verification discipline + plain language**.
- Hardware wallet users (the most safety-conscious cohort!) get hit by phishing waves and supply-chain scares (see the Coldcard incident dossier, our seed content) and there is no single place that says *what actually happened, what's confirmed vs rumor, and what to do*.
- **Insight that makes this a product, not a blog:** scam information has a trust-decay problem. A Reddit warning is unverifiable; a regulator alert is 6 months late. Our wedge is the **trust ladder** (Reported → Corroborated → Verified → Resolved/Disputed) applied to *fresh* incidents — speed of a forum, standards of a newsroom.

## 2. Who it's for (in priority order)

| Segment | Job to be done | Why they come back |
|---|---|---|
| **The Checker** (largest) | "Is this address/site/offer/device a scam?" — 30-second answer before sending money | Bookmark-able check tools; incident freshness |
| **The Holder-Learner** | "Set up my self-custody safely" (seed entropy, device verification, inheritance) | Guides tied to real incidents, not theory |
| **The Reporter/Watchman** | "I saw/experienced a scam — warn others, feel agency" | Status ladder, evidence-chip verification, named credit |
| **The Journalist/Researcher** | Citable, dated, sourced incident records | Permalink dossiers with source lists |

Non-target (for now): enterprise compliance, law enforcement, token-price audience.

## 3. Strategy — wedge, moat, counter-positioning

- **Wedge:** Bitcoin-first incident coverage + the check tools, in one brand. "Bitcoin-first" is a feature: it counter-positions against DeFi-exploit trackers and lets us go deep on hardware wallets, seed hygiene, and inheritance — topics with durable search demand.
- **Moat (in order of realism):**
  1. **Structured incident corpus** — dated, sourced, trust-labeled dossiers accumulate into the best-indexed answer for "is X a scam" queries. Content compounds; aggregators can't match editorial verification.
  2. **Community of verifiers (Watchmen)** — reporter → verifier ladder creates contributor lock-in and throughput no solo editor can match.
  3. **Brand** — "the anti-scam paper of record" + the newspaper design is memorable and screenshot-able; trust brands in security compound.
- **Counter-positioning:** Chainabuse is enterprise-gated and multi-chain generic; Rekt is insider-tone DeFi; regulators are slow and unreadable; Reddit is fast and unverified. We are *fast AND verified AND readable* — that combination is the product.
- **Explicitly not:** a price site, a token project, a generic crypto news outlet, a place that sells "recovery services" ads (the #1 secondary-scam vector — see Guardrails).

## 4. North Star & metrics

**North Star: Weekly Answered Checks (WAC)** — sessions where a user gets a concrete verdict: a database lookup with a result, a wallet check completed, or an incident dossier read to the "how to protect yourself" block. This is the countable unit of "someone got safer."

| Type | Metric | 6-month target |
|---|---|---|
| North star | Weekly Answered Checks | 2,000/wk |
| Input | Verified incidents published | 3+/wk (editorial floor) |
| Input | Median time: incident occurs → dossier live | < 48h |
| Loop | Check → report conversion | > 2% |
| Loop | Rug Report (newsletter) subscribers | 1,000 |
| Guardrail | Corrections rate on Verified-labeled items | < 2%, all publicly logged |
| Guardrail | Zero paid listings / zero recovery-service ads | absolute |

## 5. Scope — three releases

### R1 "The Paper" (weeks 1–3) — static but real
Port from v4 design, content from files in repo (no DB, no auth):
1. **Front page** — ticker, CRITICAL alert bar (manual flag), latest incidents, guides rail
2. **Incident database** — the merged "Registry" screen; data from `data/incidents/*.json`; facets Type/Severity/Trust-state; severity strip computed from data
3. **Incident dossier page** — template rendering the incident schema (launch content: Coldcard incident + 2 backfilled classics)
4. **Guides** — MDX; launch: *Seed Phrase Entropy* (+ device-verification guide next)
5. **Report a scam** — form → email/GitHub issue intake (manual triage; productize in R3)
6. **Rug Report capture** — newsletter signup (Buttondown/Resend), the v3 capture band
- Deploy: Vercel, `btcscam.com`. All 26 designed screens NOT required — these 6 surfaces only. **Cut ruthlessly: no forum, no store, no accounts in R1.**

### R2 "The Wire" (weeks 4–8) — live data
7. **Ingestion pipeline** — scheduled pulls from sources in `docs/data-sources.md` → *draft queue* → human verify → publish. **Nothing auto-publishes above "Reported."** Trust ladder is editorial, not algorithmic.
8. **Wallet/address check** — query against aggregated blacklists + our own incident-linked addresses; verdict page with next-step links (v3 design already has clean-verdict pattern)
9. **Ticker & alert bar driven by data**; RSS + JSON feed of our own incidents (be a source others cite)
10. Supabase (Postgres) replaces JSON files; incidents get revision history + public corrections log

### R3 "The Watchmen" (weeks 9–16) — community
11. Accounts; report flow with evidence chips; reporter → Watchman ladder (per design's My Desk tier mechanics)
12. Verify-votes vs upvotes (already designed); MOD tooling; first-run onboarding
13. Monetization v1: Rug Report Pro (early alerts), store (SeedBook synergy — KeepCrypt cross-sell with disclosure), donations. **No listing fees, no ads from exchanges/recovery firms, ever.**

## 6. LNO on the build (where effort actually pays)

- **Leverage** (do these excellently): incident schema + dossier template (every future page inherits its quality); trust-ladder language & corrections policy (the brand IS this); the Coldcard launch dossier (proof-of-concept for "fast AND verified"); SEO title/permalink structure for "is X a scam" queries.
- **Neutral** (do fine, timebox): Next.js port of designed screens (design is done — execute, don't redesign); newsletter wiring; deploy pipeline.
- **Overhead** (do fast or defer): forum, store, accounts, logo decision (still pending in Claude Design — don't block launch), analytics beyond basics.

## 7. Pre-mortem (it's Feb 2027 and this failed — why?)

**Tigers (real, must mitigate):**
1. **Defamation/legal exposure** — we called something a scam; a "founder" lawyers up. → Mitigation: trust-ladder wording is legal armor ("Reported by 3 users, unverified" is a fact); Verified label requires 2+ independent primary sources; public corrections log; documented takedown/dispute process **before** launch; never state losses without source.
2. **Solo-founder throughput** — 3 incidents/wk editorial floor dies by week 6. → Mitigation: ingestion pipeline drafts 80% (R2 is the real product); backfill evergreen dossiers (top-20 historical scams) that need no freshness; weekly batch ritual (Monday Sweep) not daily publishing.
3. **The checker moment needs Google** — SEO takes 6-12 months. → Mitigation: programmatic dossier pages target long-tail scam-name queries from day 1; distribute each incident natively where victims already are (Reddit r/Bitcoin, X, HN when relevant) with dossier as canonical link; newsletter converts spikes into a durable channel.

**Paper tigers (look scary, aren't):** competitor copies us (verification throughput + brand don't copy); "crypto is dead" cycles (scams are counter-cyclical — bull runs breed scams, bear markets breed desperation scams); data source shuts down (multi-source by design).

**Elephant in the room:** *Is this a business or a public good?* Answer honestly: it's a trust asset. Direct revenue (Pro alerts, store, donations) likely stays small for a year. Its strategic value: the trust brand + audience feeds KeepCrypt/Bitwill/inheritance-services (Mitul's actual business line) with the most safety-conscious Bitcoin audience on the internet — *with disclosure, as house products, never as hidden ads*. Decide budget as marketing-for-the-portfolio, not standalone P&L, and it stops feeling like failure at month 6.

## 8. Editorial constitution (product law, enforced in UI)

1. Every incident shows its **trust state** and its **sources**. No source, no publish.
2. **Severity ≠ verification** — separate chips, never conflated (already in design).
3. Staleness is labeled (>90 days banner — already in design). Old truth decays.
4. Corrections are public and permanent. We are wrong out loud.
5. Numbers are honest: no fake member counts (design already replaced "41,208 WATCHMEN" with "PAID LISTINGS 0" — keep that spirit).
6. **We never sell trust:** no paid listings, no exchange ads, no "recovery service" ads, affiliate/house-product links always disclosed inline.

## 9. Open questions (decide by R1 ship)

- Domain: confirm btcscam.com is secured and points to Vercel.
- Logo: Redaction vs Stamp (pending in `Logo Concepts.dc.html`) — pick one, ship, iterate.
- Newsletter vendor: Buttondown (cheap, API) vs Resend Broadcasts — decide in R1 week 2.
- Corrections/dispute policy page: draft with a template before first Verified label ships.

## 10. Reference docs in this repo

- `docs/data-sources.md` — verified APIs/feeds + MVP ingestion stack
- `docs/growth-playbook.md` — community + distribution loops
- `data/schemas/incident.schema.json` — the incident contract
- `content/` — launch content (incidents + guides)
- `design-reference/` — exported v4 design (the design contract)
