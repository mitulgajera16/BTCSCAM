# 02 — Free-Tool Funnels: Chainabuse/TRM Economics, Analog Cases, and the BTCSCAM Funnel-Surface Spec

**Program:** Phase-Community research (see `00-program.md`) · **Agent:** 2 ECONOMICS · **Date:** 2026-08-11

Research date: 2026-08-11. Tags: **VERIFIED** (fetched + quoted + URL), **ESTIMATE** (method stated), **UNVERIFIED** (excluded from recommendations).

---

## Part 1 — Chainabuse / TRM Labs deep-dive

### 1.1 Origin story

**VERIFIED** — Chainabuse launched **May 18, 2022**, announced by TRM Labs with founding industry partners **Circle, Solana Foundation, The Aave Companies, Hedera, Binance.US, and Civic** (TRM launch blog; Circle press release). Circle's release: "Chainabuse is the first multi-chain, community-powered crypto scam reporting tool and is available for anyone to use for free."

**VERIFIED** — Stated rationale: the 2021 bull market (crypto at ~$3T peak) produced a flood of scams while community warnings were scattered across social media and hard to validate. TRM CEO Esteban Castaño framed it as an adoption problem: "The latent fear of inadvertently investing in a rugpull – or being hacked – hampers mainstream crypto adoption."

**VERIFIED** — BitcoinAbuse absorption: TRM **acquired Bitcoinabuse.com on October 11, 2023** and folded its legacy data into Chainabuse: "All previously reported scam data has been combined into a single platform to check transactions, URLs and blockchain addresses" (Yahoo Finance carrying the PR). BitcoinAbuse had been the de-facto Bitcoin scam-address database since 2018 (founded by engineer Alan Reed, per PR coverage). Castaño: "Chainabuse enables everyone, everywhere, to report malicious crypto activity and get connected to the support they need."

### 1.2 TRM Labs, the company

**VERIFIED** — Founded **2018** by **Esteban Castaño (CEO) and Rahul Raina (CTO)**, San Francisco; Y Combinator alum (YC company directory; batch S19 per third-party listings — batch designation UNVERIFIED).

Funding history (press-release-grade unless noted):

| Round | Amount | Date | Lead | Notes |
|---|---|---|---|---|
| Pre-seed | undisclosed | 2018 | Blockchain Capital | **VERIFIED** via Series C coverage (PYMNTS/Fortune) |
| Seed | $4.2M | 2019 | — | **Crunchbase-class only** (Medium/секondary coverage; no PR found) |
| Series A | $14M | announced Jun 2021 | Bessemer Venture Partners | **VERIFIED** (TRM blog + IBS Intelligence); PayPal Ventures, Initialized, Jump, Salesforce Ventures, Operator Partners, Blockchain Capital participated |
| Series B | $60M | Dec 7, 2021 | Tiger Global | **VERIFIED** (Business Wire PR); Amex Ventures, Visa, Citi Ventures, DRW, Jump, Marshall Wace, Block, PayPal Ventures |
| Series B expansion | $70M (B total $130M) | Nov 9, 2022 | Thoma Bravo | **VERIFIED** (Business Wire / Thoma Bravo PR); Goldman Sachs joined |
| Series C | $70M at **$1B valuation** | Feb 4, 2026 | Blockchain Capital (returning) | **VERIFIED** (GlobeNewswire/TRM blog/Thoma Bravo PR/Fortune); Goldman Sachs, Bessemer, Brevan Howard Digital, Thoma Bravo, Citi Ventures, Galaxy Ventures, DRW, CMT Digital, Y Combinator, Alumni Ventures |

Total disclosed equity ≈ **$218M+**.

**VERIFIED** — What TRM sells (Series C PR language): "blockchain analytics solutions to help law enforcement and national security agencies, financial institutions, and cryptocurrency businesses detect, investigate, and disrupt crypto-related fraud and financial crime." Customers: agencies in 50+ countries; named commercial customers include Circle, Coinbase, Cross River Bank, PayPal, Robinhood, Stripe, Visa.

### 1.3 Funnel mechanics

