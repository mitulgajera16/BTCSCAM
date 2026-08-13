"use client";

import { useActionState } from "react";
import {
  acceptChip,
  acceptReportToDraft,
  attachReportToIncident,
  rejectChip,
} from "@/app/desk/actions";
import type { IncidentRef } from "./types";
import {
  mono,
  capsLabel,
  field,
  button,
  buttonQuiet,
  buttonDanger,
  resultStyle,
} from "./ui";

// DeskSignalsPanel (formerly a second component named VoteTally — renamed so
// the public tally in src/components/votes/VoteTally.tsx owns that name).
// Desk v2 per-report panel: verify-vote tallies, evidence chips with
// accept/reject moderation, and the two accept moves (new draft / attach to
// incident). Votes and chips are SIGNALS TO EDITORS — this panel repeats
// that in print because it is the product's law: nothing here auto-verifies.
//
// Vote evidence URLs and chip values render as plain text, never <a> — they
// may point at live scam infrastructure (same rule as ReportRow).
//
// Honest numbers: when the votes/chips read failed (votesOk/chipsOk false,
// e.g. migrations 0002/0004 unapplied) this panel prints UNAVAILABLE, never
// a zero count it cannot stand behind.

export type DeskVote = {
  id: number;
  stance: "corroborate" | "dispute";
  voter: string; // handle or shortened uuid, resolved server-side
  evidenceUrl: string | null;
  note: string | null;
  createdAt: string;
};

export type DeskChip = {
  id: number;
  kind: string; // url | txid | screenshot | quote
  value: string;
  contributor: string | null; // handle/short uuid, or null when anonymous
  accepted: boolean | null; // null = pending
  createdAt: string;
};

function StanceCount({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <span style={{ ...capsLabel, color: count > 0 ? color : "var(--meta)" }}>
      {count} {label}
    </span>
  );
}

function VoteLine({ vote }: { vote: DeskVote }) {
  return (
    <div style={{ borderTop: "1px solid var(--rule)", padding: "8px 0" }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
        <span
          style={{
            ...capsLabel,
            color: vote.stance === "corroborate" ? "var(--tick-up)" : "var(--danger)",
          }}
        >
          {vote.stance === "corroborate" ? "SAW IT TOO" : "DISPUTE"}
        </span>
        <span style={{ ...mono, fontSize: 12, color: "var(--meta)" }}>
          {vote.voter} · {vote.createdAt.slice(0, 10)}
        </span>
      </div>
      {vote.evidenceUrl && (
        <p
          style={{
            ...mono,
            fontSize: 12,
            margin: "4px 0 0",
            wordBreak: "break-all",
            color: "var(--ink)",
          }}
        >
          EVIDENCE: {vote.evidenceUrl}
        </p>
      )}
      {vote.note && (
        <p style={{ fontSize: 14, lineHeight: 1.5, margin: "4px 0 0" }}>{vote.note}</p>
      )}
    </div>
  );
}

function ChipRow({ chip }: { chip: DeskChip }) {
  const [acceptState, acceptAction, acceptPending] = useActionState(acceptChip, null);
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectChip, null);
  const state = acceptState ?? rejectState;
  const decided = chip.accepted !== null || acceptState?.ok || rejectState?.ok;

  const statusLabel =
    chip.accepted === true
      ? "ACCEPTED"
      : chip.accepted === false
        ? "REJECTED"
        : acceptState?.ok
          ? "ACCEPTED"
          : rejectState?.ok
            ? "REJECTED"
            : "PENDING";

  return (
    <div style={{ borderTop: "1px solid var(--rule)", padding: "8px 0" }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
        <span style={{ ...capsLabel, color: "var(--ink)" }}>{chip.kind.toUpperCase()}</span>
        <span
          style={{
            ...capsLabel,
            color:
              statusLabel === "ACCEPTED"
                ? "var(--tick-up)"
                : statusLabel === "REJECTED"
                  ? "var(--danger)"
                  : "var(--meta)",
          }}
        >
          {statusLabel}
        </span>
        <span style={{ ...mono, fontSize: 12, color: "var(--meta)" }}>
          {chip.contributor ?? "anonymous"} · {chip.createdAt.slice(0, 10)}
        </span>
      </div>
      {/* Plain text, never a link — chip values may be live scam infrastructure. */}
      <p
        style={{
          ...mono,
          fontSize: 12,
          margin: "4px 0 0",
          wordBreak: "break-all",
          whiteSpace: "pre-wrap",
        }}
      >
        {chip.value}
      </p>
      {!decided && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          <form action={acceptAction}>
            <input type="hidden" name="chipId" value={chip.id} />
            <button type="submit" style={buttonQuiet} disabled={acceptPending || rejectPending}>
              ACCEPT CHIP
            </button>
          </form>
          <form action={rejectAction}>
            <input type="hidden" name="chipId" value={chip.id} />
            <button type="submit" style={buttonDanger} disabled={acceptPending || rejectPending}>
              REJECT CHIP
            </button>
          </form>
        </div>
      )}
      {state && (
        <p role="status" style={resultStyle(state.ok)}>
          {state.ok ? `OK — ${state.message}` : state.error}
        </p>
      )}
    </div>
  );
}

