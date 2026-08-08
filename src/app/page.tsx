import Link from "next/link";
import { TRUST_LABEL } from "@/lib/incidents";
import { fetchAllIncidents } from "@/lib/incidents-db";
import StampMark from "@/components/stamp-mark";
import RugReportBand from "@/components/rug-report-band";
import WireTicker, { getTickerItems } from "@/components/wire-ticker";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif" };

function TrustChip({ state }: { state: keyof typeof TRUST_LABEL }) {
  return (
    <span
      style={{
        ...mono,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".05em",
        padding: "2px 8px",
        border: "1px solid var(--ink)",
        color: "var(--ink)",
        background: state === "verified" ? "var(--ink)" : "transparent",
        ...(state === "verified" ? { color: "var(--paper)" } : {}),
      }}
    >
      {TRUST_LABEL[state]}
    </span>
  );
}

function SeverityChip({ severity }: { severity: string }) {
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

export default async function Home() {
  const incidents = await fetchAllIncidents();
  const dangerous = incidents.filter(
    (i) => i.ongoing && (i.severity === "S1" || i.severity === "S2"),
  );
  const critical = dangerous.find((i) => i.severity === "S1");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main>
      {/* Wire ticker */}
      <WireTicker items={await getTickerItems()} />

      {/* Conditional CRITICAL bar */}
      {critical && (
        <div
          role="alert"
          style={{
            background: "var(--danger-bg)",
            color: "var(--danger-ink)",
            borderBottom: "1px solid var(--danger)",
            padding: "10px 24px",
            display: "flex",
            gap: 12,
            alignItems: "baseline",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              ...mono,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".05em",
              background: "var(--danger)",
              color: "#fff",
              padding: "2px 8px",
            }}
          >
            CRITICAL
          </span>
          <Link
            href={`/scam/${critical.slug}`}
            style={{ fontWeight: 700, fontSize: 16 }}
          >
            {critical.title}
          </Link>
          <span style={{ ...mono, fontSize: 12, marginLeft: "auto" }}>
            UPDATED {critical.lastUpdated}
          </span>
        </div>
      )}

      {/* Orange Paper zone */}
      <header style={{ background: "var(--warm)" }}>
        <div
          style={{
            ...mono,
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 24px",
            fontSize: 12,
            fontWeight: 500,
            borderBottom: "1px solid var(--rule)",
          }}
        >
          <span>{today}</span>
          <span>EST. 2026 · READER-FUNDED</span>
        </div>
        <div style={{ textAlign: "center", padding: "40px 24px 28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(40px, 8vw, 88px)",
                fontWeight: 900,
                letterSpacing: 0,
                lineHeight: 1,
                margin: 0,
              }}
            >
              <span style={{ color: "var(--orange)" }}>BTC</span>
              <span
                style={{
                  textDecoration: "line-through",
                  textDecorationColor: "var(--danger)",
                  textDecorationThickness: "6px",
                }}
              >
                SCAM
              </span>
            </h1>
            <StampMark size={56} />
          </div>
          <p
            style={{
              ...mono,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: ".05em",
              color: "var(--meta)",
              marginTop: 12,
            }}
          >
            THE ANTI-SCAM PAPER OF RECORD
          </p>
        </div>
        <nav
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "12px 28px",
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: ".05em",
          }}
        >
          <Link href="/">FRONT PAGE</Link>
          <Link href="/check">CHECK</Link>
          <Link href="/registry">REGISTRY</Link>
          <Link href="/guides">GUIDES</Link>
          <Link href="/report">REPORT</Link>
          <Link href="/store">STORE</Link>
          <Link href="/rug-report">RUG REPORT</Link>
        </nav>
        <div className="double-rule" />
      </header>

      {/* Dangerous right now */}
      <section style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <h2
          style={{
            ...mono,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: ".05em",
            color: "var(--danger)",
            borderBottom: "2px solid var(--ink)",
            paddingBottom: 8,
          }}
        >
          ⚠ DANGEROUS RIGHT NOW
        </h2>
        {dangerous.map((i) => (
          <article
            key={i.id}
            className="story-row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 16,
              padding: "20px 0",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <SeverityChip severity={i.severity} />
                <TrustChip state={i.trustState} />
              </div>
              <h3 style={{ ...display, fontSize: 24, lineHeight: 1.25, margin: 0 }}>
                <Link href={`/scam/${i.slug}`}>{i.title}</Link>
              </h3>
              <p style={{ fontSize: 16, color: "var(--meta)", lineHeight: 1.5, marginTop: 8, maxWidth: "65ch" }}>
                {i.summary}
              </p>
            </div>
            <div className="story-meta" style={{ ...mono, fontSize: 12, textAlign: "right", color: "var(--meta)" }}>
              {i.impact?.lossNative && (
                <div style={{ color: "var(--danger)", fontWeight: 600 }}>
                  {i.impact.lossNative}
                </div>
              )}
              <div>UPDATED {i.lastUpdated}</div>
            </div>
          </article>
        ))}
      </section>

      {/* Registry */}
      <section id="registry" style={{ padding: "16px 24px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <h2
          style={{
            ...mono,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: ".05em",
            borderBottom: "2px solid var(--ink)",
            paddingBottom: 8,
          }}
        >
          THE REGISTRY · LAST SWEEP {today}
        </h2>
        {incidents.map((i) => (
          <div
            key={i.id}
            style={{
              display: "flex",
              gap: 16,
              alignItems: "baseline",
              padding: "14px 0",
              borderBottom: "1px solid var(--rule)",
              fontSize: 16,
            }}
          >
            <span style={{ ...mono, fontSize: 12, color: "var(--meta)", minWidth: 80 }}>
              {i.firstObserved}
            </span>
            <SeverityChip severity={i.severity} />
            <Link href={`/scam/${i.slug}`} style={{ fontWeight: 700, flex: 1 }}>
              {i.title.split(":")[0]}
            </Link>
            <Link
              href={`/scam/${i.slug}`}
              style={{ ...mono, fontSize: 12, fontWeight: 600, color: "var(--link)" }}
            >
              DETAILS →
            </Link>
          </div>
        ))}
      </section>

      {/* Guides */}
      <section id="guides" style={{ padding: "16px 24px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <h2
          style={{
            ...mono,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: ".05em",
            borderBottom: "2px solid var(--ink)",
            paddingBottom: 8,
          }}
        >
          PROTECT YOURSELF
        </h2>
        <article style={{ background: "var(--panel)", padding: 24, marginTop: 16, maxWidth: 640 }}>
          <p style={{ ...mono, fontSize: 11, fontWeight: 600, letterSpacing: ".05em", color: "var(--meta)", margin: 0 }}>
            GUIDE · FACT-CHECKED 2026-08-08
          </p>
          <h3 style={{ ...display, fontSize: 21, marginTop: 8, marginBottom: 8 }}>
            How to generate a seed phrase with entropy you can actually trust
          </h3>
          <p style={{ fontSize: 16, color: "var(--meta)", lineHeight: 1.5 }}>
            $116M+ was stolen from people who did everything &ldquo;right.&rdquo;
            Dice-roll seeds survived. 50 rolls for 12 words, 99 for 24 — and how
            to verify the math yourself.
          </p>
          <Link
            href="/guides/seed-phrase-entropy"
            style={{ ...mono, fontSize: 12, fontWeight: 600, color: "var(--link)" }}
          >
            READ THE GUIDE →
          </Link>
        </article>
      </section>

      <RugReportBand />

      <footer
        id="report"
        style={{
          background: "var(--dark)",
          color: "var(--dark-text)",
          borderTop: "1px solid var(--dark-text)",
          padding: "32px 24px",
          ...mono,
          fontSize: 12,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <span>
            BTC<span style={{ textDecoration: "line-through" }}>SCAM</span> ·
            THE ANTI-SCAM PAPER OF RECORD
          </span>
          <span style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link href="/standards" style={{ fontWeight: 600 }}>
              STANDARDS →
            </Link>
            <span>PAID LISTINGS 0 · CORRECTIONS PUBLIC · SOURCES OR IT DIDN&apos;T HAPPEN</span>
          </span>
        </div>
      </footer>
    </main>
  );
}
