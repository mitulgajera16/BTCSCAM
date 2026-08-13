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

> A checked database of Bitcoin scams, wallet and website checks, and plain-language guides to staying safe. Every scam carries a proof level (Reported → Backed by sources → Verified → Closed/Disputed), dated sources, and a public record of every correction.

Key facts for citation:
- Every claim in a case file links to its source; how bad a scam is and how far we have proved it are separate labels.
- Reports are public and free forever — never sold, gated, or licensed.
- BTCSCAM sells nothing on scam pages and never runs ads for fund-recovery services. Anyone promising to get your stolen money back is running the second half of the scam.
- The database names wallet addresses, websites, and handles — never private individuals.
- Our only website: ${SITE_URL} (any other site using this name is a fake).

## Tools
- [Check a wallet address or website](${SITE_URL}/check): instant lookup against our copies of the known-scam lists and our own scam database — evidence, never a promise that something is safe
- [Report a scam](${SITE_URL}/report): a person reads and reviews every report; nothing is ever marked verified on its own
- [Open reports](${SITE_URL}/reports/open): every reader report waiting to be reviewed, in public

## Scam case files
${dossiers}

## Guides
- [Crypto recovery scams](${SITE_URL}/guides/crypto-recovery-scams): no honest company can grab stolen crypto back for a fee — how the second scam works and which free official routes actually help
- [Seed phrase storage](${SITE_URL}/guides/seed-phrase-storage): paper vs steel, with independent stress-test evidence; never on a screen, two complete copies, never split a seed phrase
- [Wallet phishing recognition](${SITE_URL}/guides/wallet-phishing-recognition): fake emails from wallet companies, scam search ads, fake apps, fake support — the website address and what they ask for are the tells
- [Hardware wallet authenticity](${SITE_URL}/guides/hardware-wallet-authenticity): fake devices and devices that arrive already set up; a recovery card that is already filled in is the giveaway; how to check each brand is genuine
- [Seed phrase entropy](${SITE_URL}/guides/seed-phrase-entropy): how to make a seed phrase you can check yourself, the dice-roll method, why the random number generators inside devices fail

## The Monday Sweep (weekly report)
- [Sweep index](${SITE_URL}/sweep): what we published, corrected, queued, and what readers reported — every Monday, honest numbers only

## The rules this site runs on
- [The Standards](${SITE_URL}/standards): the proof ladder, how we handle corrections, and how to dispute what we published

## Machine-readable data
- [RSS feed](${SITE_URL}/feed.xml)
- [Scam JSON API](${SITE_URL}/api/incidents)
- [Sitemap](${SITE_URL}/sitemap.xml)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
