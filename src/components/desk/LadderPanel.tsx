"use client";

import { useActionState } from "react";
import { recomputeLadder } from "@/app/desk/actions";
import { LADDER_TIERS } from "@/components/account/types";
import { mono, capsLabel, button, resultStyle } from "./ui";

// The contribution ladder, printed as a newspaper table — no meters, no
// confetti. Status and credit are the only rewards; there are no tokens or
// points, and the recompute never demotes anyone. Watchman and mod are
// manual by design: thresholds make you eligible, editors make the call.
//
// One ladder, one source: rows derive from LADDER_TIERS (components/account/
// types.ts) — the same array behind the account LadderTable and the open
// ledger's LadderBox, so the copy cannot drift.

const LADDER = LADDER_TIERS.map((tier) => ({
  role: tier.title,
  how: tier.earned,
  auto: !tier.manual,
}));

const cell = {
  ...mono,
  fontSize: 12,
  padding: "8px 12px 8px 0",
  verticalAlign: "top",
  borderBottom: "1px solid var(--rule)",
  textAlign: "left" as const,
};

export default function LadderPanel({
  roleCounts,
  error,
}: {
  roleCounts: Record<string, number> | null;
  error?: string;
}) {
  const [state, action, pending] = useActionState(recomputeLadder, null);

  return (
    <div style={{ marginTop: 16, maxWidth: 720 }}>
      <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--meta)", margin: 0 }}>
        Standing is credit, not currency: no tokens, no points. Accepted work moves
        people up; nothing moves them down. Votes and chips stay signals to editors —
        rank never verifies an incident.
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 12 }}>
          <thead>
            <tr>
              <th style={{ ...cell, ...capsLabel, borderBottom: "2px solid var(--ink)" }}>
                RANK
              </th>
              <th style={{ ...cell, ...capsLabel, borderBottom: "2px solid var(--ink)" }}>
                HOW IT IS EARNED
              </th>
              <th style={{ ...cell, ...capsLabel, borderBottom: "2px solid var(--ink)" }}>
                HOLDERS
              </th>
            </tr>
          </thead>
          <tbody>
            {LADDER.map((rung) => (
              <tr key={rung.role}>
                <td style={{ ...cell, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {rung.role}
                  {!rung.auto && (
                    <span style={{ color: "var(--meta)", fontWeight: 500 }}> · MANUAL</span>
                  )}
                </td>
                <td style={{ ...cell, fontFamily: "inherit", fontSize: 14 }}>{rung.how}</td>
                <td style={{ ...cell, whiteSpace: "nowrap" }}>
                  {roleCounts ? (roleCounts[rung.role.toLowerCase()] ?? 0) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <p style={{ ...mono, fontSize: 12, color: "var(--danger)", marginTop: 10 }}>
          COULD NOT READ PROFILES: {error} — is migration 0002 applied?
        </p>
      )}

      <form action={action} style={{ marginTop: 14 }}>
        <button type="submit" style={button} disabled={pending}>
          {pending ? "RECOMPUTING…" : "RECOMPUTE LADDER"}
        </button>
      </form>
      <p style={{ ...mono, fontSize: 11, color: "var(--meta)", margin: "8px 0 0" }}>
        Resyncs accepted-report counters from the reports table and applies threshold
        promotions up to corroborator. Promotions only — the ladder never demotes.
      </p>
      {state && (
        <p role="status" style={resultStyle(state.ok)}>
          {state.ok ? `OK — ${state.message}` : state.error}
        </p>
      )}
    </div>
  );
}
