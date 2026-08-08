import "server-only";

// Server-only Supabase access for the Check Desk and the blacklist cron.
//
// Thin re-export from the canonical shared module (src/lib/db.ts) so both
// key requirements — anon for public reads, service role for these paths —
// are visible in one place.
//
// The blacklist tables are service_role-only under RLS (they are a mirror we
// serve lookups from, never a dataset we re-export), so "has Supabase" here
// means URL + SERVICE ROLE key (hasServiceRole): the anon key alone would
// only produce RLS failures. The `import "server-only"` above makes the
// no-service-key-in-the-client rule structural — an accidental client-side
// import fails the build instead of compiling silently.

export { hasServiceRole as hasSupabase, getServiceClient } from "@/lib/db";
