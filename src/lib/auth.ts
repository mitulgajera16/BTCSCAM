import "server-only";

import type { User } from "@supabase/supabase-js";
import { getServiceClient, hasServiceRole, hasSupabase } from "@/lib/db";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// ── The Watchmen ladder ─────────────────────────────────────────────────────
// reader → reporter → corroborator → watchman → mod. Standing is earned by
// accepted contributions and granted by editors — it is status and credit,
// never tokens or points, and it never lets anyone verify anything: votes
// and chips are signals TO editors, the trust ladder stays editorial.

export type Role = "reader" | "reporter" | "corroborator" | "watchman" | "mod";

/** Low to high. Index = rank. */
export const ROLE_LADDER: readonly Role[] = [
  "reader",
  "reporter",
  "corroborator",
  "watchman",
  "mod",
] as const;

export const ROLE_LABEL: Record<Role, string> = {
  reader: "READER",
  reporter: "REPORTER",
  corroborator: "CORROBORATOR",
  watchman: "WATCHMAN",
  mod: "MOD",
};

export function isRole(value: unknown): value is Role {
  return (
    typeof value === "string" && (ROLE_LADDER as readonly string[]).includes(value)
  );
}

/** True when `role` sits at or above `min` on the ladder. */
export function roleAtLeast(role: Role | null | undefined, min: Role): boolean {
  if (!role) return false;
  return ROLE_LADDER.indexOf(role) >= ROLE_LADDER.indexOf(min);
}

// ── Profile shape (public.profiles, migrations 0002 + 0003) ────────────────

export interface Profile {
  id: string;
  handle: string | null;
  role: Role;
  acceptedReports: number;
  /** First-run "WELCOME TO THE DESK" panel dismissed (0003). */
  onboarded: boolean;
  /** Named-credit opt-in: show handle on dossiers they contributed to (0003). */
  showCredit: boolean;
  createdAt: string;
}

function toProfile(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    handle: typeof row.handle === "string" ? row.handle : null,
    role: isRole(row.role) ? row.role : "reader",
    acceptedReports:
      typeof row.accepted_reports === "number" ? row.accepted_reports : 0,
    // Columns from migration 0003 — default honestly if it has not run yet.
    onboarded: row.onboarded === true,
    showCredit: row.show_credit !== false,
    createdAt: typeof row.created_at === "string" ? row.created_at : "",
  };
}

// ── Session ────────────────────────────────────────────────────────────────

/**
 * The signed-in user for this request, or null. Uses supabase.auth.getUser()
 * — the token is verified against the auth server, not just decoded from the
 * cookie — so the result is safe to authorize against. Null whenever
 * Supabase is not provisioned: callers render honest disabled states, never
 * fake session UI.
 */
export async function getSession(): Promise<User | null> {
  if (!hasSupabase()) return null;
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

/**
 * The signed-in user's profile row, or null when signed out or when
 * Supabase is absent. Prefers the service client (bypasses RLS, reads every
 * column); falls back to the visitor's own session client, which RLS
 * restricts to self-read — still trustworthy for one's OWN row because the
 * role column is service_role-writable only (migration 0002).
 */
export async function getProfile(): Promise<Profile | null> {
  const user = await getSession();
  if (!user) return null;
  try {
    const client = hasServiceRole()
      ? getServiceClient()
      : await getSupabaseServerClient();
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (error || !data) return null;
    return toProfile(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

// ── Authorization ──────────────────────────────────────────────────────────

export type RoleCheck =
  | { ok: true; user: User; profile: Profile }
  | { ok: false; error: string };

/**
 * Server-side role gate for actions and role-gated pages. Server actions are
 * directly POST-reachable, so EVERY action calls this itself — never rely on
 * a page or proxy having run first. The role is read from public.profiles
 * via the SERVICE client (never from client input, never from a cookie);
 * fails closed when the service key is absent.
 */
export async function requireRole(minRole: Role): Promise<RoleCheck> {
  if (!hasSupabase()) {
    return {
      ok: false,
      error:
        "Accounts are not open yet — the desk ledger connects when our database goes live.",
    };
  }
  const user = await getSession();
  if (!user) {
    return { ok: false, error: "Not signed in. Sign in at /account/sign-in first." };
  }
  if (!hasServiceRole()) {
    return {
      ok: false,
      error:
        "Role checks are unavailable (service credentials missing) — failing closed.",
    };
  }
  const { data, error } = await getServiceClient()
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    return { ok: false, error: `Could not read your profile: ${error.message}` };
  }
  if (!data) {
    return {
      ok: false,
      error: "No profile on record for this account — sign in again to create one.",
    };
  }
  const profile = toProfile(data as Record<string, unknown>);
  if (!roleAtLeast(profile.role, minRole)) {
    return {
      ok: false,
      error: `This needs ${ROLE_LABEL[minRole]} standing or above; this account is ${ROLE_LABEL[profile.role]}. Standing is earned by accepted contributions — see /standards.`,
    };
  }
  return { ok: true, user, profile };
}
