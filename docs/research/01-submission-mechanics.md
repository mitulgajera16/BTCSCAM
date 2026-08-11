# 01 — Submission Mechanics: How the Internet Takes a Scam Report

**Program:** Phase-Community research (see `00-program.md`) · **Agent:** 1 MECHANICS · **Date:** 2026-08-11

**Method.** Between 2026-08-11 fetches, I walked the live intake surfaces (forms, FAQ/docs, rules stickies, contact pages) of 12 scam-reporting or scam-adjacent platforms, plus 3 dead/absorbed projects. Every claim is tagged **VERIFIED** (page fetched, quoted, URL in Sources), **VERIFIED-SNIPPET** (verbatim text surfaced via search index of the named source where direct fetch was blocked — treat as one grade below VERIFIED), **ESTIMATE** (method stated), or **UNVERIFIED**. Several targets actively block automated fetching (reddit.com, ftc.gov, scamadviser.com returned 403s or SPA shells); those sections say so explicitly rather than papering over it.

---

## 1. Rekt.news — tips, not reports

- **Intake.** No structured public submission exists. Walking the homepage: nav is `t&c / videos / leaderboard / research / tools / log in` — no "report" or "submit tip" surface; the leaderboard ranks exploit losses, not contributors (VERIFIED, rekt.news). The About page returned HTTP 500 at access time (VERIFIED failure). Community contact runs through Telegram (@rektnews) and X (@RektHQ) (VERIFIED-SNIPPET). Secondary descriptions call it "an anonymous platform for whistleblowers and DeFi detectives to present their findings to the community" (UNVERIFIED — third-party directory copy).
- **Moderation.** Editorial: anonymous staff writers decide what becomes a story. No visible pending/published states — a tip either becomes an article or vanishes. (ESTIMATE from site structure: only finished articles are public.)
- **Incentives.** Whistleblower culture, not credit: sources stay anonymous by design. No badges, no bylines for tipsters. (ESTIMATE.)
- **Abuse defense.** Full editorial gate; nothing publishes without staff writing it. Defamation posture: names names in published investigations, absorbed as ordinary journalistic risk. (ESTIMATE.)
- **Cold start.** Content-first: launched as a pseudonymous editorial blog covering DeFi exploits; audience followed the articles, not the other way around (UNVERIFIED detail; structurally evident — there is no UGC surface at all).

## 2. Web3 Is Going Just Great — one-person curation with a public suggestion queue

- **Intake.** "The best and quickest way to suggest an addition or change to this timeline is via Github Issue," with templates; also DMs/tweets to @molly0xFFF or Mastodon, warning "I often miss tweets to the @web3isgreat account!" Ask is minimal: "send me a link to reporting about any event you're hoping to see on the timeline" (all VERIFIED, /contribute). GitHub account required for the primary path; social DMs are the anonymous-ish fallback. Friction: ~2–3 screens via issue template.
- **Moderation.** Sole editor. "This is... a personal project of mine, and reflects my own opinions" — "I'm Molly White, a software engineer, writer, and critical researcher" (VERIFIED, /about). States: suggestion (GitHub issue, publicly visible) → published entry, or closed. Suggesters can watch their issue's fate — a de facto public queue.
- **Incentives.** None stated; no credit policy on /about or /contribute (VERIFIED absence). GitHub issue history is incidental public credit.
- **Abuse defense.** The "link to reporting" requirement outsources evidence to existing journalism — the site cites press, it doesn't take victim testimony. Opinions disclaimer shields editorial choice. (VERIFIED quotes above; interpretation mine.)
- **Cold start.** Pure content-precedes-community: one person began curating a timeline in 2022 riding crypto-skeptic Twitter attention (UNVERIFIED date; single-curator model VERIFIED above).

## 3. Krebs on Security — the reader-correspondence model

- **Intake.** A contact form (Name / Email / Subject / Message + CAPTCHA): "I also enjoy corresponding with readers, so shoot me a note and tell me what you think of the blog" (VERIFIED, /about). No structured tip line, no evidence fields, no anonymity infrastructure advertised on the About page (VERIFIED absence; he may accept Signal via other channels — UNVERIFIED).
- **Moderation.** One journalist. Tips become stories only after his own investigation; ~1,300 posts since leaving The Washington Post (1995–2009 tenure, VERIFIED).
- **Incentives.** Correspondence with a famous reporter; occasional in-story hat-tips (UNVERIFIED). No system of record for contributors.
- **Abuse defense.** Journalist verification + personal legal exposure; he famously names named individuals and absorbs retaliation (swattings, lawsuits — UNVERIFIED here, widely documented).
- **Cold start.** Imported audience: he left the Post with a beat and a readership; the blog never needed community submissions to have content (ESTIMATE from VERIFIED bio).

