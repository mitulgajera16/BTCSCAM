# Seeding Playbook — Copyright-Safe Dossier Seeding & Ingest

**Date:** 2026-08-11 · **Owner:** Mitul Gajera · **Status:** Definitive, synthesized from the 3-phase legal + content research round (all terms pages fetched 2026-08-11 unless noted; adversarial verdicts folded in). Governs how the first 10–15 dossiers get seeded and how the ongoing ingest pipeline pulls from public sources without copyright, contract, or defamation exposure — while producing the unique original expression SEO/AEO requires.

Source-discipline rules from `../00-program.md` are binding here: every claim below is tagged **VERIFIED** (primary source fetched, URL + quote) / **ESTIMATE** (method stated) / **UNVERIFIED** (flagged, excluded from decisions). Ingest advice matches `data/schemas/incident.schema.json` — trust states, `claims[]`, `sources[].type`, defanged `entities.domains`, `corrections[]`.

---

## 1. The legal frame in one page

Ten rules of thumb. Everything else in this playbook is application.

1. **US federal government prose is public domain.** 17 USC 105: "Copyright protection under this title is not available for any work of the United States Government." **VERIFIED** — https://www.law.cornell.edu/uscode/text/17/105. DOJ, SEC, CFTC, FBI/IC3, FTC, Treasury/OFAC, USSS release text is freely republishable. Carve-outs: contractor deliverables, third-party photos/exhibits, agency seals, and USPS/CPB/PBS/NPR works are NOT PD (**VERIFIED**, Compendium III §313.6(C)(1), https://www.copyright.gov/comp3/chap300/ch300-copyrightable-authorship.pdf).

2. **State works are NOT automatically public domain.** 17 USC 105 reaches federal works only; NY AG asserts "All Rights Reserved" over state content (**VERIFIED**, ag.ny.gov footer). Rule: fetch every state source's terms page and classify it PD-declared / licensed-with-conditions / restricted / silent before onboarding. Silent = summarize + facts + short quotes, never copy.

