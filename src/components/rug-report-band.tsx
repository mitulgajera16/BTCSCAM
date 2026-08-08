"use client";

import { useState } from "react";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

type Status = "idle" | "submitting" | "done" | "error" | "not-configured";

export default function RugReportBand() {
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || status === "submitting") return;
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const body = (await res.json().catch(() => null)) as {
        ok?: boolean;
        reason?: string;
        message?: string;
      } | null;

      if (res.ok && body?.ok) {
        setStatus("done");
      } else if (res.status === 503 || body?.reason === "not-configured") {
        setStatus("not-configured");
        if (body?.message) setMessage(body.message);
      } else {
        setStatus("error");
        setMessage(body?.message ?? "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  return (
    <section
      aria-labelledby="rug-report-heading"
      style={{
        background: "var(--dark)",
        color: "var(--dark-text)",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p
          id="rug-report-heading"
          style={{
            ...mono,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: ".05em",
            color: "var(--orange)",
            margin: 0,
          }}
        >
          THE RUG REPORT
        </p>
        <h2
          style={{
            ...display,
            fontSize: 24,
            lineHeight: 1.25,
            color: "var(--paper)",
            margin: "8px 0 0",
          }}
        >
          The weekly anti-scam briefing.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.5, margin: "12px 0 0" }}>
          One incident deep-dive, the Dangerous-right-now list, one protection
          tip. Weekly. Plain, dated, sourced, zero hype.
        </p>

        {status === "done" ? (
          <p
            role="status"
            style={{
              ...mono,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--tick-up)",
              marginTop: 20,
            }}
          >
            SUBSCRIBED. You&rsquo;re on the list — first issue after launch
            week.
          </p>
        ) : status === "not-configured" ? (
          <div role="status" style={{ marginTop: 20 }}>
            <p style={{ fontSize: 16, lineHeight: 1.5, margin: 0 }}>
              {message ||
                "Signups are not connected to the mail provider yet. Email us and a human will add you."}
            </p>
            <a
              href="mailto:subscribe@btcscam.com?subject=Subscribe"
              style={{
                ...mono,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: ".05em",
                color: "var(--orange)",
                display: "inline-block",
                marginTop: 12,
              }}
            >
              SUBSCRIBE@BTCSCAM.COM →
            </a>
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 20,
              }}
            >
              <label htmlFor="rug-report-email" style={srOnly}>
                Email address
              </label>
              <input
                id="rug-report-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "submitting"}
                style={{
                  ...mono,
                  flex: "1 1 220px",
                  fontSize: 16,
                  padding: "10px 12px",
                  background: "transparent",
                  border: "1px solid var(--dark-text)",
                  borderRadius: 0,
                  color: "var(--paper)",
                }}
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                style={{
                  ...mono,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: ".05em",
                  padding: "10px 20px",
                  background: "var(--orange)",
                  color: "var(--ink)",
                  border: "1px solid var(--orange)",
                  opacity: status === "submitting" ? 0.7 : 1,
                }}
              >
                {status === "submitting" ? "SUBSCRIBING…" : "SUBSCRIBE"}
              </button>
            </form>
            <p
              aria-live="polite"
              style={{
                ...mono,
                fontSize: 12,
                color: status === "error" ? "var(--tick-down)" : "var(--dark-text)",
                marginTop: 12,
                marginBottom: 0,
              }}
            >
              {status === "error" ? message : "FREE · UNSUBSCRIBE ANY TIME"}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
