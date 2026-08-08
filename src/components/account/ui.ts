import type { CSSProperties } from "react";
import { mono } from "@/components/ui";

/**
 * Account styling — shared consts come from the neutral module
 * (src/components/ui.ts); only what is genuinely account-specific is
 * defined here.
 */

export {
  mono,
  display,
  capsLabel,
  field,
  button,
  buttonQuiet,
  resultStyle,
} from "@/components/ui";

export const sectionRule: CSSProperties = {
  ...mono,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: ".05em",
  color: "var(--ink)",
  borderBottom: "2px solid var(--ink)",
  paddingBottom: 8,
  marginTop: 48,
};

/** Defang a domain so the ledger never renders a clickable scam host. */
export function defang(domain: string): string {
  return domain.replace(/\./g, "[.]");
}
