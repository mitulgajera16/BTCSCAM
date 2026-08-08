import type { Metadata } from "next";
import Link from "next/link";
import { CheckForm } from "@/components/check/CheckForm";
import { hasSupabase } from "@/components/check/db";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

export const metadata: Metadata = {
  title: "Check an Address or Domain",
  description:
    "Check a Bitcoin address, Ethereum-style address, or website domain against the blocklists BTCSCAM mirrors — ScamSniffer, MetaMask eth-phishing-detect — and the published scam registry. Lookups, not guarantees: we never certify anything as safe.",
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

const SOURCES: { name: string; covers: string; note: string }[] = [
  {
    name: "BTCSCAM REGISTRY",
    covers: "Addresses + domains",
    note: "Entities named in our own published dossiers. Every entry carries a trust state and sources; a match links you straight to the dossier.",
  },
  {
    name: "SCAMSNIFFER BLACKLIST",
    covers: "Addresses + domains",
    note: "ScamSniffer's open scam-database (GPL-3.0). We mirror it for lookups only and never re-export the list. The free feed runs about 7 days behind their live data.",
  },
  {
    name: "METAMASK ETH-PHISHING-DETECT",
    covers: "Domains",
    note: "The phishing-domain blocklist that ships inside MetaMask, maintained in the open. Domains only — it does not cover addresses.",
  },
  {
    name: "CHAINABUSE",
    covers: "Deep link only",
    note: "Community scam reports across chains. Their free tier has no lookup API, so we hand you a direct link to their result page instead of pretending we queried it.",
  },
];

export default function CheckPage() {
  const live = hasSupabase();

  return (
    <main style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 64px" }}>
      <nav style={{ ...mono, fontSize: 12, padding: "16px 0" }}>
        <Link href="/">← FRONT PAGE</Link>
        <span style={{ color: "var(--meta)" }}> / THE CHECK DESK</span>
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
        THE CHECK DESK · LOOKUPS, NOT GUARANTEES
      </p>
      <h1
        style={{
          ...display,
          fontSize: "clamp(24px, 5vw, 40px)",
          lineHeight: 1.2,
          margin: "8px 0 0",
        }}
      >
        Check it before you send.
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.55, marginTop: 20 }}>
        Paste an address or a domain. We look it up in the blocklists we
        mirror and in our own published registry, then tell you exactly what
        was checked and what was not. Two answers are possible here — FLAGGED
        and NOT FOUND. There is no button on this desk that stamps anything
        as trustworthy, because no honest lookup can.
      </p>

      {!live && (
        <aside
          style={{
            background: "var(--warm)",
            border: "1px solid var(--rule)",
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
              color: "var(--meta)",
              margin: 0,
            }}
          >
            STATUS · LIVE DATABASE NOT CONNECTED
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.55, margin: "8px 0 0" }}>
            The live blocklist mirror is not attached to this deployment yet.
            Checks still scan the published dossiers bundled with this site,
            and every result links to Chainabuse — which runs independently of
            us. Each answer states plainly which lookups ran.
          </p>
        </aside>
      )}

      <SectionRule label="RUN A CHECK" />
      <div style={{ marginTop: 24 }}>
        <CheckForm />
      </div>

      <SectionRule label="WHAT THIS DESK CHECKS" />
      <div style={{ background: "var(--panel)", padding: "20px 24px", marginTop: 16 }}>
        {SOURCES.map((s, idx) => (
          <div
            key={s.name}
            style={{
              padding: "12px 0",
              borderBottom:
                idx < SOURCES.length - 1 ? "1px solid var(--rule)" : "none",
            }}
          >
            <p
              style={{
                display: "flex",
                gap: 12,
                alignItems: "baseline",
                flexWrap: "wrap",
                margin: 0,
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
                }}
              >
                {s.name}
              </span>
              <span style={{ ...mono, fontSize: 11, color: "var(--meta)" }}>
                {s.covers.toUpperCase()}
              </span>
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.55, margin: "8px 0 0" }}>
              {s.note}
            </p>
          </div>
        ))}
      </div>

      <SectionRule label="HOW TO READ A RESULT" danger />
      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: 16, lineHeight: 1.55, margin: 0 }}>
          <span style={{ ...mono, fontSize: 12, fontWeight: 600, letterSpacing: ".05em", color: "var(--danger)" }}>
            FLAGGED
          </span>{" "}
          means at least one list we mirror carries this address or domain, or
          it is named in a published dossier. A listing is a recorded
          allegation from the named source, not a court finding — but it is a
          stop sign. Do not send funds, do not enter a seed phrase.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 12 }}>
          <span style={{ ...mono, fontSize: 12, fontWeight: 600, letterSpacing: ".05em" }}>
            NOT FOUND
          </span>{" "}
          means exactly that: not on the lists we checked, at the moment we
          checked. Scams are minted faster than any list records them, and
          the free ScamSniffer feed we mirror runs about 7 days behind. We
          cannot certify anything as safe to use, and this desk never will —
          a fresh scam address passes every blocklist on earth on day one.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 12, marginBottom: 0 }}>
          If a check comes back NOT FOUND but something still smells wrong,
          trust your nose and{" "}
          <Link href="/report" style={{ color: "var(--link)", fontWeight: 700 }}>
            file a report
          </Link>
          . Our vocabulary for trust states is defined at{" "}
          <Link href="/standards" style={{ color: "var(--link)", fontWeight: 700 }}>
            /standards
          </Link>
          .
        </p>
      </div>

      <SectionRule label="CREDITS AND LICENSES" />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16, marginBottom: 0 }}>
        This desk exists because others do hard work in the open:{" "}
        <a
          href="https://github.com/scamsniffer/scam-database"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--link)", fontWeight: 700 }}
        >
          ScamSniffer scam-database
        </a>{" "}
        (GPL-3.0 — we serve individual lookups only and never re-export the
        list) and{" "}
        <a
          href="https://github.com/MetaMask/eth-phishing-detect"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--link)", fontWeight: 700 }}
        >
          MetaMask eth-phishing-detect
        </a>
        . Cross-checks link to{" "}
        <a
          href="https://www.chainabuse.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--link)", fontWeight: 700 }}
        >
          Chainabuse
        </a>
        , which we are not affiliated with. No source pays us; nobody can pay
        to be delisted.
      </p>
    </main>
  );
}
