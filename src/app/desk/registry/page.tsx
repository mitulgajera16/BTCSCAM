import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";

import { getModActor, verifyEditorAuth } from "@/components/desk/auth";
import RegistryDraftCard from "@/components/desk/registry/RegistryDraftCard";
import RegistryPublishedRow from "@/components/desk/registry/RegistryPublishedRow";
import type {
  DbOnlyView,
  DraftView,
  PublishedView,
} from "@/components/desk/registry/types";
import { getServiceClient, hasServiceRole } from "@/lib/db";
import {
  isLocalRegistry,
  listDrafts,
  listPublished,
  loadReviewFlags,
} from "@/lib/registry/fs-state";
import { changedDataPaths } from "@/lib/registry/publish";
import { deriveSyncBadges, type DbRowLite } from "@/lib/registry/pure";

// The Registry — local-only lifecycle desk for file-based dossiers.
// Draft = data/drafts/, published = data/incidents/; publish and back-to-
// draft move files, seed/clear Supabase, and commit — so this page exists
// ONLY on a local dev server (isLocalRegistry) and 404s everywhere else,
// exactly like an unauthorized desk hit. A review queue must never show a
// cached yesterday: always rendered fresh.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Scam Database · The Desk — BTCSCAM",
  description:
    "Local-only case file lifecycle desk. Every publish is a human decision.",
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

type DbIncidentRow = {
  id: string;
  slug: string;
  title: string;
  last_updated: string | null;
  data: unknown;
};

async function loadDbRows(): Promise<{ rows: DbIncidentRow[]; error?: string }> {
  if (!hasServiceRole()) {
    return { rows: [], error: "no Supabase service key in this environment" };
  }
  const { data, error } = await getServiceClient()
    .from("incidents")
    .select("id, slug, title, last_updated, data")
    .order("last_updated", { ascending: false })
    .limit(500);
  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as DbIncidentRow[] };
}

export default async function RegistryPage() {
  if (!(await isLocalRegistry())) notFound();

  // Same access gate as the desk page: Basic auth OR mod session, verified
  // here regardless of the proxy.
  const h = await headers();
  let accessLabel: string | null = null;
  if (verifyEditorAuth(h.get("authorization"))) {
    accessLabel = "EDITOR · BASIC AUTH";
  } else {
    const mod = await getModActor();
    if (mod) accessLabel = `MOD · ${(mod.handle ?? mod.id.slice(0, 8)).toUpperCase()}`;
  }
  if (!accessLabel) notFound();

  const [drafts, published, flags, changed, db] = await Promise.all([
    listDrafts(),
    listPublished(),
    loadReviewFlags(),
    changedDataPaths(),
    loadDbRows(),
  ]);

  const draftViews: DraftView[] = drafts.map((f) => ({
    slug: f.doc.slug,
    fileName: f.fileName,
    title: f.doc.title ?? "(untitled)",
    trustState: String(f.doc.trustState ?? "?"),
    severity: String(f.doc.severity ?? "?"),
    categories: Array.isArray(f.doc.categories) ? f.doc.categories : [],
    flags: flags.get(f.fileName) ?? [],
    sourceCount: Array.isArray(f.doc.sources) ? f.doc.sources.length : 0,
    parseError: f.parseError ?? null,
  }));

  const rowBySlug = new Map(db.rows.map((r) => [r.slug, r]));
  const publishedViews: PublishedView[] = published.map((f) => {
    const row = rowBySlug.get(f.doc.slug);
    const dbRow: DbRowLite = row
      ? { lastUpdated: row.last_updated, data: row.data }
      : null;
    const uncommitted =
      changed === null ||
      changed.has(`data/incidents/${f.fileName}`) ||
      changed.has(`data/drafts/${f.fileName}`);
    const badges = f.parseError
      ? [{ label: `BROKEN JSON — ${f.parseError}`, ok: false }]
      : deriveSyncBadges(f.doc, db.error ? null : dbRow, uncommitted);
    if (db.error) badges.unshift({ label: `DB UNREADABLE — ${db.error}`, ok: false });
    if (changed === null) badges.push({ label: "GIT STATUS UNAVAILABLE", ok: false });
    return {
      slug: f.doc.slug,
      id: f.doc.id ?? f.fileName.replace(/\.json$/, ""),
      title: f.doc.title ?? f.fileName,
      publishedDate: String(f.doc.published ?? "?"),
      badges,
    };
  });

  const fileSlugs = new Set(published.map((f) => f.doc.slug));
  const dbOnly: DbOnlyView[] = db.rows
    .filter((r) => !fileSlugs.has(r.slug))
    .map((r) => ({ id: r.id, slug: r.slug, title: r.title }));

  const today = new Date().toISOString().slice(0, 10);

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
        <span>{accessLabel} · LOCAL ONLY · NOT INDEXED</span>
      </div>

      <header style={{ padding: "32px 0 20px" }}>
        <h1 style={{ ...display, fontSize: 40, fontWeight: 600, margin: 0 }}>
          The Scam Database
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
          CASE FILE LIFECYCLE · EVERY PUBLISH IS A HUMAN DECISION · RUNS ON YOUR
          MACHINE, WRITES FILES + DATABASE + GIT
        </p>
        <p style={{ marginTop: 12, marginBottom: 0 }}>
          <Link
            href="/desk"
            style={{ ...mono, fontSize: 12, fontWeight: 600, color: "var(--link)" }}
          >
            ← THE DESK
          </Link>
        </p>
      </header>
      <div className="double-rule" />

      <section>
        <h2 style={sectionHead}>DRAFTS · {draftViews.length}</h2>
        {draftViews.length === 0 ? (
          <EmptyState>No file drafts. New case files land in data/drafts/.</EmptyState>
        ) : (
          draftViews.map((d) => <RegistryDraftCard key={d.fileName} draft={d} />)
        )}
      </section>

      <section>
        <h2 style={sectionHead}>PUBLISHED · {publishedViews.length}</h2>
        {publishedViews.length === 0 ? (
          <EmptyState>Nothing published from files yet.</EmptyState>
        ) : (
          publishedViews.map((p) => <RegistryPublishedRow key={p.id} row={p} />)
        )}
      </section>

      <section>
        <h2 style={sectionHead}>DB-ONLY · {dbOnly.length}</h2>
        <p style={{ ...mono, fontSize: 12, color: "var(--meta)", marginTop: 12 }}>
          Published from the ingest queue at /desk — they have no file in
          data/incidents/, so this desk lists them read-only.
        </p>
        {dbOnly.map((r) => (
          <p key={r.id} style={{ ...mono, fontSize: 12, margin: "6px 0" }}>
            {r.id} ·{" "}
            <a
              href={`/scam/${r.slug}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--link)" }}
            >
              {r.title}
            </a>
          </p>
        ))}
      </section>
    </main>
  );
}
