import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getModActor, verifyEditorAuth } from "@/components/desk/auth";
import { getServiceClient, hasSupabase } from "@/components/desk/db";
import {
  SOURCE_LABEL,
  SOURCE_ORDER,
  type DeskDraft,
  type DeskReport,
  type IncidentRef,
} from "@/components/desk/types";
import DraftCard from "@/components/desk/DraftCard";
import ReportRow from "@/components/desk/ReportRow";
import CorrectionsComposer from "@/components/desk/CorrectionsComposer";
import DeskSignalsPanel, {
  type DeskChip,
  type DeskVote,
} from "@/components/desk/DeskSignalsPanel";
import LadderPanel from "@/components/desk/LadderPanel";

// The Desk — Monday Sweep + Watchmen tools. Access: editor Basic auth
// (src/proxy.ts guards /desk/*) OR a signed-in session whose profiles row
// says role = 'mod' — either works, so the desk runs before accounts exist.
// This page re-verifies on its own (the GET render leaks reporter PII if it
// ever trusts the proxy alone), and every server action re-verifies again.
// Always rendered fresh: a review queue must never show a cached yesterday.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Desk · Monday Sweep — BTCSCAM",
  description: "Editor-only review queue. Nothing publishes automatically.",
  robots: { index: false, follow: false },
};

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif" };

const sectionHead = {
  ...mono,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: ".05em",
  borderBottom: "2px solid var(--ink)",
  paddingBottom: 8,
  marginTop: 40,
} as const;

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ ...mono, fontSize: 12, color: "var(--meta)", marginTop: 16 }}>
      {children}
    </p>
  );
}

function QueryError({ table, message }: { table: string; message: string }) {
  return (
    <p style={{ ...mono, fontSize: 12, color: "var(--danger)", marginTop: 16 }}>
      COULD NOT READ {table.toUpperCase()}: {message} — are the migrations
      applied?
    </p>
  );
}

// Access gate: verifyEditorAuth (Basic auth) OR the shared getModActor in
// src/components/desk/auth.ts — one mod-session check for the page and every
// desk action. getUser() validates the JWT against the auth server; the role
// comes from profiles via the SERVICE client — never from anything the
// client sent.

// ── data loaders (service role; desk tables are not publicly readable) ─────

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

async function loadDrafts(): Promise<{ drafts: DeskDraft[]; error?: string }> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("draft_incidents")
    .select("id, source, source_url, title, status, created_at, normalized")
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return { drafts: [], error: error.message };
  const drafts: DeskDraft[] = (data ?? []).map((row) => ({
    id: Number(row.id),
    source: str(row.source) || "unknown",
    sourceUrl: str(row.source_url) || null,
    title: str(row.title) || "(untitled draft)",
    createdAt: str(row.created_at),
    normalized:
      row.normalized && typeof row.normalized === "object"
        ? (row.normalized as Record<string, unknown>)
        : null,
  }));
  return { drafts };
}

type OpenReport = DeskReport & { status: string };

// Desk v2 shows new AND triaged reports: verify-votes and chips arrive on
// both, and a triaged report with fresh signals still needs the editor.
async function loadReports(): Promise<{ reports: OpenReport[]; error?: string }> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("reports")
    .select("*")
    .in("status", ["new", "triaged"])
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return { reports: [], error: error.message };
  const reports: OpenReport[] = (data ?? []).map((row) => ({
    id: Number(row.id),
    description: str(row.description),
    // Defensive: the R1 intake wrote scam_type; the R2 schema says category.
    category: str(row.category) || str(row.scam_type) || null,
    vendor: str(row.vendor) || null,
    domain: str(row.domain) || null,
    address: str(row.address) || null,
    observedOn: str(row.observed_on) || str(row.observed) || null,
    evidenceUrls: Array.isArray(row.evidence_urls)
      ? row.evidence_urls.filter((u: unknown): u is string => typeof u === "string")
      : [],
    contactEmail: str(row.contact_email) || null,
    createdAt: str(row.created_at),
    status: str(row.status) || "new",
  }));
  return { reports };
}

// Merge, attach, and corrections write to the incidents TABLE, so only
// database rows are offered as targets — a bundled-JSON incident that has
// not been seeded yet would dead-end with "not found".
async function loadIncidentRefs(): Promise<{ refs: IncidentRef[]; error?: string }> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("incidents")
    .select("id, slug, title")
    .order("last_updated", { ascending: false })
    .limit(500);
  if (error) return { refs: [], error: error.message };
  const refs: IncidentRef[] = (data ?? []).map((row) => ({
    id: str(row.id),
    slug: str(row.slug),
    title: str(row.title),
  }));
  return { refs };
}

