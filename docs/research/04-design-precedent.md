# 04 — Design Precedent: Security/Privacy/Compliance Products with Documented Design Work

**Program:** Phase-Community research (see `00-program.md`) · **Agent:** 4 PRECEDENT · **Date:** 2026-08-11
**Confidence note:** three cases rest on full-text primary reads (1Password refresh, Proton, HIBP); five on verified search excerpts of the named primary sources (flagged inline). No case is reconstructed from memory; three candidates were pruned for lack of documentation rather than padded.

## Method

Candidate pool of 10 was verified against one rule: a case survives only if an actual writeup exists (first-party design post, agency credit, or contemporaneous documented coverage) — not folklore. For each surviving case, "designer claims it worked" is distinguished from "measured outcome exists."

**Pruned:**
- **Stripe** — no documented Radar/fraud-surface design writeup found beyond "trust through craft" folklore. Dropped rather than padded.
- **Norton/LifeLock / Malwarebytes rebrands** — no documented critique verified in this run; dropped. The mandatory cautionary slot is filled by 1Password 8 (better documented anyway).
- **Chrome padlock removal** — promising trust-indicator cautionary, but the primary Chromium research post wasn't verified this run; demoted to Open Questions.

**Kept (8):** 1Password brand refresh (2023), 1Password 8 Electron move (2021, cautionary), Proton rebrand (2022), Mullvad (ongoing, self-documented), Have I Been Pwned rebrand (2025), GOV.UK Design System form patterns (2015–), Cloudflare Radar 2.0 (2022), Signal usernames (2024).

---

## Case 1 — 1Password brand refresh (2023): security without scare tactics

**(a) Design decisions.** Post dated April 20, 2023, in-house Creative + Product Design team (color led by Art Director Lawren Ussery). Concrete moves: separated the company logo from the product icon (the icon users click daily was deliberately untouched); bespoke typeface "Agile Sans" described as "friendly and trustworthy"; desaturated primary blue ("more tactile and almost denim-like") plus a beige ("Biscuit"); illustration system scaled from spot icons to narrative scenes; photography shifted to fly-on-the-wall real people. Stated strategy, quoted: "We wanted to double down on our desire to cultivate a different conversation about security. One that's not steeped in scare tactics but focuses on capabilities and possibilities instead."

**(b) Evidence it worked.** None published. The post is forward-looking; no metrics, no before/after. The claim is the design team's.

**(c) What it traded away.** Urgency. A security brand that refuses fear gives up fear's conversion power (the consumer-AV industry runs on it), and a desaturated warm palette gives up the high-contrast alarm register. It also splits brand equity across two marks.

**(d) Transferable to BTCSCAM.** The severity-vs-verification chip system should carry 1Password's split: severity in calm, ink-weight editorial register, never AV-style red-alert theater. And note what they did NOT touch: the daily-trusted product icon. BTCSCAM's strikethrough masthead is that icon — brand work around it, never through it.

---

## Case 2 (CAUTIONARY) — 1Password 8 goes Electron (2021): consistency for the operator, regression for the user

**(a) Design decisions.** August 2021: 1Password 8 for Mac shipped in beta on Electron, replacing the native Mac app, to unify one codebase across platforms. Company defense (documented in community threads): heavy lifting stays in native Rust, Electron only renders UI.

**(b) Evidence of the damage.** Documented contemporaneously and in the company's own forums: users lobbied 1Password to abandon the Electron version (AppleInsider, Aug 16, 2021); Six Colors ran "Not important enough: 1Password abandons its native Mac app"; community threads titled "1Password 8 — Non-native feel" itemized concrete regressions — no rubber-band scrolling, missing animations in list expansion, menus, checkbox toggling, modal transitions — plus memory usage. The rare case where the cost is better documented than any benefit: the outcome data IS the backlash. Honest limit: no published churn numbers; 1Password kept growing commercially, so "hurt trust" is documented sentiment among the power-user base, not a measured revenue hit.

**(c) What it traded away.** Native feel and the most vocal users' goodwill, for cross-platform engineering velocity — and the trust damage concentrated precisely in the security-conscious segment whose endorsements built the brand.

**(d) Transferable to BTCSCAM.** For /desk: editorial-console users build muscle memory; never regress the feel of the trusted daily tool for internal convenience. For the whole portal: in a trust product, the users who notice texture regressions first are the contributors whose verify-votes and dossiers give the site its authority. Their sentiment is the product.

