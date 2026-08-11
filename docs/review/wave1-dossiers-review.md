# Wave-1 Seed Dossiers — Review Queue

**Date:** 2026-08-11 · **Status: AWAITING MITUL'S REVIEW — nothing here is published.** 12 dossiers drafted from `seeding-playbook.md` wave 1, each adversarially fact-checked (verifier problems: 7 blockers, 34 fixes, 49 nits — all applied by a prescribed-fix pass except 7 reviewer's-call items noted below), then schema-validated.

**How to approve:** reply "approve dossier <slug>" (or "approve all", "approve all except <slugs>"). On approval per dossier I: set `published` to the approval date, move the file to `data/incidents/`, re-seed Supabase, deploy, and run the archive captures still marked pending. The **unverified flags** under each dossier are the claims you should eyeball before approving — they are parked in `claims[]` as reported-unconfirmed or hedged in the text, so approving without resolving them is safe but weaker.

| # | Dossier | Trust at launch | Severity | Flags |
|---|---|---|---|---|
| 1 | `bitcoin-atm-impersonation-shakedowns` | verified | S1 | 5 |
| 2 | `crypto-recovery-service-scams` | verified | S2 | 6 |
| 3 | `ledger-impersonation-ecosystem` | verified | S2 | 6 |
| 4 | `trezor-support-phishing` | corroborated | S3 | 5 |
| 5 | `coinbase-insider-breach-2025` | verified | S2 | 5 |
| 6 | `bitcoin-sextortion-emails` | verified | S2 | 6 |
| 7 | `task-job-deposit-scams` | verified | S1 | 4 |
| 8 | `mirror-trading-international` | resolved | S3 | 7 |
| 9 | `hashflare-cloud-mining-fraud` | resolved | S4 | 6 |
| 10 | `bitconnect-ponzi` | resolved | S4 | 6 |
| 11 | `celsius-collapse` | resolved | S3 | 6 |
| 12 | `twitter-2020-giveaway-hack` | resolved | S4 | 5 |

---

## 1. Bitcoin ATM shakedowns: impersonators' QR-code cash funnel took $388.9M in 2025; adults over 50 hit hardest

**File:** `data/drafts/bitcoin-atm-impersonation-shakedowns.json` · trustState `verified` · S1 · categories: impersonation, social-engineering

**Verifier's one-liner:** Bitcoin ATM shakedown dossier: all 5 load-bearing sources fetched and confirmed exact (IC3 $388.9M/13,460, FTC Spotlight, both quotes verbatim), schema-valid, constitution-clean; fixes are the courier-PSA framing, missing archive captures, and parked state-law claims awaiting official confirmation.

**Fix pass:** 7 applied, 1 skipped. Notes: Skipped only the firstObserved/2021-vs-2020 nit — its description explicitly marks it reviewer's-call. Archive fix applied best-effort: 7 of 9 URLs now have recorded archive links appended to publisher strings (house workaround per this wave's convention, schema has no archivedUrl field), including a fresh SPN capture of Help Net Security; IC3 PSA260515-2 (no snapshot exists anywhere) and the Justia Vermont statute page both refused Save Page Now and archive.today repeatedly (520s; both sites block archivers) — each carries an explicit 'archive capture pending' note for pre-publish human capture. The Jan 2024 courier PSA (I-012924-PSA) was fetched, confirmed live and supporting, and added as a 9th regulator source (archive.ph capture recorded) since the reworded timeline now cites it. Primary-typing nit resolved by retyping IC3 PSA260515-2 as 'primary' (the offered concrete option); the ~$333M nit resolved by deleting the clause (the offered alternative). FTC PDF date set to '2024-08' — partial dates match house precedent ('2026-08' in published coldcard incident). Summary now 386/400 chars; JSON.parse validation passed.

**Check before approving:**
- [ ] Vermont 8 V.S.A. § 2577 (90-day new-customer refund mandate, $1,000 daily limit): Justia mirror returned 403 and legislature.vermont.gov refused connection during verification — confirm from the official statute before publish; actions[4] points victims to this claim.
- [ ] Minnesota 2024 kiosk law ($2,000 limit, refunds, warning signs) and the reported Minnesota/Connecticut/Vermont kiosk bans: no statute or legislature source fetched; both AARP and crypto.news citations unverified.
- [ ] BTCSCAM-derived ~$246M 2024 IC3 kiosk baseline: arithmetic checks out against the PSA's stated 58% increase, but confirm against the IC3 2024/2025 Annual Report kiosk figures before treating as more than an estimate; the '~$333M media' aside is currently unsourced.
- [ ] FTC Data Spotlight exact publication day (source dated 2024-08-01; PDF says only 'August 2024') and the web-version date 2024-09-03 (page 403-blocked; inferred from the press release).
- [ ] No archive captures of cited URLs exist yet (playbook §4 requirement) — capture all source URLs before publish; ftc.gov and Vermont legislature already block or refuse automated fetches.

---

## 2. The recovery-scam industry: fake law firms, fake tracers, and IC3 impersonators re-scam theft victims

**File:** `data/drafts/crypto-recovery-service-scams.json` · trustState `verified` · S2 · categories: recovery-scam, impersonation, social-engineering

**Verifier's one-liner:** Recovery-scam industry dossier verified: schema-valid, all four IC3 PSA primaries fetched and matching (seizure-order quote, 100+ impersonation reports, INTFTC, deepfake escalation), constitution respected; five fixes needed — misnamed elder-fraud hotline, stale MLARS URL, an unconfirmed SERP claim stated as fact in affected[], seniors-targeting overstatement, and a plural 'FBI leaders' overreach.