// Verify-votes and evidence chips for the open reports, with contributor
// uuids resolved to handles where a profile exists. Both tables are R3
// migrations — errors surface as notes, never as a broken desk.
async function loadSignals(reportIds: number[]): Promise<{
  votesByReport: Map<number, DeskVote[]>;
  chipsByReport: Map<number, DeskChip[]>;
  votesError?: string;
  chipsError?: string;
}> {
  const votesByReport = new Map<number, DeskVote[]>();
  const chipsByReport = new Map<number, DeskChip[]>();
  if (reportIds.length === 0) return { votesByReport, chipsByReport };

  const sb = getServiceClient();
  const [votesRes, chipsRes] = await Promise.all([
    sb
      .from("verify_votes")
      .select("*")
      .in("report_id", reportIds)
      .order("created_at", { ascending: true })
      .limit(1000),
    sb
      .from("evidence_chips")
      .select("*")
      .in("report_id", reportIds)
      .order("created_at", { ascending: true })
      .limit(1000),
  ]);

  // Resolve contributor handles in one query.
  const userIds = new Set<string>();
  for (const v of votesRes.data ?? []) if (v.user_id) userIds.add(String(v.user_id));
  for (const c of chipsRes.data ?? []) if (c.added_by) userIds.add(String(c.added_by));
  const handleOf = new Map<string, string>();
  if (userIds.size > 0) {
    const { data: profiles } = await sb
      .from("profiles")
      .select("id, handle")
      .in("id", [...userIds]);
    for (const p of profiles ?? []) {
      if (p.id && typeof p.handle === "string" && p.handle) {
        handleOf.set(String(p.id), p.handle);
      }
    }
  }
  const label = (uuid: unknown): string | null => {
    if (!uuid) return null;
    const id = String(uuid);
    return handleOf.get(id) ?? `${id.slice(0, 8)}…`;
  };

  for (const v of votesRes.data ?? []) {
    const rid = Number(v.report_id);
    const list = votesByReport.get(rid) ?? [];
    list.push({
      id: Number(v.id),
      stance: v.stance === "dispute" ? "dispute" : "corroborate",
      voter: label(v.user_id) ?? "unknown",
      evidenceUrl: str(v.evidence_url) || null,
      note: str(v.note) || null,
      createdAt: str(v.created_at),
    });
    votesByReport.set(rid, list);
  }

  for (const c of chipsRes.data ?? []) {
    const rid = Number(c.report_id);
    const list = chipsByReport.get(rid) ?? [];
    list.push({
      id: Number(c.id),
      kind: str(c.kind) || "url",
      value: str(c.value),
      contributor: label(c.added_by),
      // Column arrives with migration 0004; undefined reads as pending.
      accepted: typeof c.accepted === "boolean" ? c.accepted : null,
      createdAt: str(c.created_at),
    });
    chipsByReport.set(rid, list);
  }

  return {
    votesByReport,
    chipsByReport,
    votesError: votesRes.error?.message,
    chipsError: chipsRes.error?.message,
  };
}

async function loadRoleCounts(): Promise<{
  counts: Record<string, number> | null;
  error?: string;
}> {
  const sb = getServiceClient();
  const { data, error } = await sb.from("profiles").select("role").limit(5000);
  if (error) return { counts: null, error: error.message };
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const role = str(row.role) || "reader";
    counts[role] = (counts[role] ?? 0) + 1;
  }
  return { counts };
}

// ── page ───────────────────────────────────────────────────────────────────

