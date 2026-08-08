/**
 * Minimal hand-rolled RSS 2.0 / Atom parser. No dependencies, no DOM.
 *
 * Verified live against the five feeds this pipeline consumes (2026-08-08):
 * - IC3 PSA RSS: RSS 2.0, no <description>, guid isPermaLink="false"
 * - SEC litigation RSS: RSS 2.0, dc:creator, links contain trailing newlines
 * - CFTC press RSS: RSS 2.0, self-closing <description/>
 * - FTC consumer-protection RSS: RSS 2.0, UTF-8 curly quotes
 * - Bitcoin Optech: Atom (<entry>, <link href> attributes, <published>)
 *
 * Robust to CDATA sections, XML entities, self-closing tags, and namespaced
 * tag names. Not a general XML parser — good enough for these feeds, and it
 * fails soft (missing fields come back as empty strings).
 */

export interface FeedItem {
  title: string;
  link: string;
  guid: string;
  /** ISO 8601 timestamp, or null when the feed date could not be parsed. */
  publishedAt: string | null;
  /** Plain-text summary/description with tags stripped. May be "". */
  summary: string;
}

function decodeEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return Number.isNaN(code) ? "" : String.fromCodePoint(code);
    })
    .replace(/&#(\d+);/g, (_, dec: string) => {
      const code = Number.parseInt(dec, 10);
      return Number.isNaN(code) ? "" : String.fromCodePoint(code);
    })
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripCdata(input: string): string {
  return input.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, " ");
}

function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

/** Extract inner text of the first matching tag name. Handles CDATA. */
function extractTag(block: string, names: string[]): string {
  for (const name of names) {
    const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i");
    const match = block.match(re);
    if (match) {
      return collapseWhitespace(decodeEntities(stripCdata(match[1])));
    }
    // Self-closing (e.g. CFTC's <description/>) → treat as absent, keep looking.
  }
  return "";
}

/** RSS uses <link>url</link>; Atom uses <link href="..." rel="alternate"/>. */
function extractLink(block: string): string {
  const rss = block.match(/<link(?:\s[^>]*)?>([\s\S]*?)<\/link>/i);
  if (rss && rss[1].trim()) {
    return decodeEntities(stripCdata(rss[1]).trim());
  }
  let fallbackHref = "";
  for (const m of block.matchAll(/<link\b([^>]*?)\/?>/gi)) {
    const attrs = m[1];
    const href = attrs.match(/href="([^"]*)"/i)?.[1] ?? "";
    if (!href) continue;
    if (/rel="alternate"/i.test(attrs)) return decodeEntities(href.trim());
    if (!fallbackHref) fallbackHref = href;
  }
  return decodeEntities(fallbackHref.trim());
}

function extractDate(block: string): string | null {
  const raw = extractTag(block, ["pubDate", "published", "updated", "dc:date"]);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function extractSummary(block: string): string {
  // Content may be XML-escaped HTML (&lt;p&gt;) or CDATA-wrapped HTML —
  // decodeEntities inside extractTag handles the former; strip tags after,
  // then decode ONCE MORE: escaped-HTML descriptions routinely carry
  // double-escaped entities (&amp;amp;) that only surface after the first
  // decode, and they must not reach draft summaries or ticker labels.
  for (const name of ["description", "summary", "content:encoded", "content"]) {
    const text = extractTag(block, [name]);
    if (text) return collapseWhitespace(decodeEntities(stripTags(text)));
  }
  return "";
}

/**
 * Parse an RSS 2.0 or Atom feed into items. Items without a title AND
 * without a link are dropped; everything else fails soft.
 */
export function parseFeed(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  for (const m of xml.matchAll(
    /<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi,
  )) {
    const block = m[2];
    const title = extractTag(block, ["title"]);
    const link = extractLink(block);
    if (!title && !link) continue;
    const guid = extractTag(block, ["guid", "id"]) || link;
    items.push({
      title,
      link,
      guid,
      publishedAt: extractDate(block),
      summary: extractSummary(block),
    });
  }
  return items;
}
