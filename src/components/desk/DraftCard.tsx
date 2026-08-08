"use client";

import { useActionState } from "react";
import { approveDraft, mergeDraft, rejectDraft } from "@/app/desk/actions";
import {
  nField,
  slugify,
  SEVERITY_OPTIONS,
  CATEGORY_ENUM,
  type DeskDraft,
  type IncidentRef,
} from "./types";
import {
  mono,
  display,
  capsLabel,
  field,
  labelStyle,
  button,
  buttonQuiet,
  buttonDanger,
  resultStyle,
} from "./ui";

// One ingested draft: preview of the normalized doc plus the three editor
// moves — approve (publish as REPORTED), merge into an existing incident,
// or reject with a note. All decisions are human; nothing is automatic.

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function PreviewRow({ k, v }: { k: string; v: string }) {
  if (!v) return null;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
      <span style={{ ...capsLabel, color: "var(--meta)", minWidth: 130 }}>{k}</span>
      <span style={{ ...mono, fontSize: 12, wordBreak: "break-word" }}>{v}</span>
    </div>
  );
}

function DetailsSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <details style={{ borderTop: "1px solid var(--rule)", padding: "10px 0" }}>
      <summary style={{ ...capsLabel, cursor: "pointer", color: "var(--link)" }}>
        {label}
      </summary>
      <div style={{ paddingTop: 12 }}>{children}</div>
    </details>
  );
}