export default async function DeskPage() {
  // Defense in depth: never trust that the proxy ran (the same rule every
  // server action follows). Basic auth OR mod session; anyone else sees a
  // 404, not the queue.
  const h = await headers();
  let accessLabel: string | null = null;
  if (verifyEditorAuth(h.get("authorization"))) {
    accessLabel = "EDITOR · BASIC AUTH";
  } else {
    const mod = await getModActor();
    if (mod) accessLabel = `MOD · ${(mod.handle ?? mod.id.slice(0, 8)).toUpperCase()}`;
  }
  if (!accessLabel) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const connected = hasSupabase();

  let drafts: DeskDraft[] = [];
  let reports: OpenReport[] = [];
  let refs: IncidentRef[] = [];
  let draftsError: string | undefined;
  let reportsError: string | undefined;
  let refsError: string | undefined;
  let votesByReport = new Map<number, DeskVote[]>();
  let chipsByReport = new Map<number, DeskChip[]>();
  let votesError: string | undefined;
  let chipsError: string | undefined;
  let roleCounts: Record<string, number> | null = null;
  let rolesError: string | undefined;

  if (connected) {
    const [d, r, i, p] = await Promise.all([
      loadDrafts(),
      loadReports(),
      loadIncidentRefs(),
      loadRoleCounts(),
    ]);
    drafts = d.drafts;
    draftsError = d.error;
    reports = r.reports;
    reportsError = r.error;
    refs = i.refs;
    refsError = i.error;
    roleCounts = p.counts;
    rolesError = p.error;

    const signals = await loadSignals(reports.map((rep) => rep.id));
    votesByReport = signals.votesByReport;
    chipsByReport = signals.chipsByReport;
    votesError = signals.votesError;
    chipsError = signals.chipsError;
  }

  // Group drafts by source in the canonical order; unknown sources last.
  const grouped = new Map<string, DeskDraft[]>();
  for (const draft of drafts) {
    const list = grouped.get(draft.source) ?? [];
    list.push(draft);
    grouped.set(draft.source, list);
  }
  const groupKeys = [
    ...SOURCE_ORDER.filter((s) => grouped.has(s)),
    ...[...grouped.keys()].filter((s) => !SOURCE_ORDER.includes(s)).sort(),
  ];

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 64px" }}>
      <div
        style={{
          ...mono,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          padding: "8px 0",
          fontSize: 12,
          fontWeight: 500,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <span>{today}</span>
        <span>{accessLabel} · NOT INDEXED</span>
      </div>

      <header style={{ padding: "32px 0 20px" }}>
        <h1 style={{ ...display, fontSize: 40, fontWeight: 600, margin: 0 }}>
          The Desk
        </h1>
        <p
          style={{
            ...mono,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: ".05em",
            color: "var(--meta)",
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          MONDAY SWEEP · EVERY PUBLISH IS A HUMAN DECISION · EVERYTHING SHIPS AS
          REPORTED · NOT CHECKED YET
        </p>
        <p style={{ marginTop: 12, marginBottom: 0, display: "flex", gap: 20 }}>
          <Link
            href="/"
            style={{ ...mono, fontSize: 12, fontWeight: 600, color: "var(--link)" }}
          >
            ← FRONT PAGE
          </Link>
          {process.env.NODE_ENV === "development" ? (
            <Link
              href="/desk/registry"
              style={{ ...mono, fontSize: 12, fontWeight: 600, color: "var(--link)" }}
            >
              THE DATABASE (LOCAL) →
            </Link>
          ) : null}
        </p>
      </header>
      <div className="double-rule" />

      {!connected ? (
        <section
          style={{
            background: "var(--panel)",
            border: "1px solid var(--rule)",
            padding: "24px 28px",
            marginTop: 32,
            maxWidth: 640,
          }}
        >
          <p
            style={{
              ...mono,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".05em",
              color: "var(--danger)",
              margin: 0,
            }}
          >
            DATABASE NOT CONNECTED
          </p>
          <h2 style={{ ...display, fontSize: 24, fontWeight: 600, margin: "8px 0" }}>
            The desk has nothing to show.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.55, marginBottom: 0 }}>
            Supabase is not provisioned in this environment, so there is no
            draft queue, no reports list, no vote tallies, and no ladder — and
            this page will not pretend otherwise. Once SUPABASE_URL and
            SUPABASE_SERVICE_ROLE_KEY are set and the migrations are applied,
            the 05:00 UTC sweep fills the queue and it appears here.
          </p>
        </section>
      ) : (
        <>
          {/* ── DRAFT QUEUE ──────────────────────────────────────────── */}
          <section>
            <h2 style={sectionHead}>DRAFT QUEUE · {drafts.length}</h2>
            {draftsError ? (
              <QueryError table="draft_incidents" message={draftsError} />
            ) : drafts.length === 0 ? (
              <EmptyState>Queue empty. Next sweep pulls at 05:00 UTC.</EmptyState>
            ) : (
              groupKeys.map((source) => (
                <div key={source}>
                  <h3
                    style={{
                      ...mono,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: ".05em",
                      color: "var(--meta)",
                      marginTop: 24,
                      marginBottom: 0,
                    }}
                  >
                    {SOURCE_LABEL[source] ?? source.toUpperCase()} ·{" "}
                    {grouped.get(source)!.length}
                  </h3>
                  {grouped.get(source)!.map((draft) => (
                    <DraftCard key={draft.id} draft={draft} incidents={refs} />
                  ))}
                </div>
              ))
            )}
          </section>

          {/* ── REPORTS ──────────────────────────────────────────────── */}
          <section>
            <h2 style={sectionHead}>READER REPORTS · {reports.length} OPEN</h2>
            {votesError && <QueryError table="verify_votes" message={votesError} />}
            {chipsError && <QueryError table="evidence_chips" message={chipsError} />}
            {reportsError ? (
              <QueryError table="reports" message={reportsError} />
            ) : reports.length === 0 ? (
              <EmptyState>
                No open reports. Reader reports land here the moment they are
                filed at /report — anonymous or signed-in alike.
              </EmptyState>
            ) : (
              reports.map((report) => (
                <div key={report.id}>
                  <ReportRow report={report} />
                  <DeskSignalsPanel
                    reportId={report.id}
                    reportStatus={report.status}
                    votes={votesByReport.get(report.id) ?? []}
                    chips={chipsByReport.get(report.id) ?? []}
                    incidents={refs}
                    votesOk={!votesError}
                    chipsOk={!chipsError}
                  />
                </div>
              ))
            )}
          </section>

          {/* ── CORRECTIONS COMPOSER ─────────────────────────────────── */}
          <section>
            <h2 style={sectionHead}>CORRECTIONS COMPOSER</h2>
            {refsError ? (
              <QueryError table="incidents" message={refsError} />
            ) : (
              <CorrectionsComposer incidents={refs} />
            )}
          </section>

          {/* ── THE LADDER ───────────────────────────────────────────── */}
          <section>
            <h2 style={sectionHead}>THE LADDER</h2>
            <LadderPanel roleCounts={roleCounts} error={rolesError} />
          </section>
        </>
      )}
    </main>
  );
}