---

## Case 3 — Proton rebrand (2022): family resemblance as a trust argument

**(a) Design decisions.** "A new visual universe to portray Proton's better internet," May 25, 2022, by Thibaud Eberwein, Head of Proton Creative Studio (in-house). Concrete: unified product icons at consistent size/weight, each retaining a historical element (VPN keeps the Secure Core triangle; Mail's icon derives from the original padlock's bottom half); new "P" logo referencing encryption keys; naming standardized to two-word "Proton Mail / Proton VPN"; new saturated purple with per-product accents; ABC Arizona typeface — quoted rationale: "we felt our font should have a more human touch... a font with empathy and warmth that reflects how Proton is different." Trigger was community feedback that the apps "lacked a family resemblance."

**(b) Evidence it worked.** None published — no metrics in the post. Claim is the studio's; the community-feedback trigger is at least a documented user input.

**(c) What it traded away.** The austere, tool-like seriousness part of the privacy audience reads as credibility. "Empathy and warmth" bets that mainstream trust matters more than cryptographer-aesthetic trust. Per-product colors on shared purple also blur product recognition during transition.

**(d) Transferable to BTCSCAM.** The community surfaces (/report, /reports/open, dossiers, contributor profiles, /desk) need Proton's move exactly: one chip grammar, one type system, one severity color logic everywhere, with per-surface accents — and each surface retaining a recognizable core-identity element (the paper, the ink, the strikethrough). Family resemblance is itself the trust argument: a report form that looks like the dossiers it feeds reads as one institution.

---

## Case 4 — Mullvad: data you never collect is data the design never has to protect

**(a) Design decisions.** Self-documented across Mullvad's blog and policy pages: signup collects no username, no password, no email — the product generates a random 16-digit numbered account, and that number is the entire customer relationship; account numbers were deliberately lengthened for safety ("Mullvad's account numbers get longer — and safer"); cash payments by post are supported and defended in writing ("Cash is Still King"); a published no-logging policy. The design principle is structural: anonymity as architecture, not marketing copy — the interface cannot leak what the system never asked for.

**(b) Evidence it worked.** No conversion or trust metrics published — Mullvad does not run the analytics that would produce them, which is the point. The evidence is positional: the numbered-account design is the single most-cited fact in a decade of third-party reviews. Honest framing: reputation evidence, not measured outcome. *(Search-excerpt confidence.)*

**(c) What it traded away.** Everything growth marketing runs on: no email → no lifecycle campaigns, no recovery flow, no retention funnel, no research panel. Also convenience — users must safeguard an unmemorable number. Anti-marketing in the literal sense: reach forfeited for verifiable minimalism.

**(d) Transferable to BTCSCAM.** Contributor profiles and /report should be Mullvad-shaped at intake: a scam report must be submittable with zero reporter PII, and pseudonymous contributor identity should be generated, not registered. A scam-reporting portal's users include victims and insiders with real exposure; "we never asked" is a stronger promise than "we protect what you gave us" — and it should be visible in the form itself (fields that don't exist are the trust signal).

---

## Case 5 — Have I Been Pwned: the verdict machine, and how to rebrand one without breaking it

**(a) Design decisions.** Two documented layers. Original (2013, self-built): dead simple by explicit principle — one search box, verdict returned on the same page with zero navigation, no signup to check; the first logo was literally the SQL-injection string with "have i been pwned?" beside it. Rebrand ("Soft-Launching and Open Sourcing the Have I Been Pwned Rebrand," March 11, 2025, design by Luft Design, Norway): kept the `';--` SQL-injection motif as the core icon on purpose — Hunt: "when you're a decade+ into a name and a brand, there's history that I think you need to" carry forward; built a variant system (icon alone, "Pwned" short wordmark, full wordmark); site rebuilt on Bootstrap 5 + vanilla JS; the whole rebrand was soft-launched and open-sourced for community feedback before being finalized.

**(b) Evidence it worked.** For the original simplicity: a decade of scale (documented in "A Decade of Have I Been Pwned") is consistent with, but does not prove, the design claim — the "simplicity drove adoption" causal claim is Hunt's. For the rebrand: the post explicitly contains no outcome data.