## 4. BleepingComputer (+ forums) — structured tip line grafted on a news/forum hybrid

- **Intake.** Dedicated tip page: "Have an interesting news tip, hack, vulnerability, or leaked information you think we should cover?" Fields: Name (Optional), Email (Optional), Tip (Required), reCaptcha. Anonymity is explicit: use "the Tor browser" or "via Signal at (646) 961-3731". But: "We strongly recommend providing an email or alternative contact, such as Signal, as we commonly have questions about news tips" (all VERIFIED, /news-tip/). Friction: 1 screen, 1 required field — the lowest-friction structured intake in this study.
- **Moderation.** Staff journalists triage; nothing auto-publishes. Forums are separate: account-required community threads moderated by a volunteer mod team (UNVERIFIED specifics — forum rules not fetched).
- **Incentives.** Possible coverage of your tip; no formal credit system (ESTIMATE).
- **Abuse defense.** Editorial gate; "commonly have questions" = human follow-up as the verification mechanism (VERIFIED quote, interpretation mine).
- **Cold start.** Forums (malware-removal help) built the audience years before the newsroom scaled; community-as-help-desk preceded community-as-source (UNVERIFIED sequencing, structurally consistent).

## 5. Have I Been Pwned — single-operator verification checklist, in public

- **Intake.** "If you've come across a data breach which you'd like to submit, get in touch with me" — check the pwned-websites page first (VERIFIED, /FAQs). Free-form contact, not a form; submitters are typically anonymous or pseudonymous.
- **Moderation.** Troy Hunt personally, against a **published five-question checklist**: "Has the impacted service publicly acknowledged the breach?" / "Does the data in the breach turn up in a Google search (i.e. it's just copied from another source)?" / "Is the structure of the data consistent with what you'd expect to see in a breach?" / "Have the attackers provided sufficient evidence to demonstrate the attack vector?" / "Do the attackers have a track record of either reliably releasing breaches or falsifying them?" (VERIFIED, /FAQs). This is the cleanest public verification rubric found anywhere in this study.
- **Incentives.** None. Submitters are unnamed; the artifact (searchable breach) is the payoff.
- **Abuse defense.** The checklist itself; unverifiable dumps get labeled "unverified" on the site (UNVERIFIED detail). Publishes breach *datasets*, never accuses individuals — structurally defamation-proof.
- **Cold start.** Built by one person in 2013, seeded with already-public mega-breach corpora (Adobe et al.) — data preceded users (UNVERIFIED, widely documented).

## 6. ScamAdviser — algorithm first, reports as noisy input

- **Intake.** A /report-a-scam form exists ("Every report protects millions of other consumers" — VERIFIED-SNIPPET); the page and the FAQ both returned 403 to fetching, so exact fields are UNVERIFIED. Trustpilot reviewers report the contact form breaking and report@scamadviser.com bouncing (VERIFIED-SNIPPET of third-party reviews — treat as anecdote, but it is the only observed friction evidence).
- **Moderation.** Primarily algorithmic Trust Score; the FAQ concedes: "The Trust Score partly takes into account information whose accuracy cannot be directly verified, such as user ratings" (VERIFIED-SNIPPET). No visible per-report states.
- **Incentives.** None. Reports dissolve into a score.
- **Abuse defense.** Disputes go through contacting ScamAdviser to contest a score or "incorrect" user reviews (VERIFIED-SNIPPET). Scores domains, not people — hedged by construction, and by the same token gameable in both directions.
- **Cold start.** Algorithm-first: the domain-scoring engine gave every URL a page before any user reported anything — SEO-driven traffic, reports layered on later (ESTIMATE from product structure).

## 7. FTC ReportFraud — the government sink with a feedback loop

*(ftc.gov blocks fetching; all quotes VERIFIED-SNIPPET from ftc.gov pages via search index.)*