**VERIFIED**, from docs.chainabuse.com:
- **Free**: reporting, searching, browsing; standard API key at "10 calls per month (1 call= maximum of 50 reports)".
- **Partner tier**: by application — "Partners have access to premium access. Please reach out here: https://www.chainabuse.com/partner-contact"; rate limit "max 5,000 calls/ hour".
- **Law-enforcement tier**: "Law Enforcement has access to specific API filters and can retrieve data (such as victim's location, evidence, scammer's IP addresses, social media handles, private reports not visible on the website and much more)."
- **Chainabuse Pro**: "Chainabuse Pro is a gated software module that helps investigators accelerate triaging and investigation of cases" — enriched data "only made available to pre-vetted Partners." **No public pricing exists anywhere in the docs** (verified absence).
- Contact for partnership runs through **chainabuse@trmlabs.com** — the funnel literally terminates in a TRM inbox.

**VERIFIED** — Self-published scale: ~500K reports by Oct 2023 (acquisition PR); "over 700,000 incidents of scams reported since the platform's establishment in 2022" as of the **Operation Shamrock** partnership announcement (TRM blog, Nov 2024), where Chainabuse became the official reporting partner of a law-enforcement/industry anti-pig-butchering coalition. **The "~1M reports" figure**: a 2026 third-party review says "nearly 1M" — plausible extrapolation but **UNVERIFIED on Chainabuse's own surfaces** (the site is a JS app that doesn't server-render stats; latest self-published number remains 700K+).

**Traffic — ESTIMATE only.** Method: report-cadence proxy. Verified anchors give ~200K new reports in the 13 months Oct 2023→Nov 2024 (~500/day). Applying the 90-9-1 participation heuristic (1–5% of visitors contribute), that implies roughly 10K–50K visits/day → **order of magnitude 10⁵–low 10⁶ visits/month**. Caveats both ways: partner/API bulk submissions inflate report counts; check-only lookups (the majority use case) deflate them. Secondary proxy: strong citation footprint — launch coverage across Cointelegraph + six partner blogs, inherited BitcoinAbuse's 2018-era backlink base, and law-enforcement referral channels via Operation Shamrock. Similarweb-class panel numbers for a niche site like this are noise; no precise visitor figure should ever be quoted.

### 1.4 Is Chainabuse directly monetized?

**Hypothesis confirmed: it is a free public-good product that feeds the enterprise funnel.** Evidence:
1. No pricing page, no self-serve paid tier, no ads (VERIFIED absence across site/docs).
2. Every gate (partner API, LE tier, Pro) is **application-gated, not payment-gated**, and routes to TRM sales/partnership channels (chainabuse@trmlabs.com).
3. The enriched-data tiers map exactly onto TRM's paying customer segments (law enforcement, compliance teams, investigators).
4. The data flywheel: 700K+ victim reports are a proprietary fraud-intelligence corpus that TRM's paid platform can leverage; TRM's own Series C materials list Chainabuse among its solutions ("Block illicit cashouts — Scam reporting platform").
5. Branding: TRM launch PR, TRM-hosted blog, TRM contact addresses — the free tool wears the parent's name at every trust moment.

One nuance: **Chainabuse Pro may carry a fee for vetted partners** (pricing undisclosed) — so the more precise model is "free public good → application-gated enrichment → TRM enterprise contract," a three-step ladder rather than a two-step one.

---

## Part 2 — Analog cases

### 2.1 Have I Been Pwned → 1Password (the benchmark)

- **Free**: email breach search, breach notifications; Pwned Passwords API — "freely accessible without the need for a subscription and API key… There is no rate limit on the Pwned Passwords API" (**VERIFIED**, HIBP API docs). K-anonymity model: only the first 5 hash chars are sent — "a privacy-preserving approach which does not disclose the address being searched to HIBP" (**VERIFIED**).
- **What converts**: (a) the 1Password placement (March 2018, ongoing); (b) the authenticated email/domain-search API at **$3.50/month** — Troy's stated reason was **abuse prevention, not revenue**: requiring a credit card deterred bad actors, and after years of data abuse became "near non-existent" (**VERIFIED**, troyhunt.com; exact-quote fidelity on the reasoning passage is imperfect in extraction, so treated as close paraphrase).
- **Disclosure language (VERIFIED, quote at length — this is the Part 3 benchmark)**:
  - "Clearly, this is a commercial relationship - 1Password pays to get their product in front of people via HIBP."
  - "I've never received either product for free (I've paid retail prices for both for years), and I've never been paid to endorse either of them."
  - "This is a product I was already endorsed in by my own free volition and from the perspective of my own authenticity, that was *very* important." (sic)
  - "people going and getting themselves the very password manager that I've used myself for so many years is the single best security advice I could give."
