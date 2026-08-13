import type { ReactNode } from "react";
import Link from "next/link";
import { getAllIncidents, TRUST_LABEL, type Incident } from "@/lib/incidents";
import SeverityChip from "@/components/primitives/severity-chip";

const mono = { fontFamily: "var(--font-plex-mono), monospace" } as const;
const display = { fontFamily: "var(--font-fraunces), serif" } as const;

/* ── Kicker: mono label above the headline, orange accent rule ───────── */
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        ...mono,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: ".05em",
        margin: "24px 0 0",
      }}
    >
      <span style={{ borderBottom: "2px solid var(--orange)", paddingBottom: 4 }}>
        {children}
      </span>
    </p>
  );
}

/* ── Dek: standfirst under the headline. Renders a div (MDX may hand it
   an already-wrapped <p>), with scoped CSS so either shape reads 18px. ── */
export function Dek({ children }: { children: ReactNode }) {
  return (
    <div
      className="guide-dek"
      style={{ fontSize: 18, lineHeight: 1.55, marginTop: 20, maxWidth: "62ch" }}
    >
      <style>{`.guide-dek p { font-size: 18px !important; line-height: 1.55 !important; margin: 0 !important; }`}</style>
      {children}
    </div>
  );
}

/* ── Dated byline ────────────────────────────────────────────────────── */
export function Byline({
  published,
  sourcesVerified,
}: {
  published: string;
  sourcesVerified: string;
}) {
  return (
    <p
      style={{
        ...mono,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: ".05em",
        color: "var(--meta)",
        borderBottom: "1px solid var(--rule)",
        paddingBottom: 16,
        marginTop: 12,
      }}
    >
      PUBLISHED {published} · SOURCES CHECKED {sourcesVerified} · CORRECTIONS
      ARE PUBLIC
    </p>
  );
}

/* ── Newspaper data table. Pass literal <tr><td>…</td></tr> children. ── */
const tableCss = `
.guide-table table { border-collapse: collapse; width: 100%; }
.guide-table th {
  font-family: var(--font-plex-mono), monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .05em;
  text-transform: uppercase;
  text-align: left;
  border-bottom: 2px solid var(--ink);
  padding: 8px 12px 8px 0;
  color: var(--ink);
}
.guide-table td {
  font-size: 14px;
  line-height: 1.5;
  border-bottom: 1px solid var(--rule);
  padding: 10px 12px 10px 0;
  vertical-align: top;
}
.guide-table strong { font-weight: 700; }
`;

export function GuideTable({
  head,
  children,
}: {
  head: string[];
  children: ReactNode;
}) {
  return (
    <figure className="guide-table" style={{ margin: "20px 0", overflowX: "auto" }}>
      <style>{tableCss}</style>
      <table>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </figure>
  );
}

/* ── Cross-link block: real incidents pulled from the registry ───────── */
/* Standards: loss figures carry a confidence grade and an as-of date —
   on every path, for all three grades, native or USD. */
function lossLine(i: Incident): string | null {
  if (!i.impact) return null;
  const base =
    i.impact.lossNative ??
    (i.impact.lossUSD ? `$${i.impact.lossUSD.toLocaleString("en-US")}` : null);
  if (!base) return null;
  const suffix = [
    i.impact.confidence?.toUpperCase(),
    i.impact.asOf ? `AS OF ${i.impact.asOf}` : undefined,
  ]
    .filter(Boolean)
    .join(" · ");
  return suffix ? `${base} (${suffix})` : base;
}

export function WhyThisMatters({ ids }: { ids: string[] }) {
  const all = getAllIncidents();
  const incidents = ids
    .map((id) => all.find((i) => i.id === id))
    .filter((i): i is Incident => Boolean(i));
  if (incidents.length === 0) return null;
  return (
    <aside className="no-print" style={{ marginTop: 48 }}>
      <h2
        style={{
          ...mono,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: ".05em",
          color: "var(--danger)",
          borderBottom: "2px solid var(--ink)",
          paddingBottom: 8,
          margin: 0,
        }}
      >
        WHY THIS MATTERS — REAL CASES
      </h2>
      {incidents.map((i) => {
        const loss = lossLine(i);
        return (
          <article
            key={i.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 16,
              padding: "16px 0",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <SeverityChip severity={i.severity} length="code" />
                <span
                  style={{
                    ...mono,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".05em",
                    padding: "2px 8px",
                    border: "1px solid var(--ink)",
                    background: i.trustState === "verified" ? "var(--ink)" : "transparent",
                    color: i.trustState === "verified" ? "var(--paper)" : "var(--ink)",
                  }}
                >
                  {TRUST_LABEL[i.trustState]}
                </span>
              </div>
              <h3
                style={{ ...display, fontSize: 21, fontWeight: 600, lineHeight: 1.3, margin: 0 }}
              >
                <Link href={`/scam/${i.slug}`}>{i.title}</Link>
              </h3>
              <p style={{ ...mono, fontSize: 12, color: "var(--meta)", margin: "8px 0 0" }}>
                FIRST SEEN {i.firstObserved} · UPDATED {i.lastUpdated}
              </p>
            </div>
            <div style={{ ...mono, fontSize: 12, textAlign: "right", color: "var(--meta)" }}>
              {loss && (
                <div style={{ color: "var(--danger)", fontWeight: 600 }}>{loss}</div>
              )}
              <Link
                href={`/scam/${i.slug}`}
                style={{ fontWeight: 600, color: "var(--link)" }}
              >
                READ THE CASE FILE →
              </Link>
            </div>
          </article>
        );
      })}
    </aside>
  );
}

/* ── Closing sourced footnote, double-ruled ──────────────────────────── */
export function SourceNote({ children }: { children: ReactNode }) {
  return (
    <footer
      className="guide-source-note"
      style={{
        borderTop: "3px double var(--ink)",
        marginTop: 48,
        paddingTop: 16,
        fontSize: 14,
        lineHeight: 1.6,
        color: "var(--meta)",
      }}
    >
      <style>{`.guide-source-note p { font-size: 14px !important; line-height: 1.6 !important; margin: 0 !important; }`}</style>
      {children}
    </footer>
  );
}
