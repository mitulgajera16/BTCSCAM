import Link from "next/link";
import type { Metadata } from "next";

/**
 * The site had no not-found boundary, so a bad URL rendered Next's default
 * unstyled 404 — no wordmark, no nav, no way back. For a site whose footer
 * warns that any other site using this name is a fake, an unbranded page is
 * a trust problem, not just a rough edge.
 */

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

const EXITS: Array<{ href: string; label: string; blurb: string }> = [
  {
    href: "/check",
    label: "CHECK A WALLET OR WEBSITE",
    blurb: "Paste an address or a site and we look it up against known-scam lists.",
  },
  {
    href: "/registry",
    label: "THE SCAM DATABASE",
    blurb: "Every scam we have on file, with sources and a proof level.",
  },
  {
    href: "/report",
    label: "REPORT A SCAM",
    blurb: "A person reads every report. You do not need to be sure.",
  },
  {
    href: "/guides",
    label: "PROTECTION GUIDES",
    blurb: "Plain-language guides to the traps that take the most money.",
  },
];

export default function NotFound() {
  return (
    <main
      style={{
        maxWidth: "var(--w-prose)",
        margin: "0 auto",
        padding: "0 var(--space-6) var(--space-16)",
      }}
    >
      <nav style={{ ...mono, fontSize: "var(--text-xs)", padding: "var(--space-4) 0" }}>
        <Link href="/">← FRONT PAGE</Link>
        <span style={{ color: "var(--fg-muted)" }}> / PAGE NOT FOUND</span>
      </nav>

      <p
        style={{
          ...mono,
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          letterSpacing: ".05em",
          color: "var(--fg-muted)",
          margin: 0,
        }}
      >
        404 · NOTHING FILED AT THIS ADDRESS
      </p>

      <h1
        style={{
          ...display,
          fontSize: "var(--text-h1)",
          lineHeight: "var(--lh-tight)",
          margin: "var(--space-2) 0 0",
        }}
      >
        This page does not exist.
      </h1>

      <p
        style={{
          fontSize: "var(--text-md)",
          lineHeight: "var(--lh-body)",
          color: "var(--fg-muted)",
          maxWidth: "var(--measure-narrow)",
          margin: "var(--space-3) 0 0",
        }}
      >
        The link may be old, or mistyped. Nothing was deleted to hide it — when
        we retire a record we keep it and date it, and say so on the page.
      </p>

      <div
        style={{
          borderTop: "2px solid var(--line-strong)",
          marginTop: "var(--space-10)",
          paddingTop: "var(--space-2)",
        }}
      >
        <p
          style={{
            ...mono,
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            letterSpacing: ".05em",
            margin: 0,
          }}
        >
          WHERE YOU PROBABLY MEANT TO GO
        </p>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "var(--space-6) 0 0" }}>
        {EXITS.map((e) => (
          <li
            key={e.href}
            style={{
              borderBottom: "1px solid var(--line)",
              padding: "var(--space-4) 0",
            }}
          >
            <Link
              href={e.href}
              style={{
                ...mono,
                display: "inline-block",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                letterSpacing: ".05em",
              }}
            >
              {e.label} →
            </Link>
            <p
              style={{
                fontSize: "var(--text-meta)",
                lineHeight: "var(--lh-body)",
                color: "var(--fg-muted)",
                margin: "var(--space-1) 0 0",
                maxWidth: "var(--measure-narrow)",
              }}
            >
              {e.blurb}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
