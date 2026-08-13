import type { CSSProperties } from "react";

const mono: CSSProperties = { fontFamily: "var(--font-plex-mono), monospace" };

/**
 * Vote tally for one open report: plain counts, nothing else — no bars, no
 * percentages, no scores. The binding copy prints beside the ledger: votes
 * are signals to the editors; nothing here auto-verifies.
 */
export default function VoteTally({
  corroborate,
  dispute,
}: {
  corroborate: number;
  dispute: number;
}) {
  return (
    <div
      style={{
        ...mono,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: ".05em",
        display: "flex",
        gap: 18,
        flexWrap: "wrap",
        alignItems: "baseline",
      }}
    >
      <span>SAW IT TOO {corroborate}</span>
      <span style={{ color: dispute > 0 ? "var(--danger)" : "var(--ink)" }}>
        DISPUTE {dispute}
      </span>
      <span style={{ color: "var(--meta)", fontWeight: 500, letterSpacing: 0 }}>
        SIGNALS TO THE EDITORS — NOT PROOF
      </span>
    </div>
  );
}
