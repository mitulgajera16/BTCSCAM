"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Route-level error boundary. Every page on this site awaits a database read
 * with no Suspense and no boundary, so an unreachable database threw an
 * uncaught error and Next rendered its default page. This keeps the user on
 * a branded page, tells them the truth (our problem, not theirs), and — most
 * importantly — offers a retry, which the old error copy never did.
 */

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[btcscam] route error", error);
  }, [error]);

  return (
    <main
      style={{
        maxWidth: "var(--w-prose)",
        margin: "0 auto",
        padding: "0 var(--space-6) var(--space-16)",
      }}
    >
      <nav style={{ ...mono, fontSize: "var(--text-xs)", padding: "var(--space-4) 0" }}>
        <Link href="/">← FRONT PAGE</Link>
        <span style={{ color: "var(--fg-muted)" }}> / SOMETHING BROKE</span>
      </nav>

      <div
        role="alert"
        style={{
          border: "2px solid var(--danger)",
          background: "var(--danger-bg)",
          padding: "var(--space-6)",
        }}
      >
        <p
          style={{
            ...mono,
            fontSize: "var(--text-2xs)",
            fontWeight: 600,
            letterSpacing: ".05em",
            color: "var(--danger-fg)",
            margin: 0,
          }}
        >
          ⚠ THIS PAGE FAILED TO LOAD
        </p>

        <h1
          style={{
            ...display,
            fontSize: "var(--text-xl)",
            lineHeight: "var(--lh-tight)",
            margin: "var(--space-2) 0 0",
          }}
        >
          Our end broke, not yours.
        </h1>

        <p
          style={{
            fontSize: "var(--text-base)",
            lineHeight: "var(--lh-body)",
            margin: "var(--space-3) 0 0",
            maxWidth: "var(--measure-narrow)",
          }}
        >
          Something went wrong while we were loading this page. Nothing you did
          caused it, and nothing you submitted was lost. Try again — if it keeps
          failing, the pages below do not depend on the part that broke.
        </p>

        <button
          type="button"
          onClick={reset}
          style={{
            ...mono,
            marginTop: "var(--space-5)",
            minHeight: "var(--touch-min)",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            letterSpacing: ".05em",
            background: "var(--fg)",
            color: "var(--fg-inverse)",
            border: "1px solid var(--fg)",
            padding: "0 var(--space-5)",
          }}
        >
          TRY THIS PAGE AGAIN
        </button>

        {error.digest && (
          <p
            style={{
              ...mono,
              fontSize: "var(--text-2xs)",
              color: "var(--fg-muted)",
              margin: "var(--space-4) 0 0",
            }}
          >
            ERROR REF: {error.digest} — quote this if you write to us.
          </p>
        )}
      </div>

      <p
        style={{
          fontSize: "var(--text-meta)",
          lineHeight: "var(--lh-body)",
          color: "var(--fg-muted)",
          margin: "var(--space-8) 0 0",
        }}
      >
        Still works right now:{" "}
        <Link href="/registry" style={{ color: "var(--link)" }}>
          the scam database
        </Link>
        ,{" "}
        <Link href="/guides" style={{ color: "var(--link)" }}>
          the guides
        </Link>
        , and{" "}
        <Link href="/standards" style={{ color: "var(--link)" }}>
          the rules this site runs on
        </Link>
        .
      </p>
    </main>
  );
}
