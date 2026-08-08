-- ============================================================================
-- BTCSCAM — R3 desk audit trail + profile preferences (0003_profiles_extra)
--
-- Depends on: 0002_r3.sql (public.profiles) and the Supabase auth schema
-- (auth.users). Idempotent: safe to re-run.
--
-- desk_log is the INTERNAL audit trail of desk actions. The public face of
-- editorial changes stays the corrections system (0001) — public and
-- permanent. Nothing in this file touches trust states.
-- ============================================================================

-- ------------------------------------------------- profiles: preference flags
-- onboarded: the first-run "WELCOME TO THE DESK" panel on /account was
-- dismissed. show_credit: named-credit opt-in — show this handle on dossiers
-- the account contributed to ("Corroborated by …"). Defaults to true; the
-- credit line only ever uses handles, never emails.
alter table public.profiles
  add column if not exists onboarded boolean not null default false;

alter table public.profiles
  add column if not exists show_credit boolean not null default true;

comment on column public.profiles.onboarded is
  'First-run WELCOME TO THE DESK panel dismissed.';
comment on column public.profiles.show_credit is
  'Named-credit opt-in: show handle on dossiers this account contributed to.';

-- 0002 revoked ALL update columns from authenticated (handle writes go
-- exclusively through the updateHandle server action via the service client
-- — the browser key must never reach that column, or the reserved-word and
-- one-change rules could be bypassed). These two preference flags are
-- harmless self-serve booleans, so they are the ONLY columns authenticated
-- may update; the "profiles_self_update" RLS policy (0002) still restricts
-- rows to the owner. role and accepted_reports remain service_role-only
-- writes. Grants are additive and idempotent.
grant update (onboarded, show_credit) on public.profiles to authenticated;

-- -------------------------------------------------------------------- desk_log
-- Append-only audit trail: who did what at the desk, when, to which subject
-- (a report id, incident id, chip id, or profile id as text), with free-form
-- structured detail. Actor survives as null if the account is deleted — the
-- trail itself is never rewritten.
create table if not exists public.desk_log (
  id         bigserial primary key,
  actor      uuid references auth.users (id) on delete set null,
  action     text not null,
  subject    text,
  detail     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_desk_log_created
  on public.desk_log (created_at desc);

create index if not exists idx_desk_log_actor
  on public.desk_log (actor);

-- ============================================================================
-- Row Level Security — desk_log is service_role/mod only
-- ============================================================================

alter table public.desk_log enable row level security;

-- Read: mods only. Server-side desk rendering uses the service_role client
-- (bypasses RLS); this policy additionally lets a signed-in mod read the
-- trail directly. The profiles subquery runs under profiles RLS — the
-- self-read policy (0002) covers reading one's own role.
drop policy if exists "desk_log_mod_read" on public.desk_log;
create policy "desk_log_mod_read" on public.desk_log
  for select to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'mod'
    )
  );

-- Writes: service_role only — deliberately NO insert/update/delete policies
-- for authenticated. Desk server actions append entries after re-verifying
-- the actor's session and role; the trail cannot be edited from a browser.
