"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Incident, TrustState } from "@/lib/incidents";

type Severity = Incident["severity"];

export interface RegistryRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  severity: Severity;
  trustState: TrustState;
  ongoing: boolean;
  categories: string[];
  firstObserved: string;
  lastUpdated: string;
  vendor?: string;
  lossNative?: string;
  stale: boolean;
}

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif" };

const SEVERITIES: Severity[] = ["S1", "S2", "S3", "S4"];
const TRUST_ORDER: TrustState[] = [
  "reported",
  "corroborated",
  "verified",
  "resolved",
  "disputed",
];

/* Severity band colors — danger family for active loss, muted for the rest.
   Red stays danger-only per editorial law. */
const SEV_COLOR: Record<Severity, string> = {
  S1: "var(--danger)",
  S2: "var(--tick-down)",
  S3: "var(--meta)",
  S4: "var(--rule)",
};

function SeverityChip({ severity }: { severity: Severity }) {
  const active = severity === "S1" || severity === "S2";
  return (
    <span
      style={{
        ...mono,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".05em",
        padding: "2px 8px",
        border: `1px solid ${active ? "var(--danger)" : "var(--rule)"}`,
        background: severity === "S1" ? "var(--danger)" : "transparent",
        color:
          severity === "S1"
            ? "#fff"
            : active
              ? "var(--danger)"
              : "var(--meta)",
      }}
    >
      {severity}
    </span>
  );
}

function TrustChip({
  state,
  label,
}: {
  state: TrustState;
  label: string;
}) {
  return (
    <span
      style={{
        ...mono,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".05em",
        padding: "2px 8px",
        border: "1px solid var(--ink)",
        background: state === "verified" ? "var(--ink)" : "transparent",
        color: state === "verified" ? "var(--paper)" : "var(--ink)",
      }}
    >
      {label}
    </span>
  );
}

function FacetChip({
  label,
  count,
  active,
  onToggle,
}: {
  label: string;
  count: number;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      style={{
        ...mono,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".05em",
        padding: "4px 10px",
        border: `1px solid ${active ? "var(--ink)" : "var(--rule)"}`,
        background: active ? "var(--ink)" : "transparent",
        color: active ? "var(--paper)" : "var(--meta)",
      }}
    >
      {label} ({count})
    </button>
  );
}

function FacetLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        ...mono,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".05em",
        color: "var(--meta)",
        minWidth: 104,
      }}
    >
      {children}
    </span>
  );
}

