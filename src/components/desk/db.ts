import "server-only";

// Desk-local Supabase access — a thin re-export from the canonical shared
// module (src/lib/db.ts) so every key requirement lives in one place.
//
// The desk needs the service role because draft_incidents, reports, and the
// blacklist tables are service_role-only under RLS, so "has Supabase" here
// means URL + SERVICE ROLE key (hasServiceRole). This file sits beside
// "use client" components; the `import "server-only"` above makes any
// accidental client-side import a build error rather than a silent key leak.

export { hasServiceRole as hasSupabase, getServiceClient } from "@/lib/db";
