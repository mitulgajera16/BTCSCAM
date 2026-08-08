import fs from "node:fs";
import path from "node:path";

export type TrustState =
  | "reported"
  | "corroborated"
  | "verified"
  | "resolved"
  | "disputed";

export interface Incident {
  id: string;
  slug: string;
  title: string;
  summary: string;
  trustState: TrustState;
  severity: "S1" | "S2" | "S3" | "S4";
  ongoing?: boolean;
  categories: string[];
  firstObserved: string;
  published: string;
  lastUpdated: string;
  entities?: {
    vendor?: string;
    products?: string[];
    domains?: string[];
    addresses?: string[];
  };
  impact?: {
    lossUSD?: number;
    lossNative?: string;
    victims?: string;
    confidence?: "confirmed" | "estimated" | "rising";
    asOf?: string;
    source?: string;
  };
  timeline?: { date: string; event: string; source?: string }[];
  affected?: string[];
  notAffected?: string[];
  actions: string[];
  claims?: {
    claim: string;
    status:
      | "primary-confirmed"
      | "reported-unconfirmed"
      | "disputed"
      | "retracted";
    attribution?: string;
    sources?: string[];
  }[];
  relatedGuides?: string[];
  relatedIncidents?: string[];
  sources: { url: string; publisher: string; date?: string; type: string }[];
  corrections?: { date: string; note: string }[];
  tags?: string[];
}

const INCIDENTS_DIR = path.join(process.cwd(), "data", "incidents");

export function getAllIncidents(): Incident[] {
  return fs
    .readdirSync(INCIDENTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map(
      (f) =>
        JSON.parse(
          fs.readFileSync(path.join(INCIDENTS_DIR, f), "utf-8"),
        ) as Incident,
    )
    .sort((a, b) => (a.firstObserved < b.firstObserved ? 1 : -1));
}

export function getIncidentBySlug(slug: string): Incident | undefined {
  return getAllIncidents().find((i) => i.slug === slug);
}

export function isStale(incident: Incident, now = new Date()): boolean {
  const updated = new Date(incident.lastUpdated);
  return (
    (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24) > 90 &&
    incident.trustState !== "resolved"
  );
}

export const TRUST_LABEL: Record<TrustState, string> = {
  reported: "REPORTED · UNVERIFIED",
  corroborated: "CORROBORATED",
  verified: "VERIFIED",
  resolved: "RESOLVED",
  disputed: "DISPUTED",
};

export const SEVERITY_LABEL: Record<Incident["severity"], string> = {
  S1: "S1 · ACTIVE LARGE-SCALE LOSS",
  S2: "S2 · ACTIVE TARGETED LOSS",
  S3: "S3 · PATCHED, RESIDUAL RISK",
  S4: "S4 · HISTORICAL RECORD",
};
