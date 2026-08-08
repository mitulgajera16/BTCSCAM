"use client";

import { useActionState, useState } from "react";
import { castVote } from "@/app/reports/open/actions";
import {
  button,
  buttonDanger,
  buttonQuiet,
  field,
  labelStyle,
  mono,
  resultStyle,
} from "@/components/ui";

// Stance controls for one open report — rendered only for corroborator+
// (the page decides; the castVote action re-verifies regardless).
// CORROBORATE requires an evidence URL. DISPUTE requires a note (20+ chars).
// One stance per watcher per report; the server surfaces the conflict.

type Stance = "corroborate" | "dispute";

export default function StanceButtons({
  reportId,
  stance,
}: {
  reportId: number;
  /** The viewer's existing stance on this report, if any. */
  stance: Stance | null;
}) {
  const [mode, setMode] = useState<Stance | null>(null);
  const [state, action, pending] = useActionState(castVote, null);

  if (stance) {
    return (
      <p style={{ ...mono, fontSize: 12, fontWeight: 600, margin: 0 }}>
        YOU ALREADY WEIGHED IN — {stance === "corroborate" ? "CORROBORATE" : "DISPUTE"}.{" "}
        <span style={{ color: "var(--meta)", fontWeight: 500 }}>
          One stance per watcher; it stands with the editors.
        </span>
      </p>
    );
  }

  if (state?.ok) {
    return (
      <p role="status" style={resultStyle(true)}>
        OK — {state.message}
      </p>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          aria-pressed={mode === "corroborate"}
          onClick={() => setMode(mode === "corroborate" ? null : "corroborate")}
          style={mode === "corroborate" ? button : buttonQuiet}
        >
          CORROBORATE
        </button>
        <button
          type="button"
          aria-pressed={mode === "dispute"}
          onClick={() => setMode(mode === "dispute" ? null : "dispute")}
          style={
            mode === "dispute"
              ? { ...buttonDanger, background: "var(--danger)", color: "#fff" }
              : buttonDanger
          }
        >
          DISPUTE
        </button>
      </div>

      {mode === "corroborate" && (
        <form action={action} style={{ display: "grid", gap: 8, maxWidth: 520 }}>
          <input type="hidden" name="reportId" value={reportId} />
          <input type="hidden" name="stance" value="corroborate" />
          <label htmlFor={`evidence-${reportId}`} style={{ ...labelStyle, marginBottom: 0 }}>
            EVIDENCE URL — REQUIRED. A LINK AN EDITOR CAN CHECK.
          </label>
          <input
            id={`evidence-${reportId}`}
            name="evidenceUrl"
            type="url"
            required
            maxLength={500}
            placeholder="https://…"
            style={field}
          />
          <div>
            <button type="submit" disabled={pending} style={button}>
              {pending ? "FILING…" : "FILE CORROBORATION"}
            </button>
          </div>
        </form>
      )}

      {mode === "dispute" && (
        <form action={action} style={{ display: "grid", gap: 8, maxWidth: 520 }}>
          <input type="hidden" name="reportId" value={reportId} />
          <input type="hidden" name="stance" value="dispute" />
          <label htmlFor={`dispute-${reportId}`} style={{ ...labelStyle, marginBottom: 0 }}>
            DISPUTE NOTE — REQUIRED, 20+ CHARACTERS. WHAT DOES NOT HOLD UP?
          </label>
          <textarea
            id={`dispute-${reportId}`}
            name="note"
            required
            minLength={20}
            maxLength={2000}
            rows={3}
            style={{ ...field, resize: "vertical" }}
          />
          <div>
            <button type="submit" disabled={pending} style={button}>
              {pending ? "FILING…" : "FILE DISPUTE"}
            </button>
          </div>
        </form>
      )}

      {state && !state.ok && (
        <p role="status" style={resultStyle(false)}>
          {state.error}
        </p>
      )}
    </div>
  );
}
