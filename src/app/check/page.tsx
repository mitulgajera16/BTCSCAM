import type { Metadata } from "next";
import Link from "next/link";
import { CheckForm } from "@/components/check/CheckForm";
import { hasSupabase } from "@/components/check/db";
import SectionRule from "@/components/primitives/section-rule";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

export const metadata: Metadata = {
  title: "Check a Wallet Address or Website",
  description:
    "Check a Bitcoin address, Ethereum-style address, or website against the known-scam lists BTCSCAM keeps a copy of — ScamSniffer, MetaMask eth-phishing-detect — and our own scam database. We look it up; we never tell you something is safe.",
  alternates: { canonical: "/check" },
};


const SOURCES: { name: string; covers: string; note: string }[] = [
  {
    name: "BTCSCAM DATABASE",
    covers: "Wallet addresses + websites",
    note: "The wallet addresses, websites, and handles named in our own published case files. Every entry shows a proof level and the sources behind it, and a match takes you straight to the case file.",
  },
  {
    name: "SCAMSNIFFER SCAM LIST",
    covers: "Wallet addresses + websites",
    note: "ScamSniffer's open scam database (GPL-3.0). We keep a copy so we can answer one lookup at a time, and we never hand the list back out. The free copy runs about 7 days behind their live version.",
  },
  {
    name: "METAMASK ETH-PHISHING-DETECT",
    covers: "Websites",
    note: "The list of fake websites that ships inside the MetaMask wallet, kept up to date in public. Websites only — it does not cover wallet addresses.",
  },
  {
    name: "CHAINABUSE",
    covers: "Link out only",
    note: "Scam reports filed by the public across many coins. Their free plan gives us no way to search it from here, so we hand you a direct link to their results page instead of pretending we searched it.",
  },
];

export default async function CheckPage({
  searchParams,
}: PageProps<"/check">) {
  const q = String((await searchParams).q ?? "").slice(0, 300);
  const live = hasSupabase();

  return (
    <main style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 64px" }}>
      <nav style={{ ...mono, fontSize: 12, padding: "16px 0" }}>
        <Link href="/">← FRONT PAGE</Link>
        <span style={{ color: "var(--meta)" }}> / THE WALLET CHECK</span>
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
        THE WALLET CHECK · WE LOOK IT UP, WE DO NOT PROMISE
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
        Paste a wallet address or a website. We look it up in the known-scam
        lists we keep a copy of and in our own scam database, then tell you
        exactly what we checked and what we did not. There are only two
        answers here — FLAGGED and NOT FOUND. Nothing on this page will ever
        tell you something is safe, because no honest lookup can.
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
            STATUS · LIVE LISTS NOT CONNECTED
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.55, margin: "8px 0 0" }}>
            Our copies of the outside scam lists are not hooked up to this
            site yet. Checks still search the published case files that ship
            with the site, and every answer links out to Chainabuse, which
            runs on its own and has nothing to do with us. Each answer says
            plainly which lookups actually ran.
          </p>
        </aside>
      )}

      <SectionRule label="RUN A CHECK" />
      <div style={{ marginTop: 24 }}>
        <CheckForm initialValue={q} />
      </div>

      <SectionRule label="WHAT WE CHECK AGAINST" />
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
          means at least one of the lists we copy has this wallet address or
          website on it, or a published case file names it. Being on a list
          means the source wrote down what someone saw. It is not a court
          ruling — but treat it as a stop sign. Do not send money, and do not
          type in your seed phrase.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 12 }}>
          <span style={{ ...mono, fontSize: 12, fontWeight: 600, letterSpacing: ".05em" }}>
            NOT FOUND
          </span>{" "}
          means exactly that: it was not on the lists we checked, at the
          moment we checked them. New scams appear faster than any list can
          write them down, and our copy of the free ScamSniffer list runs
          about 7 days behind. We cannot tell you anything is safe, and we
          never will — on its first day, a brand-new scam address passes
          every scam list on earth.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 12, marginBottom: 0 }}>
          If a check comes back NOT FOUND but something still feels wrong,
          trust that feeling and{" "}
          <Link href="/report" style={{ color: "var(--link)", fontWeight: 700 }}>
            file a report
          </Link>
          . What each proof level means is spelled out at{" "}
          <Link href="/standards" style={{ color: "var(--link)", fontWeight: 700 }}>
            /standards
          </Link>
          .
        </p>
      </div>

      <SectionRule label="CREDITS AND LICENSES" />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16, marginBottom: 0 }}>
        This page only works because other people do hard work in the open:{" "}
        <a
          href="https://github.com/scamsniffer/scam-database"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--link)", fontWeight: 700 }}
        >
          ScamSniffer scam-database
        </a>{" "}
        (GPL-3.0 — we answer one lookup at a time and never hand the list
        back out) and{" "}
        <a
          href="https://github.com/MetaMask/eth-phishing-detect"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--link)", fontWeight: 700 }}
        >
          MetaMask eth-phishing-detect
        </a>
        . Second-opinion links go to{" "}
        <a
          href="https://www.chainabuse.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--link)", fontWeight: 700 }}
        >
          Chainabuse
        </a>
        , who we have no connection to. Nobody pays us to be on these lists,
        and nobody can pay us to be taken off them.
      </p>
    </main>
  );
}
