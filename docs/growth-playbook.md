# BTCSCAM Growth Playbook — community & distribution loops

Companion to `PRD.md` §3–4. Principle: **every loop starts from a moment of fear or near-miss and ends with the user safer + the corpus richer.** We don't "do marketing"; we operationalize warnings.

## The core loop (product loop, not marketing)

```
Someone almost gets scammed
   → checks BTCSCAM (search / bookmark / friend's link)     [Answered Check]
   → outcome page asks "seen this yourself? report it"      [Check → Report, target >2%]
   → report gets corroborated → dossier updated/created
   → dossier ranks for the scam's name → next victim finds it
   → loop compounds
```
Everything below exists to feed this loop.

## Channel plays (in order of expected ROI)

### 1. SEO on scam-name long-tail (the compounding asset)
- Every incident dossier is a landing page for `"<scam/entity name> scam"`, `"is <X> legit"`, `"<device> fake"` queries. These are low-competition, high-intent, and *nobody* serves them with dated, sourced answers.
- Mechanics: permalink `/scam/<slug>`; title pattern `"<Name>: what happened and what's verified — BTCSCAM"`; FAQ block per dossier (matches "People also ask"); JSON-LD `NewsArticle` + `ClaimReview` where applicable; changelog on page (freshness signal).
- Backfill 20 evergreen dossiers (classic scams people still google) in R1–R2 to build topical authority before fresh incidents need it.

### 2. Be first-and-cited on incident days (the spike engine)
- When an incident breaks (like the Coldcard one): publish the dossier fast at "Reported/Corroborated," then update the SAME permalink as facts land. One canonical URL that journalists, Reddit mods, and X accounts can cite.
- Distribution ritual per incident: post in the venue where victims are discussing it (r/Bitcoin, r/BitcoinBeginners, vendor's thread, X reply chains) as *helpful summary + link*, never drive-by promo. Target: our dossier becomes the mod-pinned link.
- Ship an **RSS/JSON feed + embeddable alert widget** early so newsletters and podcasts quote us as a source. Being cited IS the growth.

### 3. The Rug Report (newsletter — own the relationship)
- Weekly: 1 incident deep-dive, "Dangerous right now" list, 1 protection tip. Written in house voice: plain, dated, sourced, zero hype.
- Capture: article-end band (already designed in v3), check-verdict pages, dossier sidebars.
- This converts SEO/incident spikes into a recurring audience we don't rent from Google.

### 4. Watchmen program (community as throughput)
- Ladder (matches designed My Desk tiers): Reader → Reporter (1 accepted report) → Corroborator (evidence chips on others' reports) → **Watchman** (trusted verifier, named on dossiers) → Mod.
- Rewards are *status and credit*, not tokens/money (money attracts farmers; status attracts the paranoid-careful people we want). Named credit line on every dossier: "Corroborated by …".
- Rituals: **Monday Sweep** (public review of the week's reports — mirrors Mitul's board ritual), monthly "correction honor roll" (we celebrate people who proved us wrong — trust theater that's actually real).
- Start in public (comments/GitHub/Discord-lite) only in R3 — community before tooling dies; tooling before community is empty rooms.

### 5. Education as evergreen funnel
- Guides target durable queries ("how to generate seed phrase with dice", "how to verify coldcard genuine"). Each guide cross-links incidents that prove *why* the advice matters — fear → practice conversion. Each incident links guides — news → education conversion.
- Format bet: every guide has a printable one-pager (KeepCrypt SeedBook DNA — physical artifacts travel in Bitcoin circles).

## What we don't do
- No paid ads (unit economics can't work; audience distrusts ads by definition).
- No engagement-bait threads, no fear-porn headlines beyond severity truth (brand suicide).
- No token, no points-that-become-token. Ever.
- No growth hire / agency — loops above are founder-operable at ~1 day/week + pipeline.

## Weekly operating cadence (founder-scale)
| Day | Ritual |
|---|---|
| Mon | Sweep: triage reports, update trust states, board review |
| Tue–Wed | 1 dossier (new or backfill) + distribution posts |
| Thu | Rug Report issue |
| Fri | 1 guide section or product increment; corrections pass |

## Leading indicators to watch weekly
1. Answered Checks (north star) and its mix (search vs direct vs referral)
2. Check→Report conversion
3. Citations (backlinks/mentions of dossier URLs)
4. Newsletter growth + open rate
5. Time-to-dossier on fresh incidents
