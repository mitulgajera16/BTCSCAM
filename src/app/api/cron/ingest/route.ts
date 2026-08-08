import type { NextRequest } from "next/server";
import { hasSupabase } from "@/lib/ingest/db";
import { runIngest } from "@/lib/ingest/pipeline";
import { safeEqual } from "@/lib/safe-equal";

/**
 * Daily ingestion cron (vercel.json: 0 5 * * *).
 *
 * Vercel invokes this GET with `Authorization: Bearer ${CRON_SECRET}`
 * automatically when the CRON_SECRET env var exists. Anything else is 401.
 *
 * When Supabase is not configured this returns 503 WITHOUT fetching any
 * source — no work is pretended, no data is faked.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Fail closed when CRON_SECRET is unset; compare in constant time (same
  // hash-then-timingSafeEqual pattern as the desk auth).
  const secret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");
  if (!secret || !authorization || !safeEqual(authorization, `Bearer ${secret}`)) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!hasSupabase()) {
    return Response.json(
      { ok: false, reason: "db-not-configured" },
      { status: 503 },
    );
  }

  const result = await runIngest();
  return Response.json(result);
}
