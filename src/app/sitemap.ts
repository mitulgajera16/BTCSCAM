import type { MetadataRoute } from "next";
import { fetchAllIncidents } from "@/lib/incidents-db";
import { SITE_URL } from "@/lib/site";

/** Match the other DB-backed feeds: pick up newly published dossiers — including
 *  DB-only ones with no bundled file — within the cache window, not only at the
 *  next code deploy. Without this the sitemap silently omits crawl targets that
 *  are already live on every other surface. */
export const revalidate = 300;

/** Live guides only — mirrors LIVE_GUIDES in src/app/guides/page.tsx.
 *  lastModified is each guide's fact-checked date. */
const GUIDES: { slug: string; factChecked: string }[] = [
  { slug: "crypto-recovery-scams", factChecked: "2026-08-12" },
  { slug: "seed-phrase-storage", factChecked: "2026-08-12" },
  { slug: "wallet-phishing-recognition", factChecked: "2026-08-11" },
  { slug: "hardware-wallet-authenticity", factChecked: "2026-08-11" },
  { slug: "seed-phrase-entropy", factChecked: "2026-08-08" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const incidents = await fetchAllIncidents();

  // The front page and registry change whenever any dossier does.
  const latestUpdate = incidents
    .map((i) => i.lastUpdated)
    .sort()
    .at(-1);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: latestUpdate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/registry`,
      lastModified: latestUpdate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    { url: `${SITE_URL}/check`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/guides`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/report`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/store`, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${SITE_URL}/standards`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/reports/open`,
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/sweep`,
      lastModified: "2026-08-11",
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/sweep/2026-08-11`,
      lastModified: "2026-08-11",
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/account/sign-in`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const incidentPages: MetadataRoute.Sitemap = incidents.map((i) => ({
    url: `${SITE_URL}/scam/${i.slug}`,
    lastModified: i.lastUpdated,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const guidePages: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    lastModified: g.factChecked,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...incidentPages, ...guidePages];
}
