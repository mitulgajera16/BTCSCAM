"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

// ── Evidence chips (R3) ─────────────────────────────────────────────────────
// Typed evidence attached to a report one piece at a time: a URL, a
// transaction id, a screenshot link, or an exact quote. Chips serialize into
// a hidden form field as JSON and ride the same server action as the rest of
// the report — the action re-validates every chip server-side (this file is
// client code; nothing here is trusted).

const mono = { fontFamily: "var(--font-plex-mono), monospace" };

export type ChipKind = "url" | "txid" | "screenshot" | "quote";
export type EvidenceChip = { kind: ChipKind; value: string };

export const CHIP_KINDS: readonly ChipKind[] = [
  "url",
  "txid",
  "screenshot",
  "quote",
];

export const CHIP_LABEL: Record<ChipKind, string> = {
  url: "URL",
  txid: "TXID",
  screenshot: "SCREENSHOT-URL",
  quote: "QUOTE",
};

export const MAX_CHIPS = 12;
export const MAX_QUOTE_CHARS = 280;
const MAX_CHIP_URL_CHARS = 500;

const PLACEHOLDER: Record<ChipKind, string> = {
  url: "https://web.archive.org/web/…",
  txid: "64 hex characters — 0x prefix allowed",
  screenshot: "https:// link to the screenshot",
  quote: "Their exact words — up to 280 characters",
};

/**
 * Parse a serialized chips payload (the hidden-field JSON) back into chips.
 * Defensive: malformed entries are dropped, nothing throws. Used to rehydrate
 * the widget when the server action returns the draft for editing.
 */
export function parseChips(
  serialized: string | null | undefined,
): EvidenceChip[] {
  if (!serialized) return [];
  try {
    const raw: unknown = JSON.parse(serialized);
    if (!Array.isArray(raw)) return [];
    const out: EvidenceChip[] = [];
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const kind = (item as Record<string, unknown>).kind;
      const value = (item as Record<string, unknown>).value;
      if (typeof kind !== "string" || typeof value !== "string") continue;
      if (!(CHIP_KINDS as readonly string[]).includes(kind)) continue;
      out.push({ kind: kind as ChipKind, value });
    }
    return out.slice(0, MAX_CHIPS);
  } catch {
    return [];
  }
}

/**
 * Client-side chip validation — returns an error sentence or null. The server
 * action applies the same rules again; this only exists so mistakes surface
 * before submit.
 */
export function chipProblem(kind: ChipKind, value: string): string | null {
  const v = value.trim();
  if (!v) return "Type a value first.";
  if (kind === "url" || kind === "screenshot") {
    if (v.length > MAX_CHIP_URL_CHARS) {
      return `Keep it under ${MAX_CHIP_URL_CHARS} characters — use an archive capture or a shorter canonical link.`;
    }
    try {
      if (new URL(v).protocol !== "https:") {
        return "Must be a full URL starting https://.";
      }
    } catch {
      return "Must be a full URL starting https://.";
    }
    return null;
  }
  if (kind === "txid") {
    return /^(0x)?[0-9a-fA-F]{64}$/.test(v)
      ? null
      : "A transaction id is exactly 64 hex characters (0x prefix allowed).";
  }
  // quote
  return v.length <= MAX_QUOTE_CHARS
    ? null
    : `Keep the quote to ${MAX_QUOTE_CHARS} characters — the exact words, not the whole thread.`;
}

const chipStyle: CSSProperties = {
  ...mono,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  maxWidth: "100%",
  border: "1px solid var(--ink)",
  background: "var(--panel)",
  padding: "4px 6px 4px 8px",
  fontSize: 12,
};

const smallField: CSSProperties = {
  boxSizing: "border-box",
  border: "1px solid var(--ink)",
  borderRadius: 0,
  background: "var(--paper)",
  color: "var(--ink)",
  padding: "8px 10px",
  fontSize: 14,
  lineHeight: 1.5,
};

