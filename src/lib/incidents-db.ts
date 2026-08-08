import { unstable_cache } from "next/cache";

import {
  getAllIncidents,
  getIncidentBySlug,
  type Incident,
} from "./incidents";
import { getAnonClient, hasSupabase } from "./db";

/**
 * Async incident loaders for R2 ("The Wire").
 *
 * When Supabase is configured, incidents are read from the `incidents` table
 * (the `data` jsonb column is the full incident document — same shape as
 * data/incidents/*.json). When it is not configured, or a read fails, these
 * delegate to the sync bundled-JSON loaders in src/lib/incidents.ts. The
 * bundled registry is real editorial content, so falling back to it is honest
 * degradation — it is never fabricated data.
 *
 * Supabase reads are wrapped in unstable_cache with tag 'incidents' and a
 * 300s revalidate window; publishing calls revalidateTag('incidents', 'max').
 */

export type { Incident, TrustState } from "./incidents";

export interface CorrectionRow {
  id: number;
  incidentId: string;
  correctedOn: string;
  note: string;
}

export interface TickerItem {
  id: number;
  kind: string;
  label: string;
  url: string | null;
  publishedAt: string;
}

const readAllFromSupabase = unstable_cache(
  async (): Promise<Incident[]> => {
    const db = getAnonClient();
    const { data, error } = await db
      .from("incidents")
      .select("data")
      .order("first_observed", { ascending: false });
    if (error) {
      throw new Error(`Supabase incidents read failed: ${error.message}`);
    }
    return (data ?? []).map((row) => (row as { data: Incident }).data);
  },
  ["incidents"],
  { tags: ["incidents"], revalidate: 300 },
);

const readBySlugFromSupabase = unstable_cache(
  async (slug: string): Promise<Incident | null> => {
    const db = getAnonClient();
    const { data, error } = await db
      .from("incidents")
      .select("data")
      .eq("slug", slug)
      .maybeSingle();
    if (error) {
      throw new Error(
        `Supabase incident read failed for slug "${slug}": ${error.message}`,
      );
    }
    return data ? ((data as { data: Incident }).data ?? null) : null;
  },
  ["incidents", "by-slug"],
  { tags: ["incidents"], revalidate: 300 },
);

const readCorrectionsFromSupabase = unstable_cache(
  async (incidentId: string): Promise<CorrectionRow[]> => {
    const db = getAnonClient();
    const { data, error } = await db
      .from("corrections")
      .select("id, incident_id, corrected_on, note")
      .eq("incident_id", incidentId)
      .order("corrected_on", { ascending: false });
    if (error) {
      throw new Error(
        `Supabase corrections read failed for "${incidentId}": ${error.message}`,
      );
    }
    return (data ?? []).map((row) => {
      const r = row as {
        id: number;
        incident_id: string;
        corrected_on: string;
        note: string;
      };
      return {
        id: r.id,
        incidentId: r.incident_id,
        correctedOn: r.corrected_on,
        note: r.note,
      };
    });
  },
  ["incidents", "corrections"],
  { tags: ["incidents"], revalidate: 300 },
);

const readTickerFromSupabase = unstable_cache(
  async (limit: number): Promise<TickerItem[]> => {
    const db = getAnonClient();
    const { data, error } = await db
      .from("ticker_items")
      .select("id, kind, label, url, published_at")
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) {
      throw new Error(`Supabase ticker read failed: ${error.message}`);
    }
    return (data ?? []).map((row) => {
      const r = row as {
        id: number;
        kind: string;
        label: string;
        url: string | null;
        published_at: string;
      };
      return {
        id: r.id,
        kind: r.kind,
        label: r.label,
        url: r.url,
        publishedAt: r.published_at,
      };
    });
  },
  ["incidents", "ticker"],
  { tags: ["incidents", "ticker"], revalidate: 300 },
);

/**
 * All incidents, newest firstObserved first. Supabase when configured; the
 * bundled JSON registry otherwise (and as fallback on error).
 *
 * When the database IS reachable, its rows are UNIONED with the bundled
 * registry (deduped by slug, DB rows winning — they may carry desk edits the
 * bundle does not). A partially seeded table must never make bundled-only
 * dossiers silently vanish from the front page, /registry, or the feeds
 * while their /scam/[slug] pages still exist.
 */
export async function fetchAllIncidents(): Promise<Incident[]> {
  if (!hasSupabase()) {
    return getAllIncidents();
  }
  try {
    const rows = await readAllFromSupabase();
    const bySlug = new Map<string, Incident>();
    for (const incident of getAllIncidents()) {
      bySlug.set(incident.slug, incident);
    }
    for (const incident of rows) {
      if (incident && typeof incident.slug === "string" && incident.slug) {
        bySlug.set(incident.slug, incident);
      }
    }
    return [...bySlug.values()].sort((a, b) =>
      a.firstObserved < b.firstObserved ? 1 : -1,
    );
  } catch (err) {
    console.error(
      "[incidents-db] falling back to bundled registry:",
      err instanceof Error ? err.message : err,
    );
    return getAllIncidents();
  }
}

/**
 * One incident by slug. Supabase when configured; bundled JSON otherwise and
 * as fallback when the row is missing or the read fails.
 */
export async function fetchIncidentBySlug(
  slug: string,
): Promise<Incident | undefined> {
  if (!hasSupabase()) {
    return getIncidentBySlug(slug);
  }
  try {
    const hit = await readBySlugFromSupabase(slug);
    if (hit) {
      return hit;
    }
  } catch (err) {
    console.error(
      `[incidents-db] slug "${slug}" falling back to bundled registry:`,
      err instanceof Error ? err.message : err,
    );
  }
  return getIncidentBySlug(slug);
}

/**
 * Desk-composed corrections for an incident (corrections table). Without
 * Supabase this returns [] — bundled incidents carry their corrections inline
 * in incident.corrections, which pages already render.
 */
export async function fetchCorrections(
  incidentId: string,
): Promise<CorrectionRow[]> {
  if (!hasSupabase()) {
    return [];
  }
  try {
    return await readCorrectionsFromSupabase(incidentId);
  } catch (err) {
    console.error(
      `[incidents-db] corrections for "${incidentId}" unavailable:`,
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

/**
 * Latest Wire ticker items, newest first. Without Supabase this returns [] so
 * the front page keeps its static incident-derived ticker.
 */
export async function fetchTickerItems(limit = 14): Promise<TickerItem[]> {
  if (!hasSupabase()) {
    return [];
  }
  try {
    return await readTickerFromSupabase(limit);
  } catch (err) {
    console.error(
      "[incidents-db] ticker unavailable:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}
