-- ============================================================================
-- 0005_harden_reports — close the anonymous direct-INSERT bypass on reports.
--
-- Background: 0001 created "reports_public_insert" so anyone could file a
-- report with the anon key. But the ONLY writer of reports in the app is the
-- /report server action (src/app/report/actions.ts), which uses the
-- service_role client — that bypasses RLS, so it never needed the anon policy.
-- The anon policy therefore adds no capability our code uses, while exposing a
-- path that skips the server action's field validation and rate limiter: with
-- the anon key, a client could mass-insert reports straight into the table.
--
-- Fix: drop the anon INSERT policy. reports become service_role-write-only,
-- exactly like draft_incidents and the blacklists. Public READ of reports was
-- never granted (only owner-read for signed-in users), so /reports/open — which
-- reads via the service role on the server — is unaffected. Idempotent.
-- ============================================================================

drop policy if exists "reports_public_insert" on public.reports;

-- Defence in depth: even a future service_role writer cannot store an
-- oversized payload. These caps sit well above any legitimate report and match
-- the spirit of the server action's own limits.
alter table public.reports
  drop constraint if exists reports_description_len;
alter table public.reports
  add constraint reports_description_len
  check (char_length(description) <= 8000);

alter table public.reports
  drop constraint if exists reports_evidence_count;
alter table public.reports
  add constraint reports_evidence_count
  check (array_length(evidence_urls, 1) is null or array_length(evidence_urls, 1) <= 20);
