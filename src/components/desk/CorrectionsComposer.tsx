"use client";

import { useActionState } from "react";
import { addCorrection } from "@/app/desk/actions";
import type { IncidentRef } from "./types";
import { mono, field, labelStyle, button, resultStyle } from "./ui";

// Corrections are public and permanent: one row in the corrections table,
// one entry in the incident doc's corrections[] array, then revalidation.

export default function CorrectionsComposer({
  incidents,
}: {
  incidents: IncidentRef[];
}) {
  const [state, action, pending] = useActionState(addCorrection, null);
  const today = new Date().toISOString().slice(0, 10);

  if (incidents.length === 0) {
    return (
      <p style={{ ...mono, fontSize: 12, color: "var(--meta)", marginTop: 16 }}>
        No incidents in the database yet — nothing to correct.
      </p>
    );
  }

  return (
    <div style={{ background: "var(--panel)", padding: "20px 24px", marginTop: 16, maxWidth: 640 }}>
      <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--meta)", marginTop: 0 }}>
        Corrections are public and permanent. The note appears verbatim on the
        case file page and in the corrections record — write it as you would print it.
      </p>
      <form action={action} style={{ display: "grid", gap: 14 }}>
        <div>
          <label style={labelStyle} htmlFor="correction-incident">INCIDENT</label>
          <select id="correction-incident" name="incidentId" style={field} required>
            <option value="">— pick an incident —</option>
            {incidents.map((i) => (
              <option key={i.id} value={i.id}>
                {i.slug} — {i.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle} htmlFor="correction-date">CORRECTION DATE</label>
          <input
            id="correction-date"
            name="date"
            type="date"
            defaultValue={today}
            style={{ ...field, width: "auto" }}
            required
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="correction-note">CORRECTION NOTE</label>
          <textarea
            id="correction-note"
            name="note"
            rows={4}
            placeholder="What was wrong, and what is correct now"
            style={field}
            required
          />
        </div>
        <div>
          <button type="submit" style={button} disabled={pending}>
            {pending ? "FILING…" : "FILE CORRECTION"}
          </button>
        </div>
      </form>
      {state && (
        <p role="status" style={resultStyle(state.ok)}>
          {state.ok ? `OK — ${state.message}` : state.error}
        </p>
      )}
    </div>
  );
}
