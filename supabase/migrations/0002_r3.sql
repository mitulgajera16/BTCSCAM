-- ============================================================================
-- BTCSCAM — R3 community-verification tables (0002_r3)
--
-- Depends on: 0001_init.sql (public.reports) and the Supabase auth schema
-- (auth.users). Idempotent: safe to re-run.
--
-- Roles ladder: reader → reporter → corroborator → watchman → mod.
-- Verification stances never change an incident's trust state by themselves;
-- editors still decide. Severity ≠ trust, votes ≠ verification.
-- ============================================================================

-- ----------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  handle           text unique,
  role             text not null default 'reader'
                   check (role in ('reader','reporter','corroborator','watchman','mod')),
  accepted_reports integer not null default 0,
  created_at       timestamptz not null default now()
);

-- ------------------------------------------------------------- verify_votes
create table if not exists public.verify_votes (
  id           bigserial primary key,
  report_id    bigint not null references public.reports (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  stance       text not null check (stance in ('corroborate','dispute')),
  evidence_url text,
  note         text,
  created_at   timestamptz not null default now(),
  unique (report_id, user_id)
);

create index if not exists idx_verify_votes_report
  on public.verify_votes (report_id);

-- ----------------------------------------------------------- evidence_chips
create table if not exists public.evidence_chips (
  id         bigserial primary key,
  report_id  bigint not null references public.reports (id) on delete cascade,
  kind       text not null check (kind in ('url','txid','screenshot','quote')),
  value      text not null,
  added_by   uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_evidence_chips_report
  on public.evidence_chips (report_id);

-- ============================================================================
-- Row Level Security
-- Public rendering of tallies/chips happens server-side via the service_role
-- client (bypasses RLS); direct client access is deliberately narrow.
-- ============================================================================

alter table public.profiles       enable row level security;
alter table public.verify_votes   enable row level security;
alter table public.evidence_chips enable row level security;

-- profiles: self read.
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select to authenticated
  using (id = auth.uid());

-- profiles: self update — restricted by the column-level privileges below.
-- role and accepted_reports are service_role-only writes.
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Column-level restriction: authenticated gets NO update columns from this
-- migration. handle is deliberately NOT granted — its rules (the reserved-
-- word impersonation blocklist and the one-change-ever shape rule, both in
-- src/components/account/handle.ts) are enforced by the updateHandle server
-- action, which writes via the service client. A browser-key UPDATE would
-- bypass both, so that path is closed at the grant level; uniqueness alone
-- is not the impersonation control. 0003 grants the two harmless preference
-- flags (onboarded, show_credit) and nothing else.
revoke update on public.profiles from authenticated;

-- Row creation is service_role-only for now (no insert policy); R3 will add a
-- security-definer trigger on auth.users signup.

-- verify_votes: insert only by corroborator/watchman/mod, only as themselves,
-- and NEVER on their own report — corroboration must be independent, so a
-- self-vote is refused at the database as well as in the castVote action.
-- The profiles subquery runs under profiles RLS (self-read covers it); the
-- reports subquery runs under reports RLS ("reports_owner_read", 0001) which
-- makes exactly the caller's own reports visible — the not-exists therefore
-- fails precisely on self-votes.
drop policy if exists "verify_votes_trusted_insert" on public.verify_votes;
create policy "verify_votes_trusted_insert" on public.verify_votes
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('corroborator','watchman','mod')
    )
    and not exists (
      select 1
      from public.reports r
      where r.id = report_id
        and r.user_id = auth.uid()
    )
  );

-- verify_votes: voters can read their own votes ("you already voted").
drop policy if exists "verify_votes_self_read" on public.verify_votes;
create policy "verify_votes_self_read" on public.verify_votes
  for select to authenticated
  using (user_id = auth.uid());

-- evidence_chips: insert by the report owner or by watchman/mod, only as
-- themselves. The reports subquery runs under reports RLS (owner read).
drop policy if exists "evidence_chips_insert" on public.evidence_chips;
create policy "evidence_chips_insert" on public.evidence_chips
  for insert to authenticated
  with check (
    added_by = auth.uid()
    and (
      exists (
        select 1
        from public.reports r
        where r.id = report_id
          and r.user_id = auth.uid()
      )
      or exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role in ('watchman','mod')
      )
    )
  );

-- evidence_chips: contributors can read their own chips.
drop policy if exists "evidence_chips_self_read" on public.evidence_chips;
create policy "evidence_chips_self_read" on public.evidence_chips
  for select to authenticated
  using (added_by = auth.uid());