**(c) What it traded away.** The instant same-page verdict trades nuance for speed: a binary "pwned" without context can alarm; email-only lookup can't represent breaches keyed on other identifiers. Keeping `';--` trades mainstream legibility for insider continuity. Amateur-built UI for a decade traded polish for shipping — Hunt documents rejecting his own redesign attempts.

**(d) Transferable to BTCSCAM.** The single highest-value transfer in this report: the dossier lookup and /reports/open must return the verdict on the same surface with zero navigation — paste an address/domain, get the trust-state chip and severity immediately, no account, no interstitial. And when BTCSCAM's identity evolves, do it the HIBP way: keep the scar tissue (strikethrough masthead = their `';--`), soft-launch, let the community see the change before it hardens.

---

## Case 6 — GOV.UK Design System: one thing per page, and forms as tested infrastructure

**(a) Design decisions.** The most research-documented form practice in the field. "One thing per page" (GDS Design Notes, July 3, 2015; expanded in Adam Silver's Smashing Magazine case study, May 2017): each question page asks one thing — reduces cognitive load, works on mobile, and makes error handling, branching, loops, and save-and-resume tractable. Lab-tested on Register to Vote and Verify. The wider system: question protocol (justify every field before it exists), tested error-message patterns, "check your answers" confirmation pages — all published with research provenance. *(Search-excerpt confidence.)*

**(b) Evidence it worked.** The strongest evidence base in this set, still mostly qualitative: GDS documents lab research on named services; low-confidence users find one-thing-per-page easier. Also documented is the boundary condition — the MoJ Forms post (March 21, 2022) records that professional, repeat users need to go beyond the pattern because one-per-page fatigues them. A pattern whose own publisher documents where it fails is the attribution gold standard here.

**(c) What it traded away.** Speed for expert users (more clicks, documented by MoJ); brand delight (deliberately austere); screen-level information density.

**(d) Transferable to BTCSCAM.** /report is a GOV.UK problem wearing a newspaper skin: reporters are stressed, low-confidence, on phones, mid-scam or post-loss. One evidence chip per step — what happened, the address, the platform, the proof — with branching per scam type and save-and-resume; a "check your report" page before submit. The MoJ caveat maps to /desk: editors are the professional users — give them the dense multi-field view the public form must not have.

---

## Case 7 — Cloudflare Radar 2.0: public data as standing proof, findability as the redesign driver

**(a) Design decisions.** Radar launched as a free public window onto Cloudflare's network data; Radar 2.0 (Birthday Week 2022, documented in Cloudflare's launch and "How we built it" posts) was a full revamp driven by documented user feedback — chiefly that "the way information was structured made finding information daunting." Concrete 2.0 decisions: navigation restructured around questions/insights rather than raw data inventory; cleaner chart system; three sharing primitives — social share, embeddable charts, and a public API — turning every chart into a citable artifact. *(Search-excerpt confidence.)*

**(b) Evidence it worked.** No engagement metrics published. What IS documented is the input side: the redesign was a response to named user feedback — the company documented its own v1 design failure as the motivation.

**(c) What it traded away.** Free public data is a permanent accuracy liability (every embedded chart is a reputation hostage) and pure cost with no direct monetization; question-led navigation trades away the exhaustive-inventory view power analysts want.

**(d) Transferable to BTCSCAM.** /reports/open is BTCSCAM's Radar: the open ledger is trust marketing, not just a database. Ship its sharing primitives early — permalink per ledger row, embeddable dossier/chip cards, eventually an API — so journalists and exchanges cite BTCSCAM surfaces directly. And learn from v1's documented failure preemptively: organize the ledger by the visitor's question ("has this address been reported?" "what's active this week?") rather than by chronology alone.

---

## Case 8 — Signal usernames (2024): identity designed to be forgettable

**(a) Design decisions.** "Keep your phone number private with Signal usernames" (signal.org, February 2024, with a support deep-dive). Concrete: usernames are optional, deliberately impermanent, designed to be changed and discarded ("make a username to connect with people at a conference... then change it when it's over"); a username is not the display name and is not visible in chats; phone numbers no longer shown to chat partners by default; hard discoverability control — "Who can find me by my phone number: Nobody." Ephemerality and non-display are the design; identity exposure is opt-in per relationship. *(Search-excerpt confidence.)*

**(b) Evidence it worked.** No adoption or safety metrics published — consistent with Signal's no-analytics constraint (it structurally cannot publish engagement funnels). Design rationale is first-party and detailed; outcomes undocumented by design. Documented residual criticism: a phone number is still required at signup.

