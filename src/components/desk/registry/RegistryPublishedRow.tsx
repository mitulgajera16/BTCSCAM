"use client";

import { useActionState, useState } from "react";

import { unpublishAction } from "@/app/desk/registry/actions";
import {
  UNPUBLISH_PIPELINE,
  type PublishedView,
  type RegistryActionState,
} from "./types";
import { buttonDanger, buttonQuiet, capsLabel, display, mono, resultStyle } from "../ui";

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

export default function RegistryPublishedRow({ row }: { row: PublishedView }) {
  const [state, formAction, pending] = useActionState(unpublishAction, null);
  const [armed, setArmed] = useState(false);
  const pulled = state?.ok ?? false;

  return (
    <article
      style={{
        border: "1px solid var(--rule)",
        padding: "14px 20px",
        marginTop: 12,
        background: "var(--paper)",
        ...(pulled ? { opacity: 0.55 } : {}),
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ ...display, fontSize: 18, margin: 0 }}>{row.title}</h3>
          <p style={{ ...mono, fontSize: 12, color: "var(--meta)", margin: "4px 0 0" }}>
            PUBLISHED {row.publishedDate} · {row.id}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
          <a
            href={`/scam/${row.slug}`}
            target="_blank"
            rel="noreferrer"
            style={{ ...buttonQuiet, textDecoration: "none", display: "inline-block" }}
          >
            VIEW LIVE
          </a>
          {!armed && !pulled ? (
            <button type="button" style={buttonDanger} disabled={pending} onClick={() => setArmed(true)}>
              BACK TO DRAFT
            </button>
          ) : null}
        </div>
      </div>

      <div
        style={{
          ...mono,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: ".05em",
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          marginTop: 10,
        }}
      >
        {row.badges.map((b) => (
          <span key={b.label} style={{ color: b.ok ? "var(--ink)" : "var(--danger)" }}>
            {b.label}
          </span>
        ))}
      </div>

      {armed && !pulled ? (
        <div style={{ borderTop: "2px solid var(--danger)", marginTop: 12, paddingTop: 12 }}>
          <p style={{ ...capsLabel, margin: 0 }}>THIS WILL, IN ORDER:</p>
          <ol style={{ ...mono, fontSize: 12, lineHeight: 1.6, paddingLeft: 18, margin: "8px 0" }}>
            {UNPUBLISH_PIPELINE.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p style={{ ...mono, fontSize: 12, color: "var(--danger)", margin: "8px 0" }}>
            THE PAGE IS FULLY OFF-SITE ONLY WHEN THE DEPLOY LANDS — until then the
            previous bundle still contains the file.
          </p>
          <form action={formAction} style={{ display: "inline-flex", gap: 8 }}>
            <input type="hidden" name="slug" value={row.slug} />
            <button type="submit" style={buttonDanger} disabled={pending}>
              {pending ? "PULLING…" : "CONFIRM BACK TO DRAFT"}
            </button>
            <button type="button" style={buttonQuiet} disabled={pending} onClick={() => setArmed(false)}>
              CANCEL
            </button>
          </form>
        </div>
      ) : null}

      {state ? <StepList state={state} /> : null}
      {pulled ? (
        <p style={{ ...capsLabel, marginTop: 8 }}>
          BACK IN DRAFTS — refresh the page to see it under DRAFTS.
        </p>
      ) : null}
    </article>
  );
}