- **Intake.** Guided multi-step form at reportfraud.ftc.gov/form (SPA), launched October 2020. No account needed; identity requested but reports can be filed without full contact details.
- **Moderation.** No publication at all — reports flow into Consumer Sentinel, "a secure online database that is used by civil and criminal law enforcement authorities worldwide"; "your report is instantly available to more than 3,000 federal, state, and local law enforcers across the country."
- **Incentives.** The strongest closure loop in the study: "consumers who file a report will receive next steps from the FTC with advice on what to do based on their particular report." Explicitly bounded: "The FTC does not resolve individual consumer reports."
- **Abuse defense.** Nothing is published, so false reports pollute a law-enforcement dataset rather than a public accusation surface. Perjury-adjacent deterrents apply (UNVERIFIED).
- **Cold start.** Not applicable — statutory mandate plus predecessor complaint systems; aggregate output ($12.5B reported 2024 losses, VERIFIED-SNIPPET headline) markets the intake.

## 8. ACCC Scamwatch — the transparent government form

- **Intake.** Five named stages: "Introduction, About the scam, About you, Preview & submit, Complete" (VERIFIED, portal.scamwatch.gov.au). You'll need "details of the scam, including any contact details and times" and "any images or attachments relating to the scam, like screenshots" (VERIFIED). Optionality is explicit: "share as much or as little as you're comfortable with" (VERIFIED). Friction: 5 screens, no account.
- **Moderation.** Internal ACCC triage; nothing public per-report. Two disclaimers do heavy lifting: "Reports to Scamwatch are not official police reports" and "We can't respond to reports made through this form" (both VERIFIED).
- **Incentives.** Civic framing: "Your report helps us stop scammers and warn others"; consent-based action — "With your consent, we can use your report to work with organisations and remove scam websites, scam ads and contact details"; victim-support referral to IDCARE (all VERIFIED).
- **Abuse defense.** No publication surface to abuse. Privacy statement governs data (VERIFIED reference).
- **Cold start.** Government mandate + national ad campaigns; not a community.

## 9. Chainabuse — the industry-consortium ledger (BTCSCAM's closest analog)

