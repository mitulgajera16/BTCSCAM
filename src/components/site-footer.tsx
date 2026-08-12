import Link from "next/link";
import StampMark from "@/components/stamp-mark";
import { SITE_HOST } from "@/lib/site";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };

const COLUMNS = [
  {
    h: "SECTIONS",
    links: [
      ["Front Page", "/"],
      ["The Database", "/registry"],
      ["Wallet Check", "/check"],
      ["Guides", "/guides"],
    ],
  },
  {
    h: "COMMUNITY",
    links: [
      ["Report a Scam", "/report"],
      ["Open Reports", "/reports/open"],
      ["My Desk", "/account"],
      ["Store", "/store"],
    ],
  },
  {
    h: "THE WIRE",
    links: [
      ["Monday Sweep", "/sweep"],
      ["RSS Feed", "/feed.xml"],
      ["Data API", "/api/incidents"],
      ["Sitemap", "/sitemap.xml"],
    ],
  },
  {
    h: "ORGANIZATION",
    links: [
      ["Standards & Corrections", "/standards"],
      ["Dispute a Listing", "/standards"],
    ],
  },
] as const;

/**
 * Sitewide footer, rendered from the root layout so every page carries the
 * canonical-domain notice and the nav — not just the homepage. The domain
 * line is driven by SITE_HOST, the single source of truth, so it can never
 * contradict llms.txt or the Sweep, and never names a host we do not control.
 */
export default function SiteFooter() {
  return (
    <footer style={{ background: "var(--warm)", borderTop: "1px solid var(--rule)" }}>
      <div
        style={{
          maxWidth: 1140,
          margin: "0 auto",
          padding: "40px 24px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "32px 40px",
        }}
      >
        <div>
          <p style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0, margin: 0 }}>
            <span style={{ color: "var(--orange)" }}>BTC</span>
            <span
              style={{
                textDecoration: "line-through",
                textDecorationColor: "var(--danger)",
                textDecorationThickness: "3px",
              }}
            >
              SCAM
            </span>
            <span style={{ color: "var(--meta)" }}>.COM</span>
          </p>
          <p
            style={{ ...mono, fontSize: 11, color: "var(--meta)", letterSpacing: ".05em", lineHeight: 1.6, margin: "10px 0 0" }}
          >
            EXPOSE SCAMS · VERIFY REPORTS · PROTECT THE COMMUNITY
          </p>
          <div style={{ marginTop: 14 }}>
            <StampMark size={44} tone="ink" />
          </div>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.h}>
            <p
              style={{ ...mono, fontSize: 11, fontWeight: 600, letterSpacing: ".05em", color: "var(--meta)", margin: 0 }}
            >
              {col.h}
            </p>
            <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0 }}>
              {col.links.map(([label, href]) => (
                <li key={`${col.h}-${label}`} style={{ marginTop: 8 }}>
                  <Link href={href} style={{ fontSize: 14, fontWeight: 700 }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--rule)", padding: "14px 24px" }}>
        <p
          style={{
            maxWidth: 1140,
            margin: "0 auto 10px",
            ...mono,
            fontSize: 11,
            color: "var(--meta)",
            letterSpacing: ".05em",
          }}
        >
          {SITE_HOST.toUpperCase()} IS OUR ONLY DOMAIN. ANY OTHER SITE USING THIS
          NAME IS AN IMPOSTOR — CHECK YOUR ADDRESS BAR.
        </p>
        <div
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: "8px 24px",
            flexWrap: "wrap",
            ...mono,
            fontSize: 11,
            color: "var(--meta)",
            letterSpacing: ".05em",
          }}
        >
          <span>© 2026 BTCSCAM — COMMUNITY-VERIFIED SCAM INTELLIGENCE</span>
          <span>NOT FINANCIAL ADVICE · VERIFY EVERYTHING · PAID LISTINGS 0</span>
        </div>
      </div>
    </footer>
  );
}