export default function DeskSignalsPanel({
  reportId,
  reportStatus,
  votes,
  chips,
  incidents,
  votesOk,
  chipsOk,
}: {
  reportId: number;
  reportStatus: string;
  votes: DeskVote[];
  chips: DeskChip[];
  incidents: IncidentRef[];
  /** False when the verify_votes read failed — tallies print UNAVAILABLE. */
  votesOk: boolean;
  /** False when the evidence_chips read failed — counts print UNAVAILABLE. */
  chipsOk: boolean;
}) {
  const [draftState, draftAction, draftPending] = useActionState(acceptReportToDraft, null);
  const [attachState, attachAction, attachPending] = useActionState(
    attachReportToIncident,
    null,
  );

  const corroborate = votes.filter((v) => v.stance === "corroborate").length;
  const dispute = votes.filter((v) => v.stance === "dispute").length;
  const accepted = draftState?.ok || attachState?.ok;

  return (
    <div
      style={{
        border: "1px solid var(--rule)",
        borderTop: 0,
        background: "var(--panel)",
        padding: "14px 20px 16px",
        ...(accepted ? { opacity: 0.55 } : {}),
      }}
    >
      {/* ── tallies ── */}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "baseline",
        }}
      >
        <span style={{ ...capsLabel, color: "var(--meta)" }}>
          VERIFY-VOTES · REPORT #{reportId} ·{" "}
          {reportStatus === "triaged" ? "BEING REVIEWED" : reportStatus.toUpperCase()}
        </span>
        {votesOk ? (
          <>
            <StanceCount label="SAW IT TOO" count={corroborate} color="var(--tick-up)" />
            <StanceCount label="DISPUTE" count={dispute} color="var(--danger)" />
          </>
        ) : (
          <span style={{ ...capsLabel, color: "var(--danger)" }}>
            TALLIES UNAVAILABLE — THE VOTE READ FAILED; NO COUNTS PRINTED
            RATHER THAN WRONG ONES.
          </span>
        )}
      </div>
      <p style={{ ...mono, fontSize: 11, color: "var(--meta)", margin: "6px 0 0" }}>
        Votes and chips are signals to editors. They never auto-verify — the proof
        ladder stays editorial.
      </p>

      {votesOk && votes.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {votes.map((vote) => (
            <VoteLine key={vote.id} vote={vote} />
          ))}
        </div>
      )}

      {/* ── evidence chips ── */}
      <div style={{ marginTop: 14 }}>
        {!chipsOk ? (
          <>
            <span style={{ ...capsLabel, color: "var(--danger)" }}>
              EVIDENCE CHIPS · UNAVAILABLE
            </span>
            <p style={{ ...mono, fontSize: 12, color: "var(--danger)", margin: "6px 0 0" }}>
              The chip read failed — no count printed rather than a wrong one.
            </p>
          </>
        ) : (
          <>
            <span style={{ ...capsLabel, color: "var(--meta)" }}>
              EVIDENCE CHIPS · {chips.length}
            </span>
            {chips.length === 0 ? (
              <p style={{ ...mono, fontSize: 12, color: "var(--meta)", margin: "6px 0 0" }}>
                No chips filed on this report yet.
              </p>
            ) : (
              <div style={{ marginTop: 8 }}>
                {chips.map((chip) => (
                  <ChipRow key={chip.id} chip={chip} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── accept moves ── */}
      <div
        style={{
          borderTop: "2px solid var(--ink)",
          marginTop: 14,
          paddingTop: 12,
          display: "grid",
          gap: 10,
        }}
      >
        <form action={draftAction} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input type="hidden" name="reportId" value={reportId} />
          <button type="submit" style={button} disabled={draftPending || attachPending}>
            {draftPending ? "ACCEPTING…" : "ACCEPT → NEW DRAFT"}
          </button>
          <span style={{ ...mono, fontSize: 11, color: "var(--meta)", alignSelf: "center" }}>
            Creates a queue draft — still publishes only via APPROVE, as REPORTED.
          </span>
        </form>
        {draftState && (
          <p role="status" style={{ ...resultStyle(draftState.ok), marginTop: 0 }}>
            {draftState.ok ? `OK — ${draftState.message}` : draftState.error}
          </p>
        )}

        <form
          action={attachAction}
          style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}
        >
          <input type="hidden" name="reportId" value={reportId} />
          <select
            name="incidentId"
            style={{ ...field, width: "auto", maxWidth: 360, fontSize: 13 }}
            required
            defaultValue=""
          >
            <option value="">— pick an incident —</option>
            {incidents.map((i) => (
              <option key={i.id} value={i.id}>
                {i.slug} — {i.title}
              </option>
            ))}
          </select>
          <button type="submit" style={buttonQuiet} disabled={draftPending || attachPending}>
            {attachPending ? "ATTACHING…" : "ATTACH TO INCIDENT"}
          </button>
        </form>
        {attachState && (
          <p role="status" style={{ ...resultStyle(attachState.ok), marginTop: 0 }}>
            {attachState.ok ? `OK — ${attachState.message}` : attachState.error}
          </p>
        )}
      </div>
    </div>
  );
}
