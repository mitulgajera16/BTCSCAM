import { LADDER_TIERS, type LadderRole } from "./types";
import { capsLabel, mono } from "./ui";

/**
 * THE LADDER — newspaper table of the five tiers. The current tier gets the
 * rubber-stamp treatment (double frame, slight tilt, brand orange). A ledger,
 * not a game: no bars, no confetti, no points.
 *
 * Server-safe presentational component — no hooks, no client directive.
 */

function HereStamp() {
  return (
    <span
      style={{
        ...mono,
        display: "inline-block",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: ".05em",
        color: "var(--orange)",
        border: "2px solid var(--orange)",
        outline: "1px solid var(--orange)",
        outlineOffset: 2,
        borderRadius: 3,
        padding: "2px 8px",
        transform: "rotate(-3deg)",
        whiteSpace: "nowrap",
      }}
    >
      YOU ARE HERE
    </span>
  );
}

export default function LadderTable({
  currentRole,
}: {
  /** Omit for signed-out / pre-launch views — no tier is marked. */
  currentRole?: LadderRole;
}) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            minWidth: 640,
            borderCollapse: "collapse",
            fontSize: 16,
          }}
        >
          <thead>
            <tr>
              {["", "TIER", "HOW IT IS EARNED", "WHAT IT OPENS", ""].map(
                (h, idx) => (
                  <th
                    key={idx}
                    scope="col"
                    style={{
                      ...capsLabel,
                      color: "var(--meta)",
                      textAlign: "left",
                      padding: "8px 12px 8px 0",
                      borderBottom: "2px solid var(--ink)",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {LADDER_TIERS.map((tier, idx) => {
              const here = currentRole === tier.role;
              return (
                <tr
                  key={tier.role}
                  style={here ? { background: "var(--warm)" } : undefined}
                >
                  <td
                    style={{
                      ...mono,
                      fontSize: 12,
                      color: "var(--meta)",
                      padding: "14px 12px 14px 0",
                      borderBottom: "1px solid var(--rule)",
                      verticalAlign: "top",
                      width: 32,
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td
                    style={{
                      ...mono,
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: ".05em",
                      padding: "14px 16px 14px 0",
                      borderBottom: "1px solid var(--rule)",
                      verticalAlign: "top",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tier.title}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px 14px 0",
                      borderBottom: "1px solid var(--rule)",
                      verticalAlign: "top",
                      lineHeight: 1.5,
                    }}
                  >
                    {tier.earned}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px 14px 0",
                      borderBottom: "1px solid var(--rule)",
                      verticalAlign: "top",
                      lineHeight: 1.5,
                      color: "var(--meta)",
                    }}
                  >
                    {tier.grants}
                  </td>
                  <td
                    style={{
                      padding: "14px 0",
                      borderBottom: "1px solid var(--rule)",
                      verticalAlign: "top",
                      textAlign: "right",
                    }}
                  >
                    {here && <HereStamp />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p
        style={{
          ...mono,
          fontSize: 12,
          lineHeight: 1.6,
          color: "var(--meta)",
          marginTop: 12,
          maxWidth: "72ch",
        }}
      >
        STATUS IS THE ONLY REWARD. No points, no tokens, nothing to buy.
        Promotion is checked by the editors when work is accepted; nothing on
        this ladder auto-verifies an incident. Anonymous reporting stays open
        to everyone — an account is for credit, not a gate.
      </p>
    </div>
  );
}
