import type { Metadata } from "next";
import Link from "next/link";
import RugReportBand from "@/components/rug-report-band";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

export const metadata: Metadata = {
  title: "The Rug Report",
  description:
    "The weekly BTCSCAM newsletter: one incident deep-dive, the Dangerous-right-now list, one protection tip. Plain, dated, sourced, zero hype.",
};

function SectionRule({ label }: { label: string }) {
  return (
    <h2
      style={{
        ...mono,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: ".05em",
        color: "var(--ink)",
        borderBottom: "2px solid var(--ink)",
        paddingBottom: 8,
        marginTop: 40,
      }}
    >
      {label}
    </h2>
  );
}

const WHAT_YOU_GET: { index: string; title: string; body: string }[] = [
  {
    index: "01",
    title: "ONE INCIDENT DEEP-DIVE",
    body: "The anatomy of one scam from the registry: how it worked, who it hit, what is confirmed versus merely reported — every claim dated and sourced.",
  },
  {
    index: "02",
    title: "THE DANGEROUS-RIGHT-NOW LIST",
    body: "The active S1/S2 incidents from the registry at press time, each with the single most important thing to do about it.",
  },
  {
    index: "03",
    title: "ONE PROTECTION TIP",
    body: "A single concrete step you can finish in minutes, fact-checked before it ships. No listicles, no filler.",
  },
  {
    index: "04",
    title: "THE FORMAT",
    body: "Plain, dated, sourced, zero hype. Corrections are public and permanent, same as the paper.",
  },
];

export default function RugReportPage() {
  return (
    <main style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 64px" }}>
      <nav style={{ ...mono, fontSize: 12, padding: "16px 0" }}>
        <Link href="/">← FRONT PAGE</Link>
        <span style={{ color: "var(--meta)" }}> / THE RUG REPORT</span>
      </nav>

      <p
        style={{
          ...mono,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: ".05em",
          color: "var(--meta)",
          margin: "16px 0 0",
        }}
      >
        NEWSLETTER · WEEKLY
      </p>
      <h1
        style={{
          ...display,
          fontSize: "clamp(24px, 5vw, 40px)",
          lineHeight: 1.2,
          margin: "8px 0 0",
        }}
      >
        The Rug Report
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.55, marginTop: 16, maxWidth: "65ch" }}>
        The paper, folded down to one email. One incident deep-dive, the
        Dangerous-right-now list, one protection tip. Weekly. Plain, dated,
        sourced, zero hype.
      </p>

      <div style={{ marginTop: 32 }}>
        <RugReportBand />
      </div>

      <SectionRule label="WHAT YOU GET — EVERY ISSUE" />
      <div>
        {WHAT_YOU_GET.map((item) => (
          <div
            key={item.index}
            style={{
              display: "flex",
              gap: 16,
              padding: "16px 0",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <span
              style={{
                ...mono,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--meta)",
                minWidth: 24,
                paddingTop: 3,
              }}
            >
              {item.index}
            </span>
            <div>
              <h3
                style={{
                  ...mono,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: ".05em",
                  margin: 0,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: "var(--meta)",
                  margin: "6px 0 0",
                  maxWidth: "65ch",
                }}
              >
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <SectionRule label="ARCHIVE" />
      <div
        style={{
          ...mono,
          fontSize: 12,
          background: "var(--panel)",
          border: "1px solid var(--rule)",
          padding: "14px 16px",
          marginTop: 16,
        }}
      >
        No issues published yet — first issue after launch week. Every issue
        will be archived here in full.
      </div>
    </main>
  );
}
