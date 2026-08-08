"use client";

import { useActionState } from "react";
import { triageReport } from "@/app/desk/actions";
import { defang, type DeskReport } from "./types";
import { mono, capsLabel, buttonQuiet, buttonDanger, resultStyle } from "./ui";

// One reader report awaiting triage. Domains are defanged and evidence URLs
// are rendered as plain text on purpose: the desk must never present live
// scam infrastructure as a clickable link.

function MetaLine({ k, v }: { k: string; v: string }) {
  if (!v) return null;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
      <span style={{ ...capsLabel, color: "var(--meta)", minWidth: 110 }}>{k}</span>
      <span style={{ ...mono, fontSize: 12, wordBreak: "break-all" }}>{v}</span>
    </div>
  );
}

export default function ReportRow({ report }: { report: DeskReport }) {
  const [state, action, pending] = useActionState(triageReport, null);

  return (
    <article
      style={{
        border: "1px solid var(--rule)",
        padding: "16px 20px",
        marginTop: 12,
        background: "var(--paper)",
        ...(state?.ok ? { opacity: 0.55 } : {}),
      }}
    >
      <div
        style={{
          ...mono,
          fontSize: 12,
          color: "var(--meta)",
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 8,
        }}
      >
        <span>REPORT #{report.id}</span>
        <span>FILED {report.createdAt.slice(0, 16).replace("T", " ")} UTC</span>
        {report.category && <span>{report.category.toUpperCase()}</span>}
        {report.observedOn && <span>OBSERVED {report.observedOn}</span>}
      </div>

      <p style={{ fontSize: 16, lineHeight: 1.55, margin: 0, whiteSpace: "pre-wrap" }}>
        {report.description}
      </p>

      <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
        <MetaLine k="VENDOR" v={report.vendor ?? ""} />
        <MetaLine k="DOMAIN" v={report.domain ? defang(report.domain) : ""} />
        <MetaLine k="ADDRESS" v={report.address ?? ""} />
        <MetaLine k="CONTACT" v={report.contactEmail ?? "not provided"} />
        {report.evidenceUrls.length > 0 && (
          <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
            <span style={{ ...capsLabel, color: "var(--meta)", minWidth: 110 }}>EVIDENCE</span>
            <div style={{ display: "grid", gap: 2 }}>
              {report.evidenceUrls.map((u, idx) => (
                // Plain text, never <a> — may point at live scam infrastructure.
                <span key={idx} style={{ ...mono, fontSize: 12, wordBreak: "break-all" }}>
                  {u}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        action={action}
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}
      >
        <input type="hidden" name="reportId" value={report.id} />
        {/* The clicked button supplies the status value. */}
        <button type="submit" name="status" value="triaged" style={buttonQuiet} disabled={pending}>
          MARK TRIAGED
        </button>
        <button type="submit" name="status" value="accepted" style={buttonQuiet} disabled={pending}>
          ACCEPT
        </button>
        <button type="submit" name="status" value="rejected" style={buttonDanger} disabled={pending}>
          REJECT
        </button>
      </form>
      {state && (
        <p role="status" style={resultStyle(state.ok)}>
          {state.ok ? `OK — ${state.message}` : state.error}
        </p>
      )}
    </article>
  );
}
