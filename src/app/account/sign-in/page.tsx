import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasSupabase } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { requestMagicLink } from "./actions";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to BTCSCAM with a one-time email link. An account puts your handle on the record when your evidence holds up — reporting without a name stays open to everyone.",
};

// State travels via query params (?sent=1 / ?error=code) so the whole flow
// works without client JavaScript. Codes only — never reflected free text.
const ERROR_COPY: Record<string, string> = {
  "not-configured":
    "Accounts are not open yet — your desk switches on when our database goes live. Reporting stays open to everyone in the meantime.",
  "invalid-email":
    "That does not look like an email address. Check it and try again.",
  "rate-limited":
    "Too many sign-in requests in a short time. Wait a few minutes, then try again.",
  "send-failed":
    "The sign-in email could not be sent. Try again in a minute — if it keeps failing, the fault is ours, not yours.",
  "link-expired":
    "That sign-in link has expired or was already used. Each link works once, on purpose — ask for a new one below.",
  "missing-code":
    "That link arrived without a sign-in code, so it cannot be used. Ask for a new one below.",
};

const field: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid var(--ink)",
  borderRadius: 0,
  background: "var(--paper)",
  color: "var(--ink)",
  padding: "10px 12px",
  fontSize: 16,
  fontFamily: "inherit",
  lineHeight: 1.5,
};

function PanelLabel({ children, danger }: { children: ReactNode; danger?: boolean }) {
  return (
    <p
      style={{
        ...mono,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".05em",
        color: danger ? "var(--danger)" : "var(--meta)",
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

function Panel({ children, danger }: { children: ReactNode; danger?: boolean }) {
  return (
    <div
      role="status"
      style={{
        background: danger ? "var(--danger-bg)" : "var(--panel)",
        border: `1px solid ${danger ? "var(--danger)" : "var(--rule)"}`,
        padding: "24px 28px",
        marginBottom: 32,
      }}
    >
      {children}
    </div>
  );
}

export default async function SignInPage({
  searchParams,
}: PageProps<"/account/sign-in">) {
  const sp = await searchParams;
  const live = hasSupabase();

  // Already signed in: the register is behind you — go to your desk.
  if (live && (await getSession())) redirect("/account");

  const sent = sp.sent === "1";
  const errorCode = typeof sp.error === "string" ? sp.error : null;
  const errorCopy = errorCode ? (ERROR_COPY[errorCode] ?? null) : null;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 64px" }}>
      <nav style={{ ...mono, fontSize: 12, padding: "16px 0" }}>
        <Link href="/">← FRONT PAGE</Link>
        <span style={{ color: "var(--meta)" }}> / SIGN IN</span>
      </nav>

      <header style={{ padding: "24px 0 8px" }}>
        <p
          style={{
            ...mono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".05em",
            color: "var(--meta)",
            margin: 0,
          }}
        >
          MY DESK · SIGN IN
        </p>
        <h1 style={{ ...display, fontSize: 40, lineHeight: 1.1, margin: "12px 0 16px" }}>
          Sign in to your desk.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, margin: 0 }}>
          One email, one link, no password. An account exists for credit, not
          as a gate: it puts your handle on the record when your evidence
          holds up. Reporting without a name stays open to everyone at{" "}
          <Link href="/report" style={{ color: "var(--link)" }}>
            /report
          </Link>
          {" — "}with or without an account, a person reads every report.
        </p>
      </header>

      <div className="double-rule" style={{ margin: "24px 0 32px" }} />

      {!live ? (
        <Panel>
          <PanelLabel>ACCOUNTS OPEN SOON</PanelLabel>
          <h2 style={{ ...display, fontSize: 24, margin: "8px 0" }}>
            We are not taking names yet.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.55, margin: 0 }}>
            ACCOUNTS OPEN SOON — your desk switches on when our database goes
            live. Until then nothing here pretends otherwise: no form, no fake
            sign-in. You can still{" "}
            <Link href="/report" style={{ color: "var(--link)" }}>
              file a report anonymously
            </Link>{" "}
            or read{" "}
            <Link href="/standards" style={{ color: "var(--link)" }}>
              the standards
            </Link>{" "}
            that decide who gets credit.
          </p>
        </Panel>
      ) : sent ? (
        <Panel>
          <PanelLabel>CHECK YOUR MAIL</PanelLabel>
          <h2 style={{ ...display, fontSize: 24, margin: "8px 0" }}>
            If that address can receive email, a link is on its way.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.55, margin: 0 }}>
            The link signs you in once, then stops working. Open it in this
            browser — it only works in the one that asked for it. Nothing
            after a few minutes? Check your spam folder, then ask for another
            below.
          </p>
        </Panel>
      ) : null}

      {live && errorCopy && (
        <Panel danger>
          <PanelLabel danger>SIGN-IN PROBLEM</PanelLabel>
          <p style={{ fontSize: 16, lineHeight: 1.55, margin: "8px 0 0" }}>{errorCopy}</p>
        </Panel>
      )}

      {live && (
        <form action={requestMagicLink}>
          <div style={{ marginBottom: 24 }}>
            <label
              htmlFor="email"
              style={{
                ...mono,
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".05em",
                marginBottom: 6,
              }}
            >
              EMAIL ADDRESS
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              placeholder="you@example.com"
              style={field}
            />
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: "var(--meta)",
                marginTop: 6,
                marginBottom: 0,
              }}
            >
              Used for the sign-in link and nothing else. Never published,
              never sold, never shown on a case file — credit lines use your
              handle, and only if you turn that on.
            </p>
          </div>
          <button
            type="submit"
            style={{
              ...mono,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: ".05em",
              background: "var(--orange)",
              color: "var(--ink)",
              border: "1px solid var(--ink)",
              borderRadius: 0,
              padding: "12px 28px",
              cursor: "pointer",
            }}
          >
            SEND SIGN-IN LINK
          </button>
        </form>
      )}

      <div style={{ borderTop: "1px solid var(--rule)", marginTop: 48, paddingTop: 24 }}>
        <PanelLabel>WHAT AN ACCOUNT IS · AND IS NOT</PanelLabel>
        <ul style={{ fontSize: 15, lineHeight: 1.6, paddingLeft: 20, margin: "12px 0 0" }}>
          <li>
            A place on the contributor ladder — reader, reporter, witness,
            watchman — earned by work we accept. Standing and credit only; no
            tokens, no points, nothing to buy.
          </li>
          <li>
            When you back up a report or dispute one, that is a signal to the
            editors. It never verifies anything by itself — a person decides
            every step of the proof ladder, as written in{" "}
            <Link href="/standards" style={{ color: "var(--link)" }}>
              the standards
            </Link>
            .
          </li>
          <li>
            Not a gate. Every reader gets the same scam database, signed in or
            not.
          </li>
        </ul>
      </div>
    </main>
  );
}