- **Refused to monetize**: the core service itself — "I always intend to run the services I do today for free - I've absolutely no intention of changing that" (**VERIFIED**); and any acquirer requiring compromise (see failure case).
- **Failure case — Project Svalbard (VERIFIED)**: Troy's 2019 attempt to sell HIBP (KPMG-run process, 141 candidates, months of exclusivity) collapsed in March 2020: "It was a change in business model that not only made the deal infeasible from their perspective, but also from mine; some of the most important criteria for the possible suitor were simply no longer there." He walked rather than settle: "all other candidates would mean making concessions I simply couldn't justify," and "Have I Been Pwned is no longer being sold and I will continue running it independently."
- **Lesson**: disclosure works when it is first-person, specific, and shows skin in the game ("I've paid retail prices for years") — and when the promoted product *is* the advice, not adjacent to it. Also: a trust asset is nearly unsellable without destroying it; plan to hold.

### 2.2 VirusTotal → Google → Chronicle → Google Cloud

- **Free**: multi-engine file/URL/domain scanning (70+ engines), public community, rate-limited public API — "VirusTotal is free to end users for non-commercial use in accordance with our Terms of Service" (**VERIFIED**, docs).
- **What converts**: Premium/Enterprise — "tools to perform complex criteria-based searches to identify and access harmful files samples for further study" (**VERIFIED**); plus the corporate exits: founded 2004 by Bernardo Quintero/Julio Canto under Hispasec (Málaga), **acquired by Google Sept 2012**, moved into **Chronicle 2018**, folded into **Google Cloud 2019** (Wikipedia + Spanish tech press; acquisition itself widely reported — VERIFIED at press level).
- **Disclosure language (VERIFIED)**: the reciprocity contract is stated openly — "Scanning reports produced by VirusTotal are shared with the public VirusTotal community," and "The contents of submitted files or pages may also be shared with premium VirusTotal customers." Partners "agree to contribute to the effort to raise global IT security levels."
- **Refused to monetize**: scanning itself — free for 20+ years through three ownership changes. Structurally there is no pay-to-remove-detection: verdicts belong to third-party engines, not VT (structural observation, not a quoted policy — **UNVERIFIED as explicit policy**).
- **Lesson**: say out loud what happens to contributed data. VT's entire model — your upload becomes community intelligence — is disclosed in plain sentences, and that candor is why researchers keep feeding the corpus that premium customers pay to search.

### 2.3 Shodan

- **Free**: registered account with limited search results, restricted filters, small credit allowance (**VERIFIED** via multiple pricing reviews + shodan account/billing pages).
- **What converts**: the famous **$49 one-time lifetime membership** (100 query + 100 scan credits/month, UI filters); then subscription API plans at **$69/mo (Freelancer), $359/mo (Small Business), $1,099/mo (Corporate)**; enterprise data licensing above that (**VERIFIED** at review-site level; Shodan publishes no single canonical pricing page for all tiers).
- **Disclosure language**: minimal — Shodan doesn't do trust theater; the product is the data.
- **Refused to monetize**: the existence of the data itself — anyone can confirm a finding for free; payment buys scale, filters, exports, and commercial use.
- **Lesson**: a cheap one-time membership is a powerful hobbyist→professional ramp; put the paywall on volume and workflow, never on the basic answer.

### 2.4 Etherscan

- **Free**: the entire explorer UI, and a free API tier (5 calls/sec across all chains) (**VERIFIED**, Etherscan info center + docs).
- **What converts**: API Pro tiers (Standard/Advanced/Professional, Pro-only endpoints), plus a 2026 **"Lite" plan at 25% of the previous lowest paid tier**, introduced with an explicitly stated cost rationale: rising chain throughput means "free universal coverage is no longer sustainable" (**VERIFIED**, info.etherscan.com); labeled sponsored slots exist on the site (**UNVERIFIED specifics** — not fetched).
- **Disclosure language (VERIFIED)**: "Etherscan is not funded, operated, or managed by the Ethereum Foundation but instead exists as an independent entity" — independence stated as a feature, on their own support pages.
- **Refused to monetize**: their labeling/name-tag system (scam/phish flags) has no published paid path in or out (**UNVERIFIED as formal policy** — excluded from recommendations).
- **Lesson**: when economics force a paywall move, publish the cost math. Etherscan narrates *why* the free tier shrank, which converts a potential betrayal story into an operations story.

