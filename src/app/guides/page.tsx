import Link from "next/link";
import type { Metadata } from "next";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif" };

export const metadata: Metadata = {
  title: "Protect Yourself — Guides",
  description:
    "Fact-checked, plain-language guides to protecting your bitcoin. Live now: verifiable seed-phrase entropy. In preparation: device verification and inheritance.",
};

/* Published guides only. Honest numbers: this list is the source of truth
   for the count shown below. */
const LIVE_GUIDES = [
  {
    slug: "seed-phrase-entropy",
    kicker: "GUIDE · FACT-CHECKED 2026-08-08",
    title: "How to generate a seed phrase with entropy you can actually trust",
    dek: "$116M+ (rising estimate, as of 2026-08-05) was stolen from people who did everything “right.” Dice-roll seeds survived. 50 rolls for 12 words, 99 for 24 — and how to verify the math yourself.",
    published: "2026-08-08",
  },
];

/* No dates. We publish when fact-checking is done, not before. */
const IN_PREPARATION = [
  {
    title: "Device verification: proving your hardware wallet is genuine",
    scope:
      "Vendor genuineness checks, the limits of tamper-evident packaging, and why you buy direct.",
  },
  {
    title: "Inheritance: passing bitcoin on without handing anyone your keys",
    scope:
      "Multisig and timelock approaches, and written instructions that never leak the seed itself.",
  },
];

function SectionRule({ label }: { label: string }) {
  return (
    <h2
      style={{
        ...mono,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: ".05em",
        borderBottom: "2px solid var(--ink)",
        paddingBottom: 8,
        marginTop: 40,
      }}
    >
      {label}
    </h2>
  );
}

export default function GuidesPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px" }}>
      <nav style={{ ...mono, fontSize: 12, padding: "16px 0" }}>
        <Link href="/">← FRONT PAGE</Link>
        <span style={{ color: "var(--meta)" }}> / PROTECT YOURSELF</span>
      </nav>

      <header style={{ borderBottom: "3px double var(--ink)", paddingBottom: 24 }}>
        <h1
          style={{
            ...display,
            fontSize: "clamp(32px, 6vw, 40px)",
            fontWeight: 600,
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          Protect Yourself
        </h1>
        <p
          style={{
            ...mono,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: ".05em",
            color: "var(--meta)",
            marginTop: 12,
            marginBottom: 0,
          }}
        >
          GUIDES · FACT-CHECKED AGAINST PRIMARY SOURCES · CORRECTIONS PUBLIC
        </p>
      </header>

      <section>
        <SectionRule label={`LIVE GUIDES (${LIVE_GUIDES.length})`} />
        {LIVE_GUIDES.map((g) => (
          <article
            key={g.slug}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 16,
              padding: "24px 0",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <div>
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
                {g.kicker}
              </p>
              <h3
                style={{
                  ...display,
                  fontSize: "clamp(24px, 4vw, 32px)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  margin: "8px 0 0",
                }}
              >
                <Link href={`/guides/${g.slug}`}>{g.title}</Link>
              </h3>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--meta)",
                  lineHeight: 1.5,
                  marginTop: 8,
                  marginBottom: 12,
                  maxWidth: "65ch",
                }}
              >
                {g.dek}
              </p>
              <Link
                href={`/guides/${g.slug}`}
                style={{
                  ...mono,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--link)",
                }}
              >
                READ THE GUIDE →
              </Link>
            </div>
            <div style={{ ...mono, fontSize: 12, textAlign: "right", color: "var(--meta)" }}>
              PUBLISHED {g.published}
            </div>
          </article>
        ))}
      </section>

      <section>
        <SectionRule label="IN PREPARATION — NO DATES PROMISED" />
        {IN_PREPARATION.map((g) => (
          <article
            key={g.title}
            style={{
              display: "flex",
              gap: 16,
              alignItems: "baseline",
              padding: "16px 0",
              borderBottom: "1px solid var(--rule)",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                ...mono,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".05em",
                padding: "2px 8px",
                border: "1px solid var(--rule)",
                color: "var(--meta)",
                whiteSpace: "nowrap",
              }}
            >
              IN PREPARATION
            </span>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h3
                style={{
                  ...display,
                  fontSize: 21,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  margin: 0,
                  color: "var(--meta)",
                }}
              >
                {g.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--meta)",
                  lineHeight: 1.5,
                  margin: "4px 0 0",
                  maxWidth: "65ch",
                }}
              >
                {g.scope}
              </p>
            </div>
          </article>
        ))}
        <p
          style={{
            ...mono,
            fontSize: 12,
            color: "var(--meta)",
            marginTop: 16,
          }}
        >
          Guides go live only after fact-checking against primary sources. We do
          not announce dates we might miss.
        </p>
      </section>
    </main>
  );
}
