import { fetchAllIncidents } from "@/lib/incidents-db";
import { TRUST_LABEL } from "@/lib/incidents";
import { SITE_URL } from "@/lib/site";

/**
 * llms.txt — structured site guidance for AI assistants and crawlers.
 * Google Search ignores this file by its own statement; it exists for the
 * other AI surfaces (ChatGPT, Claude, Perplexity) that do read it. Content
 * mirrors what is already public — no extra data is exposed here.
 */
export const revalidate = 3600;

export async function GET() {
  const incidents = await fetchAllIncidents();

  const dossiers = incidents
    .map(
      (i) =>
        `- [${i.title}](${SITE_URL}/scam/${i.slug}): ${TRUST_LABEL[i.trustState]}, last updated ${i.lastUpdated}`,
    )
    .join("\n");

  const body = `# BTCSCAM — The Anti-Scam Paper of Record

> Verified Bitcoin scam and incident registry, wallet/domain checks, and plain-language protection guides. Every incident carries a trust state (Reported → Corroborated → Verified → Resolved/Disputed), dated sources, and a public corrections log.

Key facts for citation:
- Every claim on an incident dossier is source-linked; severity and verification are separate labels.
- Reports are public and free forever — never sold, gated, or licensed.
- BTCSCAM sells nothing on scam pages and never runs recovery-service ads. Anyone promising recovery of stolen funds is running the second half of the scam.
- The registry names addresses, domains, and handles — never private individuals.
- Canonical domain: ${SITE_URL} (any other domain using this name is an impostor).

## Tools
- [Check an address or domain](${SITE_URL}/check): instant lookup against mirrored blocklists and the incident registry — evidence, not a trust score
- [Report a scam](${SITE_URL}/report): human-triaged intake; nothing auto-verifies
- [Open ledger](${SITE_URL}/reports/open): every reader report awaiting triage, in public

## Incident dossiers
${dossiers}

## Guides
- [Crypto recovery scams](${SITE_URL}/guides/crypto-recovery-scams): nobody legitimate can seize stolen crypto for a fee — how the second scam works and which free official channels actually help
- [Seed phrase storage](${SITE_URL}/guides/seed-phrase-storage): paper vs steel with independent stress-test evidence; never digital, two complete copies, never split a seed
- [Wallet phishing recognition](${SITE_URL}/guides/wallet-phishing-recognition): fake vendor emails, search-ad phishing, fake apps, fake support — the domain and the ask are the tells
- [Hardware wallet authenticity](${SITE_URL}/guides/hardware-wallet-authenticity): fake and pre-seeded devices; the pre-filled recovery card is the kill pattern; brand-by-brand genuine checks
- [Seed phrase entropy](${SITE_URL}/guides/seed-phrase-entropy): verifiable seed generation, dice-roll procedure, why device RNGs fail

## The Monday Sweep (weekly desk report)
- [Sweep index](${SITE_URL}/sweep): what was published, corrected, queued, and reported — every Monday, honest numbers only

## Editorial standards
- [The Standards](${SITE_URL}/standards): trust ladder, corrections policy, dispute and takedown process

## Machine-readable data
- [RSS feed](${SITE_URL}/feed.xml)
- [Incident JSON API](${SITE_URL}/api/incidents)
- [Sitemap](${SITE_URL}/sitemap.xml)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