**(c) What it traded away.** Discoverability and growth mechanics — locked-down users are unfindable, usernames unmemorable by intent, support burden rises. Signal accepts a worse social graph for a smaller exposure surface.

**(d) Transferable to BTCSCAM.** Contributor profiles should be Signal-shaped: display handle decoupled from any real identifier, verify-votes never exposing contact info, and reporter identity per-dossier rather than global (a contributor who reported one scam ring should not be linkable across all their reports by default). The status ladder must run on accumulated pseudonymous reputation, not identity disclosure.

---

## 10 TRANSFERABLE DECISIONS

1. **/report — one evidence chip per page.** Stressed, low-confidence, mobile reporters; branching by scam type; save-and-resume; "check your report" before submit. (GOV.UK)
2. **Dossier lookup + /reports/open — verdict on the same surface, zero navigation.** Paste address → trust-state chip + severity immediately, no account, no interstitial. (HIBP)
3. **/report — fields that don't exist are the trust signal.** Zero reporter PII required to submit; the form's visible minimalism is the privacy promise. (Mullvad, GOV.UK question protocol)
4. **Contributor profiles — generated pseudonyms, not registered identities.** Issue a contributor number/handle; reputation accrues to it; no email required for the base ladder tier. (Mullvad)
5. **Contributor profiles — identity exposure is opt-in and per-context.** Verify-votes never reveal contact info; reports not cross-linkable by default. (Signal usernames)
6. **All surfaces — one chip grammar, per-surface accent.** Report form, ledger, dossiers, and desk visibly one institution; each surface keeps a core identity element (paper, ink, strikethrough). (Proton)
7. **Severity chips — alarm content, calm register.** Severity in editorial ink-weight, never AV-style fear theater; the newspaper voice is the differentiator. (1Password refresh)
8. **/reports/open — every row a citable artifact.** Permalinks, embeddable chip cards, API later; the open ledger is the marketing. (Cloudflare Radar)
9. **/reports/open — organize by the visitor's question, not by chronology.** "Is this address reported?" / "What's active now?" as primary entry points; Radar documented that inventory-first structure failed. (Radar 2.0)
10. **/desk — never regress the feel of the trusted daily tool; and give pros the dense view.** Editors get multi-field density the public form must not have; their console's texture is never sacrificed for shared-component convenience. (1Password 8 cautionary + MoJ/GOV.UK boundary condition)

---

## So what for BTCSCAM

The pattern across all eight cases is that trust products win by **structural honesty, not asserted honesty**. The decisions that built these reputations are all verifiable inside the interface itself: Mullvad's signup literally has no email field; HIBP's verdict arrives before you could doubt it; Radar's data is embeddable by strangers; Signal's username is visibly changeable. None of these say "trust us" — they arrange the interface so the promise can be checked. For BTCSCAM this means the community surfaces should make their guarantees inspectable: the report form's absent PII fields, the ledger's permalinked rows, the trust-state chip's visible verification trail. A newspaper-of-record identity earns this naturally — newspapers cite sources; BTCSCAM's chips should behave like citations.

Second pattern: **the field has almost no measured outcomes.** Of eight cases, only GOV.UK publishes real research provenance, and even there the evidence is qualitative lab findings plus a documented boundary condition. Every rebrand post (1Password, Proton, HIBP, Radar) contains zero metrics. Practical implication: BTCSCAM should not treat any borrowed pattern as proven — it should treat /reports/open as its own instrumentation surface. Report completion rate, verify-vote participation, and time-to-verification are measurable without surveilling users, and publishing them would make BTCSCAM one of the only trust products with public outcome data — itself a trust move none of these precedents made.

Third: **the warmth-versus-fear calibration is genuinely unresolved**, and BTCSCAM sits in a different spot than any precedent. 1Password and Proton fled fear because they sell protection to comfortable people. BTCSCAM documents active harm to people who may be mid-loss; pure warmth would be dishonest, pure alarm would be AV-slop. The newspaper register is the answer the precedents didn't have available: severity as sober front-page fact. The chip system should read like a broadsheet's typography of importance — sizes and weights, not sirens.

Finally, the cautionary case says **trust is asymmetric in texture**. 1Password lost more standing in one felt regression (scrolling, animations, memory) than its later brand refresh visibly earned back, and the loss concentrated in exactly the vocal expert users a community product depends on. BTCSCAM's contributors — the verify-voters, the ladder climbers, the desk editors — are its Six Colors readers. Every future redesign should be HIBP-shaped: keep the scar tissue, soft-launch, let the community watch the change happen.