export function EvidenceChips({
  name = "chips",
  defaultValue,
}: {
  name?: string;
  defaultValue?: string;
}) {
  const [chips, setChips] = useState<EvidenceChip[]>(() =>
    parseChips(defaultValue),
  );
  const [kind, setKind] = useState<ChipKind>("url");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function addChip() {
    const v = value.trim();
    const problem = chipProblem(kind, v);
    if (problem) {
      setError(problem);
      return;
    }
    if (chips.length >= MAX_CHIPS) {
      setError(
        `Up to ${MAX_CHIPS} chips per report — lead with the strongest.`,
      );
      return;
    }
    if (chips.some((c) => c.kind === kind && c.value === v)) {
      setError("That chip is already on the report.");
      return;
    }
    setChips([...chips, { kind, value: v }]);
    setValue("");
    setError(null);
  }

  function removeChip(index: number) {
    setChips(chips.filter((_, i) => i !== index));
    setError(null);
  }

  return (
    <div>
      {/* Serialized payload — the server action re-validates every entry. */}
      <input
        type="hidden"
        name={name}
        value={chips.length > 0 ? JSON.stringify(chips) : ""}
      />

      {chips.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            padding: 0,
            margin: "0 0 12px",
          }}
        >
          {chips.map((chip, i) => (
            <li key={`${chip.kind}:${chip.value}`} style={chipStyle}>
              <span
                style={{
                  fontWeight: 600,
                  letterSpacing: ".05em",
                  color: "var(--meta)",
                  whiteSpace: "nowrap",
                }}
              >
                {CHIP_LABEL[chip.kind]}
              </span>
              <span
                title={chip.value}
                style={{
                  maxWidth: 320,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {chip.value}
              </span>
              <button
                type="button"
                onClick={() => removeChip(i)}
                aria-label={`Remove ${CHIP_LABEL[chip.kind]} chip ${chip.value}`}
                style={{
                  ...mono,
                  border: "none",
                  background: "transparent",
                  color: "var(--ink)",
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: 1,
                  padding: "2px 4px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <select
          aria-label="Chip type"
          className="rf-field"
          value={kind}
          onChange={(e) => {
            setKind(e.target.value as ChipKind);
            setError(null);
          }}
          style={{ ...smallField, ...mono, flex: "0 0 auto" }}
        >
          {CHIP_KINDS.map((k) => (
            <option key={k} value={k}>
              {CHIP_LABEL[k]}
            </option>
          ))}
        </select>
        <input
          type="text"
          aria-label="Chip value"
          className="rf-field"
          value={value}
          maxLength={kind === "quote" ? MAX_QUOTE_CHARS : MAX_CHIP_URL_CHARS}
          placeholder={PLACEHOLDER[kind]}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            // Enter adds the chip — it must not submit the whole report.
            if (e.key === "Enter") {
              e.preventDefault();
              addChip();
            }
          }}
          style={{
            ...smallField,
            ...(kind === "quote" ? {} : mono),
            flex: "1 1 220px",
            minWidth: 0,
          }}
        />
        <button
          type="button"
          onClick={addChip}
          style={{
            ...mono,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: ".05em",
            background: "transparent",
            color: "var(--ink)",
            border: "1px solid var(--ink)",
            padding: "8px 16px",
            cursor: "pointer",
            flex: "0 0 auto",
          }}
        >
          ADD CHIP
        </button>
      </div>

      <div aria-live="polite">
        {error && (
          <p
            style={{
              ...mono,
              fontSize: 12,
              fontWeight: 600,
              color: "var(--danger)",
              margin: "8px 0 0",
            }}
          >
            {error}
          </p>
        )}
      </div>

      {!error && value.trim() && (
        <p
          style={{
            ...mono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".05em",
            color: "var(--meta)",
            margin: "8px 0 0",
          }}
        >
          NOT ATTACHED UNTIL YOU PRESS ADD CHIP.
        </p>
      )}

      {chips.length > 0 && (
        <p
          style={{
            ...mono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".05em",
            color: "var(--meta)",
            margin: "8px 0 0",
          }}
        >
          {chips.length} OF {MAX_CHIPS} CHIPS.
        </p>
      )}
    </div>
  );
}