### 2.5 urlscan.io

- **Free**: 50 private scans, 5,000 public scans, 1,000 searches/month (**VERIFIED**, urlscan blog/FAQ); commercial *use* of the free tier in SOC workflows is explicitly allowed.
- **What converts**: commercial API subscriptions, and **urlscan Pro** (threat-hunting portal + phishing feed); unlisted-scan visibility is a Pro privilege — unlisted scans are visible to "vetted security researchers and companies which are subscribers to our urlscan Pro platform" (**VERIFIED**).
- **Disclosure language (VERIFIED)**: "We do not share any data with our sponsors that wouldn't otherwise be available to regular customers." And the visibility guidance: choose Public when "There is no PII or confidential data in the URL and you want it to be discoverable by other researchers."
- **Refused to monetize**: sponsor privileges over community data (the quote above is exactly that refusal, in writing).
- **Lesson**: tier by **visibility**, not by capability — free users pay with public contributions that build the corpus the paid product hunts across.

### 2.6 FAILURE CASE — Web of Trust (WOT)

**VERIFIED** — WOT was a free crowd-sourced website-reputation extension (~140M downloads claimed) that monetized by selling "anonymized" user browsing histories. In November 2016, German public broadcaster **NDR** demonstrated the data was trivially de-anonymizable — journalists re-identified 50+ users, exposing emails embedded in URLs, health details, sexual preferences, phone numbers. Mozilla and Google pulled the extension from their stores within days. WOT's own concession: its data-cleaning "may not have been sufficient to fully anonymize the browsing data WOT users shared with us." The brand never recovered its standing.

**Lesson**: WOT's product *was* trust, and it monetized the trust substrate itself (user data). For a trust tool, the fatal monetization is any one where the user is the product. Second failure, softer: **Project Svalbard** (2.1) — even a *well-intentioned* sale process nearly compromised HIBP; independence turned out to be the asset.

---

## Part 3 — Funnel-surface spec: BTCSCAM → Bitwill + KeepCrypt

Constraints honored: no paid listings, no recovery-service ads, house links disclosed inline. Benchmark disclosure = HIBP's 1Password language (commercial relationship named; first-person; skin in the game; the product is the advice). Surfaces grounded in the live repo (`/Users/mitulgajera/Desktop/Dev/btcscam/src/app`: `check`, `guides`, `scam`, `store`, `report`, `registry`, `reports`; `content/guides/seed-phrase-entropy.md`).

