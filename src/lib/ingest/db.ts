import "server-only";

// Supabase access for the ingestion pipeline — a thin re-export from the
// canonical shared module (src/lib/db.ts) so every key requirement lives in
// one place.
//
// The pipeline writes to service-role-only tables (draft_incidents,
// ticker_items), so "has Supabase" here means URL + SERVICE ROLE key
// (hasServiceRole); the anon key alone would only produce RLS failures.
// When it is false the cron route answers 503 and no fetching happens —
// no work is pretended, no data is faked.

export { hasServiceRole as hasSupabase, getServiceClient } from "@/lib/db";