3. **Government edicts are free regardless of state claims — but only for lawmakers and judges.** "Officials empowered to speak with the force of law cannot be the authors of the works they create in the course of their official duties" (**VERIFIED**, Georgia v. Public.Resource.Org, https://www.law.cornell.edu/supremecourt/text/18-1150). Court opinions/orders at any level: republishable. Adversarial correction: a state agency C&D order (e.g., TSSB) is **edict-LIKELY, not edict-certain** — treat as fair-use-supported, not PD-certain, and prefer linking the docket. State agency press releases are never edicts.

4. **Facts are free from any source; the container never is.** "No one may claim originality as to facts… the copyright in a factual compilation is thin" (**VERIFIED**, Feist v. Rural, 499 U.S. 340, https://www.law.cornell.edu/supremecourt/text/499/340). Addresses, txids, domains, amounts, dates, charges — extractable from anything with citation. Never copy prose, close paraphrase, narrative structure, or another registry's selection-and-arrangement.

5. **ToS are contracts that bind even where copyright doesn't.** DeFiLlama (USD 100k liquidated damages/violation), OpenPhish (no disclosure to any third party), Chainabuse (personal non-commercial only) — all **VERIFIED** from live terms. Obtaining data through a feed binds you to its contract even if every datum is a public-domain fact. hiQ v. LinkedIn (**VERIFIED**, 9th Cir. opinion PDF): scraping public pages is likely not CFAA — but hiQ's endgame was a $500k consent judgment admitting contract, tort, AND CFAA liability via fake-account access. Never scrape behind a login, never with created accounts, never after a C&D.

6. **Short quotes ride on fair use — sparingly.** 17 USC 107 (**VERIFIED**, https://www.law.cornell.edu/uscode/text/17/107). Per the adversarial correction: the four factors will *typically* favor our pattern **when each quote stays short, factual, attributed, and embedded in original verification** — this is enforced per-dossier, never assumed program-wide. Hard editorial rule: max 1–2 quoted sentences per source, in quotation marks, linked, surrounded by original analysis. Never quote the "heart" of a scoop (**VERIFIED**, Harper & Row, copyright.gov Fair Use Index summary). Screenshot scam artifacts, quote news.

7. **Fair report privilege is the defamation shield — and attribution is an element of it, not a courtesy.** NY Civil Rights Law §74, Cal. Civ. Code §47(d) (**VERIFIED**, both fetched). Publish allegations only as allegations ("the indictment alleges…"), cite and link the official document, portray it fairly. The privilege covers the faithful report only — our own added commentary sits outside it, so keep analysis visually separated from the reported record. Naming objects (addresses/domains/handles), never people, removes most of the remaining surface (constitution law; insight memo #10).

8. **Allegation ≠ finding maps directly onto the trust ladder.** Indictments, civil complaints, C&D orders, complaint-based trackers (DFPI, WA DFI, CFTC RED List) → `reported`/`corroborated`. Consent orders, guilty pleas, judgments, first-party vendor advisories, on-chain proof → `verified`/`resolved`. Never promote on a community feed alone.

9. **EU/UK databases carry a sui generis extraction right US law lacks.** 15-year right against substantial or repeated-systematic extraction (**VERIFIED**, Directive 96/9/EC Arts. 7/10/11, EUR-Lex; BHB v. William Hill and the parallel post-Brexit UK right both now VERIFIED per adversarial round). Rule: never bulk-extract from EU/EEA/UK aggregators; take single, independently re-verified facts.

10. **India (home jurisdiction) is compatible with all of the above.** EBC v. Modak (**VERIFIED**, indiankanoon.org/doc/1062099/): skill-and-judgment originality ≈ Feist; Indian court judgments republishable under §52(1)(q)(iv); Indian *government* works are copyrighted (not PD) — quote sparingly under fair dealing. DPDPA 2023 §3(c)(ii) excludes personal data the person made public themselves (**VERIFIED**) — but NOT data made public about a person by someone else: one more reason for names-objects-not-people. Indian defamation is plaintiff-friendlier — flagged for counsel in §7.

---

## 2. Source inventory

Three tiers. Adversarial verdicts are folded in: where a verifier said REFUTED or NEEDS-CAUTION, the row shows the *corrected* guidance.

### TIER 1 — Free to use (public domain / open license)

Text or data reusable outright; attribution per the rules column. All still get rewritten into original dossier prose (see §3).

| Source | Basis (all VERIFIED unless noted) | Attribution rule | Ingest method | SEO/AEO value |
|---|---|---|---|---|
| **DOJ press releases + indictments** (justice.gov, all USAOs) | PD, 17 USC 105; "information on Department of Justice websites is in the public domain" (justice.gov/legalpolicies) | Not required; cite anyway. No DOJ seals. | JSON API live: `justice.gov/api/v1/press_releases.json` (filter crypto terms client-side; HTML is Akamai-gated) | Very high — per-incident addresses/domains/amounts + .gov citation |
| **SEC litigation releases, admin proceedings, suspensions** | Public information, freely copyable (sec.gov/privacy) | "Consider appropriate citation to the SEC"; no seal | RSS live: `/enforcement-litigation/litigation-releases/rss` + siblings. MUST send declared User-Agent with contact email (fair-access rules) | High — terse releases beg original rewrite; complaint PDFs are unique detail |
| **SEC/OIEA Investor Alerts** (investor.gov) | Same SEC public-information policy | Citation recommended | No RSS — monthly scrape of listing page or GovDelivery email | Moderate-high for AEO explainers; typologies not incidents |
| **CFTC enforcement + RED List** | PD with acknowledgement requested (cftc.gov/WebPolicy) | Acknowledgement requested | RSS live: `cftc.gov/RSS/RSSENF/rssenf.xml`; RED List = weekly table scrape + diff | High — retail fake-platform fraud; RED List = long-tail "is X legit" pages. Carry CFTC's own not-a-finding caveat → `reported` |
| **FBI IC3 PSAs + Cryptocurrency Fraud Reports** | PD (DOJ component; justice.gov/legalpolicies) | Cite as source | RSS live: `ic3.gov/PSA/RSS`, `ic3.gov/CSA/rss`; annual report PDFs manual | Very high AEO — canonical loss statistics; caveat: victim-reported, unverified by FBI |
| **FTC alerts, press releases, Data Spotlights, Sentinel** | PD, explicitly stated (ftc.gov/policy-notices/website-policy) | "Source: United States Federal Trade Commission, www.ftc.gov" where feasible; 17 USC 403 notice if a page is predominantly FTC text (avoid by writing originally) | RSS live: consumer alerts, consumer-protection PRs, data-spotlight feeds; Sentinel Data Book zips annual | High for stats/education (Bitcoin-ATM queries); Sentinel = aggregate, not dossiers |
| **US Secret Service newsroom** | PD by statute (17 USC 105; no site-level claim found) | Cite as source; no seals | No RSS — monthly manual sweep | Low-moderate; use as *corroboration* (second agency = ladder promotion) |
| **Treasury OFAC SDN — digital currency addresses** | PD by statute; addresses are Feist facts. 74 digital-currency-address entries in current SDN XML | Credit requested; state designation basis; no Treasury seals | Daily: `sanctionslistservice.ofac.treas.gov/api/download/sdn.csv` (follow 302) → extract Digital Currency Address features → diff | Very high — structured, citable, government-verified addresses; thin competition on "is address X sanctioned" |
| **govinfo / USCOURTS opinions** | PD, 17 USC 105 quoted on policies page | Customary credit to originating agency | govinfo API / bulk | Canonical citation URLs; link opinions, summarize originally |
| **PACER + CourtListener/RECAP** | Filings "generally in the public domain" (CourtListener ToS); bulk data Public Domain Mark; opinions PD (Wheaton; 17 USC 105) | Cite case caption + docket + "via CourtListener/RECAP" | REST API v4 (free token, single registered token, conservative rates) + webhook docket alerts; RECAP extension; stay under $30/qtr PACER | The AEO differentiator: primary-document citation on every federal dossier. Cite the court's PDF (not extracted text) for `verified` — CourtListener's own "unreliably reproduced" disclaimer. No FCRA uses; mirror that ban in our ToS |
| **California DFPI Crypto Scam Tracker** | Site content "considered in the public domain" (dfpi.ca.gov conditions-of-use); Feist facts; §47(d) fair report | Attribute anyway: "per complaints reported to the California DFPI" — attribution triggers fair-report protection | 403s to bots (WAF) — manual browser capture, Wayback snapshots (verified working), or CPRA request. Do not hammer the WAF | Highest of all: 2,000+ named scam domains → long-tail "is X a scam" dossiers. ALL entries → `reported` rung ("DFPI has not verified the losses") |
| **BaFin consumer warnings** | Express permission: content "may generally be stored, shared and reproduced… only with a clear citation of the source" (bafin.de terms, EN) | Mandatory: "© Federal Financial Supervisory Authority / www.bafin.de"; no alteration/falsification; label our translations as BTCSCAM's own unofficial translation; skip embedded images | Server-rendered, bot-accessible; RSS exists but exact URL UNVERIFIED — confirm before automating | High — names scam domains weeks before English coverage; first-mover wedge |
| **Europol reports (IOCTA)** | "Reproduction is authorised provided the source is acknowledged" (IOCTA 2024 PDF copyright page) | Use their supplied citation format; never reuse report images (Getty credits) | Manual PDF pulls + press-release monitoring | Medium-high — permissive quotable statistics for evergreen explainers |
| **Wikidata** | CC0 | None required; courtesy cite | SPARQL/REST, fully automatable | High for AEO — feeds schema.org entity data on dossier pages; re-verify anything load-bearing |
| **Web3 is Going Just Great** (Molly White) | Text CC BY 3.0 Unported (About page) | Required: credit Molly White / W3IGG, link the entry, note modifications. Site images separately attributed — don't reuse | Feed + manual review (feed URL ESTIMATE — confirm); entries link their own primary sources for corroboration | High as lead corpus for seed dossiers; rewrite every entry (CC BY ≠ duplicate-content immunity) |
| **BitcoinHeist ransomware dataset** (UCI) | CC BY 4.0 | Required: UCI citation + DOI + CC BY notice | One-time bulk download | Programmatic long-tail address pages; labels are research-grade, data ends 2018 → `reported`/`corroborated` only |
| **Scam Sniffer scam-database** (GitHub) | GPL-3.0 (repo verified, actively maintained) | Per-fact citation needs only a link; redistributing the *dataset* triggers GPL copyleft — don't republish as a download | Daily cron pull of raw JSON (7-day-delayed) | High — address-level, crypto-native, matches objects-not-people exactly; `reported`/`corroborated` only |
| **PhishTank** | Legacy OpenDNS terms: Data "available for commercial use without charge" (phishtank.com/terms.php) | Link appreciated, not required — link anyway | Hourly DB download; registration frozen so no new API keys — keyless rate-limited file pull. **Snapshot the terms page to Wayback before building** (Cisco could supersede); re-verify each URL live/archived before publishing | High — verified exchange/wallet phishing URLs, direct domain-dossier seeds |

### TIER 2 — Facts-citable (copyrighted; extract facts + cite, quote ≤1–2 sentences)

Never republish text. Facts + attribution + link + fair-report framing.

| Source | Terms posture (VERIFIED) | Working rule | Ingest method | SEO/AEO value |
|---|---|---|---|---|
| **NY Attorney General** | "All Rights Reserved" footer; disclaimer grants nothing. Most restrictive state source | Feist facts + §74 fair report; attribute every claim to "the NY AG's complaint/press release of [date]"; pull complaint PDFs via NYSCEF/CourtListener as the real primary. Extra precision where defendants are operating companies (Coinbase/Gemini suits) | Manual monitoring of crawlable PR index | High-authority incident anchors; primary-doc citation outranks news rewrites |
| **NYDFS enforcement actions** | Express license but **non-commercial only**, attribution, unaltered (dfs.ny.gov/disclaimer) | Because BTCSCAM may monetize: don't rely on the license — original summaries + facts + short quotes + link to NYDFS-hosted PDFs. Consent orders = respondent-agreed facts → strong `verified`/`resolved` material; report "consented to findings" accurately (no-admission clauses) | Manual/scripted table watch (no RSS); site doesn't block | Underexploited: plain-English consent-order breakdowns own those queries |
| **Texas SSB crypto orders** | Silent — no claim, no grant | Orders: edict-likely → republishable-with-caution (tag internally fair-use-supported, per adversarial verdict); press-release prose: summarize only. ECDOs = unproven → `reported`/`corroborated` | Manual; site fetchable; historical crypto-sweep pages = batch seed leads | Named fake-platform orders → DFPI-style long-tail with formal-order authority |
| **Washington DFI alerts** | Silent; bare © notice | Facts + attribution ("per a Washington DFI consumer alert dated…"); preserve DFI's own hedging ("appears to engage in fraud") → `reported` | Email subscription + crawl of paginated index (no WAF) | Freshest named-domain feed of any state source — first-mover dossiers |
| **UK FCA Warning List** | Personal/internal use only; no third-party circulation; OGL covers statistics/Data section ONLY (fca.org.uk/legal). Page 403s to bots | Facts + link: "FCA added X to its Warning List on [date]". Never reproduce page text. Source new warnings from the live news RSS (`fca.org.uk/news/rss.xml`, confirmed 200) or manual record | RSS for news; manual for list; FS Register API for authorisation checks | Very high — clone-firm warnings drive "is X a scam" volume; strong E-E-A-T citation |
| **ASIC Moneysmart Investor Alert List** | Verbatim reuse needs prior emailed ASIC permission; general content NOT CC; Cloudflare-blocks bots | Facts + link + no-endorsement line; optional cheap insurance: email ASIC for excerpt permission | Manual/browser-assisted monitoring; no RSS/API found | High — AU scam entities target global victims; low-competition for US-facing coverage |
| **CSA Investor Alerts (Canada)** | Written permission required for reproduction; one-time-use only, 4–6 weeks processing (adversarial-verified) — useless for news speed, which confirms facts-only mode | Facts + link, never alert prose; corroborate via member regulators (OSC, BCSC, ASC) | Email/RSS subscription channels or low-frequency manual check; do NOT headless-scrape the Sucuri-challenged site | High — early flags, cross-border corroboration for the `corroborated` rung |
| **Singapore MAS IAL** | General content: written permission for republication; datasets get an open licence, but IAL's dataset status unconfirmed | Facts + link; mirror the IAL "not exhaustive" disclaimer; use dataset attribution template only if MAS confirms IAL is a dataset | Manual monitoring (server-rendered); email subscription | High — early flags from a major hub, unsynthesized for US audiences |
| **RBI Alert List (India)** | Conditional reproduction (accurate, unmodified, source prominently acknowledged) but a conflicting no-commercial-use clause → default facts + short quotes | Prominent acknowledgment; mirror "list is not exhaustive" disclaimer; keep framing strictly factual (home-jurisdiction posture) | Server-rendered, curl-fetchable; press releases announce list expansions | High — global forex/crypto hybrid platforms; near-zero English competition |
| **SEBI cautions (India)** | Reproduction requires prior emailed permission; source prominently acknowledged; not "derogatory or misleading" | Facts + attribution + link; describe SEBI's action, don't editorialize it as SEBI's view; send the low-cost permission email before any verbatim annexure use | Event-driven monitoring of PR section; registered-intermediary search for negative verification | Medium-high — "is X SEBI registered" demand; India vertical breadth |
| **Chainalysis reports/blog** | © all rights reserved; AUP bans bulk export + scraping of any product surface (incl. Chainalysis Free) | "Chainalysis estimates X" — attribute estimates as estimates; recreate charts from cited numbers, never copy; manual reading only | Manual annual/mid-year report reads; gated forms bind — read at download | High — attributed authoritative numbers for stat pages and answer boxes |
| **TRM Labs research/blog** | Beacon terms = internal-business-use license; treat all-rights-reserved everywhere | Same as Chainalysis; extra care: TRM owns Chainabuse — don't jeopardize the pending partner application | Manual | High — citing TRM + Chainalysis on one statistic demonstrates corroboration |
| **Rekt.news** | "all content copyright rekt © 2026 • all rights reserved" | Extract discrete facts into the dossier template; never mirror their attack-flow narrative or voice; ≤1–2 attributed sentences | Manual + RSS-if-available for lead alerts | High as cited corroboration; their detail enables claims competitors can't make — in our words |
| **Wikipedia** | CC BY-SA 4.0. Correct pin-cite (adversarial fix): the no-conditions-on-lawful-use clause is legalcode **§8(a)**, not §2(b)(2). Fact extraction never creates Adapted Material | Use as citation index only — cite its underlying sources, never Wikipedia; close paraphrase = ShareAlike contamination + SEO death | Manual + MediaWiki API for citation mining | Zero as text; high as a shortcut to primaries |
| **Reddit** (r/CryptoScams, r/Scams) | **Adversarial correction: there is NO permitted crawl path** — robots.txt is `Disallow: /` for all agents, so the User Agreement's conditional crawl grant is a null set; scraping breaches the agreement you accepted as an account holder. Public Content Policy is posture, not a license | Three lanes only: (a) manual reading + ≤1–2-sentence fair-use quotes with permalink + archive; (b) official embeds (Embeds Terms now verified: unmodified, not near ads, no implied endorsement, revocable — pair every embed with own prose + archive); (c) Data API for lead *discovery* only — store facts + permalink, delete pulled text (retention clause). No usernames in aggregates | Data API (OAuth, free tier) as monitoring feed → draft queue | High — victims narrate incidents here; phrase grammar mined for `phrases/aliases` field (insight memo #8) |
| **X (Twitter)** | ToS: interfaces-only reuse, scraping expressly prohibited; Developer Agreement bans iframing "under any circumstances" → **skip X embeds entirely** | Fair-use text quotes + permalink + archive; screenshot-as-evidence when the tweet IS the scam artifact; never automate collection | Manual | High — rug-pulls surface here first; quoting the fraudulent post is quoting the object |
| **Bitcointalk** | No ToS granting/limiting reuse; posters retain copyright; robots.txt has no Disallow (verified) | Fair-use quotes + topic permalink + archive; polite rate-limited crawling for discovery only (trespass hygiene); Scam Accusations board = `reported` until corroborated; handles often ARE the object | Polite crawl of Scam Accusations board for historical leads | Very high for historical dossiers (Mt. Gox-era, pirateat40) — uniquely detailed, rarely quoted |
| **Internet Archive / archive.today** | Adversarial correction: IA access is "for scholarship and research purposes only" — link freely (linking copies nothing), but don't bulk re-host archived content or call our use licensed. archive.today: no terms, anonymous operator | Cite as "archived at web.archive.org/…"; our own dated screenshots are the PRIMARY evidence layer, Wayback first corroboration, archive.today second; never sole support for `verified` | Save Page Now on every quoted/cited page at capture time; CDX API for lookups | Structural — archive links substantiate the trust ladder and survive link-rot |

### TIER 3 — Restricted (avoid, link-only, or internal-only)

| Source | Verdict | Rule |
|---|---|---|
| **OpenPhish** | **EXCLUDE ENTIRELY** (adversarial-confirmed) | Terms bar commercial use and any display/disclosure to third parties, uniformly across tiers — publishing any feed-derived URL is a literal breach. Even internal triage is grey if we monetize. Do not touch without written consent |
| **DeFiLlama** | Read-only background; never automate, never republish | USD 100k liquidated damages per violation — highest monetary risk in the program. Use as a human-browsed completeness checklist; re-derive every fact from the protocol's postmortem or on-chain data with courtesy link |
| **Chainabuse (TRM)** | Link-only until partner application resolves | Personal non-commercial license — our use arguably exceeds it even at citation level if we monetize. Allowed: deep links, independently re-verified on-chain facts, at most report-count citations ("Chainabuse shows N reports", linked). No scraping, no bulk, no report text. Pursue Chainabuse Pro partner route before any systematic use |
| **BitcoinAbuse legacy CSV dumps** | Do not import | Corrected framing: provenance-unverifiable + 3+ years stale (not "retroactive TRM ownership"). Any address that matters gets independently re-verified on-chain, which launders both the legal and accuracy problem |
| **IOSCO I-SCAN** | Internal discovery tool only | Adversarial correction: the legacy permission is 20+ years old AND revocable on written notice — rely on it for nothing. Pipeline: uncopyrightable facts (entity, regulator, date) → go to the issuing regulator's own alert page → apply THAT regulator's terms → cite THAT as primary. Re-check current terms from a residential browser before any automation |
| **Interpol** | Facts + sparing quotes + link; no automation | Adversarial correction: the "verified" terms are a **2018-era capture** (live site 503; no later snapshot exists) — current terms unknown, and the archived ones include a user indemnification clause. Re-fetch live terms before launch reliance; absolutely no INTERPOL name-as-brand/logo use |
| **URLhaus / ThreatFox (abuse.ch)** | Conditional — blocked on the monetization decision | Free tier is for "not-for-profit purposes"; a monetized BTCSCAM likely doesn't qualify. Decide monetization posture BEFORE wiring in (open question §7). If used: per-IOC lookups for corroboration, cite the entry URL, never republish dumps (derivative-works clause), never `verified` on these alone |
| **Elliptic Data Set (Kaggle)** | PARK (adversarial-confirmed) | License unverifiable; anonymized features can't name scam objects anyway — no dossier value |

---

## 3. The transformation rule

**We never republish verbatim — not even public-domain text.** Three reasons, one rule.

1. **SEO/AEO.** Duplicate text of justice.gov or Wikipedia ranks nobody. Search and answer engines reward unique original expression built on cited primaries; a DOJ release republished wholesale is the most-duplicated text on the internet the day it drops. The 17 USC 403 notice requirement for pages "predominantly" of US-gov text (**VERIFIED**, FTC policy + govinfo) is a second nudge in the same direction.
2. **The product IS the editorial synthesis.** BTCSCAM's value is not the press release — it's the trust-ladder classification, the object extraction (defanged domains, addresses), the timeline, the `actions[]` block ("this block is the product" — incident schema), the `notAffected[]` who-can-stand-down call, the victim-phrase targeting, and the corrections discipline. None of that exists in any source. A dossier is original expression *about* sourced facts.
3. **Legal convergence.** The same practice that makes pages rankable is the Feist-safe path (our own selection and arrangement), the fair-use posture (transformative purpose), the fair-report posture (fair and accurate account, clearly attributed), and the hot-news defense (independent verification work, no real-time mirroring of any single outlet). Legality and SEO point the same direction; there is no tension to manage.

**Operating rules:** quote only when exact wording matters (an admission, a charge, an agency warning) — ≤1–2 sentences, quotation marks, attribution, link. PD edict excerpts (court orders) may run longer as blockquotes framed by original analysis. Every extracted fact logs its provenance (proves facts were taken as facts, not as a copied compilation). Rewrite Web3IGG/DFPI/alert narratives from scratch; mirror no source's ordering or field structure.

---

## 4. Seed dossier candidates

Publish flow (approved decision): **agent drafts → Mitul reviews → publish.** Nothing goes live without review. Every dossier: `sources[]` ≥1 primary, per-claim `claims[]` attribution for anything not primary-confirmed, victim phrases into the `phrases/aliases` field (insight memo #8), recovery-scam banner (memo #9), archive capture of every cited URL at draft time.

**Wave 1 (launch 12):**

| # | Dossier | Category / trustState at launch | Primary sources | Victim search phrases (seed set) |
|---|---|---|---|---|
| 1 | **Bitcoin ATM shakedowns** — impersonators + the QR-code cash funnel (2023–2026) | impersonation, social-engineering / `verified` (FTC+IC3 data) · ongoing | FTC Data Spotlight PDF (fetched); IC3 PSA260515-2 (fetched: $388.9M, 13,460 complaints 2025); FTC PR 2024 | "government said pay fine at bitcoin atm" · "bitcoin atm scam can i get money back" · "bank fraud department told me to buy bitcoin" |
| 2 | **The recovery-scam industry** — fake law firms, fake tracers, IC3 impersonators | recovery-scam / `verified` · ongoing | IC3 PSA230811 (fetched: "Private sector recovery companies cannot issue seizure orders"); PSA250813; PSA260720 | "can i recover stolen bitcoin" · "crypto recovery service legit or scam" · "law firm contacted me about my stolen crypto" — the constitutional differentiator made into content |
| 3 | **Ledger impersonation ecosystem** — 2020 leak → 2025 seed-phrase letters | impersonation, phishing / `verified` (first-party advisories) · ongoing | ledger.com/phishing-campaigns-status (fetched, pollable); CEO breach post | "ledger letter in mail asking for recovery phrase real" · "ledger data breach am i affected" |
| 4 | **Trezor support-channel phishing** — 2024 portal breach + 2025 contact-form abuse | impersonation, phishing / `corroborated` → `verified` after Wayback retrieval of both advisories (direct fetch failed; titles confirmed) | blog.trezor.io advisories (via Wayback); corroboration: BleepingComputer/The Block | "email from trezor support asking for recovery seed" · "trezor data breach 2024 what was leaked" |
| 5 | **Coinbase insider breach + impersonation-call wave** (May 2025) | impersonation, social-engineering / `verified` (SEC 8-K fetched from EDGAR) · ongoing | Coinbase 8-K (EDGAR, Item 1.05); Coinbase blog (confirm fetch pre-publish) | "did coinbase call me is it real" · "coinbase asked me to move funds to safe wallet" |
| 6 | **'I have your password'** — Bitcoin sextortion email/letter waves | social-engineering / `verified` · ongoing | IC3 PSA180807 (fetched); FTC 2018 blackmail alert (**UNVERIFIED fetch — confirm pre-publish**); PSA230407 | "email has my real password asking for bitcoin" · "letter with photo of my house demanding bitcoin" · "should i pay sextortion email" |
| 7 | **Task scams** — gamified deposits-to-get-paid job platforms | social-engineering, ponzi / `verified` (FTC PR + spotlight PDF fetched; IC3 PSA240604 URL confirmed) | FTC Dec 2024 PR + task-scams spotlight PDF; IC3 PSA240604 | "task job asked me to deposit money to withdraw earnings" · "app optimization job whatsapp real or scam" |
| 8 | **Mirror Trading International** — 29,421 BTC, largest Bitcoin fraud in CFTC history | ponzi / `resolved` (default judgment) · liquidation ongoing | CFTC PR 8696-23 (fetched: "$1,733,838,372 restitution"); 8549-22 | "mirror trading international claims process" · "forex bot trades my bitcoin guaranteed returns" — the most Bitcoin-first case on the list |
| 9 | **HashFlare** — $577M fake cloud-mining dashboard | ponzi / `resolved` (guilty pleas; **sentencing outcome UNVERIFIED — confirm from docket pre-publish**) | DOJ OPA + USAO-WDWA releases (fetched via API); docket W.D. Wash. 2:22-cr-185 | "hashflare refund how to get money back" · "is cloud mining legit" |
| 10 | **BitConnect** — the canonical lending-program Ponzi | ponzi / `resolved` · restitution tail | DOJ indictment + Arcaro plea (fetched via API); SEC PR 2021-172 | "bitconnect victim compensation how to claim" · "guaranteed daily returns crypto legit" |
| 11 | **Celsius** — 'Unbank yourself', founder pled guilty | exchange-failure / `resolved` (**12-year sentence UNVERIFIED — confirm from SDNY release pre-publish**) | SDNY guilty-plea release (fetched); FTC 2023 settlement + July 2026 $16.5M orders | "celsius distribution when will i get my crypto back" · "is earning interest on bitcoin safe" — the not-your-keys anchor dossier |
| 12 | **July 2020 Twitter giveaway hack** — 'send BTC, get double back' | theft, impersonation / `resolved` · giveaway format ongoing | DOJ NDCA release (fetched); NYDFS Twitter Report (**UNVERIFIED fetch — confirm**) | "elon musk bitcoin giveaway real" · "sent bitcoin to giveaway address can i get it back" |

**Wave 2 (next 4):**

| # | Dossier | Notes |
|---|---|---|
| 13 | **$225.3M USDT pig-butchering forfeiture** (June 2025) | DOJ + USSS releases fetched; in-rem action = pure objects, no people. $5.8B 2024-loss figure is ESTIMATE from press coverage — source from IC3 report or drop |
| 14 | **OneCoin** — fake coin, no blockchain | SDNY releases fetched; **FBI Most Wanted status of Ignatova UNVERIFIED — confirm pre-publish** |
| 15 | **HyperFund/HyperVerse** — $1.89B rebrand-hopping pyramid | DOJ USAO-MD fetched; the alias graph (HyperTech→HyperVerse→HyperNation) is a registry-native artifact |
| 16 | **Forsage** — the smart-contract pyramid | DOJ + SEC; fills the "code can still encode a pyramid" doctrine gap; on-chain contract addresses = verifiable objects |

Selection logic: wave 1 front-loads live victim search demand (mid-scam queries), Bitcoin-first fit (self-custody, hardware wallets, BTC-denominated fraud), and airtight federal/first-party sourcing. Named individuals appear only as charged/convicted in cited official documents, allegation-framed until judgment; dossiers anchor on objects.

---

## 5. Ongoing ingest — feeds → draft queue

Everything lands in a **draft queue**, never auto-publishes. Human (Mitul) promotes drafts per the publish flow. Every source record in the ingest config carries a `terms_checked` field: `{url, date_fetched, quote}` — mirroring this research's methodology (cross-cutting rule, §1.2).

| Cadence | Feed | Pipeline action |
|---|---|---|
| Daily | OFAC SDN CSV/XML | Diff digital-currency addresses → new designation = draft stub + Treasury PR lookup |
| Daily | Scam Sniffer JSON (GitHub) | Diff domains/addresses → corroboration index + drainer-domain draft leads |
| Daily/hourly | PhishTank DB | Filter exchange/wallet-brand targets → corroboration index; verify live/archived before use |
| Poll (RSS) | SEC litigation/admin/suspensions · CFTC enforcement · IC3 PSA+CSA · FTC (alerts, PRs, spotlights) · FCA news · DOJ API | Crypto-keyword filter → draft stub with release text attached (PD) + docket lookup via CourtListener |
| Webhook | CourtListener docket alerts on tracked crypto-fraud cases | New filing → attach PDF to the incident's draft timeline |
| Weekly | CFTC RED List table diff · WA DFI alerts index · NYDFS enforcement table · TX SSB news | New entity → long-tail dossier draft ("reported" rung, hedged) |
| Weekly | Web3IGG feed · Rekt (leads only) · Bitcointalk Scam Accusations (polite crawl) | Lead review; chase each entry's own primary sources |
| Monthly | investor.gov alerts · USSS newsroom · BaFin warnings (once RSS URL confirmed) · RBI/SEBI PR sweep · MAS/ASIC/CSA manual check | Education-page updates + international corroboration index |
| Annual | IC3 Annual + Crypto Fraud Reports · FTC Sentinel Data Book · Europol IOCTA · Chainalysis/TRM reports (manual read) | Stats pages refresh; attributed-estimate updates across dossiers |
| Discovery only (no publish path) | Reddit Data API (facts+permalink, delete text) · I-SCAN CSV (manual export) · DeFiLlama (human browsing) · Chainabuse (deep-link lookups) | Leads → primary-source chase → draft |

Pipeline hygiene (binding): declared User-Agent with contact email on all fetchers (SEC requires it); rate-limit everything; honor robots.txt; no logins/created accounts for collection; no real-time mirroring of any single outlet (hot-news hygiene — the corroboration ladder's natural delay is the defense); Save Page Now + own screenshot on every source URL at draft time; allegation verbs until adjudication; complaint-feed entries capped at `reported`.

---

## 6. Boilerplate blocks (paste-ready)

**B1 — Federal PD source line (DOJ/SEC/CFTC/IC3/FTC/OFAC):**
> Source: [Agency], "[Release title]," [date] ([link]). U.S. government work, public domain (17 U.S.C. § 105). Quotations from charging documents describe allegations, not established facts, unless a conviction or judgment is noted.

**B2 — Allegation framing (fair report):**
> According to the [complaint/indictment/order] filed by [agency] in [court, case no.] on [date] ([link] · [archived]), [defendant/entity] is alleged to have [conduct]. These are allegations; no court has ruled on them as of [date]. BTCSCAM's own analysis appears separately below and is not part of the official record.

**B3 — Complaint-tracker entry (DFPI / WA DFI / RED List):**
> This entry is based on complaints reported to the [California DFPI / Washington State DFI / CFTC], which the agency states it has not independently verified ([link] · [archived]). BTCSCAM lists it at the **Reported** tier. Inclusion is not a finding by any agency or court that a violation occurred.

**B4 — CC BY attribution (Web3 is Going Just Great):**
> Incident first catalogued by Molly White, *Web3 is Going Just Great* ([entry link]), text licensed CC BY 3.0. This dossier is BTCSCAM's independent rewrite and verification; facts were re-checked against the primary sources cited below.

**B5 — CC BY 4.0 dataset (UCI BitcoinHeist):**
> Address corroboration: BitcoinHeist Ransomware Address Dataset (2020), UCI Machine Learning Repository, https://doi.org/10.24432/C5BG8V, licensed CC BY 4.0. Research-grade labels covering 2009–2018; treated as Reported-tier evidence only.

**B6 — BaFin (mandatory citation + translation label):**
> Source: © Federal Financial Supervisory Authority / www.bafin.de, consumer warning of [date] ([link]). English rendering is BTCSCAM's own unofficial translation; the German original governs.

**B7 — Regulator facts-only line (FCA/ASIC/CSA/MAS/RBI/SEBI):**
> On [date], the [regulator] added [entity/domain] to its [list/warning] ([link] · [archived]). The [regulator] notes its list is not exhaustive; absence from it implies nothing. BTCSCAM is not affiliated with or endorsed by any regulator named on this page.

**B8 — Chainabuse citation (link-only mode):**
> Chainabuse showed [N] community reports for this address as of [date] ([link to report page]). Community reports are unverified; BTCSCAM's trust tier for this incident rests on the primary sources above.

**B9 — Short quote frame:**
> "[≤2 sentences]" — [Author/Outlet], "[Title]," [date] ([link] · [archived]). Quoted under fair use for verification and commentary; see our analysis above/below.

**B10 — Attributed estimate (Chainalysis/TRM/IC3):**
> [Firm/agency] estimates [figure] ([report, year, link]). This is [its] published estimate, not an independently established fact; IC3 figures are victim-reported and unverified by the FBI.

**B11 — No-recovery disclosure (every dossier, per insight memo #9):**
> We sell nothing on this page on purpose. BTCSCAM never promotes recovery services — anyone promising to get your bitcoin back for a fee is running the second half of the scam ([link to recovery-scam dossier]).

**B12 — Corrections block:**
> Corrections are public and permanent. [date]: [what changed and why]. Report an error: [link].

**B13 — 17 USC 403 notice (only if a page ever runs predominantly US-gov text — avoid by design):**
> This page incorporates works of the United States Government, which are not subject to copyright (17 U.S.C. § 105). Original material © BTCSCAM.

---

## 7. Open questions / items for professional review

1. **DMCA designated agent — do this the week user submissions open.** Online-only registration at dmca.copyright.gov, $6, expires in 3 years (**VERIFIED**, copyright.gov/dmca-directory). No agent on file = no 512(c) safe harbor, full stop. Calendar the renewal. Pair with a published repeat-infringer policy.
2. **India IT Act §79 / Intermediary Guidelines 2021** — the Indian intermediary-liability regime for user submissions is UNVERIFIED in this research; needs India counsel before the community funnel opens.
3. **Defamation venue analysis** — fair report privileges vary by US state and India (BNS 356) is plaintiff-friendlier; commission a short counsel memo before any person-adjacent content (currently avoided by the objects-only constitution, but bylined editorial articles are the exception path).
4. **Monetization decision gate** — one decision unlocks/locks four sources at once: abuse.ch free tier ("not-for-profit"), Reddit reuse posture, NYDFS license reliance, and the Internet Archive "research purposes" framing all turn on whether/how BTCSCAM monetizes. Decide before wiring those feeds.
5. **Chainabuse Pro partner application** — pending; until resolved, link-only mode. Conflict disclosure per `00-program.md` stands.
6. **Permission emails worth sending** (cheap insurance, non-blocking): ASIC (excerpt reuse), SEBI (verbatim annexures), DeFiLlama (public-interest reuse), OpenPhish (only if ever wanted), Reddit (if ingest volume grows).
7. **Re-verifications owed before publish:** Interpol live terms (2018-era capture only); IOSCO current terms (residential browser); BaFin RSS URL; FTC 2018 blackmail-alert URL; NYDFS Twitter Report fetch; FBI Most Wanted status (Ignatova); HashFlare sentencing (docket); Celsius sentence (SDNY release); PhishTank terms snapshot to Wayback; Trezor advisories via Wayback.
8. **EU/UK database rights** — irrelevant for the current source set; mandatory re-review before ingesting any EU/EEA/UK-based aggregator or blocklist.
9. **BTCSCAM's own dataset protection** — we gain no EU sui generis right (owner not EU-based) and only thin US compilation copyright; add API/registry terms of use (including an FCRA-use ban mirroring CourtListener's) when the public API matures.
10. **Schema addition** — `phrases`/`aliases` field (insight memo #8, ADOPT) is required by §4's victim-phrase seeding; land the schema change before wave 1 drafts.

---

## So what for BTCSCAM

The legal research and the SEO requirement converge on one architecture: extract facts, verify independently, write originally, cite everything, archive everything. That is also the constitution. The launch path is: register the DMCA agent, land the `phrases` schema field, wire the five federal RSS/API feeds plus OFAC and Scam Sniffer diffs into the draft queue, and draft wave 1's 12 dossiers for Mitul's review — federal-sourced ones first, since they carry zero copyright risk and the strongest AEO citations.

## Open questions

Consolidated in §7 above; the two hard blockers are the DMCA agent registration (before submissions) and the monetization decision gate (before abuse.ch/Reddit-adjacent feeds).
