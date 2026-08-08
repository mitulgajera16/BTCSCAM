import { fetchAllIncidents } from "@/lib/incidents-db";
import { TRUST_LABEL, type Incident } from "@/lib/incidents";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 300;

/** Minimal XML entity escaping for element text content. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(dateString: string): string {
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

export async function GET() {
  const incidents = await fetchAllIncidents();

  const sorted: Incident[] = [...incidents].sort((a: Incident, b: Incident) =>
    a.published < b.published ? 1 : -1,
  );

  const items = sorted
    .map((i) => {
      const permalink = `${SITE_URL}/scam/${i.slug}`;
      // Feed items stand alone, without the permalink's trust-state chip, so
      // each item carries its own: the "what's verified" title suffix only
      // where verification actually happened, and every description opens
      // with the trust state — a reported-only entry must never read as
      // carrying verified findings.
      const title =
        i.trustState === "verified" || i.trustState === "resolved"
          ? `${i.title}: what happened and what's verified`
          : i.title;
      const description = `TRUST STATE: ${TRUST_LABEL[i.trustState]}. ${i.summary}`;
      return [
        "    <item>",
        `      <title>${esc(title)}</title>`,
        `      <link>${esc(permalink)}</link>`,
        `      <guid isPermaLink="true">${esc(permalink)}</guid>`,
        `      <pubDate>${toRfc822(i.published)}</pubDate>`,
        `      <description>${esc(description)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
    "  <channel>",
    "    <title>BTCSCAM — The Anti-Scam Paper of Record</title>",
    `    <link>${esc(SITE_URL)}</link>`,
    "    <description>Documented bitcoin and crypto scam incidents: every entry carries a trust state and cited sources. Severity is not verification.</description>",
    "    <language>en</language>",
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    "    <ttl>5</ttl>",
    `    <atom:link href="${esc(`${SITE_URL}/feed.xml`)}" rel="self" type="application/rss+xml"/>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
