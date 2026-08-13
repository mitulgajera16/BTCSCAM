"use client";

import { useActionState } from "react";
import { toggleCredit, updateHandle } from "@/app/account/actions";
import { HANDLE_MAX, HANDLE_MIN } from "./handle";
import {
  button,
  buttonQuiet,
  capsLabel,
  field,
  mono,
  resultStyle,
} from "./ui";

// Settings: the handle (changeable once — the server enforces it by the
// stored row's shape, this UI just tells the truth about it) and the named-
// credit preference (changeable anytime).

function HandleForm({
  handle,
  canEdit,
}: {
  handle: string | null;
  canEdit: boolean;
}) {
  const [state, action, pending] = useActionState(updateHandle, null);

  if (!canEdit) {
    return (
      <div>
        <p style={{ ...capsLabel, color: "var(--meta)", margin: 0 }}>HANDLE</p>
        <p style={{ ...mono, fontSize: 18, fontWeight: 600, margin: "8px 0 0" }}>
          {handle}
        </p>
        <p
          style={{
            ...mono,
            fontSize: 12,
            color: "var(--meta)",
            lineHeight: 1.6,
            margin: "8px 0 0",
          }}
        >
          CHOSEN. Handles change once, and this one has been. It is the byline
          on work the desk accepts.
        </p>
      </div>
    );
  }

  return (
    <form action={action}>
      <label htmlFor="account-handle" style={{ ...capsLabel, display: "block" }}>
        HANDLE — YOU SET THIS ONCE
      </label>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.55,
          color: "var(--meta)",
          margin: "8px 0 12px",
          maxWidth: "60ch",
        }}
      >
        {handle
          ? `You are currently ${handle} — an auto-issued handle. Replace it with one you chose:`
          : "No handle yet. Choose one:"}{" "}
        {HANDLE_MIN}–{HANDLE_MAX} characters, lowercase letters, digits, and
        hyphens. It becomes your byline on accepted work, and it does not
        change again.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          id="account-handle"
          name="handle"
          type="text"
          required
          minLength={HANDLE_MIN}
          maxLength={HANDLE_MAX}
          pattern="[a-z0-9-]+"
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. cold-storage-carl"
          style={{ ...field, maxWidth: 320 }}
          disabled={pending}
        />
        <button type="submit" style={button} disabled={pending}>
          {pending ? "SAVING…" : "SET HANDLE"}
        </button>
      </div>
      {state && (
        <p style={resultStyle(state.ok)}>
          {state.ok ? state.message : state.error}
        </p>
      )}
    </form>
  );
}

function CreditToggle({ showCredit }: { showCredit: boolean }) {
  const [state, action, pending] = useActionState(toggleCredit, null);

  return (
    <form action={action} style={{ marginTop: 32 }}>
      <p style={{ ...capsLabel, margin: 0 }}>NAMED CREDIT</p>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.55,
          color: "var(--meta)",
          margin: "8px 0 12px",
          maxWidth: "60ch",
        }}
      >
        Named credit on case files you back up. ON: accepted contributions may
        carry your handle — &ldquo;Backed up by&rdquo; on the public record.
        OFF: you contribute anonymously; the work still counts on the ladder.
        Change it anytime.
      </p>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span
          style={{
            ...mono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".05em",
            padding: "2px 8px",
            border: "1px solid var(--ink)",
            background: showCredit ? "var(--ink)" : "transparent",
            color: showCredit ? "var(--paper)" : "var(--ink)",
          }}
        >
          {showCredit ? "ON" : "OFF"}
        </span>
        <input type="hidden" name="show" value={showCredit ? "off" : "on"} />
        <button type="submit" style={buttonQuiet} disabled={pending}>
          {pending
            ? "SAVING…"
            : showCredit
              ? "TURN NAMED CREDIT OFF"
              : "TURN NAMED CREDIT ON"}
        </button>
      </div>
      {state && (
        <p style={resultStyle(state.ok)}>
          {state.ok ? state.message : state.error}
        </p>
      )}
    </form>
  );
}

export default function SettingsPanel({
  handle,
  canEdit,
  showCredit,
}: {
  handle: string | null;
  canEdit: boolean;
  showCredit: boolean;
}) {
  return (
    <div style={{ marginTop: 16 }}>
      <HandleForm handle={handle} canEdit={canEdit} />
      <CreditToggle showCredit={showCredit} />
    </div>
  );
}
