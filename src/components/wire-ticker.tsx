import { getAllIncidents } from "@/lib/incidents";
import { hasSupabase } from "@/lib/db";
import { fetchAllIncidents, fetchTickerItems } from "@/lib/incidents-db";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };

export type TickerKind = "incident" | "advisory" | "optech" | "stat";

export interface TickerItem {
  label: string;
  kind: TickerKind;
}

/**
 * Ticker items derived from the bundled incident JSON — the exact logic the
 * front page used inline before this component existed. Used when Supabase is
 * not configured (or unreachable): the bundled registry is real, published
 * data, so falling back to it stays honest.
 */
function deriveStaticItems(): TickerItem[] {
  const incidents = getAllIncidents();
  const dangerous = incidents.filter(
    (i) => i.ongoing && (i.severity === "S1" || i.severity === "S2"),
  );
  return [
    ...dangerous.map(
      (i): TickerItem => ({
        label: i.title.split(":")[0].toUpperCase(),
        kind: "incident",
      }),
    ),
    { label: `REGISTRY ENTRIES ${incidents.length}`, kind: "stat" },
    { label: "PAID LISTINGS 0", kind: "stat" },
  ];
}

function normalizeKind(kind: string): TickerKind {
  return kind === "incident" || kind === "advisory" || kind === "optech"
    ? kind
    : "stat";
}

/**
 * Resolve ticker content: live ticker_items rows when Supabase is configured,
 * otherwise the static derivation above. Never invents entries.
 */
export async function getTickerItems(): Promise<TickerItem[]> {
  if (hasSupabase()) {
    try {
      const [rows, incidents] = await Promise.all([
        fetchTickerItems(),
        fetchAllIncidents(),
      ]);
      // fetchTickerItems never throws — it returns [] both when the table is
      // empty (cron has not run) and when the read failed. Either way there
      // is no live wire, so fall back to the static derivation rather than
      // silently dropping every S1/S2 SCAM ALERT from the front page.
      if (rows.length === 0) {
        return deriveStaticItems();
      }
      return [
        ...rows.map(
          (r: { label: string; kind: string }): TickerItem => ({
            label: r.label,
            kind: normalizeKind(r.kind),
          }),
        ),
        { label: `REGISTRY ENTRIES ${incidents.length}`, kind: "stat" },
        { label: "PAID LISTINGS 0", kind: "stat" },
      ];
    } catch {
      // Database configured but the read failed — degrade to bundled data
      // rather than render nothing or pretend the live wire is up.
      return deriveStaticItems();
    }
  }
  return deriveStaticItems();
}

function ItemPrefix({ kind }: { kind: TickerKind }) {
  if (kind === "incident") {
    return (
      <span
        style={{
          background: "var(--danger)",
          color: "#fff",
          padding: "1px 6px",
          marginRight: 8,
        }}
      >
        SCAM ALERT
      </span>
    );
  }
  if (kind === "advisory") {
    return (
      <span style={{ color: "var(--orange)", fontWeight: 600, marginRight: 8 }}>
        OFFICIAL ADVISORY
      </span>
    );
  }
  if (kind === "optech") {
    return (
      <span
        style={{ color: "var(--tick-up)", fontWeight: 600, marginRight: 8 }}
      >
        OPTECH
      </span>
    );
  }
  return null;
}

/**
 * The Wire — front-page marquee band. Server component; drop-in replacement
 * for the inline ticker markup in page.tsx:
 *
 *   <WireTicker items={await getTickerItems()} />
 */
export default function WireTicker({ items }: { items: TickerItem[] }) {
  // Same speed as the original 4-item/30s band, scaled so a fuller wire
  // stays readable instead of whipping past.
  const durationSeconds = Math.max(30, items.length * 6);

  return (
    <div
      style={{ background: "var(--dark)", overflow: "hidden" }}
      aria-hidden="true"
    >
      <div
        style={{
          ...mono,
          display: "flex",
          gap: 48,
          whiteSpace: "nowrap",
          padding: "8px 0",
          fontSize: 12,
          fontWeight: 500,
          color: "var(--dark-text)",
          animation: `tickmove ${durationSeconds}s linear infinite`,
          width: "max-content",
        }}
      >
        {[0, 1].map((n) => (
          <span key={n} style={{ display: "flex", gap: 48 }}>
            <span>
              THE WIRE <span style={{ color: "var(--tick-up)" }}>●</span> LIVE
            </span>
            {items.map((item, idx) => (
              <span key={`${item.kind}-${idx}`}>
                <ItemPrefix kind={item.kind} />
                {item.label}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
