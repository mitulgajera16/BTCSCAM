import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * AI-search crawlers are explicitly welcome: being the cited answer at the
 * "is X a scam" moment IS the product (PRD §3). /api/incidents stays
 * crawlable as the machine-readable registry; other API routes and the
 * signed-in surfaces stay out of every index.
 */
const ALLOW = ["/", "/api/incidents"];
const DISALLOW = ["/api/", "/desk", "/account", "/auth"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
        ],
        allow: ALLOW,
        disallow: DISALLOW,
      },
      { userAgent: "*", allow: ALLOW, disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
