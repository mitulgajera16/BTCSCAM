# The Registry Desk — local publish/unpublish surface for file-based dossiers

**Date:** 2026-08-12 · **Status:** approved by Mitul (design + proceed-to-build) · **Route:** `/desk/registry`

## Problem

BTCSCAM has two draft systems with unequal tooling. DB drafts from the ingest
cron (`draft_incidents`) already have approve/reject/merge buttons at `/desk`.
File-based dossiers (`data/drafts/*.json` — currently the 12 twice-verified
wave-1 dossiers) have no interface at all: publishing means asking the agent in
chat to set the date, move the file, run `scripts/seed-incidents.mjs`, commit,
and push. There is no screen that shows what is draft vs published, no publish
button, and no way back.

A structural constraint shapes any fix: the site reads incidents as the UNION
of the bundled `data/incidents/*.json` files and Supabase rows (DB wins by
slug, `src/lib/incidents-db.ts`). A DB-only unpublish would be resurrected by
the deployed bundle, so a real back-to-draft must touch file + DB + git.

## Decision

A **local-only registry page inside the existing desk**, not a production
DB-backed panel and not an off-the-shelf git CMS (Decap/Tina add OAuth, config,
and team-shaped editorial branching that a solo editor with a custom JSON
schema and a verification constitution does not need). Chosen explicitly by
Mitul over those two alternatives.

- v1 scope: **incident dossiers only.** The ingest queue keeps its existing
  `/desk` panel; guides remain code-published.
- Publish is **one click, full pipeline**, confirm dialog first.

## Architecture

- **Route:** `src/app/desk/registry/page.tsx` + `actions.ts`. Living under
  `/desk` means `src/proxy.ts` Basic-auth guard applies unchanged; the page and
  every action ALSO re-verify desk auth themselves (house rule: actions never
  trust that the proxy ran).
- **Local gate:** page and actions require `process.env.NODE_ENV ===
  "development"` AND a successful writability probe of `data/` (fail closed).
  On Vercel the page 404s exactly like an unauthorized desk hit. Server
  actions additionally refuse with a plain-language error.
- **Pure logic in `src/lib/registry/`:**
  - `fs-state.ts` — enumerate drafts/published, derive status, filename
    mapping (`data/drafts/<slug>.json` ↔ `data/incidents/<id>.json`; verified
    convention: id = `<firstObserved-year>-<slug>`, all three live files are
    named by id).
  - `review-flags.ts` — tolerant parser that scans `docs/review/*-review.md`
    for a dossier's `**File:** \`data/drafts/<name>.json\`` section and
    extracts its "Check before approving" checklist. Missing section →
    "no review notes found", never an error.
  - `publish.ts` — the step pipeline (validate → date → move → upsert →
    revalidate → commit/push) with per-step results; the incident→row mapping
    mirrors `scripts/seed-incidents.mjs` (which stays for bulk reseeds).
- **No new dependencies.** Git and file operations via `node:child_process`
  `execFile` and `node:fs/promises`, running in the local dev server.

## Status model — the filesystem is the database

No new state store, no status column.

| State | Meaning |
|---|---|
| Draft | file exists in `data/drafts/` |
| Published | file exists in `data/incidents/` |

Published dossiers get live sync badges computed at render: DB row present
(service client), row `data` matches file (compare `lastUpdated`, fall back to
deep-equal), file committed (`git status --porcelain -- data/`). DB-only
incidents (approved from the ingest queue; never had files) are listed
read-only for completeness. Render always fresh (`force-dynamic`), like the
desk.

## Publish flow (server action)

Confirm dialog first: lists the exact steps and the dossier's unresolved
review flags. Archive-capture gaps are a visible warning, never a blocker.

1. Re-verify: local gate + desk auth.
2. Validate: required fields per `data/schemas/incident.schema.json`'s
   required list (same set the seed script enforces) + "no source, no
   publish".
3. Set `published` and `lastUpdated` to today (UTC date).
4. Move file to `data/incidents/<id>.json`.
5. Upsert into Supabase `incidents` (service client, `onConflict: "id"`).
   Production goes live within its 300 s cache window — before any deploy.
6. `revalidateTag("incidents")` for the local server.
7. `git add data/ && git commit -m "publish dossier <slug>" && git push`
   (push → Vercel auto-deploys → bundle honest).

Every step returns `{ step, ok, detail }`. Steps are idempotent (file already
moved → skip; upsert is upsert; nothing to commit → skip), so retrying a
partially failed publish is safe and completes only the missing steps.

## Back-to-draft flow

Mirror image: delete DB row by id → move file back to
`data/drafts/<slug>.json` → `revalidateTag` → commit (`unpublish dossier
<slug>`) + push. The `published` date is left as-is (history; refreshed on any
re-publish). The UI states plainly: the DB removal takes the page off prod
within ≤5 min, but it is fully off-site only when the push's deploy lands,
because the previous bundle still contains the file until then.

## UI

House desk style, reusing the desk's visual vocabulary (mono section heads
with the 2px ink underline, Fraunces display, TrustState/severity labels,
`EmptyState` / `QueryError` patterns — extracted or mirrored, not redesigned).

- Header strip: date · `REGISTRY · LOCAL ONLY · NOT INDEXED` · link back to
  `/desk`.
- `DRAFTS · n` — card per dossier: title, slug, trust/severity chips,
  collapsed "check before approving" flags (count visible), PUBLISH button →
  confirm dialog → per-step result list rendered inline.
- `PUBLISHED · n` — row per dossier: title, published date, sync badges
  (`DB ✓ · MATCHES FILE ✓ · COMMITTED ✓` or their plain-language failures),
  VIEW LIVE link (`/scam/<slug>`), BACK TO DRAFT button with confirm.
- `DB-ONLY · n` — read-only list of desk-published (ingest) incidents.

## Error handling

- Fail closed everywhere; every failure renders inline in plain language
  (never a pretend success, never a silent half-state) — same tone as the
  desk's `DATABASE NOT CONNECTED` panel.
- Supabase down: drafts/published lists still render from disk; DB badges and
  publish/unpublish buttons degrade to an explicit error note.
- Git push failure (offline): publish reports steps 1–6 done, push failed;
  card shows "committed, push pending"; clicking publish again just retries
  the push.

## Testing

- Unit tests via Node's built-in `node:test` (repo has no test framework; no
  new deps): filename/id mapping, status derivation, review-flag parser
  against a fixture of the wave-1 review doc, publish-step planner
  (idempotency skips).
- Manual E2E on the dev server with a throwaway dossier: publish → verify
  file move, DB row, commit; back-to-draft → verify reversal. Real dossiers
  untouched by testing.

## Out of scope (v1)

- Editing dossier content in the browser (files are edited in the editor/agent
  workflow that already verifies them).
- Guides status board; ingest-queue rework; any production-reachable mutation
  surface.