- **Intake.** Free, structured reports against addresses/domains/handles; guest submission allowed — users "can share reports under the username of their choice... or an anonymous name," or file without logging in (VERIFIED-SNIPPET of docs). Others can "upvote, downvote or leave comments to contribute additional information" (VERIFIED, TRM launch blog).
- **Moderation.** Three visible trust states (VERIFIED, docs.chainabuse.com): **Trusted Contributor** (report filed by pre-vetted Web3 Security Network partners), **Checked Report** ("our team of moderators, including blockchain intelligence experts specializing in identifying crypto crime, checked the report" — with the hedge "Please note that there can be no guarantee that the information is 100% accurate."), **Unverified Report** (use cautiously). Every report gets a staff confidence score: "Chainabuse Blockchain intelligence team attributes a confidence score to every report." Spam: "reviews reports against spam... Spam is removed," plus a safelist of legitimate addresses/URLs to prevent false reporting (all VERIFIED).
- **Incentives.** Chosen-name attribution, badge-tier prestige for vetted orgs, and law-enforcement pipeline framing (reports feed TRM's LE customers — VERIFIED-SNIPPET).
- **Abuse defense.** The strongest stack observed: safelist + spam review + confidence scores + community flagging, with escalation — "Flagged reports are reviewed by the Global Investigations team of TRM, composed of former agents from the FBI, U.S. Secret Service, IRS-CI" (VERIFIED). Reports target addresses and URLs, not legal names.
- **Cold start.** Textbook seeded launch, May 18, 2022: partners Circle, Solana Foundation, The Aave Companies, Hedera, Binance.US, Civic; rationale that social-media scam warnings are "difficult to validate, consolidate or track over time"; and it "launches publicly today with hundreds of reports available to search across seven blockchains" (all VERIFIED, TRM blog). Data and partners preceded community; then it absorbed BitcoinAbuse's install base (2023, see Failures).

## 10. Reddit r/scams — community triage inside rented traffic

*(reddit.com refuses automated fetch; searches returned nothing quotable. This section is UNVERIFIED general knowledge, stated as such — the exact rule text must be captured manually before this doc ships.)*

- **Intake.** Reddit account required (pseudonymous OK, throwaways common). Free-text posts; screenshots customary with a strong norm to redact usernames/PII per Reddit's sitewide personal-information rules. Pinned/weekly threads absorb repetitive scam types; a wiki catalogs common scams so mods can close duplicates with a link. Friction: minimal (1 screen) once you have an account.
- **Moderation.** Volunteer mods + AutoModerator; states are effectively live/removed/locked. Doxxing rules mean scammer *identities* generally cannot be posted — the sub identifies scam *patterns*, not perpetrators.
- **Incentives.** Karma, flair, and fast human answers ("is this a scam?" usually answered in minutes — ESTIMATE from observed usage). Helpers build recognizable reputations.
- **Abuse defense.** Sitewide anti-doxxing is the defamation shield; mods remove accusations naming private individuals. Vindictive reporting is largely neutralized because naming isn't allowed at all.
- **Cold start.** Zero independent cold start: the sub grew inside Reddit's existing traffic and account graph — the clearest evidence that distribution, not tooling, creates report volume (ESTIMATE/structural).

## 11. Bitcointalk Scam Accusations — the only true community-verification system found

- **Intake.** Forum account required; accusations are public threads. A sticky prescribes the evidence template (VERIFIED, topic 260073/5575870): "What happened / Scammers Profile Link / Your username / Amount Scammed / Payment Method / Proof of Payment / PM/Chat Logs / Additional Notes." Guidelines demand receipts: "Whatever the allegation, please provide valid evidence to prove your claim right," including support-ticket IDs, screenshots, logs, contracts; exhaust the platform's support channel first (VERIFIED).
- **Moderation.** Community, not staff: the board is essentially unmoderated for truth; the **trust system** (DefaultTrust ratings and flags) is the verification layer. The board remains active — newest threads dated 2026-08-11, the day of access, across "451 pages" of accusations (VERIFIED, board index).
- **Incentives.** Reputation: successful accusations build trust standing; scammers get flags/negative trust that follow their account. Reporters are publicly named (pseudonymously) and permanently credited in-thread.
- **Abuse defense.** Symmetric reputation risk: "False or unsubstantiated accusations can result in negative feedback or reputation tags from trust system members" (VERIFIED paraphrase of guidelines). Accused parties reply in-thread — a built-in right of reply. Defamation exposure is offloaded onto pseudonymous users and an offshore forum.
- **Cold start.** Grew inside Bitcointalk's pre-existing marketplace traffic (2011-era escrow culture — UNVERIFIED date); accusations followed commerce, not vice versa.

## 12. Wildcard: GlobalAntiScam.org (GASO) — victims as infrastructure

- **Intake.** "Submit Scam Information" form + info@globalantiscam.org: "If you have lost funds to a scam, your information helps document scam infrastructure and disrupt future operations" (VERIFIED, homepage).
- **Moderation.** Internal caseworkers; nothing publishes per-report. Claimed corpus: 1000+ case records, 150+ compound locations mapped, $21.9M illicit funds flagged (VERIFIED as *claims on their homepage*, not independently checked).
- **Incentives.** Support and meaning, honestly bounded: "Submission does not guarantee recovery but contributes to accountability and disruption," and activities "do not constitute rescue operations, law-enforcement activity, or guaranteed outcomes" (VERIFIED).
- **Abuse defense.** No public accusation surface; intelligence goes to reports/LE. 501(c)(3) via "a US-based non-profit, Neosultancy, Inc." (VERIFIED).
- **Cold start.** The purest victim-bootstrap in the study: founded June 2021 by pig-butchering victims; ~60 core volunteers — themselves victims — within eight months (VERIFIED-SNIPPET, Asia News Network via search). Shared trauma was the acquisition channel.

---

## COMPARISON MATRIX

| Platform | Public submission? | Evidence required | Anonymous OK | Who verifies | Reporter incentive | Abuse defense | Named credit? |
|---|---|---|---|---|---|---|---|
| Rekt.news | Tips only (Telegram/X) | None formal | Yes (culture of it) | Anonymous editors | None; whistleblower closure | Full editorial gate | No — sources anonymous |
| Web3IGG | Suggestions (GitHub issue/DM) | Link to press reporting | Via DM; GitHub acct for main path | One person (Molly White) | Public issue queue; no formal credit | Cites journalism, not testimony | Incidental (GitHub handle) |
| Krebs | Tips only (contact form) | None formal | Form allows it; follow-up expected | One journalist | Correspondence; occasional hat-tip | Journalist verification + personal liability | Rarely |
| BleepingComputer | Tips (1-field form) + forum posts | None (Tip field only) | Yes — Tor/Signal offered | Staff journalists | Coverage of your tip | Editorial gate; human follow-up | No |
| HIBP | Breach submissions (email) | The dataset itself | Yes | One person, published 5-question rubric | None | Public checklist; publishes data, not accusations | No |
| ScamAdviser | Yes (form; reliability disputed) | Optional details | Effectively yes | Algorithm; staff on dispute | None | Score hedging; owner dispute channel | No |
| FTC ReportFraud | Yes (guided form) | Optional narrative/details | Largely yes | Nobody publishes; LE consumes | "Next steps" advice; civic closure | Non-public database | No |
| Scamwatch | Yes (5-step form) | Details + screenshots requested | "Share as much or as little…" | ACCC internal | Civic framing; IDCARE referral | Non-public; consent-based action | No |
| Chainabuse | Yes (structured, guest OK) | Address/URL + description | Yes (guest/pseudonym) | TRM staff + partner tier + community flags | Chosen-name attribution; badge tiers; LE pipeline | Safelist + spam review + confidence scores + ex-FBI escalation | Yes, chosen name |
| r/scams (UNVERIFIED) | Yes (posts) | Screenshots (redacted) by norm | Pseudonymous/throwaway | Volunteer mods + crowd replies | Karma, fast answers, flair | Sitewide anti-doxxing; removal | Pseudonymous |
| Bitcointalk Scam Acc. | Yes (public threads) | Mandated template: proof of payment, logs | Pseudonymous | Community trust system + flags | Reputation; permanent public record | Counter-flags on false accusers; in-thread right of reply | Yes, pseudonymous |
| GASO | Yes (victim intake form) | Case details | Not stated | Internal caseworkers | Support; "accountability and disruption" | No public accusations | No |

---

## FAILURE CASES

**1. CryptoScamDB — died standing up.** The static homepage still renders ("Stay Safe... more than 6,000 entries", donation addresses, API links — VERIFIED fetch 2026-08-11), but the API is dead: `api.cryptoscamdb.org/v1/scams` returns **HTTP 502** (VERIFIED same day), and the GitHub org has renamed the site repo `CryptoScamDB/legacy.cryptoscamdb.org` (VERIFIED fetch — the word "legacy" is the org's own epitaph; last-commit date not captured, repo abandonment in 2023 UNVERIFIED). **What killed it (ESTIMATE):** a volunteer/grant-run open database with no revenue and no institutional owner; when maintainer attention lapsed, the data pipeline died while the shell kept serving — worse than a 404, because a zombie database silently stops warning people while still looking authoritative.

**2. BitcoinAbuse — absorbed, not survived.** bitcoinabuse.com now serves a migration notice: "We are happy to announce BitcoinAbuse and Chainabuse — the leading reporting platform of malicious crypto activity — have joined forces," pointing users to Chainabuse; footer frozen at 2023 (VERIFIED fetch). It had real volume as a single-purpose BTC-address complaint DB. **What killed independence (ESTIMATE):** single-maintainer economics — the dataset was valuable, the operation wasn't fundable; a venture-backed intelligence company (TRM) could pay for moderation staff and API infrastructure the volunteer model couldn't. The *data* survived by being acquired.

**3. EtherScamDB — double death by absorption.** MyCrypto's EtherScamDB (2018) was folded into CryptoScamDB (~2019 — UNVERIFIED, widely documented); today `github.com/MyCryptoHQ/EtherScamDB` returns **HTTP 404** — the repo isn't even archived, it's gone (VERIFIED fetch 2026-08-11). Its successor then died too (case 1). **Lesson:** absorption into a *funded* platform preserved BitcoinAbuse's corpus; absorption into *another volunteer project* just moved EtherScamDB one hop closer to the same grave.

---

## Patterns across platforms

1. **Nobody has really cracked community verification.** Of 12 platforms, only Bitcointalk runs verification on community reputation (trust ratings/flags), and it works only because false accusers face symmetric reputation damage. Chainabuse lets the crowd vote/flag but reserves every trust-state change for paid staff. Everyone else verifies with a single accountable human or an institution.
2. **Survivors have a host organism; pure-volunteer databases die.** Living: TRM-funded (Chainabuse), tax-funded (FTC, Scamwatch), ad/newsroom-funded (Krebs, BC, Rekt), one-person-with-revenue (HIBP, Web3IGG via newsletter), donor-funded nonprofit (GASO), platform-subsidized (r/scams, Bitcointalk). Dead: all three failures were unfunded volunteer databases. The dataset outlives the org only if someone with a business model wants it.
3. **Anonymous intake is near-universal and is not the junk vector people fear — because no survivor auto-publishes anonymous claims.** Every platform accepts anonymous/pseudonymous input (BC even advertises Tor + Signal), but all of them interpose either a human gate before publication or a no-publication sink (government forms). The one surface with instant pseudonymous publication (Bitcointalk) compensates with mandatory evidence templates and reputational stakes.
4. **Reporter incentives are startlingly thin.** No scam platform runs badges, points, or levels. The working substitutes are: closure narratives ("instantly available to more than 3,000... law enforcers"; "your report helps us stop scammers"), attribution choice (Chainabuse), reputation (Bitcointalk), and fast human response (r/scams). A designed status ladder is genuinely unoccupied territory.
5. **Two intake grammars, cleanly split:** structured fields + typed evidence (Chainabuse, Scamwatch, FTC, Bitcointalk's template, GASO) versus one-box free-text tips (Krebs, BC, Rekt, Web3IGG, HIBP). Structured intake correlates with public searchable output; tip-boxes correlate with editorial gatekeeping. No platform does structured intake *and* editorial narrative — BTCSCAM's "paper of record + ledger" straddle is unclaimed.
6. **Defamation is managed by object choice, not by courage.** Aggregators publish *addresses, domains, handles* — never legal names (Chainabuse even safelists known-good addresses and stamps "no guarantee that the information is 100% accurate" on checked reports). Governments publish nothing. Only individual journalists (Krebs, Rekt) name humans, carrying the liability personally. r/scams bans naming outright. The community-scale naming of humans is an unsolved — probably unsolvable — problem; don't try.
7. **Cold start is always supply-side; the empty form never bootstraps.** Chainabuse launched with six industry partners and "hundreds of reports" pre-loaded; HIBP launched atop existing breach corpora; Web3IGG and Krebs are one editor's content machine; r/scams and Bitcointalk grew inside rented traffic; GASO seeded from its founders' own victimhood. Zero platforms started as a bare submission form waiting for strangers.
8. **The feedback loop is the rarest feature and the loudest selling point where it exists.** The norm is Scamwatch's blunt "We can't respond to reports made through this form." The FTC's "next steps" advice and Chainabuse's visible badge states are the only closure mechanisms found — and both organizations lead their marketing with them.

## So what for BTCSCAM

- **/report with typed evidence chips (url/txid/screenshot/quote)** is Bitcointalk's proven template ("Proof of Payment / PM/Chat Logs...") turned into UI, minus the forum sprawl. Pattern 5 says structured intake is what earns the right to a public ledger. Require ≥1 chip to submit; a zero-evidence report should be storable but never listable — the evidence floor is the spam filter (Chainabuse's spam-review lesson).
- **Anonymous-allowed intake is safe** (Pattern 3) *only because* BTCSCAM's design already interposes trust-state gates before anything reads as verified. Copy BleepingComputer's posture verbatim-in-spirit: anonymity offered proudly, plus "we commonly have questions" — an optional reply channel field, because follow-up is how one-person teams verify.
- **/reports/open public ledger + corroborator verify-votes** is the community-verification layer nobody currently has (Pattern 1). The two working precedents dictate the shape: votes must be *attributable and reputation-bearing* (Bitcointalk — false corroboration must cost status), and votes must count as *evidence for a human decision, never as the decision* (Chainabuse — staff assign every confidence score). BTCSCAM's human-only trust-state promotion is exactly Chainabuse's staffing model at indie scale; keep it, and say so publicly the way HIBP publishes its five questions — a posted promotion rubric is itself a trust asset.
- **Reader→Reporter→Corroborator→Watchman ladder** occupies the incentive vacuum (Pattern 4). No incumbent names and ranks contributors; Chainabuse's chosen-name attribution and Bitcointalk's permanent public record are the nearest things and both are load-bearing for volume. Allow pseudonyms (Rekt/Bitcointalk culture is the audience) but make credit real: name Corroborators on the report page.
- **Close the loop or die like a government form.** Show every reporter their report's state transitions (open → corroborated → verified/rejected) on the ledger. That single feature beats the industry norm ("we can't respond") and is the cheapest possible retention mechanic.
- **Defamation posture (Pattern 6):** ledger entries name *addresses, domains, handles* — never legal names. Human names live only in editorial articles, where BTCSCAM acts as a publisher with a byline, Krebs-style. Add Chainabuse's three defenses: a safelist of known-good entities, hedge language on every non-final state ("reported", "alleged"), and a dispute/right-of-reply lane for the accused.
- **Cold start (Patterns 2, 7):** the "paper of record" phase must fully precede the community phase — seed /reports/open yourself from documented public cases (the Coldcard dossier work is exactly this) so the ledger launches "with hundreds of reports available to search," Chainabuse-style. Consider 1–2 seeding partnerships (wallet vendors, researchers) as both data source and distribution. And decide early who would want BTCSCAM's corpus if it stalls — the failure cases show unowned datasets rot on live domains.

## Open questions

1. r/scams' exact rule text (and its weekly-thread mechanics) could not be fetched — needs manual capture from a logged-in browser before this doc is cited.
2. Chainabuse's time-to-badge (submission → Checked) is undisclosed; worth submitting a live test report to measure.
3. Does any platform rate-limit or stake corroboration votes? Found no precedent — BTCSCAM's verify-vote anti-brigading design has no one to copy.
4. ScamAdviser's dispute flow and form reliability are only attested by hostile Trustpilot reviews; direct verification blocked (403).
5. Rekt's actual tip channel (email vs Telegram DM) and whether they pay sources — About page was down (HTTP 500).
6. Legal question for counsel: does a corroborator vote on a hedged, address-only report create contributor liability anywhere BTCSCAM has users?

## Sources (all accessed 2026-08-11)

**Fetched directly (VERIFIED):** rekt.news · web3isgoinggreat.com/about · web3isgoinggreat.com/contribute · krebsonsecurity.com/about/ · bleepingcomputer.com/contact/ · bleepingcomputer.com/news-tip/ · haveibeenpwned.com/FAQs · scamwatch.gov.au/report-a-scam · portal.scamwatch.gov.au · docs.chainabuse.com/docs/verifying-the-accuracy-of-reported-information · trmlabs.com/resources/blog/announcing-the-launch-of-chainabuse-the-multi-chain-scam-reporting-tool-that-empowers-crypto-users-against-fraud · bitcointalk.org/index.php?board=83.0 · bitcointalk.org/index.php?topic=5575870.0 · globalantiscam.org · cryptoscamdb.org (zombie) · api.cryptoscamdb.org/v1/scams (502) · bitcoinabuse.com (migration notice) · github.com/CryptoScamDB/legacy.cryptoscamdb.org · github.com/MyCryptoHQ/EtherScamDB (404).
**Search-snippet only (VERIFIED-SNIPPET; direct fetch blocked):** reportfraud.ftc.gov/form · ftc.gov/enforcement/consumer-sentinel-network · ftc.gov 2025 press release (12.5B) · scamadviser.com/FAQ · scamadviser.com/report-a-scam · chainabuse.com/faq/CONTACT · trustpilot.com/review/www.scamadviser.com · asianews.network (GASO volunteers) · badcredit.org (GASO founding).
**Blocked/failed fetches (noted in text):** rekt.news/about (500) · reddit.com + old.reddit.com (refused) · consumer.ftc.gov (403) · globalantiscam.org/report-scams (404).

---

**Report complete.** Coverage: 12 platforms (wildcard = GASO) + 3 failure cases, 19 pages fetched directly, with every claim tagged VERIFIED / VERIFIED-SNIPPET / ESTIMATE / UNVERIFIED as required. Known gaps are declared inline: r/scams and FTC rely partly on snippets because both properties block automated fetching — flagged in Open Questions for manual capture. The strongest findings for the community-phase design: nobody has working community verification except Bitcointalk's reputation-staked model, no incumbent offers a status ladder (BTCSCAM's is unoccupied territory), and every surviving ledger launched pre-seeded with content, never as an empty form.