| Surface | Product | Precedent (Part 2) | Proposed disclosure copy pattern (1 sentence) | Trust-risk | What to measure |
|---|---|---|---|---|---|
| Guide endings — `seed-phrase-entropy` → hardware seed storage | **KeepCrypt** (SeedBook) | HIBP→1Password: "the very password manager that I've used myself… is the single best security advice I could give" | "SeedBook is our own product — we make it and we profit if you buy it — and it's the exact tool this guide's advice ends at, which is why it's the only link here." | **Low** — product *is* the advice; contextual, disclosed | Conversion: guide→/store CTR, SeedBook attributed sales. Guardrail: guide completion/scroll-depth delta after adding the block; reader complaints |
| Guide endings — custody/estate/"what happens when you die" guides (future) | **Bitwill** | Same HIBP pattern | "Bitwill is our own inheritance service — we run it and it pays for this site — and it exists because everything this guide describes fails silently without a succession plan." | **Low** | Same as above, per-guide |
| Dossier "WHAT TO DO NOW" blocks — incidents where death/incapacity/lost access caused the loss | **Bitwill** | HIBP shows 1Password at the alarm moment — but with first-person restraint, never fear copy | "One disclosed house link: Bitwill is our inheritance service, and we mention it here only because this incident is exactly the failure it was built to prevent." | **Medium** — monetizing an alarm moment; must never read as ambulance-chasing; restrict strictly to inheritance-relevant incidents | Conversion: block CTR→Bitwill. Guardrail: qualitative feedback/complaints, social citations of dossiers (do people still link them as neutral references?) |
| `/check` — **clean verdict** page | **KeepCrypt** | Shodan/urlscan: free answer stays free; upsell rides beside it, never gates it | "Your check is free and always will be; if you want to keep your coins off pages like this, SeedBook is our house cold-storage product — disclosed, and we profit if you buy it." | **Low-med** — fine so long as the verdict itself is never gated or delayed | Conversion: clean-verdict→/store CTR. Guardrail: repeat-check usage rate (do people keep trusting the tool?) |
| `/check` — **dirty verdict** page | **Neither (deliberate abstention)** | Chainabuse routes victims to support, not sales; WOT is what monetizing the victim moment looks like; editorial law already bans recovery ads | "We sell nothing on this page on purpose — anyone who contacts you promising recovery of these funds is running the second half of the scam." | **High if monetized → so don't.** The abstention line is itself the trust play | "Conversion" is the absence: zero commercial links by design. Guardrail: track dirty-verdict pages being screenshotted/cited as warnings (earned trust), victim feedback |
| `/store` page (exists, already disclosed) | **Both** | HIBP benchmark + Etherscan's stated independence | "Everything on this page is ours — BTCSCAM exists partly to fund Bitwill and KeepCrypt — and we list nothing we wouldn't use for our own keys." | **Low** — a store is expected to sell; risk only if house origin is buried | Conversion: store sessions→product sales. Guardrail: none needed beyond keeping disclosure above the fold |
| Newsletter (on hold; when revived) | **Both, alternating single slot** | urlscan's sponsor line: "We do not share any data with our sponsors that wouldn't otherwise be available to regular customers"; Troy's ongoing-sponsor model | "This issue's house link: SeedBook, our seed-storage product — it helps pay for this newsletter, no outside sponsor ever will, and we never share subscriber data with anyone." | **Low-med** — email tolerates one labeled house slot; dies if it becomes a catalog | Conversion: slot CTR. Guardrail: unsubscribe-rate and spam-complaint spikes vs. pre-slot baseline (HIBP-style: watch the trend, not one send) |
| `/report` + `/registry` submission flywheel | **Neither directly** — data asset | Chainabuse: 700K+ reports became the moat TRM's business sits on; VT: disclose what happens to contributions | "Reports you file here stay public and free forever — they make the /check verdicts smarter, and we never sell, gate, or license them to anyone." | **Low** — but the promise is binding forever (VT model); breaking it is the WOT ending | Conversion: none (this is the moat, not the funnel). Guardrail: report volume growth; contributor retention |

---

## Patterns

1. **The free layer is never the revenue layer.** Chainabuse, VT, Shodan, Etherscan, urlscan all keep the basic answer (is this address/file/host/URL bad?) free forever; payment sits on scale, enrichment, workflow, or placement beside the answer — never on the answer.
2. **Community-contributed data is the moat, and free access is the price you pay to keep the flywheel spinning.** Chainabuse's 700K+ reports, VT's sample corpus, urlscan's public scans — the paid product is always "search/triage the corpus the free users built." BTCSCAM's `/report`+`/registry` is the same skeleton at week one.
3. **Disclosure that converts is first-person, commercial-relationship-explicit, and shows skin in the game.** Troy Hunt's "Clearly, this is a commercial relationship" + "I've paid retail prices for both for years" is the ceiling; boilerplate "affiliate disclosure" footers are the floor. The strongest link is the one where *the product is the advice*.
4. **The fatal monetization is the one where the trust substrate itself is sold** — WOT sold browsing data and was dead in a week; urlscan pre-empts the same fear in one sentence about sponsors. For BTCSCAM the equivalent third rails are recovery-service money, paid listings, and the victim moment.
5. **Small paywalls can be governance, not revenue** — HIBP's $3.50/month exists to make abusers show a credit card. If BTCSCAM ever rate-limits `/check` or an API, frame and price it as abuse control, and say so.
6. **Independence is a feature you must state out loud, repeatedly** — Etherscan's "not funded, operated, or managed by the Ethereum Foundation"; Troy's refusal of "concessions I simply couldn't justify"; and when economics force a change, publish the cost math like Etherscan did.

## So what for BTCSCAM