**Fix pass:** 8 applied, 1 skipped. Notes: Skipped only the filename nit: its suggested_fix says to rename to data/incidents/2023-crypto-recovery-service-scams.json "at approval time" — doing it now would move an unapproved draft into the published registry, so it is left for the approver. Notes on applied fixes: (1) Hotline — both candidate URLs verified live and supportive; added BOTH to sources[] (OVC program page as primary for name/numbers/60+ eligibility, ic3.gov/crimeinfo/elderfraud as regulator for the IC3-filing-assistance fact), since each covers half the claim. (2) MLARS — the reviewer-confirmation portion is already done: justice.gov/criminal/criminal-mnf 403s WebFetch but was retrieved via browser-UA curl; live page title confirms "Money Laundering, Narcotics and Forfeiture Section (MNF)" (label updated) and the page lists a Victims Program / "On-Going Department of Justice Remission Matters" section, so the actions[2] remission pointer remains accurate at the new URL. (3) relatedGuides nit counted as applied via its "accept as a forward reference" branch — no edit possible until the guide ships. Summary untouched at 396/400 chars; JSON re-validated with node JSON.parse after all edits.

**Check before approving:**
- [ ] https://www.ftc.gov/enforcement/refunds returned 403 to automated fetch (curl and WebFetch — bot-block); reviewer must open it in a browser to confirm it is live and describes free FTC refund programs before publish.
- [ ] https://www.forfeiture.gov returned 200 but its content was not reviewed; confirm petitions for remission are actually filed/listed there as actions[2] states.
- [ ] Current official name of the DOJ section at justice.gov/criminal/criminal-mnf (page 403s automated fetch) — confirm 'Money Laundering, Narcotics and Forfeiture Section (MNF)' before updating the source label.
- [ ] Whether PSA260720 literally describes the spoofed sites' forms as 'simplified' — the fetched summary confirmed the harvested-data list (name, phone, email, scam type, estimated loss) but not that adjective.
- [ ] Playbook requires archive capture of every cited URL at draft time; no archive captures were found alongside the draft — confirm they exist or capture before publish.
- [ ] National Elder Fraud Hotline hours/eligibility (Mon-Fri 10a-6p ET, victims 60+) sourced from OVC via search results, not a direct page fetch (justice.gov 403s bots) — confirm on the live OVC page when adding the source.

---

## 3. Ledger impersonation ecosystem: the 2020 customer-data leak still fuels seed-phrase letters, fake devices, and phishing

**File:** `data/drafts/ledger-impersonation-ecosystem.json` · trustState `verified` · S2 · categories: impersonation, phishing, fake-device

**Verifier's one-liner:** Ledger impersonation-ecosystem dossier is mechanically valid with strong actions/phrases and most load-bearing facts verified against fetched primaries, but two timeline facts fail source-match (Shopify-disclosure/10-BTC-bounty date; forged-CEO-signature claim) and the Oct 2024 CNIL fine is missing.

**Fix pass:** 9 applied, 0 skipped. Notes: All 9 problems applied. Deviations/details the reviewer must know: (1) CNIL fix — the suggested 'cite the CNIL decision itself as regulator source' is impossible: the deliberation was never published (Next.ink 2024-10-24 states CNIL 'n'a pas publié sa décision'; L'Informé reports courts refused release). Added the 2024-10 timeline entry citing the live, fetched Next.ink article (type 'news'), with the non-publication noted in the event text; trustState 'verified' still rests on the Ledger vendor advisories. (2) April-2025 letters — 'supplement' path taken: BeInCrypto kept as the timeline source (it carries the letterhead/reference-number and April-4 letter-date details) and The Block added to sources[] (publisher-confirmed date 2025-04-30, content verified via Wayback capture 20250518110106; the live theblock.co URL 403s automated fetchers like all The Block links, reviewer should click-check). (3) Shopify redate — Crypto Briefing publication date 2021-01-13 confirmed by fetch; the 'reported to Ledger on December 23, 2020' clause is the verifier's prescribed wording corroborated via CoinDesk/Nasdaq, not present in the Crypto Briefing article itself — reviewer may optionally swap the event source to Ledger's own Jan 13, 2021 update to make it primary. (4) impact.source and the 2020-12-20 dump entry now cite the fetched BleepingComputer 270k article, which confirms the exact 272,853/1,075,382 figures; decrypt.co (403) removed from sources[]. (5) Archive captures: Save Page Now accepted (HTTP 302) for 9 of 13 cited URLs (all 3 ledger.com pages, both remaining BleepingComputer articles except the 2021 altered-devices one, cryptobriefing, next.ink, cryptopolitan, dailycoin); 4 failed with Wayback-side 520/523 errors after retries: BC altered-devices 2021, beincrypto, theblock (has existing 2025-05-18 capture), and the x.com CEO post — rerun SPN for those at publish. unverified_flags left untouched for human review as instructed. Summary unchanged at 397/400 chars; JSON re-validated with node JSON.parse.

