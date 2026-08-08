import type { CSSProperties } from "react";

/**
 * The neutral, scope-free styling module — the single source for the
 * newspaper idiom's shared consts. Scope-local ui.ts files (desk, account)
 * re-export from here and add only what is genuinely theirs; public-scope
 * components (src/components/votes) import from here directly, so no scope
 * ever reaches into another scope's files for a button.
 *
 * No Node imports — client components consume this file.
 */

/** The one server-action result shape, shared by every scope's actions. */
export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export const mono: CSSProperties = {
  fontFamily: "var(--font-plex-mono), monospace",
};

export const display: CSSProperties = {
  fontFamily: "var(--font-fraunces), serif",
  fontWeight: 600,
};

export const capsLabel: CSSProperties = {
  ...mono,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: ".05em",
};

export const field: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid var(--ink)",
  borderRadius: 0,
  background: "var(--paper)",
  color: "var(--ink)",
  padding: "8px 10px",
  fontSize: 16,
  fontFamily: "inherit",
  lineHeight: 1.5,
};

export const labelStyle: CSSProperties = {
  ...capsLabel,
  display: "block",
  marginBottom: 6,
};

export const button: CSSProperties = {
  ...mono,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: ".05em",
  padding: "8px 16px",
  border: "1px solid var(--ink)",
  borderRadius: 0,
  background: "var(--ink)",
  color: "var(--paper)",
  cursor: "pointer",
};

export const buttonQuiet: CSSProperties = {
  ...button,
  background: "transparent",
  color: "var(--ink)",
};

export const buttonDanger: CSSProperties = {
  ...button,
  background: "transparent",
  border: "1px solid var(--danger)",
  color: "var(--danger)",
};

export function resultStyle(ok: boolean): CSSProperties {
  return {
    ...mono,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.6,
    marginTop: 10,
    whiteSpace: "pre-wrap",
    color: ok ? "var(--ink)" : "var(--danger)",
  };
}
