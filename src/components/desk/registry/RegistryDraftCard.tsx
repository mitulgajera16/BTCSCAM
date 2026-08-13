"use client";

import { useActionState, useState } from "react";

import { publishAction } from "@/app/desk/registry/actions";
import {
  PUBLISH_PIPELINE,
  type DraftView,
  type RegistryActionState,
} from "./types";
import { button, buttonQuiet, capsLabel, display, mono, resultStyle } from "../ui";

function StepList({ state }: { state: RegistryActionState }) {
  return (
    <div style={resultStyle(state.ok)}>
      {state.steps.map((s) => (
        <div key={s.step}>
          {s.ok ? "OK     " : "FAILED "}
          {s.step.toUpperCase()} — {s.detail}
        </div>
      ))}
      {state.error ? <div>{state.error}</div> : null}
    </div>
  );
}

export default function RegistryDraftCard({ draft }: { draft: DraftView }) {
  const [state, formAction, pending] = useActionState(publishAction, null);
  const [armed, setArmed] = useState(false);
  const published = state?.ok ?? false;

  return (
    <article
      style={{
        border: "1px solid var(--rule)",
        padding: "16px 20px",
        marginTop: 12,
        background: "var(--paper)",
        ...(published ? { opacity: 0.55 } : {}),
      }}
    >
      <div style={{ ...mono, fontSize: 12, color: "var(--meta)", display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span>{draft.fileName}</span>
        <span>{draft.trustState.toUpperCase()}</span>
        <span>{draft.severity}</span>
        <span>{draft.sourceCount} SOURCES</span>
      </div>
      <h3 style={{ ...display, fontSize: 20, margin: "8px 0 4px" }}>{draft.title}</h3>
      <p style={{ ...mono, fontSize: 12, color: "var(--meta)", margin: 0 }}>
        {draft.categories.join(", ")}
      </p>

      {draft.parseError ? (
        <p style={resultStyle(false)}>BROKEN JSON — {draft.parseError}</p>
      ) : null}

      <details style={{ borderTop: "1px solid var(--rule)", marginTop: 12, padding: "10px 0 0" }}>
        <summary style={{ ...capsLabel, cursor: "pointer", color: "var(--link)" }}>
          CHECK BEFORE APPROVING · {draft.flags.length}
        </summary>
        {draft.flags.length === 0 ? (
          <p style={{ ...mono, fontSize: 12, color: "var(--meta)" }}>
            No review notes found for this case file.
          </p>
        ) : (
          <ul style={{ ...mono, fontSize: 12, lineHeight: 1.6, paddingLeft: 18, margin: "10px 0 0" }}>
            {draft.flags.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
      </details>

      {!armed && !published ? (
        <button
          type="button"
          style={{ ...button, marginTop: 12 }}
          disabled={pending || Boolean(draft.parseError)}
          onClick={() => setArmed(true)}
        >
          PUBLISH
        </button>
      ) : null}

      {armed && !published ? (
        <div style={{ borderTop: "2px solid var(--ink)", marginTop: 12, paddingTop: 12 }}>
          <p style={{ ...capsLabel, margin: 0 }}>THIS WILL, IN ORDER:</p>
          <ol style={{ ...mono, fontSize: 12, lineHeight: 1.6, paddingLeft: 18, margin: "8px 0" }}>
            {PUBLISH_PIPELINE.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {draft.flags.length > 0 ? (
            <p style={{ ...mono, fontSize: 12, color: "var(--danger)", margin: "8px 0" }}>
              {draft.flags.length} REVIEW FLAG(S) STILL LISTED ABOVE — publishing anyway is
              safe but weaker. This is a warning, not a blocker.
            </p>
          ) : null}
          <form action={formAction} style={{ display: "inline-flex", gap: 8 }}>
            <input type="hidden" name="slug" value={draft.slug} />
            <button type="submit" style={button} disabled={pending}>
              {pending ? "PUBLISHING…" : "CONFIRM PUBLISH"}
            </button>
            <button type="button" style={buttonQuiet} disabled={pending} onClick={() => setArmed(false)}>
              CANCEL
            </button>
          </form>
        </div>
      ) : null}

      {state ? <StepList state={state} /> : null}
      {published ? (
        <p style={{ ...capsLabel, marginTop: 8 }}>
          PUBLISHED — refresh the page to see it under PUBLISHED with sync badges.
        </p>
      ) : null}
    </article>
  );
}
