import type { Metadata } from "next";
import { Fraunces, Geist, IBM_Plex_Mono } from "next/font/google";
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
  title: {
    default: "BTCSCAM — The Anti-Scam Paper of Record",
    template: "%s — BTCSCAM",
  },
  description:
    "Verified Bitcoin scam and incident registry, wallet checks, and plain-language protection guides. Fast AND verified AND readable.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${geist.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
