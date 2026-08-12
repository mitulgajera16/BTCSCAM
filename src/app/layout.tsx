import type { Metadata } from "next";
import { Fraunces, Geist, IBM_Plex_Mono } from "next/font/google";
import { Agentation } from "agentation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_URL } from "@/lib/site";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  weight: "600",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist",
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BTCSCAM — The Anti-Scam Paper of Record",
    template: "%s — BTCSCAM",
  },
  description:
    "Verified Bitcoin scam and incident registry, wallet checks, and plain-language protection guides. Fast AND verified AND readable.",
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
};

// Sitewide entity schema: who publishes this, and that /check is searchable.
// Dossier pages add their own NewsArticle schema on top of this.
const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "BTCSCAM",
    url: SITE_URL,
    description:
      "The anti-scam paper of record: a verified Bitcoin scam and incident registry with a public trust ladder, sourced dossiers, and a permanent corrections log.",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "BTCSCAM",
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/check?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${geist.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
