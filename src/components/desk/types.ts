/**
 * Shared desk types and labels.
 *
 * IMPORTANT: no Node imports in this file — it is consumed by client
 * components (src/lib/incidents.ts pulls in node:fs, so its labels are
 * mirrored here instead of imported).
 */

export type DeskDraft = {
  id: number;
  source: string;
  sourceUrl: string | null;
  title: string;
  createdAt: string;
  normalized: Record<string, unknown> | null;
};

export type DeskReport = {
  id: number;
  description: string;
  category: string | null;
  vendor: string | null;
  domain: string | null;
  address: string | null;
  observedOn: string | null;
  evidenceUrls: string[];
  contactEmail: string | null;
  createdAt: string;
};

export type IncidentRef = { id: string; slug: string; title: string };

/** The shared action-result shape, aliased so desk code reads desk-local. */
export type DeskActionResult = import("@/components/ui").ActionResult;

export const SOURCE_LABEL: Record<string, string> = {
  llama: "DEFILLAMA HACKS",
  ic3: "FBI IC3 PSA",
  sec: "SEC LITIGATION",
  cftc: "CFTC PRESS",
  ftc: "FTC CONSUMER PROTECTION",
  optech: "BITCOIN OPTECH",
  report: "READER REPORTS",
};

/** Preferred display order for draft-queue source groups. */
export const SOURCE_ORDER = [
  "llama",
  "ic3",
  "sec",
  "cftc",
  "ftc",
  "optech",
  "report",
];

/** Mirrors SEVERITY_LABEL in src/lib/incidents.ts (that file is server-only). */
export const SEVERITY_OPTIONS = [
  { value: "S1", label: "S1 · ACTIVE LARGE-SCALE LOSS" },
  { value: "S2", label: "S2 · ACTIVE TARGETED LOSS" },
  { value: "S3", label: "S3 · PATCHED, RESIDUAL RISK" },
  { value: "S4", label: "S4 · HISTORICAL RECORD" },
] as const;

/** Category enum from data/schemas/incident.schema.json. */
export const CATEGORY_ENUM = [
  "vulnerability",
  "theft",
  "phishing",
  "impersonation",
  "supply-chain",
  "rug-pull",
  "ponzi",
  "malware",
  "social-engineering",
  "fake-device",
  "recovery-scam",
  "exchange-failure",
] as const;

/** Read a field from an ingested doc regardless of camelCase/snake_case. */
export function nField(
  n: Record<string, unknown> | null,
  camel: string,
  snake: string,
): unknown {
  if (!n) return undefined;
  return n[camel] !== undefined ? n[camel] : n[snake];
}

/** Defang a domain so the desk never renders a clickable scam host. */
export function defang(domain: string): string {
  return domain.replace(/\./g, "[.]");
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
