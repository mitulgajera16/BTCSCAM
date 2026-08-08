import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { getServiceClient, hasSupabase } from "@/lib/db";
import { generateDefaultHandle } from "./handle";
import type { LadderRole } from "./types";

// ── Session (cookie) client ────────────────────────────────────────────────
// @supabase/ssr cookie pattern. cookies() is ASYNC in Next 16 — await it.
// Reads use the anon key; all privileged reads/writes go through the SERVICE
// client below, keyed strictly to the session's verified auth.uid.

function supabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function supabaseAnonKey(): string | undefined {
  return (
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function createSessionClient() {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) {
    throw new Error("Supabase is not configured — guard with hasSupabase().");
  }
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component render: cookies are read-only here. Session
          // refresh happens in src/proxy.ts — safe to ignore.
        }
      },
    },
  });
}

/**
 * The verified session user, or null. Uses auth.getUser() (validates the JWT
 * against the auth server) — never trust getSession() alone for authz.
 */
export async function getSessionUser(): Promise<User | null> {
  if (!hasSupabase()) return null;
  try {
    const sb = await createSessionClient();
    const { data, error } = await sb.auth.getUser();
    if (error) return null;
    return data.user ?? null;
  } catch {
    return null;
  }
}

// ── Profiles ───────────────────────────────────────────────────────────────

export type AccountProfile = {
  id: string;
  handle: string | null;
  role: LadderRole;
  acceptedReports: number;
  onboarded: boolean;
  showCredit: boolean;
};

const ROLES: readonly LadderRole[] = [
  "reader",
  "reporter",
  "corroborator",
  "watchman",
  "mod",
];

function mapProfile(row: Record<string, unknown>): AccountProfile {
  const role = ROLES.includes(row.role as LadderRole)
    ? (row.role as LadderRole)
    : "reader";
  return {
    id: String(row.id),
    handle: typeof row.handle === "string" && row.handle ? row.handle : null,
    role,
    acceptedReports:
      typeof row.accepted_reports === "number" ? row.accepted_reports : 0,
    // onboarded / show_credit land with migration 0003 — default honestly
    // (welcome panel shows, credit defaults on) until the columns exist.
    onboarded: row.onboarded === true,
    showCredit: row.show_credit !== false,
  };
}

/** Read a profile via the service client (RLS-independent, server-only). */
export async function fetchProfile(
  userId: string,
): Promise<AccountProfile | null> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return mapProfile(data as Record<string, unknown>);
}

/**
 * Fetch the profile, creating the row if the sign-up trigger/callback has not
 * (first-visit race, or accounts created before the trigger existed). Insert
 * is idempotent: a primary-key conflict means someone else won — read theirs.
 * A handle-uniqueness conflict retries with a fresh suffix, then falls back
 * to no handle (nullable) rather than failing the page.
 */
export async function ensureProfile(user: User): Promise<AccountProfile> {
  const existing = await fetchProfile(user.id);
  if (existing) return existing;

  const sb = getServiceClient();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const handle = attempt < 2 ? generateDefaultHandle(user.email) : null;
    const { data, error } = await sb
      .from("profiles")
      .insert({ id: user.id, handle })
      .select("*")
      .maybeSingle();
    if (!error && data) return mapProfile(data as Record<string, unknown>);
    // Conflict on the primary key → the row now exists; read it back.
    const again = await fetchProfile(user.id);
    if (again) return again;
    // Otherwise (likely a handle collision) loop with a new suffix.
  }

  // Could not persist — render honest defaults; actions will surface errors.
  return {
    id: user.id,
    handle: null,
    role: "reader",
    acceptedReports: 0,
    onboarded: false,
    showCredit: true,
  };
}

// ── The ledger: own reports and evidence chips ─────────────────────────────

export type OwnReport = {
  id: number;
  category: string | null;
  vendor: string | null;
  domain: string | null;
  address: string | null;
  status: "new" | "triaged" | "accepted" | "rejected";
  incidentId: string | null;
  createdAt: string;
};

export type OwnChip = {
  id: number;
  reportId: number;
  kind: string;
  value: string;
  /**
   * Derived from evidence_chips.accepted (migration 0004): null → pending,
   * true → accepted, false → rejected. "pending" until 0004 is applied.
   */
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

/**
 * Ledger reads return { rows, error } — a failed query must render as "the
 * ledger could not be read", never as an empty ledger (degrade honestly).
 */
export type LedgerRead<T> = { rows: T[]; error: string | null };

export async function fetchOwnReports(
  userId: string,
): Promise<LedgerRead<OwnReport>> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("reports")
    .select("id, category, vendor, domain, address, status, incident_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return { rows: [], error: error.message };
  const rows: OwnReport[] = (data ?? []).map((row) => ({
    id: Number(row.id),
    category: typeof row.category === "string" ? row.category : null,
    vendor: typeof row.vendor === "string" && row.vendor ? row.vendor : null,
    domain: typeof row.domain === "string" && row.domain ? row.domain : null,
    address: typeof row.address === "string" && row.address ? row.address : null,
    status: (["new", "triaged", "accepted", "rejected"] as const).includes(
      row.status as OwnReport["status"],
    )
      ? (row.status as OwnReport["status"])
      : "new",
    incidentId:
      typeof row.incident_id === "string" && row.incident_id
        ? row.incident_id
        : null,
    createdAt: String(row.created_at ?? ""),
  }));
  return { rows, error: null };
}

export async function fetchOwnChips(
  userId: string,
): Promise<LedgerRead<OwnChip>> {
  const sb = getServiceClient();
  // select("*"): the chip review-state column (`accepted`) ships with
  // migration 0004 — a narrower select would error until then.
  const { data, error } = await sb
    .from("evidence_chips")
    .select("*")
    .eq("added_by", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return { rows: [], error: error.message };
  const rows: OwnChip[] = ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    id: Number(row.id),
    reportId: Number(row.report_id),
    kind: typeof row.kind === "string" ? row.kind : "url",
    value: typeof row.value === "string" ? row.value : "",
    // The desk writes its decision to the `accepted` boolean (0004):
    // null/absent reads as pending — never guess a review state.
    status:
      row.accepted === true
        ? "accepted"
        : row.accepted === false
          ? "rejected"
          : "pending",
    createdAt: String(row.created_at ?? ""),
  }));
  return { rows, error: null };
}
