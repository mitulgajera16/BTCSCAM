// Pure input identification + normalization for the Check Desk and the
// blacklist cron. No IO, no env, importable from anywhere on the server.
//
// Format validation only — we do not verify base58/bech32 checksums. A string
// that merely LOOKS like an address is still worth looking up; a string that
// does not match any shape is treated as a domain or rejected with a plain
// explanation.

export type QueryKind = "btc-address" | "evm-address" | "domain";

export type IdentifiedQuery = {
  kind: QueryKind;
  /** Canonical form shown back to the reader (domains: lowercased, www-stripped). */
  normalized: string;
  /** All lookup keys worth checking (e.g. domain with and without www.). */
  candidates: string[];
};

// P2PKH (1…) and P2SH (3…): base58, 25–35 chars total.
const BTC_BASE58_RE = /^[13][1-9A-HJ-NP-Za-km-z]{24,34}$/;
// Bech32/bech32m mainnet (bc1…), lowercase form. BIP-173 charset.
const BTC_BECH32_RE = /^bc1[02-9ac-hj-np-z]{8,87}$/;
const EVM_RE = /^0x[0-9a-fA-F]{40}$/;
// Hostname: labels of 1–63 [a-z0-9-], at least one dot, alpha-led TLD.
const DOMAIN_RE =
  /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{1,62}$/;

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

/** Reduce arbitrary pasted text (URL, defanged domain, bare host) to a bare
 *  lowercase hostname, or null if nothing hostname-shaped survives. */
export function normalizeDomainInput(raw: string): string | null {
  let d = raw.trim().toLowerCase();
  // Readers paste defanged domains back at us — undo example[.]com, hxxp://.
  d = d.replace(/\[\.\]/g, ".").replace(/^hxxps?:\/\//, "");
  d = d.replace(/^[a-z][a-z0-9+.-]*:\/\//, ""); // strip any scheme://
  d = d.replace(/^\/\//, "");
  const at = d.lastIndexOf("@"); // strip userinfo if a full URL was pasted
  if (at !== -1) d = d.slice(at + 1);
  d = d.split(/[/?#]/)[0]; // strip path/query/fragment
  d = d.split(":")[0]; // strip port
  d = d.replace(/\.+$/, ""); // strip trailing dot(s)
  return DOMAIN_RE.test(d) ? d : null;
}

/** Autodetect what the reader pasted. Addresses are tried first; anything
 *  else is treated as a domain. Returns null when nothing checkable remains. */
export function identifyQuery(raw: string): IdentifiedQuery | null {
  const s = raw.trim();
  if (!s) return null;

  if (EVM_RE.test(s)) {
    const lower = s.toLowerCase();
    return { kind: "evm-address", normalized: lower, candidates: unique([lower, s]) };
  }
  if (BTC_BASE58_RE.test(s)) {
    // base58 is case-sensitive — preserve it.
    return { kind: "btc-address", normalized: s, candidates: [s] };
  }
  const bechCandidate = s.toLowerCase();
  if (
    BTC_BECH32_RE.test(bechCandidate) &&
    // BIP-173 forbids mixed case; accept all-lower or all-upper only.
    (s === bechCandidate || s === s.toUpperCase())
  ) {
    return { kind: "btc-address", normalized: bechCandidate, candidates: [bechCandidate] };
  }

  const domain = normalizeDomainInput(s);
  if (domain) {
    const bare = domain.startsWith("www.") ? domain.slice(4) : domain;
    return {
      kind: "domain",
      normalized: bare,
      candidates: unique([bare, `www.${bare}`, domain]),
    };
  }
  return null;
}

/** Feed-side address normalization for the cron: returns the canonical form
 *  if the value is a plausible BTC/EVM address, else null (drops junk rows). */
export function normalizeFeedAddress(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (EVM_RE.test(s)) return s.toLowerCase();
  if (BTC_BASE58_RE.test(s)) return s;
  const lower = s.toLowerCase();
  if (BTC_BECH32_RE.test(lower)) return lower;
  return null;
}

/** Feed-side domain normalization for the cron. */
export function normalizeFeedDomain(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  return normalizeDomainInput(raw);
}

/** example.com → example[.]com — the UI must never render a queried domain
 *  in clickable/copyable-as-link form. */
export function defangDomain(domain: string): string {
  return domain.replace(/\./g, "[.]");
}
