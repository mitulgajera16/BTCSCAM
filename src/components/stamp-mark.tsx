/**
 * STAMP — the BTCSCAM rubber-stamp seal wordmark.
 *
 * Self-contained SVG, no client JS. Double-border rounded-rect frame,
 * tilted -3deg, heavy condensed wordmark, mono micro-line beneath.
 * Grunge is exactly two marks: one crisp chip on the outer frame and one
 * faded under-ink scratch across the lower-left border — crisp, not kitsch.
 *
 * Reads as intentional from 28px (favicon-adjacent) up to 120px (masthead).
 */

export type StampMarkProps = {
  /** Rendered height in px. Width follows the stamp's fixed ratio. */
  size?: number;
  /** Ink color: brand orange (default) or plain ink. */
  tone?: "orange" | "ink";
};

const VIEW_W = 132;
const VIEW_H = 56;

export default function StampMark({
  size = 56,
  tone = "orange",
}: StampMarkProps) {
  const color = tone === "ink" ? "var(--ink)" : "var(--orange)";
  const maskId = `btcscam-stamp-grunge-${tone}`;
  const width = Math.round(size * (VIEW_W / VIEW_H));

  return (
    <svg
      width={width}
      height={size}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label="BTCSCAM — Est. 2026 · Paper of Record"
      style={{ display: "block" }}
    >
      <title>BTCSCAM stamp mark</title>
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={VIEW_W}
          height={VIEW_H}
        >
          <rect width={VIEW_W} height={VIEW_H} fill="#fff" />
          {/* grunge 1: crisp chip out of the outer frame, top-right */}
          <circle cx="103.5" cy="6.2" r="2.1" fill="#000" />
          {/* grunge 2: faded under-ink scratch across the lower-left border */}
          <rect
            x="1"
            y="43.4"
            width="21"
            height="1.5"
            transform="rotate(-7 11.5 44.15)"
            fill="#000"
            opacity="0.55"
          />
        </mask>
      </defs>

      <g transform="rotate(-3 66 28)">
        <g mask={`url(#${maskId})`}>
          {/* double-border stamp frame */}
          <rect
            x="5"
            y="5.5"
            width="122"
            height="45"
            rx="6"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
          />
          <rect
            x="9.75"
            y="10.25"
            width="112.5"
            height="35.5"
            rx="3.25"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />

          {/* wordmark — heavy caps, condensed via x-scale about center */}
          <g transform="translate(66 0) scale(0.86 1) translate(-66 0)">
            <text
              x="66"
              y="29.75"
              textAnchor="middle"
              fill={color}
              fontFamily="var(--font-geist), system-ui, sans-serif"
              fontWeight={900}
              fontSize={20}
              letterSpacing=".05em"
            >
              BTCSCAM
            </text>
          </g>

          {/* micro-line — mono 9px at masthead size */}
          <text
            x="66"
            y="40.75"
            textAnchor="middle"
            fill={color}
            fontFamily="var(--font-plex-mono), monospace"
            fontWeight={600}
            fontSize={4.2}
            letterSpacing=".05em"
          >
            EST. 2026 · PAPER OF RECORD
          </text>
        </g>
      </g>
    </svg>
  );
}
