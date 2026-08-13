import Link from "next/link";
import type { Metadata } from "next";
import { SITE_HOST } from "@/lib/site";
import SectionRule from "@/components/primitives/section-rule";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

export const metadata: Metadata = {
  title: "Sweep No. 1 — Launch week, mid-crisis",
  description:
    "BTCSCAM's first weekly report: the scam database opened during the Coldcard seed-entropy crisis with 3 case files, 1 public correction, 2 new guides, 120 incoming leads waiting to be reviewed, and 0 reader reports.",
  alternates: { canonical: "/sweep/2026-08-11" },
};


function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div style={{ ...mono, fontSize: 22, fontWeight: 600 }}>{n}</div>
      <div style={{ ...mono, fontSize: 11, color: "var(--meta)", letterSpacing: ".05em" }}>
        {label}
      </div>
    </div>
  );
}

export default function SweepOne() {
  return (
    <main style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 64px" }}>
      <nav style={{ ...mono, fontSize: 12, padding: "16px 0" }}>
        <Link href="/">← FRONT PAGE</Link>
        <span style={{ color: "var(--meta)" }}> / </span>
        <Link href="/sweep">THE MONDAY SWEEP</Link>
        <span style={{ color: "var(--meta)" }}> / NO. 1</span>
      </nav>

      <p style={{ ...mono, fontSize: 12, fontWeight: 600, letterSpacing: ".05em", color: "var(--meta)", margin: 0 }}>
        THE MONDAY SWEEP · NO. 1 · WEEK OF 2026-08-04 → 2026-08-11
      </p>
      <h1 style={{ ...display, fontSize: "clamp(28px, 5vw, 40px)", lineHeight: 1.15, margin: "8px 0 0" }}>
        Launch week, mid-crisis
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.55, marginTop: 16 }}>
        BTCSCAM opened its doors in the middle of the biggest hardware-wallet
        theft on record. This is our first weekly report — the week as it
        actually was, small numbers printed as small numbers.
      </p>

      <div
        style={{
          display: "flex",
          gap: 32,
          background: "var(--panel)",
          padding: "16px 20px",
          marginTop: 20,
          flexWrap: "wrap",
        }}
      >
        <Stat n="3" label="CASE FILES ON THE RECORD" />
        <Stat n="1" label="PUBLIC CORRECTION" />
        <Stat n="3" label="GUIDES LIVE" />
        <Stat n="120" label="INCOMING LEADS QUEUED" />
        <Stat n="0" label="READER REPORTS" />
      </div>

      <SectionRule label="ON THE RECORD" danger />
      <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 16 }}>
        The scam database opened 2026-08-08 with three case files. The lead
        story is the{" "}
        <Link href="/scam/coldcard-rng-seed-entropy-flaw-2026" style={{ fontWeight: 700 }}>
          Coldcard seed-entropy flaw
        </Link>{" "}
        — $116M–$130M+ drained from wallets whose seed phrases were made by a
        quietly broken random number generator (the range is deliberate; see
        Corrections). Following right behind it, the{" "}
        <Link href="/scam/coldcard-hardware-audit-phishing-2026" style={{ fontWeight: 700 }}>
          &quot;hardware audit&quot; phishing wave
        </Link>{" "}
        — fake Coinkite emails that installed remote-control software on the
        computers of owners who were already frightened. The third,{" "}
        <Link href="/scam/milk-sad-libbitcoin-explorer-weak-entropy" style={{ fontWeight: 700 }}>
          Milk Sad
        </Link>{" "}
        (2023), is the older case we added to show that this kind of
        seed-generation failure did not start this month.
      </p>

      <SectionRule label="CORRECTIONS — WE ADMIT MISTAKES OUT LOUD" />
      <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 16 }}>
        One correction this week, logged 2026-08-11 on the Coldcard case file:
        our launch headline read &quot;~$116M+&quot;, sourced to TRM Labs as of
        Aug 5. That figure held, but the totals other outlets reported moved —
        2,000+ BTC logged by Aug 10, $130M+ per TechCrunch and Decrypt — and
        Coinkite itself will not give an estimate. The headline now carries the
        dated range, and the correction is{" "}
        <Link href="/scam/coldcard-rng-seed-entropy-flaw-2026" style={{ fontWeight: 700 }}>
          permanent on the case file
        </Link>
        . Correction rate, week one: 1 correction on 3 published case files.
        High. It stays public anyway — that is the whole point of keeping a
        record.
      </p>

      <SectionRule label="NEW GUIDES" />
      <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 16 }}>
        Two guides went out together on 2026-08-11, aimed at the panic the
        Coldcard wave created:{" "}
        <Link href="/guides/wallet-phishing-recognition" style={{ fontWeight: 700 }}>
          how to recognize wallet-company phishing
        </Link>{" "}
        (a real Coinkite email and a fake audit went around the same week — the
        website address and what they ask you for are the only signs that
        matter) and{" "}
        <Link href="/guides/hardware-wallet-authenticity" style={{ fontWeight: 700 }}>
          how to verify a hardware wallet is genuine
        </Link>{" "}
        (a recovery card that arrives already filled in is the giveaway). They
        join the{" "}
        <Link href="/guides/seed-phrase-entropy" style={{ fontWeight: 700 }}>
          seed-entropy guide
        </Link>{" "}
        from launch.
      </p>

      <SectionRule label="INCOMING LEADS" />
      <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 16 }}>
        Our first automatic sweeps for new leads queued 120 of them for a
        person to review (as of 2026-08-11): 108 from DeFiLlama&apos;s back
        catalogue of hacks, 10 from Bitcoin Optech, 2 from FTC consumer alerts.
        None of them publish themselves — nothing on this site goes above
        REPORTED without a person. Our copies of the outside scam lists
        behind{" "}
        <Link href="/check" style={{ fontWeight: 700 }}>
          /check
        </Link>{" "}
        held 2,530 flagged wallet addresses and 449,804 flagged websites as of
        2026-08-10 (ScamSniffer + MetaMask eth-phishing-detect, credited on the
        wallet check page). Being written up out of sight: 12 first-batch case
        files drafted from government and firsthand sources — Bitcoin ATM
        shakedowns, the fake fund-recovery business, people impersonating
        Ledger and Trezor, and the big frauds everyone cites. They go live only
        after a person reviews them, dated as they land.
      </p>

      <SectionRule label="READER REPORTS" />
      <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 16 }}>
        Zero reports came in during week one. That is the honest number,
        printed as our own rules require — no made-up member counts, no fake
        activity. The{" "}
        <Link href="/report" style={{ fontWeight: 700 }}>
          report page
        </Link>{" "}
        is open, a person reads every report, and every report gets a status
        you can see on the{" "}
        <Link href="/reports/open" style={{ fontWeight: 700 }}>
          open reports list
        </Link>{" "}
        — nothing disappears here.
      </p>

      <SectionRule label="COPYCAT WATCH" />
      <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 16 }}>
        Our first check for copycat sites ran 2026-08-11: no security
        certificates issued for lookalike names, and no live copy of this site
        found. For the record: {SITE_HOST} is our only website. Anything else
        using this name is a fake — check your address bar.
      </p>

      <p style={{ ...mono, fontSize: 12, color: "var(--meta)", letterSpacing: ".05em", marginTop: 40, borderTop: "1px solid var(--rule)", paddingTop: 16 }}>
        NEXT SWEEP: MONDAY 2026-08-18 · NUMBERS AS OF DATES SHOWN · FOUND AN
        ERROR? <Link href="/report">REPORT IT</Link> — WE CORRECT IN PUBLIC.
      </p>
    </main>
  );
}
