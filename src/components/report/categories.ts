// Scam categories — mirrors the `categories` enum in
// data/schemas/incident.schema.json. Keep the two in sync by hand for now;
// R3 productization can generate this from the schema.

export const SCAM_CATEGORIES = [
  "vulnerability",
  "theft",
  "phishing",
  "impersonation",
  "supply-chain",
  "rug-pull",
  "ponzi",
  "malware",
  "social-engineering",
  "fake-device",
  "recovery-scam",
  "exchange-failure",
] as const;

export type ScamCategory = (typeof SCAM_CATEGORIES)[number];

// Plain-language labels for the intake select. Newspaper voice: say what it
// is, no jargon left unexplained.
export const CATEGORY_LABEL: Record<ScamCategory, string> = {
  vulnerability: "Vulnerability — flawed wallet, firmware, or library",
  theft: "Theft — funds taken outright",
  phishing: "Phishing — fake site, email, or message",
  impersonation: "Impersonation — fake company, support desk, or person",
  "supply-chain": "Supply chain — tampered hardware or software in transit",
  "rug-pull": "Rug pull — project took the money and vanished",
  ponzi: "Ponzi — returns paid out of new deposits",
  malware: "Malware — drainers, clipboard hijackers, infected apps",
  "social-engineering": "Social engineering — talked into handing over access",
  "fake-device": "Fake device — counterfeit hardware wallet",
  "recovery-scam": "Recovery scam — a fee to get your money back",
  "exchange-failure": "Exchange failure — frozen withdrawals, insolvency",
};
