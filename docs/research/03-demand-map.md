# 03 — Demand Map: Where Scam Victims Actually Go

**Program:** Phase-Community research (see `00-program.md`) · **Agent:** 3 DEMAND · **Date:** 2026-08-11

## Method note

**What worked:** (1) **Hacker News** via the official Algolia API (`hn.algolia.com/api/v1`) — full comment trees fetched, quotes copied from API text verbatim. (2) **Bitcointalk** Scam Accusations board (board 83) fetched directly as HTML on 2026-08-11; six full topics parsed with per-message permalinks. (3) **Reddit** via the **Arctic Shift** archive API (`arctic-shift.photon-reddit.com`, the actively-maintained Pushshift successor) — returns verbatim post/comment JSON with authors, timestamps, and IDs from which canonical reddit.com permalinks are constructed. All Reddit quotes below are exact text from that archive.

**What was inaccessible (honest gaps):** reddit.com itself (403 to curl, WebFetch, and the search crawler — Reddit blocks Anthropic's user agent entirely); all six public redlib/libreddit mirrors (Anubis/Cloudflare walls); pullpush.io (502, down); **X/Twitter** (HTTP 402 — no X evidence in this report, flagged as a gap); Trustpilot (403 — could not verify Chainabuse/ScamAdviser Trustpilot reviews first-hand, so none are quoted); scamadviser.com itself (403). **Archiving:** both `archive.org/wayback/available` and `archive.ph/newest` returned HTTP 429 for the entire session (my earlier CDX bulk queries tripped a rate limit). **No archive URLs were captured; the `archive_url` CSV column is empty.** Recommend a re-run of an archive pass from a different network before publication.

**Method caveats:** Arctic Shift's `num_comments`/`score` are snapshot-time values (lower bounds). Its comment-body search timed out server-side for large subreddits, so comment evidence came from per-thread pulls (`link_id`, indexed and reliable) instead of corpus-wide comment search. Selftexts shown as `[removed]` mean mods removed the body before archive capture — titles remain quotable. All frequency numbers are estimates with the method stated inline. No sentiment percentages anywhere, per contract.

---

## Theme 1 — The "is this a scam?" firehose: huge checking volume, terrible answer rates

People's first move when suspicious is to ask strangers on Reddit, one thread at a time. The volume is enormous and the answer pipeline leaks everywhere: majority of asks get zero replies, r/Scams mods remove posts that omit the URL (destroying the conversation), and the diagnostic heuristic people actually use — "I googled it and found nothing" — fails exactly when the scam is freshest. **Frequency: 100 posts titled "is this a scam" in r/Scams in just Jun 23–30, 2026 (8 days, limit-capped sample → ≥~400/month) via Arctic Shift query `subreddit=Scams&title="is this a scam"`; 57/100 had zero comments and 68/100 had bodies removed at capture. Parallel r/CryptoCurrency sample: 45/60 "is this a scam" posts had zero comments.**

> "I've never heard of this site before and seems likely to be something fishy about it because I can't search any further info on it. I've registered with my ID but haven't invested on anything yet." — https://www.reddit.com/r/Scams/comments/1ujsmi4/ — 2026-06-30, Reddit r/Scams

> "I downloaded an app from the store, this investing app called Quick Earn about 3 weeks ago after seeing ads everywhere on both social media platforms. It looked totally normal with good reviews. […] After 2.5 months I invested 280,450 USD. Everything was smooth. Then I tried to pull out more and it said pending review. Support went quiet. Today the whole site is down." — https://www.reddit.com/r/BitcoinBeginners/comments/1t46o5f/ — 2026-05-05, Reddit r/BitcoinBeginners

> "Hi there, I have no recollection of buying Bitcoin, but in the phone they knew my name and had me log in to summ.com, which seems to be a legit site." — https://www.reddit.com/r/BitcoinBeginners/comments/1r33383/ — 2026-02-12, Reddit r/BitcoinBeginners

> "Inside my Trezor, there's just Changelly, listed as partner to use. But I'm not sure if I should do it. The sum is significant for me. […] Idk if I should push the button." — https://www.reddit.com/r/BitcoinBeginners/comments/1udpmpt/ — 2026-06-23, Reddit r/BitcoinBeginners

> "Is this a legit website? My mom wanted to start an LLC but this site just keeps charging her credit card." — https://www.reddit.com/r/Scams/comments/1v36c41/ — 2026-07-22, Reddit r/Scams (title; body empty)

> "Removing post because you've never responded to our two requests to provide the URL/domain name (despite being active on Reddit in the days since then), which is a requirement in this sub. Too bad you chose not to help future potential victims :(" — https://www.reddit.com/r/Scams/comments/1ujsmi4/comment/ovk4tuq/ — 2026-07-04, Reddit r/Scams (moderator) — *note: the mods themselves treat the domain name as the searchable artifact for future victims; that is exactly a /check + dossier model run by hand.*

## Theme 2 — Search engines and ads are the attack surface, not the defense

Victims' instinct ("search it") is actively weaponized: paid Google ads for Trezor phishing hosted on sites.google.com, typosquats ranking #1–2 on DuckDuckGo and Bing, report-and-reappear whack-a-mole. **Frequency: 3 of the 6 Bitcointalk Scam Accusations threads I fetched from the Jul 28–Aug 10, 2026 board front page center on search/ads surfacing phishing (manual read of board 83, 2026-08-11).**

> "google is such a clown company, like how is it even possible for them not to be able to detected a phishing website with all their resources and AI shit. not only are they taking money for the ad, it's hosted on their own servers." — https://bitcointalk.org/index.php?topic=5590655.msg67020859#msg67020859 — August 07, 2026, Bitcointalk Scam Accusations

> "just this phishing ad alone looks to have been active for 2 days, and they have stolen 24BTC with it so far: https://mempool.space/address/bc1qrz33mr7tx8wrpcs2pxrvv83hqwpm907s9shkz4" — https://bitcointalk.org/index.php?topic=5590655.msg67020958#msg67020958 — August 07, 2026, Bitcointalk

> "It shows up on Bing too. Number 2 in the result search list. Crazy […] Unfortunately, newbies or beginners won't know the exact domain name at first" — https://bitcointalk.org/index.php?topic=5590522.msg67018392#msg67018392 — August 06, 2026, Bitcointalk (re: featherswallet(.)org typosquat)

> "It's been happening for years and they have never filter an ad unless they're reported. The best thing to do with the effort of the community is to report it manually" — https://bitcointalk.org/index.php?topic=5590655.msg67031491#msg67031491 — August 10, 2026, Bitcointalk

## Theme 3 — Government reporting feels like a black hole

The single loudest complaint pattern across venues: you file with IC3/FTC/police, you get a confirmation number, and then silence — forever. People keep filing anyway, on faith. **Frequency: in one r/CryptoScams thread (1e8vuzk), 8 of 12 first-person IC3/FBI outcome reports describe never hearing back (manual count of the thread's 30 comments).**

> "there is no indication that anything happened, other than a confirmation number being spit out on a web page that my report had been received. That's why I made the 'black hole' comment earlier." — https://news.ycombinator.com/item?id=47793430 — 2026-04-16, Hacker News

> "I'd still report to IC3/FBI/powers that be, too. Just in case someone somewhere has the resources to do something… perhaps a high hope" — https://news.ycombinator.com/item?id=48546976 — 2026-06-15, Hacker News

> "Has anyone ever filed a complaint with the FBI's online crime division and had any sort of success?" — https://www.reddit.com/r/CryptoScams/comments/1e8vuzk/ — 2024-07-21, Reddit r/CryptoScams

> "Yes I filed a report with the FBI and other federal agencies. I was interviewed by the FBI and showed them all my documents. They never promised me anything. It has been nine months and I haven't heard anything." — https://www.reddit.com/r/CryptoScams/comments/1e8vuzk/comment/leec6vv/ — 2024-07-22, Reddit r/CryptoScams

> "As per NPR's Morning Edition on July 7th, the FBI receives on average 2,400 scam reports. Per day." — https://www.reddit.com/r/CryptoScams/comments/1e8vuzk/comment/leh7oii/ — 2024-07-22, Reddit r/CryptoScams

> "I received a scam call ostensibly from a local utility and filed an identity theft report with local police naming the utility as 'victim'. The caller even told me where they (probably really) were. Police do nothing, scams continue until something breaks." — https://news.ycombinator.com/item?id=45266393 — 2025-09-16, Hacker News

## Theme 4 — Counter-evidence: wins exist, but they're invisible and require insider moves

When reporting works, it works through escalation paths nobody documents (call the field office, certified mail to legal departments, the Secret Service). The wins never feed back into public confidence. **Frequency: 2 first-person success stories vs 8 black-hole reports in the same r/CryptoScams thread (manual count).**

> "I submitted a complaint to the IC3 with lots of details and documentation and I got a phone call 3 days later and they were able to freeze the USDT coins." — https://www.reddit.com/r/CryptoScams/comments/1e8vuzk/comment/mswep20/ — 2025-05-18, Reddit r/CryptoScams

> "I filed the FBI's ic3 form. I was told that no one would be getting back to me unless information was needed! Well I guess I didn't like that! I called the local FBI office in San Francisco and told them that I wanted an appointment with an agent. They granted me one to my surprise." — https://www.reddit.com/r/CryptoScams/comments/1e8vuzk/comment/mq56vzk/ — 2025-05-02, Reddit r/CryptoScams

> "I have heard that those reports do get reviewed and often acted on, but yes, you will typically never hear back from them." — https://news.ycombinator.com/item?id=47793181 — 2026-04-16, Hacker News (compliance-engineering background)

## Theme 5 — Platform abuse reporting is futile at Big Tech scale

Reporting scam accounts/ads to Google, Microsoft, Amazon, YouTube is described as pointless by technically sophisticated users — the people most likely to become BTCSCAM reporters. **Frequency: ≥6 distinct commenters in one HN thread (47788424, Apr 2026) describe abandoning platform abuse reporting (manual read).**

> "I gave up on trying to report abuse to Google, Amazon or Microsoft. It seems reports simply get ignored and the big providers do nothing." — https://news.ycombinator.com/item?id=47790742 — 2026-04-16, Hacker News

> "Same scammer/person has created thousands of gmail accounts and Google doesn't care. I have reported this to Google. For the amount of info Google has on people, trivial for them to prevent some of this." — https://news.ycombinator.com/item?id=47793764 — 2026-04-16, Hacker News (marketplace operator)

> "On YouTube I reported bot accounts for a couple days, the only reaction I got was that at some point it showed a popup that told me too many false reports would lead to a ban." — https://news.ycombinator.com/item?id=47790940 — 2026-04-16, Hacker News

## Theme 6 — Existing checkers give dangerously wrong answers in both directions

ScamAdviser's automated trust score is the tool victims actually find first — and it green-lights fresh scam domains (false negatives that cost real money) while flagging legitimate small businesses (false positives). Community blocklists misfire too. **Frequency: ~17 posts titled "scamadviser" in r/Scams all-time (Arctic Shift `subreddit=Scams&title=scamadviser`); of the 10 most recent, at least 5 are complaints about or accusations against ScamAdviser itself.**

> "Scamadviser gave it a high trust rating, which gave me a false sense of security about trading on the Dex Network. I did as much vetting and research as I could" — https://www.reddit.com/r/CryptoScams/comments/1flfrwy/ — 2024-09-20, Reddit r/CryptoScams

> "1 of the 19 websites given a Trustscore of 91/100. (Green) 'The trust rating is high. Might be safe.' […] Please note that I have POSITIVELY identified each and every one of these websites as fraudulent." — https://www.reddit.com/r/CryptoScams/comments/1flfrwy/ — 2024-09-20, Reddit r/CryptoScams (same OP's audit of 19 scam domains)

> "I just used it and it showed my own website a possible scam, and I'm here to ya it's not a scam. I build violins and I sell em. Simple as that." — https://www.reddit.com/r/CryptoScams/comments/1flfrwy/comment/mbeyvmf/ — 2025-02-07, Reddit r/CryptoScams

> "[India]Is winxfortune.com legit? ScamAdviser shows 'Likely Safe' but multiple red flags" — https://www.reddit.com/r/CryptoScams/comments/1qhxw5l/ — 2026-01-20, Reddit r/CryptoScams (title; body removed)

> "red-lang.org is blocked! Phantom believes this website is malicious and unsafe to use. This site has been flagged as part of a community-maintained database of known phishing websites and scams." — https://news.ycombinator.com/item?id=44047312 — 2025-05-21, Hacker News (wallet blocklist false-positive on a 14-year-old programming language site)

> "The thing I worry about with this kind of thing is that without very careful UX integration, people take false negatives as proof that things are OK, rather than treating it as just one of many signals." — https://news.ycombinator.com/item?id=43304646 — 2025-03-08, Hacker News

## Theme 7 — Checker sites as scam vectors and broken reporting UX

Worse than wrong scores: ScamAdviser's review sections are colonized by recovery-scam bots, its report form silently fails, and multiple r/Scams posts accuse it of extortion-adjacent behavior toward small businesses. Skeptics distrust the whole category. **Frequency: same `title=scamadviser` query base; 3 of 17 post titles are direct "ScamAdviser is a scam" accusations (2026-01 to 2026-03).**

> "under a ton of websites i've looked for under scamadvisor have TONS of fake reviews that bypass the autofilter. […] It's a clear scummy scam that uses bots to spam unholy amounts of [insert name here] type of copy+paste reviews." — https://www.reddit.com/r/CryptoScams/comments/1flfrwy/comment/mskbqo5/ — 2025-05-16, Reddit r/CryptoScams

> "I was just looking at Scamadviser today for another reason, and it is FILLED with reviews promoting recovery scammers!" — https://www.reddit.com/r/CryptoScams/comments/1flfrwy/comment/mskee1v/ — 2025-05-16, Reddit r/CryptoScams

> "I filled out their form, which took me about 45 minutes to get all the information together, and when I clicked 'Finish' nothing happened. My report didn't go through. What's up with that?" — https://www.reddit.com/r/CryptoScams/comments/1flfrwy/comment/mroqxxk/ — 2025-05-11, Reddit r/CryptoScams

> "When I tried to report more than one site, they blocked me and accused me of being a scammer. Seriously?!?" — https://www.reddit.com/r/CryptoScams/comments/1flfrwy/comment/mrozn1s/ — 2025-05-11, Reddit r/CryptoScams

> "[US] ScamAdviser.com is a huge scam that is damaging the reputation of small businesses, appear to be extortion tactics." — https://www.reddit.com/r/Scams/comments/1rzyrvq/ — 2026-03-21, Reddit r/Scams (title; body removed)

> "Any private business (?) that collects information on scam sites _and victims_ is shady by default. […] it contributes to the illusion that you just need to avoid the blacklist to be safe. While new names are being registered hourly, and it's the schemes themselves you should avoid." — https://www.reddit.com/r/CryptoScams/comments/1kp0oaw/comment/msxo8if/ — 2025-05-18, Reddit r/CryptoScams

## Theme 8 — Chainabuse: the insider tool victims can't find, and clones parasitize its name

Insiders recommend Chainabuse because exchanges and LE consume its data — but victims discover it by accident, ask whether it's real, and a phishing clone (chainabuse.report, registered Apr 2025) rode ScamAdviser's fake reviews to intercept them. **Frequency: 7 chainabuse-titled posts in r/CryptoScams all-time, 28 selftext mentions since 2025-01, exactly 1 chainabuse-titled post in r/Scams all-time (Arctic Shift); ~2 substantive mentions in the entire history of HN comments (Algolia full-text) — near-zero organic footprint outside specialist subs.**

> "Why report it on chainabuse? Because this data gets shared with law enforcement and crucially, many of the main exchanges that folks use can also see this data. So if a bad actor tries to sell your stolen assets […] there is a chance (not a guarantee) that they could be frozen" — https://www.reddit.com/r/CryptoScams/comments/1ve8p8r/ — 2026-08-03, Reddit r/CryptoScams (PSA about the Coldcard exploit)

> "Under user review, some of them said they got their money back from the scammer after reporting their case to Chainabuse. Has anybody used Chainabuse to report the crypto scam? Is that real that you can get your crypto back ?" — https://www.reddit.com/r/CryptoScams/comments/1kp0oaw/ — 2025-05-17, Reddit r/CryptoScams

> "whoever might be saying a clear scam site 'returned my funds after reporting them' is clearly part of the scam. But likely you are looking at some copy of the official site" — https://www.reddit.com/r/CryptoScams/comments/1kp0oaw/comment/msuz5b1/ — 2025-05-17, Reddit r/CryptoScams

> "The .report domain doesn't even load, and the .com domain has their Twitter replies disabled." — https://www.reddit.com/r/CryptoScams/comments/1kp0oaw/comment/msu8e7f/ — 2025-05-17, Reddit r/CryptoScams

> "Report the wallet address on Chainabuse and CryptoScamDB so it gets flagged in scam databases used by exchanges and investigators" — https://www.reddit.com/r/CryptoScams/comments/1tyk6t6/ — 2026-06-06, Reddit r/CryptoScams ($91k USDC corporate victim)

> "I learned from reading from https://www.operationshamrock.org/blog/five-things-to-do to report to them and https://chainabuse.com/report?source=shamrock to report any scams. Tired to search on here and got nothing." — https://www.reddit.com/r/CryptoScams/comments/1pxgzv6/ — 2025-12-28, Reddit r/CryptoScams

## Theme 9 — The double-scam: recovery predators colonize every help surface

Every venue where victims gather — help threads, checker review sections, Bitcointalk — is actively farmed by "recovery" scammers. Defenders have built countermeasures into the furniture (r/CryptoScams runs an AutoModerator warning macro and a WHOIS bot on every thread). **Frequency: 1 live recovery-scam solicitation found inside a single 30-comment FBI-help thread; r/CryptoScams' AutoMod posts a recovery-scam warning on every new victim thread (observed on both threads pulled).**

> "some are active in trying to convince the scammed victims that they are part of a recovery team that can help them get their money back through legal action and will convince the victim to pay some money to help them process their request. Scamming those who have been scammed already, those scammers dont even have a single conscience in them at all." — https://bitcointalk.org/index.php?topic=5590727.msg67024299#msg67024299 — August 08, 2026, Bitcointalk Scam Accusations

> "gratefull of a person coder that saved my money invested in the scammed platform , i had succeded and returned my money back ! Hope he will can resolve your problem too, you can contact him on telegram 𝐒𝐓𝐂𝐑𝐄𝐂𝐎𝐕𝐄𝐑𝐘" — https://www.reddit.com/r/CryptoScams/comments/1e8vuzk/comment/lenwhjm/ — 2024-07-24, Reddit r/CryptoScams (live recovery-scam bait inside a victim help thread)

> "Unfortunately, no hacker online can get back what you've lost. Please watch out for recovery scams, a follow-up scam done after victims have fallen for" — https://www.reddit.com/r/CryptoScams/comments/1ve8p8r/comment/p1eyq0w/ — 2026-08-03, Reddit r/CryptoScams (AutoModerator macro, posted on every thread)

> "Never pay for services that claim to retrieve your stolen crypto. The likelihood of you getting scammed out of more money is higher than the chances of getting your investment back." — https://www.reddit.com/r/CryptoScams/comments/1e8vuzk/comment/lenq5lf/ — 2024-07-24, Reddit r/CryptoScams

## Theme 10 — What people wish existed: searchable, appealable, transparent, pooled, real-time

Direct wish statements and DIY attempts keep recurring: HIBP-style lookup, browser-integrated real-time warning, appeal processes, community governance, victim case-pooling, searchable scam-phrase archives. The DIY database graveyard (QuikSrch, Wallet-Watch, Reclaimr, "worlds largest searchable scam database"…) proves demand and fragmentation simultaneously. **Frequency: ~23 "database"-titled posts in r/Scams since Jun 2024 (Arctic Shift `title=database`), of which ≥5 are DIY scam-database launches and ≥3 are direct "is there a database of…" asks; nearly all got ≤2 comments.**

> "You know how would this be extremely useful? If it was built into the browsers (like the deceptive website warning) and into chat apps - and it would warn real time, as the scam happens. […] you either know right away that it's a scam, or you start thinking later 'oh... was I just scammed? let me try investigating'." — https://news.ycombinator.com/item?id=42133768 — 2024-11-14, Hacker News

> "this could be like an RBL for Ethereum addresses, instead of ip addresses of spammy mail servers. […] There should probably be a way to appeal something that is blacklisted in the database just as there is a way to report." — https://news.ycombinator.com/item?id=14928893 — 2017-08-04, Hacker News (EtherScamDB launch thread)

> "it's super important that this kind of resource exists for Ethereum. 'Trustlessness' can only go so far since not everyone has the technical knowhow to detect scams for themselves. Getting trusted members of the community and having good transparency/governance on this kind of platform is key for it to take off." — https://news.ycombinator.com/item?id=14929344 — 2017-08-04, Hacker News

> "It should be the opposite: ethernotscamdb. In crypto you need to assume everything is a scan until proven innocent." — https://news.ycombinator.com/item?id=14930110 — 2017-08-04, Hacker News

> "after being burned one to many times I decided to embark on a mission to create the worlds largest searchable scam database. So far we have just over 100 scams but are hoping to grow to a 1000 by year end." — https://www.reddit.com/r/CryptoScams/comments/1oem9gu/ — 2025-10-24, Reddit r/CryptoScams

> "If the IC3 portal highlighted specific cases or stats ('thanks to reports submitted to IC3, n investigations were initiated/suspects charged/convictions secured') that would really help convince ordinary victims that the government is taking tangible steps" — https://news.ycombinator.com/item?id=47793430 — 2026-04-16, Hacker News

---

## Demand map summary

| # | Theme | Strength of evidence | BTCSCAM surface that answers it |
|---|-------|---------------------|-------------------------------|
| 1 | "Is this a scam?" firehose, low answer rate | **Strong** (volume stats + 6 fresh quotes, 2026) | **/check** (instant lookup beats waiting for strangers) |
| 2 | Search/ads are the attack surface | **Strong** (live Aug-2026 Bitcointalk incidents, on-chain loss proof) | **/check** + **scam dossiers** (outrank/preempt SEO+ads); guides |
| 3 | Government reporting black hole | **Strong** (cross-venue, 2024–2026) | **/report** + **/reports/open** (visible status ≠ black hole) |
| 4 | Wins exist but are invisible | Medium (2 first-person + 1 insider) | **/reports/open** (publish outcomes; "what worked" guides) |
| 5 | Platform reporting futility | Medium-strong (one dense HN thread, 2026) | **/report** (aggregate → registrar/abuse escalation, not platform forms) |
| 6 | Checkers wrong both directions | **Strong** (audit post with score table; false-positive harm) | **/check** (evidence-based verdicts, not domain-age heuristics) |
| 7 | Checkers as scam vectors, broken report UX | **Strong** (multiple first-person, 2025–2026) | **/report** UX + moderated corroboration (no bot reviews) |
| 8 | Chainabuse invisible to victims, clone-parasitized | **Strong** (brand-confusion thread + near-zero HN footprint) | **/check** + **/report** (be the findable front door; feed data onward) |
| 9 | Recovery-scam colonization | **Strong** (live specimen captured in help thread) | Guides + hard anti-recovery-scam policy on every dossier page |
| 10 | Wish list: searchable/appealable/pooled/real-time | Medium-strong (recurring 2017→2026, DIY graveyard) | **/reports/open** (case pooling), appeals process, API/extension — none-yet for real-time browser surface |

## Reporter motivation findings (Signal 4 — calibrates the Reader→Reporter→Corroborator→Watchman ladder)

The dominant, explicitly stated motive is **protecting the next victim**, usually fused with **shame processing** — people report *while* calling themselves stupid, and the warning post is how they convert humiliation into worth. Money recovery is explicitly disclaimed. Verbatim evidence:

- "I know I'm dumb but let me put this out so no one else falls for it." — https://www.reddit.com/r/Scams/comments/1vf15lt/ — 2026-08-04, r/Scams
- "I wanted to share this because I feel pretty stupid, but maybe it'll help someone else. […] I'm posting this because I never expected to fall for something like this." — https://www.reddit.com/r/Scams/comments/1uhd58f/ — 2026-06-27, r/Scams (score 69 — the sub rewards this genre)
- "I realize there's probably little chance of recovering the money, but I did create a Craigslist listing modeled after his to warn others that it's a scam." — https://www.reddit.com/r/Scams/comments/1v87hbv/ — 2026-07-27, r/Scams (improvised counter-scam infrastructure)
- "I'm not posting this because I expect to recover my money. I'm posting it because if someone searches for phrases like 'task job', 'bulk purchase', 'complete tasks before withdrawal', or the names used by these scammers, I hope they find this thread before sending any money." — https://www.reddit.com/r/Scams/comments/1ukqfd6/ — 2026-07-01, r/Scams — **reporters already think in SEO terms; they are hand-building dossiers with keyword lists**
- "I'm posting to warn others and to hear from anyone affected by the same people or the same method." — https://www.reddit.com/r/Scams/comments/1uzlr6a/ — 2026-07-18, r/Scams (victim-pooling motive)
- "Posting this partly to warn others, partly because I'm genuinely out of ideas on what else to try." — https://www.reddit.com/r/Scams/comments/1v9bvui/ — 2026-07-28, r/Scams
- "Just like you all, I am completely embarrassed, ashamed and depressed. But we need to support one another and report these crimes, no matter how big or small, to the FBI at ic3.gov." — https://www.reddit.com/r/BitcoinBeginners/comments/1s118go/ — 2026-03-22, r/BitcoinBeginners (victims recruiting other victims to report)
- "You should file a report anyway, if not to recover your money then at least to help build a case that might someday catch the scammers." — https://www.reddit.com/r/CryptoScams/comments/1e8vuzk/comment/leafw0g/ — 2024-07-21, r/CryptoScams (top-scored answer in thread)
- "The site went offline. […] Scammer disappeared. Thank you everyone." — https://bitcointalk.org/index.php?topic=5589730.msg67031275#msg67031275 — August 10, 2026, Bitcointalk (closure ritual at end of a 2-week investigation thread)
- "This means that three domains promoted by this scammer have now been suspended by the registrar" — https://bitcointalk.org/index.php?topic=5590338.msg67029822#msg67029822 — August 10, 2026, Bitcointalk (visible wins posted back as status updates)

**Ladder calibration takeaways:**
1. **A no-money status ladder is viable.** Bitcointalk's veteran reporters (Trêvoid, albon, Zwei) work for exactly three currencies BTCSCAM can mint: *visible outcomes* (registrar suspension confirmations pasted as updates), *community thanks* ("Thank you everyone", "nice catch @Trêvoid", "Tagged from my end"), and *investigator identity* (the $2M wallet-tracer: "Happy to answer questions about how I traced it").
2. **The Reporter tier's emotional job is shame-conversion** — copy should frame reporting as helping the next person, never as admitting victimhood. The single most common phrase pattern across 160 sampled r/Scams warning posts is "so no one else falls for it" (~80 posts containing "so no one else" in 72 days; ~80 containing "to warn others" in 140 days — both limit-capped Arctic Shift samples → ≥33/mo and ≥17/mo respectively).
3. **Corroborator tier maps to an observed behavior**: victims explicitly ask other victims of the same operation to come forward (1uzlr6a), and the case-pooling logic is stated outright: "pairing up their cases with other victims of the same scam — more money lost = higher chances of IC3 actually paying attention" (https://www.reddit.com/r/CryptoScams/comments/1e8vuzk/comment/leasq6m/, 2024-07-21).
4. **Watchman tier maps to the mod/bot pattern**: r/Scams mods enforcing "URL required, it helps future victims", WHOIS bots, AutoMod macros — communities already build watchman tooling by hand; give those people better tools and public credit.
5. **Feedback is the retention mechanism.** The most explicit design statement in the corpus: "the 'acted upon' part needs to be highlighted in tangible ways, otherwise people will be suspicious that nothing ever happens to our reports, leading to fewer reports being submitted" (HN 47793430). /reports/open with per-report status is the direct answer.

## So what for BTCSCAM

1. **/check wins by being findable and evidence-first.** The firehose exists (≥400 "is this a scam" asks/month in r/Scams alone), the majority get no answer, and the tools people find first (ScamAdviser) are distrusted with receipts. A /check page that shows *evidence* (domain age, report count, clone lineage like Premu→Premiumblock) rather than a single trust score answers the exact documented failure.
2. **Dossiers should be built for the victim's search moment.** Reporters already write keyword-stuffed warnings hoping victims google the phrase. BTCSCAM dossiers should systematically capture scam names, platform names, and stock phrases ("complete tasks before withdrawal") — that's the demand-side query stream.
3. **/report must visibly not be a black hole.** Status states, public outcome counts, and "what this report fed into" are the differentiator against IC3/FTC/ScamAdviser. Even a modest "N registrar takedowns confirmed" counter addresses the most-quoted complaint in this corpus.
4. **Anti-recovery-scam defense is table stakes.** Every victim surface gets colonized within hours; BTCSCAM needs the AutoMod-style warning banner on every dossier and hard moderation of comment surfaces from day one (no free-text testimonials — that's how ScamAdviser's reviews became a scam vector).
5. **Brand-clone risk is proven, not hypothetical**: chainabuse.report intercepted Chainabuse's reputation within weeks. Register adjacent TLDs/typos of btcscam early; publish a canonical-domain notice.
6. **The Coldcard connection is live**: the Aug 2026 r/CryptoScams PSA about the "coldcard exploit" ties directly to the existing BTCSCAM Coldcard dossier — a /check entry + open report thread for that incident would meet an active, current search stream.

## Open questions

1. **X/Twitter demand signal is unmeasured** (paywalled) — victim checking behavior there may differ (reply-guys, community notes). Needs a separate access path.
2. **Trustpilot reviews of Chainabuse/ScamAdviser unverified** (403) — search snippets suggest rich complaint material (e.g., ScamAdviser flagging bitcointalk.org itself as risky per third-party snippets) but nothing was fetchable first-hand, so it is excluded here.
3. **Answer-rate caveat**: Arctic Shift comment counts are snapshot-time; a live recount on a sample of the zero-comment posts would firm up the "majority unanswered" claim before publishing it as a stat.
4. **Do checkers' APIs matter?** First comment on a 2025 Show HN scam checker was "Is there an API that i can use?" — worth deciding early whether /check is human-only or an API surface (extension/bot demand is real but adversarially risky).
5. **Archiving pass pending**: all archive lookups 429'd this session; re-run archive.today/wayback saves for the ~60 permalinks from another network.

*Full quote corpus: [`evidence/quotes.csv`](evidence/quotes.csv) — 64 rows. `archive_url` column is empty pending the archive re-run noted in Open questions.*

**Summary for the caller:** 64 verified verbatim quotes across 10 themes + a dedicated motivation synthesis, all fetched first-hand (Reddit via Arctic Shift archive, HN via Algolia, Bitcointalk direct). Strongest demand signals: an unanswered "is this a scam?" firehose (≥400/month in r/Scams, majority zero replies), a universally-felt reporting black hole (IC3/FTC/platforms), distrust of ScamAdviser in both directions with its review section colonized by recovery scammers, and Chainabuse being invisible to victims (near-zero HN footprint, phishing clone intercepting its brand). Reporter motivation is overwhelmingly protect-the-next-victim fused with shame-conversion, plus visible-outcome and thanks rituals on Bitcointalk — a no-money status ladder is well supported. Gaps: X/Twitter (paywalled), Trustpilot/ScamAdviser pages (403), and all archive services rate-limited this session so the archive_url column is empty — recommend an archiving re-run. Raw data preserved in `/private/tmp/claude-501/-Users-mitulgajera-Desktop-Dev/76b6a036-b898-435d-a85e-98251497276b/scratchpad/demand/` (Arctic Shift JSON, Bitcointalk HTML + parsed text, HN thread dumps).
