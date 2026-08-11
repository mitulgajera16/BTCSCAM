import Link from "next/link";
import Image from "next/image";
import { TRUST_LABEL, type Incident } from "@/lib/incidents";
import { fetchAllIncidents } from "@/lib/incidents-db";
import { fetchPrices } from "@/lib/prices";
import { coverFor } from "@/lib/covers";
import SiteHeader from "@/components/site-header";
import StampMark from "@/components/stamp-mark";
import WireTicker, { getTickerItems } from "@/components/wire-ticker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Prices, ticker, and the dateline refresh without a redeploy.
export const revalidate = 300;

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif" };

function TrustChip({ state }: { state: keyof typeof TRUST_LABEL }) {
  return (
    <span
      style={{
        ...mono,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".05em",
        padding: "2px 8px",
        border: "1px solid currentColor",
        background: state === "verified" ? "var(--ink)" : "transparent",
        color: state === "verified" ? "var(--paper)" : "inherit",
      }}
    >
      {TRUST_LABEL[state]}
    </span>
  );
}

function CriticalChip({ severity }: { severity: string }) {
  const critical = severity === "S1";
  return (
    <span
      style={{
        ...mono,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".05em",
        padding: "2px 8px",
        background: critical ? "var(--danger)" : "transparent",
        border: `1px solid var(--danger)`,
        color: critical ? "#fff" : "var(--danger)",
      }}
    >
      {critical ? "CRITICAL" : severity}
    </span>
  );
}

function fmtAgo(iso: string, now: Date): string {
  const days = Math.floor(
    (now.getTime() - new Date(iso).getTime()) / 86_400_000,
  );
  if (days <= 0) return "TODAY";
  if (days === 1) return "1d AGO";
  return `${days}d AGO`;
}

