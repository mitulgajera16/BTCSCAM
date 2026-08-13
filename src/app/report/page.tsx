import type { Metadata } from "next";
import Link from "next/link";
import { ReportForm } from "@/components/report/ReportForm";
import { TRUST_LABEL, type TrustState } from "@/lib/incidents";
import SectionRule from "@/components/primitives/section-rule";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

export const metadata: Metadata = {
  title: "Report a Scam",
  description:
    "Report a Bitcoin scam to BTCSCAM. Every report enters the scam database as REPORTED and is never marked verified on its own — a person reads and reviews every one in the weekly sweep.",
  alternates: { canonical: "/report" },
};


/* Definitions abridged from /standards — the binding versions live there.
   Chips render via TRUST_LABEL so the vocabulary is identical everywhere. */
const LADDER: { state: TrustState; meaning: string }[] = [
  {
    state: "reported",
    meaning:
      "Where every report starts, including yours. One person said it, or several people did but we have not yet shown they are separate. Nobody has checked it yet.",
  },
  {
    state: "corroborated",
    meaning:
      "Two or more sources say the same thing, but we have not yet shown that they are separate, or that any of them saw it directly.",
  },
  {
    state: "verified",
    meaning:
      "Confirmed by two or more separate, firsthand sources: warnings from the company involved, Bitcoin blockchain records, regulator filings, or evidence from victims that we examined ourselves.",
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
        WHERE REPORTS COME IN · READ BY PEOPLE · REVIEWED BY HAND
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
        need proof to file, and you do not need to be sure. You only need to
        say what you saw, plainly. We do the checking; that is our job.
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
          ⚠ WARNING · SCAMS THAT PROMISE YOUR MONEY BACK
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.55, margin: "8px 0 0" }}>
          If someone contacts you promising to GET YOUR LOST MONEY BACK for a
          fee, that is itself a scam. We never charge. We never message you
          first.
        </p>
      </aside>

      <SectionRule label="WHAT HAPPENS TO YOUR REPORT — THE PROOF LADDER" />
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
          Every report starts on the bottom rung, and nothing moves up on its
          own — not because a lot of people report it, not because people are
          angry about it, not for anyone. A person moves a report up the
          ladder, and shows their sources when they do. That is why REPORTED
          on this site means exactly that, and no more.
        </p>
      </div>

      <SectionRule label="YOUR REPORT" />
      <p
        style={{
          ...mono,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--meta)",
          margin: "12px 0 0",
        }}
      >
        Accounts are for credit, not a gate — a report with no name on it
        carries exactly the same weight when we review it.
      </p>
      <div style={{ marginTop: 24 }}>
        <ReportForm />
      </div>
    </main>
  );
}
