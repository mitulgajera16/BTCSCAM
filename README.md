# BTCSCAM.com

**The anti-scam paper of record.** A newsroom-with-tools: verified scam/incident registry, wallet checks, and plain-language protection guides for Bitcoin self-custody.

## Repo map

| Path | What |
|---|---|
| `PRD.md` | Product strategy, releases R1–R3, north star, pre-mortem — read this first |
| `docs/growth-playbook.md` | Community + distribution loops (SEO, incident-day ritual, Rug Report, Watchmen) |
| `docs/data-sources.md` | Verified external APIs/feeds + ingestion stack |
| `design-reference/` | Exported Claude Design v4 (the design contract — tokens, type, 26 screens) |
| `data/schemas/incident.schema.json` | The incident contract; every registry entry validates against it |
| `data/incidents/*.json` | Launch incidents (Coldcard RNG flaw, phishing wave, Milk Sad) |
| `content/guides/*.md` | Guides (launch: seed-phrase entropy) |
| `src/` | Next.js 15 app (App Router, TS, Tailwind) |

## Dev

```bash
npm run dev     # http://localhost:3000
```

## Editorial law (enforced in code where possible)

1. No sources, no publish. 2. Severity ≠ verification (separate chips). 3. Staleness labeled at >90 days. 4. Corrections public + permanent. 5. Honest numbers only. 6. No paid listings, no recovery-service ads, house-product links disclosed.

Design identity is locked — see `design-reference/README.md`. **No italics anywhere.**