**Check before approving:**
- [ ] The only 'primary'-typed source (x.com/_pgauthier/status/1341084660953194497) could not be fetched — confirm the post exists and matches the Dec 21, 2020 CEO message before publish; trustState 'verified' otherwise rests on the three vendor-type Ledger advisories, which were all fetched and match.
- [ ] actions[] asserts the Ledger breach is indexed at haveibeenpwned.com — confirm the HIBP entry before publish.
- [ ] claims[1] (mid-2025 'Quantum Resistance Security Update' letter variant) remains reported-unconfirmed; Cryptopolitan/CCN still 403 — confirm via archive or drop.
- [ ] claims[4] ('no charges filed as of Aug 11, 2026') is an absence claim — re-confirm no arrests/charges exist at publish time, and note the Oct 2024 CNIL fine is an administrative sanction against Ledger, not charges against perpetrators, so wording should distinguish the two once the CNIL entry is added.
- [ ] Exact dump figures (272,853 orders; 1,075,382 emails) were corroborated via BleepingComputer search results rather than the cited Decrypt page (403) — verify an archive of whichever source is kept.
- [ ] claims[0] (~292,000 combined records) is confirmed in the fetched Crypto Briefing article; reviewer may fetch Ledger's own Jan 13, 2021 update (ledger.com/blog/update-efforts-to-protect-your-data-and-prosecute-the-scammers) to upgrade it to primary-confirmed.

---

## 4. Trezor support-channel phishing: 2024 support-portal breach and 2025 contact-form abuse

**File:** `data/drafts/trezor-support-phishing.json` · trustState `corroborated` · S3 · categories: phishing, impersonation

**Verifier's one-liner:** Trezor support-channel phishing dossier (2024 portal breach + 2025 contact-form abuse) passes schema, sourcing, and constitution checks with zero blockers; 3 accuracy fixes recommended (mislabeled Jan-20 notification claim, over-firm 'exposed' wording vs the advisory's hedge, missing vault.trezor[.]guide domain extraction) before owner approval.

**Fix pass:** 7 applied, 0 skipped. Notes: All 3 fixes and 4 nits applied to data/drafts/trezor-support-phishing.json; JSON validates, summary 398/400 chars. Details: (1) claims[3] upgraded to primary-confirmed after confirming the verbatim 'emailed today, 20th January 2024, all of the 66,000 contacts' sentence in the Wayback capture (20240122112334) of the advisory (WebFetch cannot reach web.archive.org, so verified via curl + text extraction); advisory URL added to claim sources, attribution rewritten. (2) Summary hedged to 'may have exposed' — required compressing 'twice turned into phishing weapons'→'twice weaponized for phishing' and 'genuine'→'real' to stay under the 400-char cap; timeline 2024-01-17 now says 'may have been accessed, per Trezor'. (3) entities.domains added as ['vault.trezor[.]guide'] after fetching the BleepingComputer 2025-06-24 article, which confirms the domain and the exact subject line '[URGENT]: vault.trezor.guide - Create a Trezor Vault now in order to secure assets who may potentially be at risk.'; the lure is quoted defanged in the 2025-06-24 timeline event. (4) 8-user trial-discussion-platform cohort added to the 2024-01-17 timeline event, wording mirroring the advisory ('might have had their contact details compromised'). (5) claims[4] absence claim: as-of date 2026-08-11 added and status changed primary-confirmed→reported-unconfirmed. (6) crypto.news nit had no suggested_fix; I verified the article's publication date via WebFetch (byline 'Jun 23, 2025 at 1:01 PM UTC') — the draft's sources[3] date 2025-06-23 is already correct, so no edit was needed; counted as applied via verification. (7) Archived Wayback URL appended to sources[0] publisher field per the suggested workaround (schema has no archivedUrl field). Unverified_flags left untouched for human review as instructed; note the playbook-wide Save Page Now captures for the other three cited URLs remain a pre-publish reviewer task.

**Check before approving:**
- [ ] Trezor's June 23, 2025 X post was not directly retrieved (X inaccessible); the 'There was no email breach...' quote is verified only via crypto.news (verbatim match) and BleepingComputer paraphrase — archive the X post or its Wayback capture pre-publish; draft correctly parks this as reported-unconfirmed in claims[2]
- [ ] Confirm Save Page Now / screenshot captures exist for all four cited URLs at draft time (playbook §4 requirement); the 2024 advisory has Wayback snapshot 20240122112334, verified readable by this reviewer
- [ ] 'No fund losses confirmed' for the June 2025 wave is an absence claim as of 2025-06-24 — re-sweep for any later loss reporting before publish and refresh impact.asOf
- [ ] crypto.news article publication date (listed 2025-06-23) — confirm exact date before publish
- [ ] trustState stays 'corroborated' per the playbook row condition: the 2024 advisory was retrieved via Wayback and its facts verify, but no trezor.io-owned advisory exists for the June 2025 incident (primary is the X post) — if the owner considers the 2024 Wayback retrieval plus the X-post archive sufficient as 'both advisories', promotion to 'verified' is defensible; otherwise leave as is

---

## 5. Coinbase insider breach: bribed support agents leaked customer data, feeding a 'safe wallet' impersonation-call wave

**File:** `data/drafts/coinbase-insider-breach-2025.json` · trustState `verified` · S2 · categories: impersonation, social-engineering

**Verifier's one-liner:** Coinbase insider-breach dossier is mechanically valid and matches its primary sources on every spot-checked fact except one miscitation: the $307M Q2-2025 expense figure is cited to a Crowdfund Insider article that does not contain it (the true primary source is Coinbase's Q2'25 shareholder letter on EDGAR, filed 2025-07-31).