- **The hypothesis held**: the category leader (Chainabuse) earns $0 directly and exists to feed a $1B enterprise company. BTCSCAM's architecture — free trust surface funding/feeding two house products — is the *proven* shape, not a compromise. The difference: TRM's funnel ends in enterprise contracts; ours ends in two consumer products, which is why HIBP (a one-man trust brand converting via a single disclosed consumer product) is the truer role model than TRM.
- **Adopt the HIBP disclosure grammar sitewide now** (first-person, "we profit if you buy it," product-is-the-advice) — the copy patterns in the Part 3 table are drop-in.
- **Make the dirty-verdict abstention an explicit, stated policy** ("We sell nothing on this page on purpose"), not just an absence. It costs nothing, differentiates from every recovery-scam-adjacent site in the niche, and is the single strongest trust signal available.
- **Treat `/report`/`/registry` data with a VT-style public covenant** (stays public, free, never sold) — write it once, honor it forever; it is the long-term moat both products sit beside.
- **Never publish a precise Chainabuse traffic number** in any BTCSCAM content; the defensible statement is "order of 10⁵–10⁶ monthly visits, inferred from report cadence."

## Open questions

1. Is **Chainabuse Pro** actually fee-bearing for vetted partners, or purely access-gated? No public pricing exists; only an application-side probe (partner-contact form) would answer it.
2. What are HIBP's **current (2026) 1Password terms** and whether the partnership survived 1Password's later growth rounds unchanged — relevant if Bitwill/KeepCrypt ever consider third-party placements *on* BTCSCAM (editorial law currently says no; keep it that way pending evidence).
3. Does the dirty-verdict abstention measurably drive return visits/citations? Needs instrumentation before/after the policy line ships.
4. Newsletter revival: which product gets the first slot, and what is the pre-slot unsubscribe baseline to measure against?
5. Should BTCSCAM publish its own self-reported stats (reports filed, checks run) Chainabuse-style — and at what threshold do small numbers help vs. hurt?

## Sources (all accessed 2026-08-11)

**Fetched directly (primary):**
- TRM launch blog — trmlabs.com/resources/blog/announcing-the-launch-of-chainabuse-the-multi-chain-scam-reporting-tool-that-empowers-crypto-users-against-fraud
- Circle press release — circle.com/pressroom/crypto-industry-leaders-champion-free-multi-chain-scam-reporting-tool-chainabuse-to-empower-users-against-crypto-fraud
- BitcoinAbuse acquisition PR (Yahoo Finance mirror of GlobeNewswire) — finance.yahoo.com/news/trm-labs-acquires-bitcoinabuse-com-130000831.html
- TRM Series C announcement — trmlabs.com/resources/blog/trm-labs-announces-70m-series-c-to-scale-ai-solutions-to-disrupt-criminal-networks-and-counter-national-security-threats
- Operation Shamrock partnership — trmlabs.com/resources/blog/trm-labs-chainabuse-named-official-reporting-partner-for-operation-shamrock
- Chainabuse API docs (tiers/limits) — docs.chainabuse.com/docs/getting-started-2-1; docs.chainabuse.com/docs/welcome-to-chainabuse-api
- Troy Hunt, 1Password partnership — troyhunt.com/have-i-been-pwned-is-now-partnering-with-1password/
- Troy Hunt, Svalbard independence — troyhunt.com/project-svalbard-have-i-been-pwned-and-its-ongoing-independence/
- Troy Hunt, HIBP API changes — troyhunt.com/expanding-and-enhancing-the-have-i-been-pwned-api/
- HIBP API docs (k-anonymity, free Pwned Passwords) — haveibeenpwned.com/API/v3
- VirusTotal docs — docs.virustotal.com/docs/how-it-works
- urlscan.io FAQ — urlscan.io/docs/faq/
- Etherscan info center — info.etherscan.com/what-is-etherscan/; info.etherscan.com/whats-changing-in-the-free-api-tier-coverage-and-why/

**Press-release-grade (via search, PR hosts):** Business Wire TRM Series B (Dec 2021) and Series B expansion (Nov 2022, Thoma Bravo PR); GlobeNewswire Series C (Feb 2026); Fortune/PYMNTS Series C coverage; IBS Intelligence Series A.

**Secondary (context only):** Wikipedia/Xataka (VirusTotal history); Shodan pricing reviews (apis.io, domscan.net) + account.shodan.io; urlscan blog (free-tier quotas); The Hacker News / PCWorld / The Register / gHacks (WOT, Nov 2016); Threatpost (Svalbard); cryptolinks 2026 review ("nearly 1M" Chainabuse reports — UNVERIFIED); Medium (TRM $4.2M seed — Crunchbase-class).
