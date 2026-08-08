"use client";

import Link from "next/link";
import { useActionState } from "react";
import { dismissOnboarding } from "@/app/account/actions";
import { button, capsLabel, display, mono, resultStyle } from "./ui";

// First-run panel — shows until profiles.onboarded is set. Three rules of
// reporting, the ladder in one line, and a pointer to the binding standards.

const RULES: { title: string; body: string }[] = [
  {
    title: "FACTS, DATES, EVIDENCE.",
    body: "Say what happened, when it happened, and how you know. A screenshot beats an adjective; a transaction id beats a screenshot.",
  },
  {
    title: "NO SPECULATION.",
    body: "Report what you saw, not what you suspect. The desk does the checking — and unverified stays labeled unverified until it is checked.",
  },
  {
    title: "NO DOXXING.",
    body: "Name companies, products, domains, and addresses. Never private individuals' homes, families, or personal accounts. Doxxing gets a report rejected.",
  },
];

export default function OnboardingPanel() {
  const [state, action, pending] = useActionState(dismissOnboarding, null);

  return (
    <section
      style={{
        border: "2px solid var(--ink)",
        background: "var(--warm)",
        padding: "24px 28px",
        marginTop: 32,
      }}
    >
      <p style={{ ...capsLabel, color: "var(--meta)", margin: 0 }}>
        FIRST RUN · READ ONCE, HOLDS FOREVER
      </p>
      <h2
        style={{
          ...display,
          fontSize: "clamp(21px, 4vw, 32px)",
          lineHeight: 1.2,
          margin: "8px 0 0",
        }}
      >
        Welcome to the desk. Three rules, then the ledger is yours.
      </h2>

      <ol
        style={{
          listStyle: "none",
          margin: "20px 0 0",
          padding: 0,
          display: "grid",
          gap: 14,
        }}
      >
        {RULES.map((rule, idx) => (
          <li
            key={rule.title}
            style={{ display: "flex", gap: 14, alignItems: "baseline" }}
          >
            <span
              style={{
                ...mono,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--orange)",
                minWidth: 24,
              }}
            >
              {String(idx + 1).padStart(2, "0")}
            </span>
            <p style={{ fontSize: 16, lineHeight: 1.55, margin: 0 }}>
              <strong style={{ ...mono, fontSize: 13, letterSpacing: ".05em" }}>
                {rule.title}
              </strong>{" "}
              {rule.body}
            </p>
          </li>
        ))}
      </ol>

      <p
        style={{
          fontSize: 16,
          lineHeight: 1.55,
          margin: "18px 0 0",
          color: "var(--meta)",
        }}
      >
        Accepted work climbs the ladder below — reader to reporter to
        corroborator to watchman. Status and credit are the only rewards; your
        votes and evidence are signals to the editors, never verdicts.{" "}
        <Link
          href="/standards"
          style={{ ...mono, fontSize: 12, fontWeight: 600, color: "var(--link)" }}
        >
          THE FULL STANDARDS →
        </Link>
      </p>

      <form action={action} style={{ marginTop: 20 }}>
        <button type="submit" style={button} disabled={pending}>
          {pending ? "SAVING…" : "I HAVE READ THE RULES — OPEN MY DESK"}
        </button>
        {state && !state.ok && <p style={resultStyle(false)}>{state.error}</p>}
      </form>
    </section>
  );
}
