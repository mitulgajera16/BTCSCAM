import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllIncidents,
  isStale,
  TRUST_LABEL,
  SEVERITY_LABEL,
} from "@/lib/incidents";
import {
  fetchAllIncidents,
  fetchCorrections,
  fetchIncidentBySlug,
} from "@/lib/incidents-db";
import { SITE_URL } from "@/lib/site";
import { liveGuidesFor } from "@/lib/guides";
import { coverFor } from "@/lib/covers";
import { PlateFigure } from "@/components/plate";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

export function generateStaticParams() {
  return getAllIncidents().map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/scam/[slug]">) {
  const { slug } = await params;
  const incident = await fetchIncidentBySlug(slug);
  if (!incident) return {};
  const name = incident.title.split(":")[0];
  return {
    // Growth-playbook title pattern; layout template appends "— BTCSCAM".
    title: `${name}: what happened and what's verified`,
    description: incident.summary,
    alternates: { canonical: `/scam/${incident.slug}` },
    // Victim search grammar (I-8) — aliases + the phrases victims type.
    keywords: [...(incident.aliases ?? []), ...(incident.phrases ?? [])],
  };
}

const CLAIM_STATUS_LABEL: Record<string, string> = {
  "primary-confirmed": "CONFIRMED BY A FIRSTHAND SOURCE",
  "reported-unconfirmed": "REPORTED · NOBODY ELSE HAS CONFIRMED IT",
  disputed: "DISPUTED",
  retracted: "TAKEN BACK BY THE SOURCE",
};

function SectionRule({ label, danger }: { label: string; danger?: boolean }) {
  return (
    <h2
      style={{
        ...mono,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: ".05em",
        color: danger ? "var(--danger)" : "var(--ink)",
        borderBottom: "2px solid var(--ink)",
        paddingBottom: 8,
        marginTop: 40,
      }}
    >
      {label}
    </h2>
  );
}