export default function RegistryExplorer({
  rows,
  trustLabel,
  severityLabel,
}: {
  rows: RegistryRow[];
  trustLabel: Record<TrustState, string>;
  severityLabel: Record<Severity, string>;
}) {
  const [sevFilter, setSevFilter] = useState<Severity | null>(null);
  const [trustFilter, setTrustFilter] = useState<TrustState | null>(null);
  const [catFilter, setCatFilter] = useState<string | null>(null);

  /* Facet counts — always computed from the full dataset, never invented. */
  const sevCounts = useMemo(() => {
    const c = { S1: 0, S2: 0, S3: 0, S4: 0 } as Record<Severity, number>;
    for (const r of rows) c[r.severity] += 1;
    return c;
  }, [rows]);

  const trustCounts = useMemo(() => {
    const c = new Map<TrustState, number>();
    for (const r of rows) c.set(r.trustState, (c.get(r.trustState) ?? 0) + 1);
    return c;
  }, [rows]);

  const catCounts = useMemo(() => {
    const c = new Map<string, number>();
    for (const r of rows)
      for (const cat of r.categories) c.set(cat, (c.get(cat) ?? 0) + 1);
    return new Map(
      [...c.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)),
    );
  }, [rows]);

  /* Worst active incident: activity comes from the explicit `ongoing`
     flag, never from trust state — trust words never do severity work.
     Lowest S-number wins, most recently updated breaks ties. */
  const worst = useMemo(() => {
    const active = rows.filter((r) => r.ongoing);
    if (active.length === 0) return null;
    return [...active].sort(
      (a, b) =>
        a.severity.localeCompare(b.severity) ||
        (a.lastUpdated < b.lastUpdated ? 1 : -1),
    )[0];
  }, [rows]);

  const critical = worst?.severity === "S1";

  const filtered = rows.filter(
    (r) =>
      (!sevFilter || r.severity === sevFilter) &&
      (!trustFilter || r.trustState === trustFilter) &&
      (!catFilter || r.categories.includes(catFilter)),
  );

  const anyFilter = sevFilter !== null || trustFilter !== null || catFilter !== null;
  const clearAll = () => {
    setSevFilter(null);
    setTrustFilter(null);
    setCatFilter(null);
  };

  return (
    <div>
      {/* ── SEVERITY STRIP ─────────────────────────────────────────── */}
      <section
        aria-label="How bad these scams are, at a glance"
        style={{
          background: "var(--paper)",
          border: "1px solid var(--rule)",
          padding: "18px 20px",
          marginTop: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px 28px",
            flexWrap: "wrap",
            alignItems: "baseline",
          }}
        >
          {SEVERITIES.map((sev) => {
            const n = sevCounts[sev];
            const selected = sevFilter === sev;
            const dimmed = sevFilter !== null && !selected;
            return (
              <button
                key={sev}
                type="button"
                onClick={() => n > 0 && setSevFilter(selected ? null : sev)}
                aria-pressed={selected}
                aria-label={`Show only ${severityLabel[sev]}`}
                disabled={n === 0}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  background: "transparent",
                  border: "none",
                  borderBottom: selected
                    ? "2px solid var(--ink)"
                    : "2px solid transparent",
                  padding: "0 0 4px",
                  opacity: n === 0 ? 0.35 : dimmed ? 0.45 : 1,
                  cursor: n === 0 ? "default" : "pointer",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    flex: "none",
                    alignSelf: "center",
                    background: SEV_COLOR[sev],
                  }}
                  aria-hidden="true"
                />
                <span style={{ fontSize: 24, fontWeight: 900 }}>{n}</span>
                <span
                  style={{
                    ...mono,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".05em",
                    color: "var(--meta)",
                  }}
                >
                  {severityLabel[sev]}
                </span>
              </button>
            );
          })}
          <span
            style={{
              ...mono,
              marginLeft: "auto",
              fontSize: 12,
              color: "var(--meta)",
            }}
          >
            {rows.length} SCAMS ON FILE
          </span>
        </div>

        {/* proportional band */}
        <div
          style={{
            display: "flex",
            height: 8,
            marginTop: 14,
            background: "var(--panel)",
            overflow: "hidden",
          }}
          aria-hidden="true"
        >
          {SEVERITIES.map((sev) =>
            sevCounts[sev] > 0 ? (
              <span
                key={sev}
                style={{
                  width: `${(sevCounts[sev] / rows.length) * 100}%`,
                  background: SEV_COLOR[sev],
                }}
              />
            ) : null,
          )}
        </div>

        {/* worst active call-out */}
        {worst && (
          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: "8px 12px",
              alignItems: "baseline",
              flexWrap: "wrap",
              padding: "10px 14px",
              background: critical ? "var(--danger-bg)" : "var(--panel)",
              borderLeft: `3px solid ${critical ? "var(--danger)" : "var(--rule)"}`,
            }}
          >
            <span
              style={{
                ...mono,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".05em",
                padding: "2px 8px",
                background: critical ? "var(--danger)" : "transparent",
                border: `1px solid ${critical ? "var(--danger)" : "var(--rule)"}`,
                color: critical ? "#fff" : "var(--meta)",
              }}
            >
              {critical ? "MOST URGENT" : "WORST ONE STILL GOING"}
            </span>
            <Link
              href={`/scam/${worst.slug}`}
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: critical ? "var(--danger-ink)" : "var(--ink)",
              }}
            >
              {worst.title}
            </Link>
            <span
              style={{
                ...mono,
                fontSize: 12,
                color: "var(--meta)",
                marginLeft: "auto",
              }}
            >
              {worst.lossNative && (
                <span style={{ color: "var(--danger)", fontWeight: 600 }}>
                  {worst.lossNative} ·{" "}
                </span>
              )}
              UPDATED {worst.lastUpdated}
            </span>
          </div>
        )}
      </section>

      {/* ── FACETS ─────────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "baseline",
          }}
        >
          <FacetLabel>TYPE</FacetLabel>
          {[...catCounts.entries()].map(([cat, n]) => (
            <FacetChip
              key={cat}
              label={cat.replace(/-/g, " ").toUpperCase()}
              count={n}
              active={catFilter === cat}
              onToggle={() => setCatFilter(catFilter === cat ? null : cat)}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "baseline",
          }}
        >
          <FacetLabel>PROOF LEVEL</FacetLabel>
          {TRUST_ORDER.filter((t) => (trustCounts.get(t) ?? 0) > 0).map((t) => (
            <FacetChip
              key={t}
              label={trustLabel[t]}
              count={trustCounts.get(t) ?? 0}
              active={trustFilter === t}
              onToggle={() => setTrustFilter(trustFilter === t ? null : t)}
            />
          ))}
        </div>
      </div>

      {/* ── RESULT COUNT ───────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "baseline",
          marginTop: 18,
        }}
      >
        <span style={{ ...mono, fontSize: 12, color: "var(--meta)" }}>
          {filtered.length} OF {rows.length} SHOWN
        </span>
        {anyFilter && (
          <button
            type="button"
            onClick={clearAll}
            style={{
              ...mono,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".05em",
              padding: "3px 10px",
              background: "transparent",
              border: "1px solid var(--ink)",
              color: "var(--ink)",
            }}
          >
            CLEAR FILTERS
          </button>
        )}
      </div>

      {/* ── THE INDEX ──────────────────────────────────────────────── */}
      <div style={{ marginTop: 10, borderTop: "1px solid var(--ink)" }}>
        {filtered.map((r) => (
          <article
            key={r.id}
            style={{
              display: "flex",
              gap: "8px 20px",
              flexWrap: "wrap",
              padding: "18px 0",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            {/* dateline */}
            <div style={{ flex: "none", width: 104 }}>
              <div
                style={{
                  ...mono,
                  fontSize: 12,
                  color: "var(--meta)",
                  opacity: r.stale ? 0.55 : 1,
                }}
              >
                {r.firstObserved}
              </div>
              {r.stale && (
                <div
                  style={{
                    ...mono,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".05em",
                    color: "var(--meta)",
                    border: "1px solid var(--rule)",
                    padding: "1px 5px",
                    marginTop: 6,
                    display: "inline-block",
                  }}
                >
                  NOT UPDATED IN 90+ DAYS
                </div>
              )}
            </div>

            {/* main column */}
            <div style={{ flex: "1 1 360px", minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 8,
                }}
              >
                <SeverityChip severity={r.severity} />
                <TrustChip
                  state={r.trustState}
                  label={trustLabel[r.trustState]}
                />
                {r.ongoing && (
                  <span
                    style={{
                      ...mono,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: ".05em",
                      padding: "2px 8px",
                      color: "var(--danger)",
                      border: "1px solid var(--danger)",
                    }}
                  >
                    ● STILL HAPPENING
                  </span>
                )}
              </div>
              <h3
                style={{
                  ...display,
                  fontSize: 21,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  margin: 0,
                }}
              >
                <Link href={`/scam/${r.slug}`}>{r.title}</Link>
              </h3>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--meta)",
                  lineHeight: 1.5,
                  margin: "6px 0 0",
                  maxWidth: "70ch",
                }}
              >
                {r.summary}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  alignItems: "baseline",
                  marginTop: 10,
                }}
              >
                {r.vendor && (
                  <span
                    style={{
                      ...mono,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: ".05em",
                      color: "var(--meta)",
                      marginRight: 6,
                    }}
                  >
                    COMPANY: {r.vendor.toUpperCase()}
                  </span>
                )}
                {r.categories.map((cat) => (
                  <span
                    key={cat}
                    style={{
                      ...mono,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: ".05em",
                      padding: "1px 6px",
                      border: "1px solid var(--rule)",
                      color: "var(--meta)",
                    }}
                  >
                    {cat.replace(/-/g, " ").toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            {/* right column */}
            <div
              style={{
                ...mono,
                fontSize: 12,
                textAlign: "right",
                color: "var(--meta)",
                marginLeft: "auto",
              }}
            >
              {r.lossNative && (
                <div style={{ color: "var(--danger)", fontWeight: 600 }}>
                  {r.lossNative}
                </div>
              )}
              <div style={{ opacity: r.stale ? 0.55 : 1 }}>
                UPDATED {r.lastUpdated}
              </div>
              <Link
                href={`/scam/${r.slug}`}
                style={{
                  ...mono,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--link)",
                  display: "inline-block",
                  marginTop: 6,
                }}
              >
                CASE FILE →
              </Link>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div
            role="status"
            style={{
              padding: "44px 24px",
              textAlign: "center",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <div style={{ ...display, fontSize: 21, fontWeight: 600 }}>
              No scam on file matches the filters you picked.
            </div>
            <p
              style={{
                margin: "10px auto 0",
                fontSize: 16,
                lineHeight: 1.6,
                color: "var(--meta)",
                maxWidth: "48ch",
              }}
            >
              Not being listed here does not mean something is safe. It may
              just mean nobody has reported it to us yet.
            </p>
            <button
              type="button"
              onClick={clearAll}
              style={{
                ...mono,
                marginTop: 16,
                padding: "10px 22px",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: ".05em",
                background: "var(--ink)",
                color: "var(--paper)",
                border: "1px solid var(--ink)",
              }}
            >
              CLEAR FILTERS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