export default function DraftCard({
  draft,
  incidents,
}: {
  draft: DeskDraft;
  incidents: IncidentRef[];
}) {
  const [approveState, approveAction, approvePending] = useActionState(approveDraft, null);
  const [mergeState, mergeAction, mergePending] = useActionState(mergeDraft, null);
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectDraft, null);

  const n = draft.normalized;
  const nTitle = str(nField(n, "title", "title")) || draft.title;
  const nSummary = str(nField(n, "summary", "summary"));
  const nSeverity = str(nField(n, "severity", "severity"));
  const nFirstObserved =
    str(nField(n, "firstObserved", "first_observed")) ||
    draft.createdAt.slice(0, 10);
  const rawCategories = nField(n, "categories", "categories");
  const nCategories = Array.isArray(rawCategories)
    ? rawCategories.filter((c): c is string => typeof c === "string").join(", ")
    : "";
  const impact = nField(n, "impact", "impact");
  const lossUSD =
    impact && typeof impact === "object"
      ? (impact as Record<string, unknown>).lossUSD
      : undefined;
  const rawSources = nField(n, "sources", "sources");
  const sourceCount = Array.isArray(rawSources) ? rawSources.length : 0;

  // A draft is publishable only with a source URL — surface that up front.
  const hasSource = Boolean(draft.sourceUrl) || sourceCount > 0;

  const decided =
    (approveState?.ok ?? false) || (mergeState?.ok ?? false) || (rejectState?.ok ?? false);

  return (
    <article
      style={{
        border: "1px solid var(--rule)",
        padding: "16px 20px",
        marginTop: 12,
        background: "var(--paper)",
        ...(decided ? { opacity: 0.55 } : {}),
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
        <span>DRAFT #{draft.id}</span>
        <span>INGESTED {draft.createdAt.slice(0, 16).replace("T", " ")} UTC</span>
        {draft.sourceUrl ? (
          <a
            href={draft.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, color: "var(--link)" }}
          >
            SOURCE →
          </a>
        ) : (
          <span style={{ color: "var(--danger)", fontWeight: 600 }}>NO SOURCE URL</span>
        )}
      </div>

      <h4 style={{ ...display, fontSize: 21, lineHeight: 1.3, margin: 0 }}>{nTitle}</h4>

      <div
        style={{
          background: "var(--panel)",
          padding: "12px 16px",
          marginTop: 12,
          display: "grid",
          gap: 6,
        }}
      >
        <PreviewRow k="TRUST STATE" v="REPORTED · UNVERIFIED (forced on approve)" />
        <PreviewRow k="SEVERITY" v={nSeverity} />
        <PreviewRow k="CATEGORIES" v={nCategories} />
        <PreviewRow k="FIRST OBSERVED" v={nFirstObserved} />
        <PreviewRow
          k="REPORTED LOSS"
          v={typeof lossUSD === "number" ? `$${lossUSD.toLocaleString("en-US")}` : ""}
        />
        <PreviewRow k="SOURCES IN DOC" v={String(sourceCount)} />
        {nSummary && (
          <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--meta)", margin: "4px 0 0" }}>
            {nSummary}
          </p>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <DetailsSection label={hasSource ? "APPROVE · PUBLISH AS REPORTED" : "APPROVE (BLOCKED · NO SOURCE)"}>
          {!hasSource && (
            <p style={{ ...mono, fontSize: 12, color: "var(--danger)", marginTop: 0 }}>
              No source, no publish. This draft carries no source URL — reject it
              or fix the ingest job.
            </p>
          )}
          <form action={approveAction}>
            <input type="hidden" name="draftId" value={draft.id} />
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={labelStyle} htmlFor={`title-${draft.id}`}>TITLE</label>
                <input id={`title-${draft.id}`} name="title" defaultValue={nTitle} style={field} required />
              </div>
              <div>
                <label style={labelStyle} htmlFor={`slug-${draft.id}`}>SLUG</label>
                <input
                  id={`slug-${draft.id}`}
                  name="slug"
                  defaultValue={slugify(nTitle)}
                  style={{ ...field, ...mono, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor={`summary-${draft.id}`}>SUMMARY</label>
                <textarea
                  id={`summary-${draft.id}`}
                  name="summary"
                  defaultValue={nSummary}
                  rows={4}
                  style={field}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <label style={labelStyle} htmlFor={`severity-${draft.id}`}>SEVERITY</label>
                  <select
                    id={`severity-${draft.id}`}
                    name="severity"
                    defaultValue={
                      ["S1", "S2", "S3", "S4"].includes(nSeverity) ? nSeverity : "S4"
                    }
                    style={{ ...field, width: "auto" }}
                  >
                    {SEVERITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle} htmlFor={`observed-${draft.id}`}>FIRST OBSERVED</label>
                  <input
                    id={`observed-${draft.id}`}
                    name="firstObserved"
                    type="date"
                    defaultValue={nFirstObserved}
                    style={{ ...field, width: "auto" }}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle} htmlFor={`categories-${draft.id}`}>
                  CATEGORIES (COMMA-SEPARATED)
                </label>
                <input
                  id={`categories-${draft.id}`}
                  name="categories"
                  defaultValue={nCategories || "theft"}
                  style={{ ...field, ...mono, fontSize: 14 }}
                  required
                />
                <p style={{ fontSize: 13, color: "var(--meta)", marginTop: 4, marginBottom: 0 }}>
                  Allowed: {CATEGORY_ENUM.join(", ")}
                </p>
              </div>
              <div>
                <button type="submit" style={button} disabled={approvePending || !hasSource}>
                  {approvePending ? "PUBLISHING…" : "PUBLISH AS REPORTED · UNVERIFIED"}
                </button>
              </div>
            </div>
          </form>
          {approveState && (
            <p role="status" style={resultStyle(approveState.ok)}>
              {approveState.ok ? `OK — ${approveState.message}` : approveState.error}
            </p>
          )}
        </DetailsSection>

        <DetailsSection label="MERGE INTO EXISTING INCIDENT">
          {incidents.length === 0 ? (
            <p style={{ ...mono, fontSize: 12, color: "var(--meta)", margin: 0 }}>
              No incidents in the database to merge into.
            </p>
          ) : (
            <form action={mergeAction} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <input type="hidden" name="draftId" value={draft.id} />
              <div style={{ flex: "1 1 320px" }}>
                <label style={labelStyle} htmlFor={`merge-${draft.id}`}>TARGET INCIDENT</label>
                <select id={`merge-${draft.id}`} name="incidentId" style={field} required>
                  <option value="">— pick an incident —</option>
                  {incidents.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.slug} — {i.title}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" style={buttonQuiet} disabled={mergePending}>
                {mergePending ? "MERGING…" : "MERGE SOURCE + TIMELINE"}
              </button>
            </form>
          )}
          {mergeState && (
            <p role="status" style={resultStyle(mergeState.ok)}>
              {mergeState.ok ? `OK — ${mergeState.message}` : mergeState.error}
            </p>
          )}
        </DetailsSection>

        <DetailsSection label="REJECT">
          <form action={rejectAction} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <input type="hidden" name="draftId" value={draft.id} />
            <div style={{ flex: "1 1 320px" }}>
              <label style={labelStyle} htmlFor={`reject-${draft.id}`}>REJECTION NOTE</label>
              <input
                id={`reject-${draft.id}`}
                name="note"
                placeholder="Why this does not belong in the registry"
                style={field}
                required
              />
            </div>
            <button type="submit" style={buttonDanger} disabled={rejectPending}>
              {rejectPending ? "REJECTING…" : "REJECT"}
            </button>
          </form>
          {rejectState && (
            <p role="status" style={resultStyle(rejectState.ok)}>
              {rejectState.ok ? `OK — ${rejectState.message}` : rejectState.error}
            </p>
          )}
        </DetailsSection>
      </div>
    </article>
  );
}
