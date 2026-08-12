/**
 * The live guide registry — single source of truth for which guides exist and
 * their display titles. Both the /guides index and the dossier "PROTECT
 * YOURSELF" block read from here, so a dossier can never link a guide that
 * isn't published (the cause of the earlier dangling-slug bug).
 */
export interface GuideMeta {
  slug: string;
  /** Short title for cross-link chips; the full title lives in the guide MDX. */
  title: string;
}

export const LIVE_GUIDES: GuideMeta[] = [
  { slug: "wallet-phishing-recognition", title: "Recognize wallet-company phishing" },
  { slug: "hardware-wallet-authenticity", title: "Verify a hardware wallet is genuine" },
  { slug: "crypto-recovery-scams", title: "Crypto recovery services: the second scam" },
  { slug: "seed-phrase-storage", title: "Store a seed phrase so it survives" },
  { slug: "seed-phrase-entropy", title: "Generate a seed you can trust" },
];

const BY_SLUG = new Map(LIVE_GUIDES.map((g) => [g.slug, g]));

/** Resolve a list of relatedGuides slugs to live guides, dropping any that
 *  are not published so stale slugs render nothing rather than a dead link. */
export function liveGuidesFor(slugs: string[] | undefined): GuideMeta[] {
  if (!slugs) return [];
  return slugs.map((s) => BY_SLUG.get(s)).filter((g): g is GuideMeta => g !== undefined);
}
