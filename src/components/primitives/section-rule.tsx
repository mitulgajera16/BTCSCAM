/**
 * SectionRule — the ruled section heading that divides every long page on
 * this site: mono caps, hairline-tight tracking, a 2px rule under it.
 *
 * This replaces nine byte-identical local copies (check, report, standards,
 * store, guides, sweep, sweep/2026-08-11, reports/open, scam/[slug]). They
 * had drifted in exactly one property — marginTop, 40px on seven pages and
 * 48px on two — which is why `space` exists as a prop rather than being
 * frozen: both values are real steps on the spacing scale, and collapsing
 * them to one is a design decision for a human to make, not a side effect
 * of extracting a component.
 *
 * Renders an <h2>. Pages that need a different heading level should say so
 * via `as` rather than nesting a second rule, so the document outline stays
 * honest for screen readers.
 */
import type { CSSProperties } from "react";

type SpaceToken = "--space-10" | "--space-12";

export default function SectionRule({
  label,
  danger,
  space = "--space-10",
  as: Tag = "h2",
  id,
  style,
}: {
  label: string;
  /** Red rule + red text: reserved for sections that carry a warning, never
   *  for emphasis. Severity and proof level are chips, not headings. */
  danger?: boolean;
  space?: SpaceToken;
  as?: "h2" | "h3";
  id?: string;
  style?: CSSProperties;
}) {
  return (
    <Tag
      id={id}
      style={{
        fontFamily: "var(--font-plex-mono), monospace",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        letterSpacing: ".05em",
        color: danger ? "var(--danger)" : "var(--ink)",
        borderBottom: "2px solid var(--ink)",
        paddingBottom: "var(--space-2)",
        marginTop: `var(${space})`,
        ...style,
      }}
    >
      {label}
    </Tag>
  );
}
