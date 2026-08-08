-- ============================================================================
-- BTCSCAM — R2 "The Wire" initial schema (0001_init)
--
-- Idempotent: safe to re-run. Tables use CREATE TABLE IF NOT EXISTS; functions
-- use CREATE OR REPLACE; triggers and policies are dropped-if-exists first.
--
-- Apply with either:
--   psql "$POSTGRES_URL" -f supabase/migrations/0001_init.sql
--   supabase db push
--
-- Editorial law encoded here:
--   * draft_incidents.normalized is ALWAYS trust_state 'reported' (enforced in
--     ingest + desk code; nothing auto-publishes).
--   * blacklist_* data (ScamSniffer GPL-3.0, MetaMask) is served as lookups
--     only, never re-exported: RLS enabled, no public policies.
-- ============================================================================

-- ---------------------------------------------------------------- incidents
-- data jsonb holds the full incident document (same shape as
-- data/incidents/*.json and the Incident type in src/lib/incidents.ts).
-- The scalar columns are denormalized for querying/ordering.
create table if not exists public.incidents (
  id             text primary key,
  slug           text not null unique,
  title          text not null,
  summary        text not null,
  trust_state    text not null
                 check (trust_state in ('reported','corroborated','verified','resolved','disputed')),
  severity       text not null
                 check (severity in ('S1','S2','S3','S4')),
  categories     text[] not null default '{}',
  first_observed date not null,
  published      timestamptz not null,
  last_updated   timestamptz not null,
  ongoing        boolean not null default false,
  data           jsonb not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_incidents_last_updated
  on public.incidents (last_updated desc);

-- Containment queries over entities.addresses / entities.domains in /check.
create index if not exists idx_incidents_data_gin
  on public.incidents using gin (data jsonb_path_ops);

-- ------------------------------------------------------- incident_revisions
create table if not exists public.incident_revisions (
  id          bigserial primary key,
  incident_id text not null references public.incidents (id) on delete cascade,
  rev         integer not null,
  data        jsonb not null,
  note        text,
  changed_at  timestamptz not null default now()
);

create index if not exists idx_incident_revisions_incident
  on public.incident_revisions (incident_id, rev desc);

-- rev numbers must be unique per incident: the max(rev)+1 computation in the
-- trigger below (and in the desk's mergeDraft) can race under concurrent
-- updates, and duplicates would corrupt the revision history silently.
create unique index if not exists uq_incident_revisions
  on public.incident_revisions (incident_id, rev);

-- On UPDATE of incidents: snapshot the previous document into
-- incident_revisions — but only when data actually changed, so idempotent
-- re-seeds (scripts/seed-incidents.mjs upserts every bundled doc
-- unconditionally) do not write a spurious snapshot per run. updated_at is
-- bumped on every update regardless.
create or replace function public.incidents_capture_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.data is distinct from new.data then
    insert into public.incident_revisions (incident_id, rev, data, note)
    values (
      old.id,
      coalesce(
        (select max(rev) from public.incident_revisions where incident_id = old.id),
        0
      ) + 1,
      old.data,
      'pre-update snapshot'
    );
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_incidents_capture_revision on public.incidents;
create trigger trg_incidents_capture_revision
  before update on public.incidents
  for each row
  execute function public.incidents_capture_revision();

-- -------------------------------------------------------------- corrections
-- Public and permanent (editorial constitution #4).
create table if not exists public.corrections (
  id           bigserial primary key,
  incident_id  text not null references public.incidents (id) on delete cascade,
  corrected_on date not null,
  note         text not null,
  created_at   timestamptz not null default now()
);

create index if not exists idx_corrections_incident
  on public.corrections (incident_id, corrected_on desc);

-- ---------------------------------------------------------- draft_incidents
-- Ingest queue for the Desk. source values: llama | ic3 | sec | cftc | ftc |
-- optech | report. normalized is incident-shaped JSON with trust_state ALWAYS
-- 'reported'. Nothing in this table is public until an editor approves it.
create table if not exists public.draft_incidents (
  id          bigserial primary key,
  source      text not null,
  source_url  text,
  guid        text,
  dedupe_key  text not null unique,
  title       text not null,
  raw         jsonb,
  normalized  jsonb,
  status      text not null default 'draft'
              check (status in ('draft','approved','rejected','merged')),
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz,
  review_note text
);

create index if not exists idx_draft_incidents_status
  on public.draft_incidents (status, created_at desc);

-- ------------------------------------------------------------------ reports
-- Public scam reports. Rate-limiting happens in the server action, not here.
create table if not exists public.reports (
  id            bigserial primary key,
  description   text not null,
  category      text,
  vendor        text,
  domain        text,
  address       text,
  observed_on   date,
  evidence_urls text[] not null default '{}',
  contact_email text,
  status        text not null default 'new'
                check (status in ('new','triaged','accepted','rejected')),
  user_id       uuid,
  incident_id   text references public.incidents (id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists idx_reports_status
  on public.reports (status, created_at desc);

-- ------------------------------------------------------ blacklist_addresses
-- Sources: scamsniffer (GPL-3.0, 7-day delayed) | metamask | btcscam
-- (addresses from our own published incidents). Lookups only — never
-- re-exported in bulk.
create table if not exists public.blacklist_addresses (
  address   text primary key,
  source    text not null,
  listed_at timestamptz not null default now(),
  meta      jsonb
);

-- -------------------------------------------------------- blacklist_domains
create table if not exists public.blacklist_domains (
  domain    text primary key,
  source    text not null,
  listed_at timestamptz not null default now(),
  meta      jsonb
);

-- ------------------------------------------------------------- ticker_items
-- Front-page Wire ticker. kind values: incident | advisory | optech.
create table if not exists public.ticker_items (
  id           bigserial primary key,
  kind         text not null,
  label        text not null,
  url          text,
  published_at timestamptz not null,
  dedupe_key   text not null unique,
  created_at   timestamptz not null default now()
);

create index if not exists idx_ticker_items_published
  on public.ticker_items (published_at desc);

-- ============================================================================
-- Row Level Security
-- RLS is enabled on every table. A table with RLS enabled and no policy for a
-- role denies that role entirely; the service_role key bypasses RLS.
-- ============================================================================

alter table public.incidents          enable row level security;
alter table public.incident_revisions enable row level security;
alter table public.corrections        enable row level security;
alter table public.draft_incidents    enable row level security;
alter table public.reports            enable row level security;
alter table public.blacklist_addresses enable row level security;
alter table public.blacklist_domains  enable row level security;
alter table public.ticker_items       enable row level security;

-- Public read: incidents, corrections, ticker_items.
drop policy if exists "incidents_public_read" on public.incidents;
create policy "incidents_public_read" on public.incidents
  for select to anon, authenticated
  using (true);

drop policy if exists "corrections_public_read" on public.corrections;
create policy "corrections_public_read" on public.corrections
  for select to anon, authenticated
  using (true);

drop policy if exists "ticker_items_public_read" on public.ticker_items;
create policy "ticker_items_public_read" on public.ticker_items
  for select to anon, authenticated
  using (true);

-- incident_revisions, draft_incidents, blacklist_addresses, blacklist_domains:
-- intentionally NO anon/authenticated policies — service_role only.

-- reports: anyone may file a report; it always lands as status 'new', never
-- pre-linked to an incident, and user_id may only be null or the caller.
drop policy if exists "reports_public_insert" on public.reports;
create policy "reports_public_insert" on public.reports
  for insert to anon, authenticated
  with check (
    status = 'new'
    and incident_id is null
    and (user_id is null or user_id = auth.uid())
  );

-- reports: signed-in reporters can read their own reports.
drop policy if exists "reports_owner_read" on public.reports;
create policy "reports_owner_read" on public.reports
  for select to authenticated
  using (user_id is not null and user_id = auth.uid());
