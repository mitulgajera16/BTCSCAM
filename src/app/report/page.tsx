import type { Metadata } from "next";
import Link from "next/link";
import { ReportForm } from "@/components/report/ReportForm";
import { TRUST_LABEL, type TrustState } from "@/lib/incidents";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

export const metadata: Metadata = {
  title: "Report a Scam",
  description:
    "Report a Bitcoin scam to BTCSCAM. Reports enter the registry as REPORTED and are never auto-verified — a human triages every submission in the weekly sweep.",
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

/* Definitions abridged from /standards — the binding versions live there.
   Chips render via TRUST_LABEL so the vocabulary is identical everywhere. */
const LADDER: { state: TrustState; meaning: string }[] = [
  {
    state: "reported",
    meaning:
      "Where every report starts — including yours. One account, or several not yet shown independent. Not yet checked.",
  },
  {
    state: "corroborated",
    meaning:
      "Two or more sources point the same way, but independence or primacy is not yet established.",
  },
  {
    state: "verified",
    meaning:
      "Confirmed by 2+ independent primary sources: vendor advisories, on-chain data, regulator filings, or victim evidence we examined ourselves.",
  },
];

export default function ReportPage() {
  return (
    <main style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 64px" }}>
      <nav style={{ ...mono, fontSize: 12, padding: "16px 0" }}>
        <Link href="/">← FRONT PAGE</Link>
        <span style={{ color: "var(--meta)" }}> / REPORT A SCAM</span>
      </nav>

      <p
        style={{
          ...mono,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: ".05em",
          color: "var(--meta)",
          margin: 0,
        }}
      >
        INTAKE DESK · READ BY HUMANS · R1 MANUAL TRIAGE
      </p>
      <h1
        style={{
          ...display,
          fontSize: "clamp(24px, 5vw, 40px)",
          lineHeight: 1.2,
          margin: "8px 0 0",
        }}
      >
        Report a scam. A person reads every one.
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.55, marginTop: 20 }}>
        If something took your money — or tried to — tell us here. You do not
        need proof to file, and you do not need to be certain. You need to say
        what you saw, plainly. The desk does the checking; that is the job.
      </p>

      <aside
        style={{
          background: "var(--danger-bg)",
          border: "1px solid var(--danger)",
          color: "var(--danger-ink)",
          padding: "16px 20px",
          marginTop: 24,
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
          ⚠ WARNING · RECOVERY SCAMS
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.55, margin: "8px 0 0" }}>
          If someone contacts you promising to RECOVER lost funds for a fee —
          that is itself a scam. We never charge. We never DM first.
        </p>
      </aside>

      <SectionRule label="HOW YOUR REPORT IS TREATED — THE TRUST LADDER" />
      <div style={{ background: "var(--panel)", padding: "20px 24px", marginTop: 16 }}>
        {LADDER.map((step, idx) => (
          <div
            key={step.state}
            style={{
              display: "flex",
              gap: 16,
              alignItems: "baseline",
              padding: "10px 0",
              borderBottom:
                idx < LADDER.length - 1 ? "1px solid var(--rule)" : "none",
            }}
          >
            <span
              style={{
                ...mono,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".05em",
                padding: "2px 8px",
                border: "1px solid var(--ink)",
                background: step.state === "verified" ? "var(--ink)" : "transparent",
                color: step.state === "verified" ? "var(--paper)" : "var(--ink)",
                whiteSpace: "nowrap",
              }}
            >
              {TRUST_LABEL[step.state]}
            </span>
            <span style={{ fontSize: 16, lineHeight: 1.5 }}>{step.meaning}</span>
          </div>
        ))}
        <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16, marginBottom: 0 }}>
          Every report enters at the bottom rung, and nothing climbs
          automatically — not for volume, not for outrage, not for anyone. A
          human moves a report up the ladder and shows their sources when they
          do. That is why REPORTED on this site means exactly that, and no
          more.
        </p>
      </div>

      <SectionRule label="YOUR REPORT" />
      <div style={{ marginTop: 24 }}>
        <ReportForm />
      </div>
    </main>
  );
}
