import type { Metadata } from "next";
import Link from "next/link";
import StampMark from "@/components/stamp-mark";
import {
  SEVERITY_LABEL,
  TRUST_LABEL,
  type Incident,
  type TrustState,
} from "@/lib/incidents";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

export const metadata: Metadata = {
  title: "The Standards",
  description:
    "The binding editorial law of BTCSCAM: the trust ladder, severity versus verification, public corrections, the dispute and takedown process, and what we never do.",
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
        marginTop: 48,
      }}
    >
      {label}
    </h2>
  );
}

function TrustChip({ state }: { state: TrustState }) {
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
        whiteSpace: "nowrap",
      }}
    >
      {TRUST_LABEL[state]}
    </span>
  );
}

const LADDER: { state: TrustState; definition: string }[] = [
  {
    state: "reported",
    definition:
      "A credible claim exists — one source, or several that cannot be shown to be independent. We publish it as a claim, clearly marked, never as established fact. Speed is allowed here; certainty is not implied.",
  },
  {
    state: "corroborated",
    definition:
      "Two or more sources point the same way, but at least one link in the chain is secondhand — independence or primacy is not yet established. The record is firming, and the chip says exactly that much and no more.",
  },
  {
    state: "verified",
    definition:
      "Verified requires 2+ independent primary sources — on-chain data, court or regulator filings, vendor admissions, or direct victim evidence we have examined ourselves. Independent means neither source derives from the other. Primary means firsthand, not reporting about reporting. No Verified label ships by any other route.",
  },
  {
    state: "resolved",
    definition:
      "The incident has concluded — patched, funds recovered, operation shut down, or actor charged — and the dossier records the ending. Resolution closes the incident; it never deletes the record.",
  },
  {
    state: "disputed",
    definition:
      "A named party contests the record and the dispute is under review. The chip goes on the moment the dispute arrives — before we decide who is right, not after.",
  },
];

const NEVER: { rule: string; detail: string }[] = [
  {
    rule: "No paid listings.",
    detail:
      "Placement on this site cannot be bought, at any price, by anyone. The registry answers to evidence only.",
  },
  {
    rule: "No exchange advertising.",
    detail:
      "We cover exchanges. We do not take their money. The two are incompatible.",
  },
  {
    rule: "No recovery-service advertising.",
    detail:
      "The recovery industry preys on victims a second time. It will never appear on these pages in any form.",
  },
  {
    rule: "No undisclosed affiliate links.",
    detail:
      "If a link pays us, the page says so where the link appears — not in a footer, not in a policy, at the link.",
  },
];

