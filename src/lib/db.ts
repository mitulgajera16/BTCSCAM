import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazy Supabase client factory (plain function cache — deliberately NOT a JS
 * Proxy, which breaks the auth libraries).
 *
 * Supabase is not provisioned yet: every caller MUST guard with hasSupabase()
 * and degrade honestly (bundled JSON data / disabled-state UI) when it returns
 * false. The env names come from the Vercel marketplace integration and vary,
 * so both spellings are read.
 */

function supabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function supabaseAnonKey(): string | undefined {
  return (
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function supabaseServiceKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
  );
}

/** True when a Supabase URL + anon key are present in the environment. */
export function hasSupabase(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

/** True when the service-role key is also present (crons, desk actions). */
export function hasServiceRole(): boolean {
  return Boolean(supabaseUrl() && supabaseServiceKey());
}

let cachedAnon: SupabaseClient | null = null;
let cachedService: SupabaseClient | null = null;

/**
 * Anon-key client for public reads (RLS applies). Throws when Supabase is not
 * configured — guard with hasSupabase() first.
 */
export function getAnonClient(): SupabaseClient {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured (missing SUPABASE_URL / SUPABASE_ANON_KEY). Guard calls with hasSupabase().",
    );
  }
  if (!cachedAnon) {
    cachedAnon = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedAnon;
}

/**
 * Service-role client (bypasses RLS) for crons, seeding, and desk actions.
 * Server-only by module import; never expose this key or client to the
 * browser. Throws when the service key is absent — guard with
 * hasServiceRole() first.
 */
export function getServiceClient(): SupabaseClient {
  const url = supabaseUrl();
  const key = supabaseServiceKey();
  if (!url || !key) {
    throw new Error(
      "Supabase service role is not configured (missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). Guard calls with hasServiceRole().",
    );
  }
  if (!cachedService) {
    cachedService = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedService;
}