export default async function IncidentPage({
  params,
}: PageProps<"/scam/[slug]">) {
  const { slug } = await params;
  const incident = await fetchIncidentBySlug(slug);
  if (!incident) notFound();

  // Corrections live in two places: the incident document itself (bundled
  // JSON / data jsonb) and the desk-composed corrections table. Merge and
  // dedupe by date+note so the ledger is complete without repeats.
  const cover = coverFor(incident.slug, incident.categories);

  const dbCorrections = await fetchCorrections(incident.id);
  const correctionsSeen = new Set<string>();
  const corrections = [
    ...(incident.corrections ?? []),
    ...dbCorrections.map((c) => ({ date: c.correctedOn, note: c.note })),
  ]
    .filter((c) => {
      const key = `${c.date}|${c.note}`;
      if (correctionsSeen.has(key)) return false;
      correctionsSeen.add(key);
      return true;
    })
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  // Related dossiers resolve against the same registry the page was read from.
  const relatedPool =
    incident.relatedIncidents && incident.relatedIncidents.length > 0
      ? await fetchAllIncidents()
      : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: incident.title,
    description: incident.summary,
    datePublished: incident.published,
    dateModified: incident.lastUpdated,
    url: `${SITE_URL}/scam/${incident.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/scam/${incident.slug}`,
    },
    author: {
      "@type": "Organization",
      name: "BTCSCAM",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "BTCSCAM",
      url: SITE_URL,
    },
  };

  return (
    <>
    <main style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 64px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <nav style={{ ...mono, fontSize: 12, padding: "16px 0" }}>
        <Link href="/">← FRONT PAGE</Link>
        <span style={{ color: "var(--meta)" }}> / </span>
        <Link href="/registry">THE DATABASE</Link>
        <span style={{ color: "var(--meta)" }}> / CASE FILE</span>
      </nav>

      {isStale(incident) && (
        <div
          role="status"
          style={{
            ...mono,
            fontSize: 12,
            background: "var(--panel)",
            border: "1px solid var(--rule)",
            padding: "10px 14px",
            marginBottom: 16,
          }}
        >
          ⚠ OUT OF DATE — we last updated this case file on{" "}
          {incident.lastUpdated}. Things may have changed since then.
          Double-check anything here before you act on it.
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <span
          style={{
            ...mono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".05em",
            padding: "2px 8px",
            background: incident.severity === "S1" ? "var(--danger)" : "transparent",
            border: `1px solid ${["S1", "S2"].includes(incident.severity) ? "var(--danger)" : "var(--rule)"}`,
            color:
              incident.severity === "S1"
                ? "#fff"
                : ["S2"].includes(incident.severity)
                  ? "var(--danger)"
                  : "var(--meta)",
          }}
        >
          {SEVERITY_LABEL[incident.severity]}
        </span>
        <span
          style={{
            ...mono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".05em",
            padding: "2px 8px",
            border: "1px solid var(--ink)",
            background: incident.trustState === "verified" ? "var(--ink)" : "transparent",
            color: incident.trustState === "verified" ? "var(--paper)" : "var(--ink)",
          }}
        >
          {TRUST_LABEL[incident.trustState]}
        </span>
        {incident.ongoing && (
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
            ● ONGOING
          </span>
        )}
      </div>

      <h1 style={{ ...display, fontSize: "clamp(24px, 5vw, 40px)", lineHeight: 1.2, margin: 0 }}>
        {incident.title}
      </h1>
      <p style={{ ...mono, fontSize: 12, color: "var(--meta)", marginTop: 12 }}>
        FIRST SEEN {incident.firstObserved} · PUBLISHED {incident.published}{" "}
        · UPDATED {incident.lastUpdated}
        {incident.entities?.vendor && ` · COMPANY: ${incident.entities.vendor.toUpperCase()}`}
      </p>

      <PlateFigure cover={cover} priority />

      <p style={{ fontSize: 18, lineHeight: 1.55, marginTop: 24 }}>
        {incident.summary}
      </p>

      {(incident.aliases?.length || incident.phrases?.length) ? (
        <p style={{ ...mono, fontSize: 12, color: "var(--meta)", lineHeight: 1.7, marginTop: 12 }}>
          PEOPLE ALSO SEARCH FOR:{" "}
          {[...(incident.aliases ?? []), ...(incident.phrases ?? [])].map(
            (p, idx, arr) => (
              <span key={p}>
                &ldquo;{p}&rdquo;{idx < arr.length - 1 ? " · " : ""}
              </span>
            ),
          )}
        </p>
      ) : null}

      {incident.impact && (
        <div
          style={{
            display: "flex",
            gap: 32,
            background: "var(--panel)",
            padding: "16px 20px",
            marginTop: 20,
            flexWrap: "wrap",
          }}
        >
          {incident.impact.lossNative && (
            <div>
              <div style={{ ...mono, fontSize: 11, color: "var(--meta)", letterSpacing: ".05em" }}>LOSSES</div>
              <div style={{ ...mono, fontSize: 18, fontWeight: 600, color: "var(--danger)" }}>
                {incident.impact.lossNative}
              </div>
            </div>
          )}
          {incident.impact.victims && (
            <div>
              <div style={{ ...mono, fontSize: 11, color: "var(--meta)", letterSpacing: ".05em" }}>VICTIMS</div>
              <div style={{ ...mono, fontSize: 18, fontWeight: 600 }}>{incident.impact.victims}</div>
            </div>
          )}
          {incident.impact.confidence && (
            <div>
              <div style={{ ...mono, fontSize: 11, color: "var(--meta)", letterSpacing: ".05em" }}>HOW SURE WE ARE</div>
              <div style={{ ...mono, fontSize: 18, fontWeight: 600 }}>
                {incident.impact.confidence.toUpperCase()}
                {incident.impact.asOf && (
                  <span style={{ fontSize: 12, color: "var(--meta)" }}> AS OF {incident.impact.asOf}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <SectionRule label="WHAT TO DO NOW" danger />
      <ol style={{ fontSize: 16, lineHeight: 1.6, paddingLeft: 24, marginTop: 16 }}>
        {incident.actions.map((a, idx) => (
          <li key={idx} style={{ marginBottom: 12, fontWeight: idx === 0 ? 700 : 400 }}>
            {a}
          </li>
        ))}
      </ol>

      <div
        role="alert"
        style={{
          background: "var(--danger-bg)",
          border: "1px solid var(--danger)",
          padding: "14px 18px",
          marginTop: 20,
        }}
      >
        <p
          style={{
            ...mono,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: ".05em",
            color: "var(--danger-ink)",
            margin: 0,
          }}
        >
          ⚠ WARNING — FAKE RECOVERY OFFERS
        </p>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.55,
            margin: "6px 0 0",
            color: "var(--danger-ink)",
          }}
        >
          If anyone contacts you promising to get your money back — for a fee
          paid up front, a "gas payment", or your seed phrase (the 12 or 24
          secret words that control your Bitcoin) — that is the second half of
          the scam. We sell nothing on this page, on purpose. No real service
          contacts victims out of the blue.
        </p>
      </div>

      {incident.timeline && (
        <>
          <SectionRule label="TIMELINE" />
          <div style={{ marginTop: 16 }}>
            {incident.timeline.map((t, idx) => (
              <div key={idx} style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--rule)" }}>
                <span style={{ ...mono, fontSize: 12, fontWeight: 600, minWidth: 90 }}>{t.date}</span>
                <span style={{ fontSize: 16, lineHeight: 1.5 }}>
                  {t.event}{" "}
                  {t.source && (
                    <a href={t.source} rel="noopener" style={{ ...mono, fontSize: 11, color: "var(--link)" }}>
                      [SOURCE]
                    </a>
                  )}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {(incident.affected || incident.notAffected) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {incident.affected && (
            <div>
              <SectionRule label="WHO IS AFFECTED" danger />
              <ul style={{ fontSize: 16, lineHeight: 1.55, paddingLeft: 20, marginTop: 12 }}>
                {incident.affected.map((a, idx) => (
                  <li key={idx} style={{ marginBottom: 8 }}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          {incident.notAffected && (
            <div>
              <SectionRule label="WHO IS NOT AFFECTED — NO ACTION NEEDED" />
              <ul style={{ fontSize: 16, lineHeight: 1.55, paddingLeft: 20, marginTop: 12, color: "var(--meta)" }}>
                {incident.notAffected.map((a, idx) => (
                  <li key={idx} style={{ marginBottom: 8 }}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {incident.claims && incident.claims.length > 0 && (
        <>
          <SectionRule label="WHAT'S CONFIRMED AND WHAT'S ONLY REPORTED" />
          <div style={{ marginTop: 16 }}>
            {incident.claims.map((c, idx) => (
              <div key={idx} style={{ padding: "14px 0", borderBottom: "1px solid var(--rule)" }}>
                <span
                  style={{
                    ...mono,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: ".05em",
                    padding: "2px 6px",
                    background: c.status === "primary-confirmed" ? "var(--ink)" : "transparent",
                    color: c.status === "primary-confirmed" ? "var(--paper)" : "var(--meta)",
                    border: "1px solid",
                    borderColor: c.status === "primary-confirmed" ? "var(--ink)" : "var(--rule)",
                  }}
                >
                  {CLAIM_STATUS_LABEL[c.status] ?? c.status.toUpperCase()}
                </span>
                <p style={{ fontSize: 16, lineHeight: 1.5, marginTop: 8, marginBottom: 4 }}>{c.claim}</p>
                {c.attribution && (
                  <p style={{ ...mono, fontSize: 12, color: "var(--meta)", margin: 0 }}>— {c.attribution}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <SectionRule label={`SOURCES (${incident.sources.length})`} />
      <ul style={{ paddingLeft: 20, marginTop: 12 }}>
        {incident.sources.map((s, idx) => (
          <li key={idx} style={{ marginBottom: 8, fontSize: 14, lineHeight: 1.5 }}>
            <a href={s.url} rel="noopener" style={{ color: "var(--link)" }}>
              {s.publisher}
            </a>{" "}
            <span style={{ ...mono, fontSize: 11, color: "var(--meta)" }}>
              [{s.type.toUpperCase()}
              {s.date ? ` · ${s.date}` : ""}]
            </span>
          </li>
        ))}
      </ul>

      {corrections.length > 0 && (
        <>
          <SectionRule label="CORRECTIONS — WHAT WE GOT WRONG AND FIXED" />
          <ul style={{ paddingLeft: 20, marginTop: 12 }}>
            {corrections.map((c, idx) => (
              <li key={idx} style={{ fontSize: 14 }}>
                <span style={{ ...mono, fontSize: 12, fontWeight: 600 }}>{c.date}</span> — {c.note}
              </li>
            ))}
          </ul>
        </>
      )}

      {liveGuidesFor(incident.relatedGuides).length > 0 && (
        <>
          <SectionRule label="PROTECT YOURSELF" />
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {liveGuidesFor(incident.relatedGuides).map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} style={{ fontWeight: 700, fontSize: 16 }}>
                {g.title} →
              </Link>
            ))}
          </div>
        </>
      )}

      {incident.relatedIncidents && incident.relatedIncidents.length > 0 && (
        <>
          <SectionRule label="RELATED CASE FILES" />
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {incident.relatedIncidents.map((rid) => {
              const rel = relatedPool.find((x) => x.id === rid);
              return rel ? (
                <Link key={rid} href={`/scam/${rel.slug}`} style={{ fontWeight: 700, fontSize: 16 }}>
                  {rel.title.split(":")[0]} →
                </Link>
              ) : null;
            })}
          </div>
        </>
      )}
    </main>
    </>
  );
}
