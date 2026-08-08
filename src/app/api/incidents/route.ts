import { fetchAllIncidents } from "@/lib/incidents-db";
import type { Incident } from "@/lib/incidents";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 300;

/**
 * Public JSON feed of published incidents. Intentionally CORS-open: this is
 * citable public data (every record already carries sources + trust state on
 * its permalink page).
 */
export async function GET() {
  const incidents = await fetchAllIncidents();

  const body = incidents.map((i: Incident) => ({
    id: i.id,
    slug: i.slug,
    title: i.title,
    summary: i.summary,
    trustState: i.trustState,
    severity: i.severity,
    categories: i.categories,
    firstObserved: i.firstObserved,
    lastUpdated: i.lastUpdated,
    permalink: `${SITE_URL}/scam/${i.slug}`,
  }));

  return Response.json(body, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}