## Open questions

1. **Trust chips as misreadable badges.** Chrome's padlock removal reportedly followed research that users misread the indicator as a general trust seal (phishing sites have HTTPS too). Unverified this run — but if true, it's the sharpest open risk for BTCSCAM's trust-state chips: does a "verified" chip on a dossier get misread as "this entity is safe"? Needs the primary Chromium research fetched, and eventually first-party comprehension testing.
2. **Does one-thing-per-page survive evidence upload?** GOV.UK's pattern is tested on questions, not on multi-file evidence chips. Where chips cluster naturally, the MoJ "beyond the pattern" precedent may apply to the public form too.
3. **Does pseudonymity depress verify-vote credibility?** Mullvad/Signal-grade anonymity protects reporters, but a public ledger needs votes outsiders find credible. The contributor ladder is the proposed bridge (reputation without identity) — no precedent here tested that combination.
4. **The unfound cautionary rebrands.** Norton/LifeLock and Malwarebytes remain unverified; a documented consumer-security rebrand critique would strengthen the cautionary file beyond the 1Password 8 platform case.

## Sources (accessed 2026-08-11)

**Read in full:**
- 1Password, "Through the keyhole: A look at our refreshed brand" (Apr 20, 2023) — https://1password.com/blog/1password-brand-refresh
- Proton, "A new visual universe to portray Proton's better internet" (May 25, 2022) — https://proton.me/blog/new-visual-universe
- Troy Hunt, "Soft-Launching and Open Sourcing the Have I Been Pwned Rebrand" (Mar 11, 2025) — https://www.troyhunt.com/soft-launching-and-open-sourcing-the-have-i-been-pwned-rebrand/

**Verified via search excerpts of the named primary/contemporaneous sources:**
- AppleInsider, "Users lobby 1Password to abandon new Electron version" (Aug 16, 2021) — https://appleinsider.com/articles/21/08/16/users-lobby-1password-to-abandon-new-electron-version
- Six Colors, "Not important enough: 1Password abandons its native Mac app" (Aug 2021) — https://sixcolors.com/post/2021/08/not-important-enough-1password-abandons-its-native-mac-app/
- 1Password Community, "1Password 8 — Non-native feel" — https://1password.community/discussion/122854/1password-8-non-native-feel
- Podfeet, "The Day the Internet Lost Its Mind about 1Password Becoming an Electron App" (Aug 2021) — https://www.podfeet.com/blog/2021/08/1password-electron/
- Mullvad, "Cash is Still King" — https://mullvad.net/en/blog/cash-still-king
- Mullvad, "Mullvad's account numbers get longer — and safer" — https://mullvad.net/en/blog/mullvads-account-numbers-get-longer-and-safer
- Mullvad, "No-logging of user activity policy" — https://mullvad.net/en/help/no-logging-data-policy
- Troy Hunt, "A Decade of Have I Been Pwned" — https://www.troyhunt.com/a-decade-of-have-i-been-pwned/
- HIBP, "Who, What & Why" — https://haveibeenpwned.com/About
- GDS Design Notes, "One thing per page" (Jul 3, 2015) — https://designnotes.blog.gov.uk/2015/07/03/one-thing-per-page/
- Adam Silver, "Better Form Design: One Thing Per Page (Case Study)," Smashing Magazine (May 2017) — https://www.smashingmagazine.com/2017/05/better-form-design-one-thing-per-page/
- GDS, "Going beyond the GOV.UK Design System for MoJ Forms professional users" (Mar 21, 2022) — https://designnotes.blog.gov.uk/2022/03/21/going-beyond-the-gov-uk-design-system-for-moj-forms-professional-users/
- Cloudflare, "Cloudflare Radar 2.0" launch post — https://blog.cloudflare.com/radar2
- Cloudflare, "How we built it: the technology behind Cloudflare Radar 2.0" (Nov 2022) — https://blog.cloudflare.com/technology-behind-radar2
- Signal, "Keep your phone number private with Signal usernames" (Feb 2024) — https://signal.org/blog/phone-number-privacy-usernames/
- Signal Support, "Phone Number Privacy and Usernames" — https://support.signal.org/hc/en-us/articles/6712070553754-Phone-Number-Privacy-and-Usernames