**Fix pass:** 6 applied, 0 skipped. Notes: EDGAR shareholder-letter URL verified live via curl with a declared User-Agent (sec.gov 403s anonymous fetchers) and contains the exact sentence 'driven by $307 million in expenses related to the data theft incident disclosed in May' (EX-99.1, July 31, 2025). Crowdfund Insider was dropped rather than kept: nothing else cited it (the India-arrest claim already has BleepingComputer + The Block), which also resolved its missing-date nit. For the lossUSD nit I took the verifier's first option (307000000, asOf 2025-07-31, shareholder-letter source) since the figure is now primary-confirmed. Problem 2's description named the summary as well as actions[2], so the summary pledge was scoped to 'tricked before May 15'; combined with the '(SEC 8-K + Coinbase blog, May 15)' nit this required trimming 'were taken' to 'taken' — summary is 396/400 chars. The Block post-383790 date set to 2025-12-29 per the verifier's ~date (URL 403s to fetchers, unverifiable directly). JSON.parse passes; edited fields hand-checked against incident.schema.json (ajv not installed for a full validation run). Unverified_flags left untouched for human review as instructed — note the Wayback/Save-Page-Now archive captures required by the playbook still do not exist for any cited URL, including the two newly-cited-date The Block links.

**Check before approving:**
- [ ] Maine AG breach notice (69,461 affected; breach start 2024-12-26): correctly parked as reported-unconfirmed — I confirmed SecurityWeek reports it, but the actual notice on maine.gov was not fetched. The Maine AG data-breach-notices index exists (maine.gov/agviewer); reviewer should locate the Coinbase notice URL and consider upgrading the claim and firstObserved sourcing.
- [ ] Coinbase blog live URL is Cloudflare-blocked to automated fetchers; I verified all cited blog facts via the Wayback Machine snapshot of 2025-05-20 (web.archive.org/web/20250520/...). Per playbook, capture and record an archive URL for every cited source at publish time — especially this one.
- [ ] Both The Block URLs (posts 355216 and 383790) returned 403 to fetch tools; the underlying facts are corroborated by SecurityWeek and BleepingComputer respectively, but the links themselves should be click-checked by the reviewer.
- [ ] Exact date of the Hyderabad arrest is not established by any fetched source — only the Dec 28-29, 2025 announcement/coverage dates.
- [ ] TaskUs department shutdown (226 employees) rests on a TaskUs statement as quoted by BleepingComputer/Fortune; no first-party TaskUs statement or Indian charging document was fetched — claims[3] reported-unconfirmed status is correct and should stay until one is.

---

## 6. Bitcoin sextortion emails: 'I have your password' blackmail waves — the video does not exist

**File:** `data/drafts/bitcoin-sextortion-emails.json` · trustState `verified` · S2 · categories: social-engineering

**Verifier's one-liner:** Sextortion-email dossier verified against all 7 cited sources (FTC via Wayback after live 403): schema-valid, quotes and legal framing clean, trustState justified; 5 precision fixes needed (FTC date, 242% = complaints not losses, phone-number detail, summary hedge, post-2024 currency source) but no blockers.

