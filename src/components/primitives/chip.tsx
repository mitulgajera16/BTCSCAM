/**
 * Chip — the small mono-caps token this site prints beside a headline: a
 * severity, a proof level, a category, a count.
 *
 * The signature `padding: 2px 8px` was pasted 26 times across the codebase,
 * alongside eight other paddings doing the same job. This is the one.
 *
 * Tone is a role, not a colour. `danger` and `dangerSolid` mean "this can
 * still take your money today"; `muted` means "on the record, not urgent".
 * Callers pass the role and let the chip own the palette, so an S4 case
 * that is long over can never come out wearing the same red as a live one.
 */
import type { CSSProperties, ReactNode } from "react";

export type ChipTone = "dangerSolid" | "danger" | "neutral" | "muted";

const TONE: Record<ChipTone, CSSProperties> = {
  // Live and expensive: filled, maximum weight on the page.
  dangerSolid: {
    background: "var(--danger)",
    border: "1px solid var(--danger)",
    color: "var(--danger-fg)",
  },
  // Live but narrower: outlined, still unmistakably red.
  danger: {
    background: "transparent",
    border: "1px solid var(--danger)",
    color: "var(--danger)",
  },
  // Carries meaning, carries no alarm.
  neutral: {
    background: "transparent",
    border: "1px solid var(--ink)",
    color: "var(--ink)",
  },
  // Historical record: present, quiet, never red.
  muted: {
    background: "transparent",
    border: "1px solid var(--rule)",
    color: "var(--meta)",
  },
};

export default function Chip({
  tone = "neutral",
  children,
  title,
  style,
}: {
  tone?: ChipTone;
  children: ReactNode;
  /** Native tooltip — use for the long form of an abbreviated label. */
  title?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      title={title}
      style={{
        display: "inline-block",
        fontFamily: "var(--font-plex-mono), monospace",
        fontSize: "var(--text-2xs)",
        fontWeight: 600,
        letterSpacing: ".05em",
        padding: "2px 8px",
        whiteSpace: "nowrap",
        ...TONE[tone],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
