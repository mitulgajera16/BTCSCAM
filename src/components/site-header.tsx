import Link from "next/link";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };

/**
 * v4 header chrome — three bands on the warm "orange paper" ground:
 *   1. date bar (mono, hairline below)
 *   2. masthead: SUBSCRIBE | BTC̶SCAM wordmark | WALLET TEST
 *   3. main nav: five grouped links left, MY DESK + REPORT A SCAM right
 * The wordmark is the strikethrough treatment from the design contract;
 * the stamp seal lives in the footer.
 */

const navLink = {
  fontSize: 13,
  fontWeight: 700 as const,
  letterSpacing: ".05em",
};

const edgeButton = {
  ...mono,
  display: "inline-block",
  fontSize: 11,
  fontWeight: 600 as const,
  letterSpacing: ".05em",
  border: "1px solid var(--ink)",
  background: "var(--paper)",
  color: "var(--ink)",
  padding: "9px 16px",
};

function NavGroup({
  label,
  items,
}: {
  label: string;
  items: Array<{ label: string; href: string }>;
}) {
  return (
    <span className="navdrop" style={navLink}>
      <button type="button" aria-haspopup="true">
        {label} <span style={{ color: "var(--meta)" }}>+</span>
      </button>
      <span className="navdrop-menu">
        {items.map((i) => (
          <Link key={i.href} href={i.href}>
            {i.label}
          </Link>
        ))}
      </span>
    </span>
  );
}

export default function SiteHeader({ today }: { today: string }) {
  return (
    <header style={{ background: "var(--warm)" }}>
      {/* date bar */}
      <div
        data-datebar=""
        style={{
          ...mono,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "4px 16px",
          padding: "8px 24px",
          fontSize: 12,
          fontWeight: 500,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <span style={{ whiteSpace: "nowrap" }}>{today}</span>
        <span style={{ whiteSpace: "nowrap" }}>
          EST. 2026 · READER-FUNDED · PAID LISTINGS 0
        </span>
      </div>

      {/* masthead: SUBSCRIBE | wordmark | WALLET TEST */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px 20px",
          flexWrap: "wrap",
        }}
      >
        <Link href="/rug-report" style={edgeButton}>
          SUBSCRIBE
        </Link>
        <Link href="/" style={{ textDecoration: "none" }}>
          <h1
            style={{
              fontSize: "clamp(34px, 5vw, 54px)",
              fontWeight: 900,
              letterSpacing: 0,
              lineHeight: 1,
              margin: 0,
              textAlign: "center",
            }}
          >
            <span style={{ color: "var(--orange)" }}>BTC</span>
            <span
              style={{
                textDecoration: "line-through",
                textDecorationColor: "var(--danger)",
                textDecorationThickness: "4px",
              }}
            >
              SCAM
            </span>
          </h1>
        </Link>
        <Link href="/check" style={edgeButton}>
          WALLET TEST
        </Link>
      </div>

      {/* main nav: five grouped links left, utilities right */}
      <nav
        aria-label="Main"
        style={{
          borderTop: "1px solid var(--rule)",
          borderBottom: "1px solid var(--rule)",
          background: "var(--paper)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "10px 24px",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "10px 24px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "10px 24px",
              flexWrap: "wrap",
            }}
          >
            <Link href="/registry" style={navLink}>
              DATABASE
            </Link>
            <Link href="/#dangerous" style={navLink}>
              ALERTS
            </Link>
            <NavGroup
              label="COMMUNITY"
              items={[
                { label: "Report a Scam", href: "/report" },
                { label: "Open Reports", href: "/reports/open" },
                { label: "My Desk", href: "/account" },
              ]}
            />
            <NavGroup
              label="LEARN"
              items={[
                { label: "Guides", href: "/guides" },
                { label: "The Rug Report", href: "/rug-report" },
                { label: "Standards", href: "/standards" },
              ]}
            />
            <Link href="/store" style={navLink}>
              STORE
            </Link>
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            <Link href="/account" style={{ ...mono, fontSize: 11, fontWeight: 600, letterSpacing: ".05em", color: "var(--meta)" }}>
              MY DESK
            </Link>
            <Link
              href="/report"
              style={{
                ...mono,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".05em",
                background: "var(--ink)",
                color: "var(--paper)",
                padding: "8px 14px",
              }}
            >
              REPORT A SCAM
            </Link>
          </span>
        </div>
      </nav>
    </header>
  );
}
