-- ============================================================================
-- BTCSCAM — R3 chip moderation (0004_chips_accept)
--
-- Depends on: 0002_r3.sql (public.evidence_chips). Idempotent: safe to re-run.
--
-- Adds the editorial decision column to evidence chips:
--   accepted = null  → pending (default; nothing is accepted automatically)
--   accepted = true  → accepted by an editor/mod on the desk
--   accepted = false → rejected by an editor/mod on the desk
--
-- Editorial law: an accepted chip is evidence FOR editors — it never changes
-- an incident's trust state by itself. Accepted chips count toward the
-- contribution ladder (5 accepted chips on others' reports → corroborator);
-- rejected chips count toward nothing and never demote anyone.
-- ============================================================================

alter table public.evidence_chips
  add column if not exists accepted boolean;

-- Desk queries: pending chips per report; ladder recompute counts accepted
-- chips per contributor.
create index if not exists idx_evidence_chips_accepted
  on public.evidence_chips (accepted, report_id);

-- No RLS changes: decisions are written exclusively through the desk's
-- server actions via the service_role client. The 0002 policies already
-- deny UPDATE to anon/authenticated (no update policy exists).
