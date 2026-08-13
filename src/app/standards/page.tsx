import type { Metadata } from "next";
import Link from "next/link";
import StampMark from "@/components/stamp-mark";
import SectionRule from "@/components/primitives/section-rule";
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
    "The rules BTCSCAM runs on and has to follow: the proof ladder, how bad a scam is versus how far we have proved it, public corrections, how to dispute what we published, and what we never do.",
  alternates: { canonical: "/standards" },
};


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
      "Someone believable says this happened — one source, or several we cannot show are separate from each other. We publish it as a claim, clearly marked, never as settled fact. We are allowed to move fast at this level. Nothing at this level means we are sure.",
  },
  {
    state: "corroborated",
    definition:
      "Two or more sources say the same thing, but at least one of them got it secondhand — we have not yet shown that the sources are separate, or that any of them saw it directly. The record is getting stronger. The label claims exactly that much and no more.",
  },
  {
    state: "verified",
    definition:
      "Verified needs two or more separate, firsthand sources — Bitcoin blockchain records, court or regulator filings, an admission from the company involved, or evidence straight from victims that we have examined ourselves. Separate means neither source got it from the other. Firsthand means the source saw it directly, not a news story repeating another news story. Nothing gets the Verified label any other way.",
  },
  {
    state: "resolved",
    definition:
      "It is over — the hole is patched, the money is back, the operation is shut down, or the people behind it have been charged — and the case file records how it ended. Closing a case never deletes the record.",
  },
  {
    state: "disputed",
    definition:
      "Someone we named says the record is wrong, and we are looking into it. The label goes on the moment they contact us — before we decide who is right, not after.",
  },
];

const NEVER: { rule: string; detail: string }[] = [
  {
    rule: "No paid listings.",
    detail:
      "A place on this site cannot be bought, at any price, by anyone. The scam database answers to evidence only.",
  },
  {
    rule: "No ads from exchanges.",
    detail:
      "We report on exchanges. We do not take their money. You cannot do both.",
  },
  {
    rule: "No ads for fund-recovery services.",
    detail:
      "Companies that promise to get your stolen money back rob victims a second time. They will never appear on these pages, in any form.",
  },
  {
    rule: "No hidden paid links.",
    detail:
      "If a link pays us, the page says so right next to the link — not down in a footer, not buried in a policy page, at the link.",
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
          THE RULES THIS SITE RUNS ON · ADOPTED 2026-08-08
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
        This page sets out the rules this site runs on. Every case file, label,
        count, and correction we publish has to follow what is written below.
        Where any other page conflicts with this one, this one wins. We adopted
        these rules before we published our first Verified label, and no
        Verified label goes out that breaks them.
      </p>

      {/* (a) THE TRUST LADDER */}
      <SectionRule space="--space-12" label="THE PROOF LADDER" />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16 }}>
        Every scam in the database carries exactly one of five proof levels.
        The words mean exactly this, everywhere they appear. A label says how
        far we have proved something — never how bad it is, how much attention
        it is getting, or how we feel about it.
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
        A CASE FILE ONLY MOVES UP THE LADDER ON NEW EVIDENCE, AND THE MOVE IS
        RECORDED IN THE CASE FILE TIMELINE. THERE IS NO OTHER WAY UP.
      </p>

      {/* (b) SEVERITY IS NOT VERIFICATION */}
      <SectionRule space="--space-12" label="HOW BAD IT IS VS HOW FAR WE HAVE PROVED IT" />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16 }}>
        Severity is about damage — how much money is going, how fast, and
        whether it is still happening. The proof ladder is about how far we
        have proved it. These are two different things, and we never let one
        stand in for the other: an S1 scam may be only Reported, and an old S4
        record may be fully Verified. A red label is not proof. A Verified
        label is not an alarm. We never move a scam up the ladder because it is
        bad, and we never play down how bad something is because the evidence
        is thin.
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
      <SectionRule space="--space-12" label="CORRECTIONS — PUBLIC, PERMANENT, DATED" />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16 }}>
        We admit our mistakes out loud. When we get a fact wrong, the
        correction is public, permanent, and dated, and it is printed on the
        case file it corrects — in the record, where the error was, for as long
        as the record exists. We never change a published fact quietly.
        Rewriting one without a dated correction is the one thing this site
        will not do: the original error and the fix stay visible together, so
        you can always see what we said, when we fixed it, and why.
      </p>

      {/* (d) DISPUTES & TAKEDOWNS */}
      <SectionRule space="--space-12" label="IF WE NAMED YOU AND YOU SAY WE GOT IT WRONG" />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16 }}>
        If we have named you and you believe the record is wrong, here is what
        to do. It works the same way for a founder, a company, an exchange, or
        a lawyer, and there is no other route.
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
          with evidence — documents, blockchain records, court or regulator
          filings. Evidence, not adjectives.
        </li>
        <li style={{ marginBottom: 12 }}>
          We reply within 72 hours.
        </li>
        <li style={{ marginBottom: 12 }}>
          The moment someone we named disputes a record, the case file carries
          the DISPUTED label while we look into it — before we decide who is
          right, not after.
        </li>
        <li style={{ marginBottom: 12 }}>
          We publish the result either way — the record is corrected, the
          record stands, or the record is retired — dated, on the case file. A
          retired record keeps its list of corrections; we do not delete
          history.
        </li>
      </ol>
      <p style={{ fontSize: 16, lineHeight: 1.55 }}>
        Legal demands to take a page down go to the same address and run on the
        same 72-hour clock, and they are noted on the case file like any other
        dispute.
      </p>

      {/* (e) WHAT WE NEVER DO */}
      <SectionRule space="--space-12" label="WHAT WE NEVER DO" />
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
            <strong>We tell you when a product is ours.</strong> When we link
            to something we make or earn money from, the page says so in plain
            sight, every time.
          </p>
        </div>
      </div>

      {/* (f) HONEST NUMBERS */}
      <SectionRule space="--space-12" label="HONEST NUMBERS" />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16 }}>
        Every count on this site is counted from the scam database, or it is
        not shown at all. We do not make up member counts, victim counts, or
        dollar amounts, and we never print a loss figure without a source.
        Every loss figure says how sure we are of it and the date it is
        accurate as of. When we do not know, the page says we do not know. A
        smaller true number beats a bigger believable one, every time it is
        printed.
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
          ADOPTED 2026-08-08. THIS PAGE ONLY CHANGES IN PUBLIC — EVERY CHANGE
          IS DATED AND LOGGED LIKE ANY OTHER CORRECTION.
        </p>
        <StampMark size={44} tone="ink" />
      </div>
    </main>
  );
}
