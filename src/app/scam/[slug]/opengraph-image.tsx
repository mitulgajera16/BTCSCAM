import { getAllIncidents, SEVERITY_LABEL } from "@/lib/incidents";
import { fetchIncidentBySlug } from "@/lib/incidents-db";
import { coverFor } from "@/lib/covers";
import { socialCard, SOCIAL_CARD_SIZE } from "@/lib/social-card";

export const size = SOCIAL_CARD_SIZE;
export const contentType = "image/png";
export const alt = "BTCSCAM case file";

export function generateStaticParams() {
  return getAllIncidents().map((i) => ({ slug: i.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const incident = await fetchIncidentBySlug(slug);
  if (!incident) {
    return new Response("Not found", { status: 404 });
  }

  return socialCard({
    cover: coverFor(incident.slug, incident.categories),
    // The headline before the colon — the full case file title runs too long to
    // set at card size without shrinking past readability in a feed.
    title: incident.title.split(":")[0],
    chip: SEVERITY_LABEL[incident.severity],
    chipDanger: incident.severity === "S1",
  });
}
