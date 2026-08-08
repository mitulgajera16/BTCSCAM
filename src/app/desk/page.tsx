import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyEditorAuth } from "@/components/desk/auth";
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

// The Desk — Monday Sweep. Editor-only (src/proxy.ts enforces Basic auth on
// /desk/*; every server action re-verifies it, and so does this page — the
// GET render leaks reporter PII if it ever trusts the proxy alone). Always
// rendered fresh: a review queue must never show a cached yesterday.
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

async function loadReports(): Promise<{ reports: DeskReport[]; error?: string }> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("reports")
    .select("*")
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return { reports: [], error: error.message };
  const reports: DeskReport[] = (data ?? []).map((row) => ({
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
  }));
  return { reports };
}

// Merge and corrections write to the incidents TABLE, so only database rows
// are offered as targets — a bundled-JSON incident that has not been seeded
// yet would dead-end with "not found".
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

// ── page ───────────────────────────────────────────────────────────────────

export default async function DeskPage() {
  // Defense in depth: never trust that the proxy ran (the same rule every
  // server action follows). Unauthorized GETs see a 404, not the queue.
  const h = await headers();
  if (!verifyEditorAuth(h.get("authorization"))) {
    notFound();
  }

  const today = new Date().toISOString().slice(0, 10);
  const connected = hasSupabase();

  let drafts: DeskDraft[] = [];
  let reports: DeskReport[] = [];
  let refs: IncidentRef[] = [];
  let draftsError: string | undefined;
  let reportsError: string | undefined;
  let refsError: string | undefined;

  if (connected) {
    const [d, r, i] = await Promise.all([
      loadDrafts(),
      loadReports(),
      loadIncidentRefs(),
    ]);
    drafts = d.drafts;
    draftsError = d.error;
    reports = r.reports;
    reportsError = r.error;
    refs = i.refs;
    refsError = i.error;
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
        <span>EDITOR ONLY · NOT INDEXED</span>
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
          REPORTED · UNVERIFIED
        </p>
        <p style={{ marginTop: 12, marginBottom: 0 }}>
          <Link
            href="/"
            style={{ ...mono, fontSize: 12, fontWeight: 600, color: "var(--link)" }}
          >
            ← FRONT PAGE
          </Link>
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
            draft queue, no reports list, and no corrections composer — and this
            page will not pretend otherwise. Once SUPABASE_URL and
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
            <h2 style={sectionHead}>READER REPORTS · {reports.length} NEW</h2>
            {reportsError ? (
              <QueryError table="reports" message={reportsError} />
            ) : reports.length === 0 ? (
              <EmptyState>
                No new reports. Reader reports land here the moment they are
                filed at /report.
              </EmptyState>
            ) : (
              reports.map((report) => <ReportRow key={report.id} report={report} />)
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
        </>
      )}
    </main>
  );
}