export default function StandardsPage() {
  const severities = Object.keys(SEVERITY_LABEL) as Incident["severity"][];

  return (
    <main style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 64px" }}>
      <nav style={{ ...mono, fontSize: 12, padding: "16px 0" }}>
        <Link href="/">← FRONT PAGE</Link>
        <span style={{ color: "var(--meta)" }}> / THE STANDARDS</span>
      </nav>

      <header style={{ textAlign: "center", padding: "24px 0 8px" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <StampMark size={72} />
        </div>
        <p
          style={{
            ...mono,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: ".05em",
            color: "var(--meta)",
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          PRODUCT LAW · ADOPTED 2026-08-08
        </p>
        <h1
          style={{
            ...display,
            fontSize: "clamp(32px, 6vw, 40px)",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          The Standards
        </h1>
      </header>

      <div className="double-rule" style={{ margin: "24px 0" }} />

      <p style={{ fontSize: 18, lineHeight: 1.55, margin: 0 }}>
        This page is the law of the paper. Every dossier, chip, count, and
        correction we publish is governed by what follows. Where any other page
        conflicts with this one, this one wins. These standards were adopted
        before the first Verified label shipped, and no Verified label ships
        outside them.
      </p>

      {/* (a) THE TRUST LADDER */}
      <SectionRule label="THE TRUST LADDER" />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16 }}>
        Every incident in the registry carries exactly one of five states. The
        words mean precisely this, everywhere they appear. A chip is a claim
        about evidence — never about severity, popularity, or how confident we
        feel.
      </p>
      <div style={{ marginTop: 8 }}>
        {LADDER.map((rung) => (
          <div
            key={rung.state}
            style={{
              padding: "18px 0",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <TrustChip state={rung.state} />
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.55,
                marginTop: 10,
                marginBottom: 0,
              }}
            >
              {rung.definition}
            </p>
          </div>
        ))}
      </div>
      <p
        style={{
          ...mono,
          fontSize: 12,
          color: "var(--meta)",
          lineHeight: 1.6,
          marginTop: 12,
        }}
      >
        MOVEMENT UP THE LADDER IS EARNED BY EVIDENCE AND LOGGED IN THE DOSSIER
        TIMELINE. THERE IS NO OTHER WAY UP.
      </p>

      {/* (b) SEVERITY IS NOT VERIFICATION */}
      <SectionRule label="SEVERITY IS NOT VERIFICATION" />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16 }}>
        Severity measures blast radius — how much is being lost, how fast, and
        whether it is still happening. The trust ladder measures how well we
        know it. These are different axes and we never let one impersonate the
        other: an S1 may be merely Reported, and an S4 historical record may be
        fully Verified. A red chip is not proof. A Verified chip is not an
        alarm. We do not promote an incident up the ladder because it is
        severe, and we do not soften severity because verification is thin.
      </p>
      <div style={{ marginTop: 16 }}>
        {severities.map((s) => (
          <div
            key={s}
            style={{
              ...mono,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: ".05em",
              color:
                s === "S1" || s === "S2" ? "var(--danger)" : "var(--meta)",
              padding: "8px 0",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            {SEVERITY_LABEL[s]}
          </div>
        ))}
      </div>

      {/* (c) CORRECTIONS */}
      <SectionRule label="CORRECTIONS — PUBLIC, PERMANENT, DATED" />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16 }}>
        We are wrong out loud. When we get a fact wrong, the correction is
        public, permanent, and dated, and it is printed inline on the dossier
        it corrects — in the record, where the error lived, for the life of
        the record. We never silently edit. Rewriting a published fact without
        a dated correction is the one sin this paper does not commit: the
        original error and its repair stay visible together, so a reader can
        always see what we said, when we fixed it, and why.
      </p>

      {/* (d) DISPUTES & TAKEDOWNS */}
      <SectionRule label="DISPUTES & TAKEDOWNS" />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16 }}>
        If we have named you and you believe the record is wrong, this is the
        process. It is the same for a founder, a vendor, an exchange, or a
        lawyer, and it is the only process.
      </p>
      <ol style={{ fontSize: 16, lineHeight: 1.6, paddingLeft: 24, marginTop: 16 }}>
        <li style={{ marginBottom: 12 }}>
          Email{" "}
          <a
            href="mailto:disputes@btcscam.com"
            style={{ ...mono, fontSize: 14, fontWeight: 600, color: "var(--link)" }}
          >
            disputes@btcscam.com
          </a>{" "}
          with evidence — documents, on-chain data, filings. Evidence, not
          adjectives.
        </li>
        <li style={{ marginBottom: 12 }}>
          We respond within 72 hours.
        </li>
        <li style={{ marginBottom: 12 }}>
          The moment a dispute arrives from a named party, the dossier carries
          the DISPUTED chip while we review — before we decide the merits, not
          after.
        </li>
        <li style={{ marginBottom: 12 }}>
          We publish the outcome either way — record corrected, record stands,
          or record retired — dated, on the dossier. A retired record keeps
          its corrections trail; we do not delete history.
        </li>
      </ol>
      <p style={{ fontSize: 16, lineHeight: 1.55 }}>
        Legal takedown demands go to the same address and run on the same
        clock, and they are noted on the dossier like any other dispute.
      </p>

      {/* (e) WHAT WE NEVER DO */}
      <SectionRule label="WHAT WE NEVER DO" />
      <div style={{ marginTop: 8 }}>
        {NEVER.map((item) => (
          <div
            key={item.rule}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "baseline",
              padding: "16px 0",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <span
              style={{
                ...mono,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".05em",
                padding: "2px 8px",
                background: "var(--ink)",
                color: "var(--paper)",
              }}
            >
              NEVER
            </span>
            <p style={{ fontSize: 16, lineHeight: 1.55, margin: 0 }}>
              <strong>{item.rule}</strong> {item.detail}
            </p>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "baseline",
            padding: "16px 0",
            borderBottom: "1px solid var(--rule)",
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
              color: "var(--ink)",
            }}
          >
            ALWAYS
          </span>
          <p style={{ fontSize: 16, lineHeight: 1.55, margin: 0 }}>
            <strong>House products are disclosed as house products.</strong>{" "}
            When we link to something we make or profit from, the page says so
            in plain sight, every time.
          </p>
        </div>
      </div>

      {/* (f) HONEST NUMBERS */}
      <SectionRule label="HONEST NUMBERS" />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16 }}>
        Every count on this site is computed from the registry, or it is not
        shown. We do not invent member counts, victim counts, or dollar
        figures, and we never state losses without a source. Loss figures
        carry a confidence grade and an as-of date. When we do not know, the
        page says we do not know. A smaller true number beats a larger
        plausible one, every time it is printed.
      </p>

      <div className="double-rule" style={{ margin: "48px 0 24px" }} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <p
          style={{
            ...mono,
            fontSize: 12,
            color: "var(--meta)",
            lineHeight: 1.6,
            margin: 0,
            maxWidth: "52ch",
          }}
        >
          ADOPTED 2026-08-08. THIS PAGE IS AMENDED ONLY IN PUBLIC — CHANGES
          ARE DATED AND LOGGED LIKE ANY CORRECTION.
        </p>
        <StampMark size={44} tone="ink" />
      </div>
    </main>
  );
}
