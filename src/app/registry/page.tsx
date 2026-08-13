import Link from "next/link";
import type { Metadata } from "next";
import { isStale, TRUST_LABEL, SEVERITY_LABEL } from "@/lib/incidents";
import { fetchAllIncidents } from "@/lib/incidents-db";
import RegistryExplorer, {
  type RegistryRow,
} from "@/components/registry/RegistryExplorer";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif" };

export const metadata: Metadata = {
  // Layout template appends "— BTCSCAM"; never hardcode the suffix here.
  title: "The Scam Database",
  description:
    "Every scam BTCSCAM has on file, in one list — sort it by type, by how bad it is, and by how well we have proved it. Each entry links to its full case file. Check before you send.",
  alternates: { canonical: "/registry" },
};

export default async function RegistryPage() {
  const incidents = await fetchAllIncidents();
  const rows: RegistryRow[] = incidents.map((i) => ({
    id: i.id,
    slug: i.slug,
    title: i.title,
    summary: i.summary,
    severity: i.severity,
    trustState: i.trustState,
    ongoing: i.ongoing ?? false,
    categories: i.categories,
    firstObserved: i.firstObserved,
    lastUpdated: i.lastUpdated,
    vendor: i.entities?.vendor,
    lossNative: i.impact?.lossNative,
    stale: isStale(i),
  }));
  // Honest numbers: derived from the registry data itself (max lastUpdated),
  // never from the build clock — a build is not a sweep.
  const lastUpdated = incidents.reduce(
    (max, i) => (i.lastUpdated > max ? i.lastUpdated : max),
    incidents[0]?.lastUpdated ?? "",
  );

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px" }}>
      <nav style={{ ...mono, fontSize: 12, padding: "16px 0" }}>
        <Link href="/">← FRONT PAGE</Link>
        <span style={{ color: "var(--meta)" }}> / THE DATABASE</span>
      </nav>

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          flexWrap: "wrap",
          marginTop: 8,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              ...mono,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: ".05em",
              color: "var(--meta)",
              margin: 0,
            }}
          >
            EVERY SCAM WE HAVE ON FILE · SOURCES OR IT DIDN&apos;T HAPPEN
          </p>
          <h1
            style={{
              ...display,
              fontSize: 32,
              fontWeight: 600,
              lineHeight: 1.15,
              margin: "6px 0 0",
            }}
          >
            The Scam Database
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--meta)",
              margin: "10px 0 0",
              maxWidth: "56ch",
            }}
          >
            Every scam we have on file — ranked by how bad it is, labelled by
            how well we have proved it, and linked to its case file. Check
            before you send.
          </p>
        </div>
        <div
          style={{
            ...mono,
            fontSize: 12,
            fontWeight: 500,
            textAlign: "right",
            color: "var(--meta)",
          }}
        >
          CASE FILES LAST UPDATED
          <br />
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>
            {lastUpdated}
          </span>
        </div>
      </header>

      <RegistryExplorer
        rows={rows}
        trustLabel={TRUST_LABEL}
        severityLabel={SEVERITY_LABEL}
      />
    </main>
  );
}