**Fix pass:** 8 applied, 1 skipped. Notes: Skipped only the S2-vs-S1 severity nit (explicitly reviewer's-call per its suggested_fix). New 2025 currency source is the NJCCIC alert https://www.cyber.nj.gov/Home/Components/News/News/1564/214 (dated 2025-01-09): the live URL returns 403 to automated fetchers (bot block, same as consumer.ftc.gov) but content was verified verbatim via Wayback capture 20250305033129 — reviewer should click-check it in a browser and Save Page Now it with the other sources. The dropped "phone number" detail from the 2024-09 Krebs entry now appears properly sourced in the new NJCCIC timeline entry (NJCCIC confirms phone number + home address in the PDF attachment's first line). FTC timeline parenthetical was replaced with the Wayback-verification note (the fix's stated alternative) rather than deleted outright. lossNative was removed and its caveat folded into impact.victims. StopNCII (stopncii.org) fetched and confirmed live, free, adults 18+, run by SWGfL's Revenge Porn Helpline. Summary is 382/400 chars; JSON re-validated with node JSON.parse.

**Check before approving:**
- [ ] FTC alert page (consumer.ftc.gov/consumer-alerts/2018/08/how-avoid-bitcoin-blackmail-scam) still 403s to automated fetchers — content verified only via a 2024 Wayback capture showing date August 21, 2018; per the playbook this row requires pre-publish confirmation from a normal browser, including whether the live page now displays any updated date.
- [ ] The claim that the live FTC page shows a 'June 23, 2022 update' is contradicted by the archived capture — confirm from a residential browser or delete.
- [ ] 'Still active' as of 2026 / ongoing:true — no cited source newer than 2024-09; confirm with a 2025/2026 advisory (NJCCIC Jan 2025 alert is a candidate) before publish.
- [ ] The '$1,950' lower bound in '~$1,950–$2,000' (2024-09 timeline): my Krebs fetch confirmed only 'just shy of $2,000' and the QR code; confirm $1,950 appears in the article or round to '~$2,000'.
- [ ] The 2019-04 date for the IC3 2018 report's release: report content verified from the PDF, but the April 2019 publication month itself was not independently confirmed.
- [ ] Playbook requires Save Page Now archive captures of every cited URL at draft time — no evidence of captures accompanies this draft; capture all seven source URLs before publish (especially the two Krebs posts and the EFF post, which are the only non-PD sources).

---

## 7. Task scams: gamified 'deposit to withdraw your earnings' job platforms drive record job-scam losses

**File:** `data/drafts/task-job-deposit-scams.json` · trustState `verified` · S1 · categories: social-engineering, ponzi

**Verifier's one-liner:** Task-scams dossier passes all mechanical, sourcing, and constitution checks — every load-bearing FTC/IC3 figure verified verbatim against fetched primaries — with one fix (uncited FBI recovery-company claim in actions[]) and five nits for the reviewer.

**Fix pass:** 4 applied, 2 skipped. Notes: Applied: (1) added IC3 PSA230811 to sources[] as regulator/2023-08-11 after WebFetch confirmed the page is live and contains verbatim "Private sector recovery companies cannot issue seizure orders to recover cryptocurrency" — backs actions[6]; (2) timeline 2026-04-06 clause reworded to "employment fraud continues its year-over-year climb" per suggested wording; (3) timeline 2024-06-04 "payment structure" -> "compensation structure"; (4) relatedIncidents now ["crypto-recovery-service-scams"] — the slug exists in data/drafts/crypto-recovery-service-scams.json and slugs are permanent per schema (that dossier's pending rename is filename/id only), so the "once slugs exist" condition is met. Skipped: lossUSD nit (suggested_fix explicitly "Reviewer decision") and firstObserved nit (house-style call whose default is "keep as-is"; no change made, convention documentation belongs at registry level, not this file). JSON validated with node (parses); summary unchanged at 394/400 chars; sources[] now 8 entries. Reviewer note: archive captures of cited URLs (unverified_flags) were left for human review per task scope.

**Check before approving:**
- [ ] ftc.gov and consumer.ftc.gov return 403 to automated fetchers — I verified all FTC facts via browser-UA curl, but the playbook-mandated Wayback (Save Page Now) captures of every cited URL at draft time are not confirmed to exist; the reviewer should archive all 7 source URLs before publish.
- [ ] FBI press-release date (April 6, 2026) was confirmed from a Wayback capture (20260407035253) because the live fbi.gov page is Cloudflare-blocked to bots; some secondary coverage says the report was 'released April 7, 2026' — reviewer should eyeball the live fbi.gov page in a browser to confirm the April 6 dateline.
- [ ] The 'published'/'lastUpdated' values of 2026-08-11 are placeholders per the workflow and must be adjusted at approval time.
- [ ] The consumer-alert URL path says /2024/11/ while the page datetime and byline say December 12, 2024 — I confirmed 2024-12-12 from the page's datetime attribute; reviewer may want to note the URL-path mismatch so it isn't 'corrected' to November later.

---

## 8. Mirror Trading International: 29,421 BTC 'forex bot' Ponzi — the largest Bitcoin fraud charged by the CFTC

**File:** `data/drafts/mirror-trading-international.json` · trustState `resolved` · S3 · categories: ponzi

**Verifier's one-liner:** MTI dossier: CFTC/FSCA/portal facts all verify, but the timeline conflates the April 2023 Ponzi declaration with final liquidation (actually 30 June 2021), misdates the Mariblock recovery report as 2024 (published Oct 2023), and omits Steynberg's widely reported April 2024 death — NEEDS-REWORK.

**Fix pass:** 11 applied, 0 skipped. Notes: All 11 problems applied, including the reviewer's-call Dec-2024 Moneyweb nit (applied because content verified via The Writer's Room mirror; Moneyweb 403s all automated fetchers). Deviations from suggested fixes, each forced by URL liveness checks: (1) suggested www.mticlaims.co.za has no DNS — cited live apex https://mticlaims.co.za/ instead (fetched; confirms Investrust-run official claims portal, liquidator A.W. van Rooyen); (2) official FSCA PDF URL on fsca.co.za now 404s — cited the FSCA's own PDF via Wayback capture 20200821154304 (content verified: R2.9bn, cannot-confirm-funds, unlicensed), mirror kept as convenience link in publisher note; (3) LawLibrary live page 403s to automated fetch — cited the live URL per the fix, content fully verified via Wayback capture 20251007174543 (confirms [2023] ZAWCHC 38, provisional 29 Dec 2020, final liquidation 30 June 2021, pyramid/Ponzi findings, void ab initio). Steynberg death claim cites verified Moonstone (2024-04-29) plus the Moneyweb death article (bot-blocked; existence and death-certificate details corroborated via search results) — reviewer should click-check both Moneyweb URLs in a browser. Moneyweb 'evaporating pot' sources[] entry carries no date field: the mirror shows 2025-07-16 while the verifier called it Dec-2024 reporting, so no date was invented; the timeline entry is dated 2024-12 by the reported state. Optional 'consider adding the defunct MTI domain defanged' sub-part of the aliases nit was not done — no citable source for the exact historical domain (alias + phrase additions were applied). Summary now 390/400 chars; node JSON.parse passes; timeline chronological. Wayback Save Page Now captures for the new URLs remain a pre-publish task per the standing unverified_flags (left for human review as instructed).

**Check before approving:**
- [ ] Confirm at publish time that www.mticlaims.co.za is still live and still the official claims channel (my corroboration: Investrust claim-form PDF at investrust.co.za and the live.mticlaims.co.za self-description; a dead or hijacked domain here would send victims into harm)
- [ ] Steynberg's reported death 22 April 2024 (Brazilian death certificate per Moneyweb/Mybroadband; Hawks investigation; active faked-death dispute) — decide framing (reported-unconfirmed vs disputed) before publish; I verified the reporting exists but not the underlying fact
- [ ] Exact liquidation dates 29 Dec 2020 (provisional) and 30 June 2021 (final) come from secondary coverage; confirm from the judgment text — the LawLibrary copy at lawlibrary.org.za/akn/za-wc/judgment/zawchc/2023/38/eng@2023-04-26 is fetchable (note the ZAWCHC 38 vs ZAWCHC 83 citation discrepancy between LawLibrary and SAFLII for the 26 April 2023 judgment — confirm the correct neutral citation before citing)
- [ ] SAFLII URL still returns 403 (matches draft note) — the 'primary' source in sources[] remains unfetched; either verify via the LawLibrary mirror or downgrade/annotate
- [ ] Whether the site template auto-appends the B11 no-recovery boilerplate at render time or it must be present in the dossier JSON (the message is present in actions[] but not as the B11 block)
- [ ] Playbook-required archive captures (Save Page Now + own screenshot) of every cited URL at draft time — cannot be verified from the JSON alone
- [ ] Policy call: legitimate victim-resource domains (mticlaims.co.za) are printed fangs-on while the binding rule says defang named domains — confirm the objects rule applies only to malicious domains as the schema states

---

## 9. HashFlare: $577M fake cloud-mining dashboards — founders pled guilty; $450M+ forfeited for victim remission

**File:** `data/drafts/hashflare-cloud-mining-fraud.json` · trustState `resolved` · S4 · categories: ponzi

**Verifier's one-liner:** HashFlare dossier verified: schema-valid, all 5 load-bearing fact clusters confirmed against fetched DOJ/USAO primaries and vLex; two timeline inaccuracies to fix (Estonian-custody duration, unsourced "pending as of mid-2026" appeal status) and stale OPA URLs, but no blockers.

**Fix pass:** 8 applied, 0 skipped. Notes: All 3 fixes + 5 nits applied. Details the reviewer should know: (1) Both new /archives/opa/pr/ DOJ URLs verified live (200 behind Akamai bm-verify interstitial; plain fetchers see a 403/refresh page) and their text confirms every fact they are cited for; the plea-release URL (justice.gov/opa/pr/two-estonian-nationals-plead-guilty-577m...) was NOT named in any problem and is untouched. (2) Archive captures: the arrest /archives/ URL already has Wayback snapshot 20260526173740; Save Page Now for the extradition /archives/ URL failed repeatedly from this environment (anonymous SPN rate limits: 429/520) and no snapshot exists yet — reviewer must capture it manually per playbook. (3) Guide-reference nit: actions[] reworded to drop 'our cloud-mining guide'; relatedGuides ["is-cloud-mining-legit"] left in place as a forward reference — the fix's other branch (confirm the guide ships in wave 1) is a publish-time reviewer task. (4) firstObserved 2015-01-01 kept as-is: schema forces a full date and sibling wave-1 drafts use year-start placeholders (de facto convention; house-style documentation still pending). (5) lossNative removed; its $577M-vs-$575M reconciliation now lives in a new primary-confirmed claims[] entry (claims count now 6) citing the sentencing release + archived arrest release; no sourced BTC-denominated figure exists. (6) entities.domains: hashflare[.]io added defanged; DOJ releases say only "HashFlare's website" without printing the domain — domain corroborated via The Block/Capital.com coverage; schema has no per-domain citation field. JSON validated via node JSON.parse; summary 396/400 chars (untouched, as no problem named it). unverified_flags left for human review as instructed.

**Check before approving:**
- [ ] Sentencing outcome was verified today against the fetched USAO-WDWA release (all details match), but the playbook row and section 7 require confirmation from the W.D. Wash. docket (2:22-cr-185 / CR22-185RSL) via PACER pre-publish — not done here; the vLex reproduction of the Aug 25, 2025 sentencing order is consistent but is not the docket.
- [ ] Ninth Circuit appeal status: if DOJ's appeal of the time-served sentences was decided in 2026, the sentence and the 'resolved' framing could be wrong — reviewer must check the Ninth Circuit docket before publish; no 2026-dated source was found in this verification.
- [ ] fbi.gov/hashflare victim intake: both the short URL and the long FBI seeking-victims URL return 403 to automated fetchers; a Wayback snapshot dated 2026-07-25 confirms the page existed recently, but reviewer should open it in a browser to confirm the questionnaire is still live and no remission deadline has been added.
- [ ] 'No remission procedure announced as of 2026-08-11' (claims[] #5): corroborated by web search today (no administrator or deadline found announced through Aug 2026) but must be re-checked on publish day against justice.gov/criminal/criminal-mnf/remission (fetched, still generic) and the FBI page.
- [ ] vLex-reported figures (440,000 customers; $352,970,000 paid to withdrawing customers; assets ~$500M; ~240,000 never withdrew) match the vLex page as fetched today — correctly parked as reported-unconfirmed; upgrade only after pulling the actual sentencing order from the docket.
- [ ] Playbook requires an archive capture of every cited URL at draft time; no evidence of captures accompanies this draft — reviewer should confirm captures exist (note the two OPA URLs should be captured at their new /archives/ locations).

---

## 10. BitConnect: the $2.4B 'Lending Program' Ponzi — real restitution exists; every paid 'refund agent' is a scam

**File:** `data/drafts/bitconnect-ponzi.json` · trustState `resolved` · S4 · categories: ponzi

**Verifier's one-liner:** BitConnect dossier passes schema validation and all verbatim-quote/constitution checks with primary facts verified against DOJ/SEC/TSSB sources, but needs five accuracy fixes (promoter count, impact confidence label, two source mis-attributions, one under-labeled claim) before publish.

**Fix pass:** 8 applied, 0 skipped. Notes: All 8 problems (5 fixes, 3 nits) applied; JSON validates via node JSON.parse; summary untouched at 395/400 chars. Judgment calls: (fix 2) chose the keep-$2.4B option — confidence changed to 'estimated' with indictment-vs-plea attribution added to impact.victims — to avoid contradicting the $2.4B in title/summary, which no problem named; (fix 3) impact.source points to the IRS CI mirror https://www.irs.gov/node/114176 (fetched live, carries '4,154 victims from 95 countries', dated 2022-09-16) because the suggested justice.gov USAO URL 403s automated fetchers and the fix explicitly permitted the mirror; asOf set to 2022-09-16 and victims text restructured so the Jan 2023 ~800 clause cross-references the timeline. (fix 4 + nit 8) 2023-01-12 entry trimmed to sourced facts and re-cited to https://www.irs.gov/node/118171 (fetched; exact $17,646,801 / ~800 victims / 40+ countries confirmed); the Arcaro-crypto funding link survives sourced in the 2021-11-16 entry, and the no-fee warning stays in actions[]. (fix 5) TSSB order URL fetched — 'returns as high as 40% a month' via 'BitConnect Trading Bot' confirmed verbatim — claim #4 split into a primary-confirmed TSSB claim plus the reported-unconfirmed 1%/day / 3,700%-annualized press claim (claims count now 7). Reviewer heads-up: actions[2] still contains 'funded by crypto forfeited by Arcaro' — that inference was only flagged for the timeline entry, actions[] was not named in any problem, so per the no-unnamed-rewrites rule it was left; it is covered by the entry's unverified_flags. Archive captures (unverified_flags item) were not performed — flags are explicitly out of scope for this task.

**Check before approving:**
- [ ] Summary states Kumbhani 'remains at large' as of the 2026-08-11 publish date. Best evidence found: SEC filing in SDNY (Nov 2024) saying it could not locate him, and Feb 2025 Indian reporting tracing him to Ahmedabad; no arrest surfaced in Aug 2026 searches. Re-check for arrest/extradition news immediately before publish.
- [ ] TSSB quote in claim #2 ('Investors should not respond to the fraudulent notice, complete the form, or send any money to the imposters.') — fetch summarization truncated mid-sentence; confirm the exact wording on the TSSB alert page in a browser before publish.
- [ ] Whether the Jan 2023 $17.6M distribution was funded specifically by the forfeited Arcaro cryptocurrency — an inference from the Nov 2021 liquidation release, not stated in the restitution release; confirm via the US v. Arcaro docket (21-cr-02542-TWR, S.D. Cal.) if the claim is kept.
- [ ] actions[3] tells prior filers to update details with the USAO-SDCA victim-witness contact — reasonable, but not verified against a fetched page; the DOJ $56M release points victims to justice.gov/usao-sdca/us-v-glenn-arcaro-21cr02542-twr, which the dossier could cite directly. Confirm that page is still live.
- [ ] Playbook section 4 requires an archive capture of every cited URL at draft time; the JSON shows no evidence of captures. justice.gov 403s to non-browser fetchers (verified during this review), making Wayback captures of the four DOJ/USAO URLs especially important.
- [ ] CoinDesk/DL News India-seizure figures (₹16.5B / ~$190M, Feb 2025) were not independently fetched during this review; they are correctly parked as reported-unconfirmed, but spot-check the CoinDesk article before publish since it also feeds a timeline entry.

---

## 11. Celsius collapse: 'Unbank Yourself' platform froze $4.7B in customer crypto; founder sentenced to 12 years

**File:** `data/drafts/celsius-collapse.json` · trustState `resolved` · S3 · categories: exchange-failure

**Verifier's one-liner:** Celsius collapse dossier (2022 freeze of ~$4.7B, Mashinsky 12-year sentence, FTC $16.5M orders): all load-bearing facts verified against live SDNY/FTC/Stretto primaries, but one blocker — the claims-agent hotline number in actions[] does not match Stretto's official contact page.

**Fix pass:** 6 applied, 0 skipped. Notes: All 6 problems applied (1 blocker, 2 fixes, 3 nits) to /Users/mitulgajera/Desktop/Dev/btcscam/data/drafts/celsius-collapse.json; JSON validates, summary unchanged at 396/400 chars. Deviations/judgment calls the reviewer must know: (1) claims[3]: no press source reporting ~$3.2B exists — coverage arithmetic is $2.53B + $127M + $220.6M ≈ $2.9B at 64.9% recovery (crypto.news, Aug 20 2025, fetched live this session), so the claim was corrected to the sourced ~$2.9B/64.9% figures instead of citing a source that contradicts $3.2B; status kept reported-unconfirmed, Stretto URL retained for the tranche, crypto.news added to top-level sources[] (type news, 2025-08-20). (2) Hotline replaced with +1 (855) 423-1530 US / +1 (949) 669-5873 intl, re-verified against the live Stretto contact page during this edit. (3) The 2022-04/05 timeline entry was split into two same-dated entries because the timeline schema allows only one source string per entry — the FTC-sourced facts keep the FTC URL, the SDNY $8M withdrawal now carries the SDNY charging-release URL. (4) relatedGuides: confirmation failed — 'not-your-keys' appears on neither the 12-guide roadmap nor anywhere in the repo, so the dangling slug was removed (empty array); re-add when a matching guide ships. impact.lossNative was omitted (fix permitted shorten-or-omit; no single native denomination exists for the mixed frozen assets and the distribution narrative already lives in the timeline). unverified_flags left untouched for human review; archive captures of all 9 source URLs (including the new crypto.news one) remain a publish-time task per playbook section 4.

**Check before approving:**
- [ ] 12-year sentence is now CONFIRMED from the live SDNY release 25-109 (fetched this run: 12 years + 3 years supervised release + $50,000 fine + $48,393,446 forfeiture, May 8 2025) — the playbook's UNVERIFIED marker for row 11 can be cleared, but reviewer should note the confirmation in the review log.
- [ ] Goldstein's FTC resolution is described in the July 20 2026 release as a 'proposed order' filed in SDNY district court (Mashinsky/Leon orders approved 3-0 and 2-0); confirm whether the district judge has since signed all three before stating 'ordered to pay' as final.
- [ ] claims[3] ~$3.2B cumulative distributions figure remains reported-unconfirmed — Stretto confirms only the $220.6M third tranche; confirm from a citable outlet or the Plan Administrator's status reports before any promotion.
- [ ] relatedIncidents id '2023-crypto-recovery-service-scams' matches the recovery-scams draft's id, but that draft must be approved/published first or the link will dangle.
- [ ] Playbook requires a Wayback/archive capture of every cited URL at draft time — no archive links are recorded in the draft; capture all 8 source URLs (justice.gov pages are Akamai-gated to bots, so captures matter) before publish.
- [ ] Corrected hotline number (855.423.1530 US / 949.669.5873 intl) was taken from the live Stretto non-distribution contact page on 2026-08-11; reviewer should re-verify it when applying the blocker fix.

---

## 12. July 2020 Twitter giveaway hack: 'send BTC, get double back' from 130 hijacked verified accounts

**File:** `data/drafts/twitter-2020-giveaway-hack.json` · trustState `resolved` · S4 · categories: theft, impersonation, social-engineering

**Verifier's one-liner:** Twitter 2020 giveaway-hack dossier is schema-clean and factually solid — every load-bearing number, date, name, and quote verified against DOJ, NYDFS, Twitter, and IRS-CI primaries — but needs rework because its central NYDFS citation URL is dead (report relocated), the ~$22k loss figure is framed as additive when NYDFS presents it as the only reported client losses, and Graham Ivan Clark is named on news sourcing only.

**Fix pass:** 6 applied, 2 skipped. Notes: Applied: (1) BLOCKER — replaced all 11 dead dfs.ny.gov/Twitter_Report refs with https://www.dfs.ny.gov/system/files/documents/2026/07/Twitter-Investigation-Report.pdf; fetched it first and confirmed live + genuine (October 2020 NYDFS report; $118k figure, IT-dept vishing quote, no-malware/exploits/backdoors, critical-infrastructure recommendation all present). Triggered Wayback Save Page Now on the PDF; capture initiated but completion unconfirmed (archive.org 429'd the availability check) — reviewer should confirm the snapshot exists. (2) lossNative reworded to subset-neutral $22k phrasing (Coinbase/Gemini/Square, 'only reported Cryptocurrency Company client losses per NYDFS'). (3) affected[2] split: four companies attempted transfers; $22k completed losses reported by three. (4) Dropped 'for a fake paid group' from @AngeloBTC entry (now 'soliciting payments', which the report supports). (5) Summary now '400+ transfers; NYDFS put total theft at over $118,000'; that pushed it to 417 chars, so trimmed elsewhere ('Charges began in July 2020', dropped 'daily') → 397/400. (6) CISO timeline entry: schema allows only ONE uri in timeline source, so 'alongside' was impossible — the PDF (which contains the Dec-2019 detail) REPLACED the press-release URL on that entry; the press release remains in sources[] and claims[4]. Skipped (both marked reviewer's-call): (A) Clark naming — suggested_fix says 'Owner decision required'; I attempted the official-record route but sao13th.com redirects to hillsboroughsao.gov which 403s automated fetch and no SA release surfaced in search, so the hedged reported-unconfirmed text stands for owner decision. (B) relatedIncidents publish-ordering + '(ET)' — explicit reviewer discretion; verified crypto-recovery-service-scams.json exists as a wave-1 draft so the slug resolves if both publish; '(ET)' kept. JSON validated with node JSON.parse after all edits.

**Check before approving:**
- [ ] Whether https://www.dfs.ny.gov/Twitter_Report resolves in a real browser (bot-blocked/404 to automated tools; search engines still index it) — regardless, the relocated PDF at dfs.ny.gov/system/files/documents/2026/07/Twitter-Investigation-Report.pdf is the safe citation and its content was fully verified
- [ ] Exact wording of the Binance ('partnered with CryptoForHealth ... give back 5000 BTC') and @AngeloBTC scam tweets — both are screenshots/images inside the NYDFS PDF (pages 6-7 and the visual timeline); the visual timeline caption reads '5000 Bitcoin' while the tweet image reads '5000 BTC'; reviewer should eyeball the images before publish
- [ ] Graham Ivan Clark's plea and sentence details (30 state felonies, 3 years juvenile facility as 'youthful offender' plus 3 years probation) — currently news-sourced and correctly parked as reported-unconfirmed; confirm against an official Florida record (Hillsborough SA release or court docket) or de-name
- [ ] Federal case outcomes for Mason Sheppard and Nima Fazeli — the draft explicitly leaves them unverified (Fazeli's later plea/sentence and Sheppard's disposition are not covered); reviewer may want to add outcomes from DOJ/docket before publish or confirm the draft's silence is acceptable
- [ ] Archive captures of every cited URL at draft time (playbook section 4 requirement) — not evidenced in the draft file; several live URLs (justice.gov, blog.twitter.com) are bot-blocked or redirect to blog.x.com, so archived copies matter here
