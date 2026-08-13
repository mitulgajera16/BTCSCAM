import Link from "next/link";
import type { Metadata } from "next";
import SectionRule from "@/components/primitives/section-rule";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

export const metadata: Metadata = {
  title: "The Monday Sweep",
  description:
    "BTCSCAM's weekly report: what we published, what we corrected, what is waiting in the incoming leads queue, and what readers reported — every Monday, honest numbers only.",
  alternates: { canonical: "/sweep" },
};

/* Published editions only — this list is the source of truth for the count. */
const EDITIONS = [
  {
    slug: "2026-08-11",
    title: "Sweep No. 1 — Launch week, mid-crisis",
    dek: "BTCSCAM opened its doors in the middle of the Coldcard seed-entropy crisis: 3 case files live, 1 public correction, 2 new guides, 120 incoming leads waiting to be reviewed, and 0 reader reports — the honest starting line.",
    published: "2026-08-11",
  },
];


export default function SweepIndex() {
  return (
    <main style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 64px" }}>
      <nav style={{ ...mono, fontSize: 12, padding: "16px 0" }}>
        <Link href="/">← FRONT PAGE</Link>
        <span style={{ color: "var(--meta)" }}> / THE MONDAY SWEEP</span>
      </nav>

      <p style={{ ...mono, fontSize: 12, fontWeight: 600, letterSpacing: ".05em", color: "var(--meta)", margin: 0 }}>
        THE DESK, IN PUBLIC · WEEKLY
      </p>
      <h1 style={{ ...display, fontSize: "clamp(28px, 5vw, 40px)", lineHeight: 1.15, margin: "8px 0 0" }}>
        The Monday Sweep
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.55, marginTop: 16 }}>
        Every Monday we publish our week: what went on the record, what we
        corrected, what new leads came in, and what readers reported. Report a
        scam almost anywhere else and you hear nothing back, ever. This page is
        the opposite promise, kept every week: we show our work, including the
        weeks when the numbers are small. No number in a Sweep is ever
        inflated; a zero is printed as a zero.
      </p>

      <SectionRule label={`EDITIONS (${EDITIONS.length})`} />
      {EDITIONS.map((e) => (
        <article
          key={e.slug}
          style={{ padding: "24px 0", borderBottom: "1px solid var(--rule)" }}
        >
          <p style={{ ...mono, fontSize: 11, fontWeight: 600, letterSpacing: ".05em", color: "var(--meta)", margin: 0 }}>
            {e.published}
          </p>
          <h3 style={{ ...display, fontSize: 22, lineHeight: 1.25, margin: "6px 0 0" }}>
            <Link href={`/sweep/${e.slug}`}>{e.title}</Link>
          </h3>
          <p style={{ fontSize: 15, lineHeight: 1.5, margin: "8px 0 0", color: "var(--ink)" }}>
            {e.dek}
          </p>
        </article>
      ))}
    </main>
  );
}