function fmtLossShort(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${Math.round(v / 1e3)}K`;
  return `$${v}`;
}

const sectionRule = {
  ...mono,
  fontSize: 12,
  fontWeight: 600 as const,
  letterSpacing: ".05em",
  borderBottom: "2px solid var(--ink)",
  paddingBottom: 8,
  margin: 0,
};

type LatestRow = {
  key: string;
  kicker: string;
  title: string;
  href: string;
  summary?: string;
  dateline: string;
  coverKey: string;
};

export default async function Home() {
  const [incidents, prices, tickerItems] = await Promise.all([
    fetchAllIncidents(),
    fetchPrices(),
    getTickerItems(),
  ]);
  const now = new Date();

  const dangerous = incidents.filter(
    (i) => i.ongoing && (i.severity === "S1" || i.severity === "S2"),
  );
  const critical = dangerous.find((i) => i.severity === "S1");
  const hero: Incident = critical ?? dangerous[0] ?? incidents[0];
  const heroCover = coverFor(hero.slug);

  const latest: LatestRow[] = [
    ...[...incidents]
      .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
      .map((i) => ({
        key: i.id,
        kicker: (i.categories[0] ?? "incident").toUpperCase().replace(/-/g, " "),
        title: i.title,
        href: `/scam/${i.slug}`,
        summary: i.summary,
        dateline: `FILED ${i.firstObserved} · UPDATED ${i.lastUpdated}`,
        coverKey: i.slug,
      })),
    {
      key: "guide-seed-entropy",
      kicker: "FIELD GUIDE",
      title: "How to generate a seed phrase with entropy you can actually trust",
      href: "/guides/seed-phrase-entropy",
      summary:
        "Dice-roll seeds survived the flaws that drained device-generated ones. 50 rolls for 12 words, 99 for 24 — and how to verify the math yourself.",
      dateline: "FACT-CHECKED 2026-08-08",
      coverKey: "guide:seed-phrase-entropy",
    },
  ];

  const onFile = [...incidents].sort(
    (a, b) =>
      a.severity.localeCompare(b.severity) ||
      b.lastUpdated.localeCompare(a.lastUpdated),
  );
  const withLoss = incidents.filter((i) => typeof i.impact?.lossUSD === "number");
  const lossTotal = withLoss.reduce((s, i) => s + (i.impact?.lossUSD ?? 0), 0);
  const lossRising = withLoss.some((i) => i.impact?.confidence === "rising");

  return (
    <main>
      <WireTicker items={tickerItems} prices={prices} />

      <SiteHeader />

      {/* Lead story — painting-led hero per v4 */}
      <section
        style={{
          position: "relative",
          background: "var(--dark)",
          minHeight: "68vh",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        {heroCover && (
          <Image
            src={heroCover.src}
            alt={heroCover.alt}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", opacity: 0.82 }}
          />
        )}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(14,14,12,0.15) 40%, rgba(14,14,12,0.88) 92%)",
          }}
        />
        <div
          style={{
            position: "relative",
            maxWidth: 1140,
            margin: "0 auto",
            padding: "56px 24px 40px",
            width: "100%",
            color: "#fff",
          }}
        >
          <p
            style={{
              ...mono,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: ".05em",
              color: "var(--orange)",
              margin: 0,
            }}
          >
            {(hero.categories[0] ?? "incident").toUpperCase().replace(/-/g, " ")}
          </p>
          <h2
            style={{
              ...display,
              fontSize: "clamp(30px, 4.6vw, 54px)",
              lineHeight: 1.15,
              margin: "10px 0 0",
              maxWidth: "22ch",
            }}
          >
            <Link href={`/scam/${hero.slug}`} style={{ color: "#fff" }}>
              {hero.title}
            </Link>
          </h2>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.5,
              margin: "14px 0 0",
              maxWidth: "58ch",
              color: "rgba(252,251,249,0.85)",
            }}
          >
            {hero.summary}
          </p>
          <p
            style={{
              ...mono,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: ".05em",
              margin: "16px 0 0",
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
              color: "rgba(252,251,249,0.7)",
            }}
          >
            <CriticalChip severity={hero.severity} />
            <TrustChip state={hero.trustState} />
            <span>
              FILED {hero.firstObserved} · UPDATED {hero.lastUpdated}
            </span>
            {heroCover && <span>{heroCover.credit}</span>}
          </p>
        </div>
      </section>

      {/* Dangerous right now — alert strip per v4 */}
      <section
        id="dangerous"
        style={{ borderBottom: "1px solid var(--rule)", padding: "0 24px" }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "18px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 16,
            }}
          >
            <p
              style={{
                ...mono,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: ".05em",
                color: "var(--danger)",
                margin: 0,
              }}
            >
              ● DANGEROUS RIGHT NOW
            </p>
            <Link
              href="/registry"
              style={{ ...mono, fontSize: 12, fontWeight: 600, color: "var(--link)" }}
            >
              ALL ALERTS →
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "14px 32px",
              marginTop: 14,
            }}
          >
            {dangerous.map((i) => (
              <div
                key={i.id}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  justifyContent: "space-between",
                }}
              >
                <span style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
                  <CriticalChip severity={i.severity} />
                  <Link
                    href={`/scam/${i.slug}`}
                    style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {i.title.split(":")[0]}
                  </Link>
                </span>
                <span style={{ ...mono, fontSize: 11, color: "var(--meta)", whiteSpace: "nowrap" }}>
                  {fmtAgo(i.lastUpdated, now)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Check before you send — inline tool band per v4 */}
      <section style={{ borderBottom: "1px solid var(--rule)", padding: "0 24px" }}>
        <form
          action="/check"
          method="get"
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            padding: "16px 0",
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <label
            htmlFor="front-check"
            style={{ ...mono, fontSize: 12, fontWeight: 600, letterSpacing: ".05em" }}
          >
            CHECK BEFORE YOU SEND:
          </label>
          <input
            id="front-check"
            name="q"
            type="text"
            maxLength={300}
            autoComplete="off"
            spellCheck={false}
            placeholder="Paste a wallet address or domain"
            style={{
              ...mono,
              flex: "1 1 260px",
              fontSize: 13,
              padding: "9px 12px",
              border: "1px solid var(--ink)",
              borderRadius: 0,
              background: "var(--paper)",
              color: "var(--ink)",
            }}
          />
          <button
            type="submit"
            style={{
              ...mono,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".05em",
              background: "var(--ink)",
              color: "var(--paper)",
              border: "1px solid var(--ink)",
              padding: "9px 18px",
              cursor: "pointer",
            }}
          >
            RUN CHECK
          </button>
          <Link href="/report" style={{ ...mono, fontSize: 12, color: "var(--link)" }}>
            or report a scam →
          </Link>
        </form>
      </section>

      {/* Body — THE LATEST + rail per v4 */}
      <section
        className="front-cols"
        style={{
          maxWidth: 1140,
          margin: "0 auto",
          padding: "32px 24px 48px",
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "40px 56px",
          alignItems: "start",
        }}
      >
        <div>
          <h2 style={sectionRule}>THE LATEST</h2>
          {latest.map((row) => {
            const cover = coverFor(row.coverKey);
            return (
              <article
                key={row.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: cover ? "1fr 116px" : "1fr",
                  gap: 18,
                  padding: "22px 0",
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
                      color: "var(--orange)",
                      margin: 0,
                    }}
                  >
                    {row.kicker}
                  </p>
                  <h3
                    style={{ ...display, fontSize: 22, lineHeight: 1.25, margin: "6px 0 0" }}
                  >
                    <Link href={row.href}>{row.title}</Link>
                  </h3>
                  {row.summary && (
                    <p
                      style={{
                        fontSize: 15,
                        color: "var(--meta)",
                        lineHeight: 1.5,
                        margin: "8px 0 0",
                        maxWidth: "62ch",
                      }}
                    >
                      {row.summary}
                    </p>
                  )}
                  <p
                    style={{
                      ...mono,
                      fontSize: 11,
                      color: "var(--meta)",
                      letterSpacing: ".05em",
                      margin: "10px 0 0",
                    }}
                  >
                    {row.dateline}
                  </p>
                </div>
                {cover && (
                  <Link href={row.href} aria-hidden="true" tabIndex={-1}>
                    <Image
                      src={cover.src}
                      alt={cover.alt}
                      width={116}
                      height={116}
                      style={{ objectFit: "cover", width: 116, height: 116, display: "block" }}
                    />
                  </Link>
                )}
              </article>
            );
          })}
        </div>

        <aside id="registry">
          <h2 style={sectionRule}>ON FILE · SEVERITY RANKED</h2>
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {onFile.map((i, idx) => (
              <li
                key={i.id}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "14px 0",
                  borderBottom: "1px solid var(--rule)",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{ ...display, fontSize: 26, color: "var(--rule)", fontWeight: 600 }}
                >
                  {idx + 1}
                </span>
                <span>
                  <Link href={`/scam/${i.slug}`} style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.35 }}>
                    {i.title.split(":")[0]}
                  </Link>
                  <span
                    style={{ ...mono, display: "block", fontSize: 11, color: "var(--meta)", marginTop: 4 }}
                  >
                    {i.severity} · {TRUST_LABEL[i.trustState]}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          {lossTotal > 0 && (
            <div
              style={{
                background: "var(--dark)",
                color: "var(--dark-text)",
                padding: "22px 22px 20px",
                marginTop: 24,
              }}
            >
              <p
                style={{ ...mono, fontSize: 11, fontWeight: 600, letterSpacing: ".05em", margin: 0 }}
              >
                FROM THE DATABASE
              </p>
              <p
                style={{
                  ...mono,
                  fontSize: 34,
                  fontWeight: 600,
                  color: "var(--orange)",
                  margin: "10px 0 0",
                }}
              >
                {fmtLossShort(lossTotal)}
                {lossRising ? "+" : ""}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.5, margin: "8px 0 0" }}>
                documented lost across {incidents.length} tracked incidents
                {lossRising ? " — still rising" : ""}
              </p>
              <Link
                href="/registry"
                style={{
                  ...mono,
                  display: "inline-block",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: ".05em",
                  color: "#fff",
                  borderBottom: "1px solid var(--orange)",
                  marginTop: 14,
                }}
              >
                OPEN THE DATABASE →
              </Link>
            </div>
          )}
        </aside>
      </section>

      {/* v4 footer — sections grouped, stamp as the seal */}
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
          {[
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
          ].map((col) => (
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
        <div
          style={{
            borderTop: "1px solid var(--rule)",
            padding: "14px 24px",
          }}
        >
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
            BTCSCAM.COM IS OUR ONLY DOMAIN. ANY OTHER SITE USING THIS NAME IS AN
            IMPOSTOR — CHECK YOUR ADDRESS BAR.
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
            <span>© 2026 BTCSCAM.COM — COMMUNITY-VERIFIED SCAM INTELLIGENCE</span>
            <span>NOT FINANCIAL ADVICE · VERIFY EVERYTHING · PAID LISTINGS 0</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
