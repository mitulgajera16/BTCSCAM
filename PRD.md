# BTCSCAM.com — Product Requirements & Strategy
**Version 2.0 · 2026-08-11 · Owner: Mitul Gajera**
Status: R1–R3 shipped and live · Phase Community approved 2026-08-11 (research: `docs/research/`, approved delta: `docs/research/synthesis/prd-delta.md`) · Design contract: `design-reference/BTCSCAM Portal v4.dc.html` (locked identity)

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
- **The anti-black-hole promise (core positioning, evidence-backed — I-5):** Every incumbent channel is a black hole — file a report, hear nothing, forever. BTCSCAM's core promise is the opposite: **every report has a visible status, every outcome is published.** This differentiator now leads; speed supports it.
- **Explicitly not:** a price site, a token project, a generic crypto news outlet, a place that sells "recovery services" ads (the #1 secondary-scam vector — see Guardrails).

## 4. North Star & metrics

**North Star: Weekly Answered Checks (WAC)** — sessions where a user gets a concrete verdict: a database lookup with a result, a wallet check completed, or an incident dossier read to the "how to protect yourself" block. This is the countable unit of "someone got safer."

| Type | Metric | Target / stage |
|---|---|---|
| North star | Weekly Answered Checks | 2,000/wk at 6 months |
| Input | Verified incidents published | 3+/wk (editorial floor) |
| Input | Median time: incident occurs → dossier live | < 48h |
| Loop | Check → report conversion | > 2% (Stage B+, the core loop's hinge) |
| Loop | Report completion rate | Stage C baseline, then improve |
| Loop | Time-to-first-status on reports | < 72h (Stage C — the anti-black-hole promise, measured) |
| Loop | Outcome counter (takedowns confirmed) | first confirmed takedown by end of Stage C |
| Loop | Contributor retention (repeat corroborators) | Stage D — empty-rooms early warning |
| Guardrail | Corrections rate on Verified-labeled items | < 2%, all publicly logged |
| Guardrail | Zero paid listings / zero recovery-service ads | absolute |

Newsletter subscriber targets are removed — the newsletter is deferred to Stage C/D at the earliest (see §6). **Commitment in principle (I-15):** once volume makes them meaningful, we publish our own outcome metrics publicly — a first-in-category trust move. Exact metric set and threshold are parked (§9).

## 5. Scope — shipped foundations + Phase Community

### R1–R3: SHIPPED (live, all three releases, as of 2026-08-08)
- **R1 "The Paper":** front page (ticker, alert bar, incidents, guides rail), registry with facets, dossier template, MDX guides, report form. Live on Vercel.
- **R2 "The Wire":** ingestion pipeline → draft queue → human verify (nothing auto-publishes above "Reported"), /check with verdict page, data-driven ticker, RSS/JSON feeds (`/feed.xml`, `/api/incidents`), Supabase with revision history + public corrections log.
- **R3 "The Watchmen" (machinery):** accounts, report flow with evidence chips, reporter → Watchman ladder, verify-votes, /desk, /reports/open ledger, /standards.
- **Newsletter (Rug Report): ON HOLD** — all surfaces removed 2026-08-10; revival is a Stage C/D decision at the earliest. Monetization v1 (Pro alerts, store) remains future work.

Content state at phase start: 3 incidents + 1 guide, zero community users — which is why activation, not machinery, is the current phase.

### Phase Community (CURRENT — activation, per `docs/research/synthesis/phase-community-roadmap.md`)
The reshape in one line: content seeds first (Stage A), the findable check second (Stage B), the feedback loop closes third (Stage C), community mechanics activate last (Stage D), with Stage 0 ops hygiene first. Every living platform launched pre-seeded; the empty form never bootstraps (I-6).

**Community scope corrections from evidence** (insight numbers cite `docs/research/synthesis/insight-memo.md`):
- Verify-votes are **reputation-bearing**: corroborations later overturned cost ladder standing; the math is simple and published (I-2).
- Corroborators get **named credit** on dossier pages; contributor identity is pseudonymous-by-default, generated not registered, per-context exposure (I-3).
- **Ladder copy law:** reporting is framed as protecting the next person, never as victimhood (I-4).
- **REJECTED permanently:** monetary/token incentives; forum; public comments (I-4, I-9).

## 6. LNO on the build (where effort actually pays)

- **Leverage** (do these excellently): **guide production — FIRST 4** (wallet-phishing recognition + hardware authenticity as a pair in the live Coldcard window, then recovery-service scams, seed storage — I-13); **dossier seeding to 10–15** documented public cases per `docs/research/synthesis/seeding-playbook.md` (the activation supply, I-6); incident schema + dossier template; trust-ladder language & corrections policy (the brand IS this); SEO title/permalink structure targeting victim phrase grammar ("is X a scam", I-8).
- **Neutral** (do fine, timebox): maintenance of shipped screens (design is done — execute, don't redesign); deploy pipeline.
- **Overhead** (do fast or defer): forum (rejected permanently), store, **logo decision** (don't block anything on it), **newsletter revival** (Stage C/D at the earliest), analytics beyond basics.

## 7. Pre-mortem (it's Feb 2027 and this failed — why?)

**Tigers (real, must mitigate):**
1. **Defamation/legal exposure** — we called something a scam; a "founder" lawyers up. → Mitigation: trust-ladder wording is legal armor ("Reported by 3 users, unverified" is a fact); Verified label requires 2+ independent primary sources; public corrections log; documented takedown/dispute process **before** launch; never state losses without source.
2. **Solo-founder throughput** — 3 incidents/wk editorial floor dies by week 6. → Mitigation: ingestion pipeline drafts 80% (R2 is the real product); backfill evergreen dossiers (top-20 historical scams) that need no freshness; weekly batch ritual (Monday Sweep) not daily publishing.
3. **The checker moment needs Google** — SEO takes 6-12 months. → Mitigation: programmatic dossier pages target long-tail scam-name queries from day 1; distribute each incident natively where victims already are (Reddit r/Bitcoin, X, HN when relevant) with dossier as canonical link; newsletter converts spikes into a durable channel.
4. **Recovery-scam colonization** — every victim surface gets farmed within hours; a live recovery-scam solicitation was captured inside a victim help thread during research (I-9). → Mitigation: recovery-scam warning banner on every dossier; **no free-text comment/review surfaces, ever**; dirty-verdict abstention policy on /check.
5. **Brand cloning** — chainabuse.report intercepted Chainabuse's brand within weeks of launch (I-14). → Mitigation: canonical-domain notice on-site + clone monitoring (live); typo/TLD registrations deferred by owner decision 2026-08-11 — revisit if a clone appears.

**Paper tigers (look scary, aren't):** competitor copies us (verification throughput + brand don't copy); "crypto is dead" cycles (scams are counter-cyclical — bull runs breed scams, bear markets breed desperation scams); data source shuts down (multi-source by design).

**Elephant in the room:** *Is this a business or a public good?* Answer honestly: it's a trust asset. Direct revenue (Pro alerts, store, donations) likely stays small for a year. Its strategic value: the trust brand + audience feeds KeepCrypt/Bitwill/inheritance-services (Mitul's actual business line) with the most safety-conscious Bitcoin audience on the internet — *with disclosure, as house products, never as hidden ads*. Decide budget as marketing-for-the-portfolio, not standalone P&L, and it stops feeling like failure at month 6.

## 8. Editorial constitution (product law, enforced in UI)

1. Every incident shows its **trust state** and its **sources**. No source, no publish.
2. **Severity ≠ verification** — separate chips, never conflated (already in design).
3. Staleness is labeled (>90 days banner — already in design). Old truth decays.
4. Corrections are public and permanent. We are wrong out loud.
5. Numbers are honest: no fake member counts (design already replaced "41,208 WATCHMEN" with "PAID LISTINGS 0" — keep that spirit).
6. **We never sell trust:** no paid listings, no exchange ads, no "recovery service" ads, affiliate/house-product links always disclosed inline.
7. **Objects, not people.** The ledger and registry name addresses, domains, and handles — never legal names. Human names appear only in bylined editorial articles where BTCSCAM acts as publisher. A known-good safelist and a dispute/right-of-reply lane exist before any community promotion mechanics go live (I-10).
8. **The dirty verdict sells nothing.** Stated on-page: "We sell nothing on this page on purpose — anyone promising recovery of these funds is running the second half of the scam." (I-9)
9. **No free-text testimonial surfaces.** Comments, reviews, and open threads are structurally banned; evidence chips and reputation-staked verify-votes are the only community inputs (I-9).
10. **Disclosure grammar.** House-product links are first-person, commercial-relationship-explicit, HIBP-style ("our own product — we profit if you buy it"), and only where the product is the advice (I-11).
11. **The reports covenant.** Reports stay public and free forever; never sold, gated, or licensed. Breaking this is the Web-of-Trust ending.

## 9. Open questions

**Closed 2026-08-11:** domain (live on Vercel); logo (Overhead — not blocking); newsletter vendor (newsletter itself deferred to Stage C/D); corrections/dispute policy (now constitution law in §8 + the /standards page).

**Open:**
- Chainabuse partner-tier application status (conflict disclosed in `docs/research/00-program.md`).
- X/Twitter demand signal — PARKED (API paywalled; I-18).
- Outcome-metrics publication threshold (I-15) — commitment in principle stands; decide the metric set when volume exists.
- Archive re-run completion for the demand-map permalinks (I-18) — Stage 0 ops item.

## 10. Reference docs in this repo

- `docs/research/` — Phase-Community research program: `01`–`05` + `synthesis/` (insight memo, roadmap, approved prd-delta, article pipeline, seeding playbook, state-of-scam-reporting brief)
- `docs/data-sources.md` — verified APIs/feeds + MVP ingestion stack
- `docs/growth-playbook.md` — community + distribution loops
- `data/schemas/incident.schema.json` — the incident contract
- `content/` — launch content (incidents + guides)
- `design-reference/` — exported v4 design (the design contract)
