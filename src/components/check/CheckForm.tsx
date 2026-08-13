"use client";

import type { CSSProperties, ReactNode } from "react";
import { useActionState, useEffect } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import {
  runCheck,
  type BlacklistHit,
  type CheckResult,
  type IncidentMatch,
} from "@/app/check/actions";
import { defangDomain } from "@/components/check/identify";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

const field: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid var(--ink)",
  borderRadius: 0,
  background: "var(--paper)",
  color: "var(--ink)",
  padding: "12px 14px",
  fontSize: 16,
  lineHeight: 1.5,
};

const labelStyle: CSSProperties = {
  ...mono,
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: ".05em",
  marginBottom: 6,
};

const buttonStyle: CSSProperties = {
  ...mono,
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: ".05em",
  background: "var(--orange)",
  color: "var(--ink)",
  border: "1px solid var(--ink)",
  padding: "12px 32px",
  whiteSpace: "nowrap",
};

const linkButtonStyle: CSSProperties = {
  ...mono,
  display: "inline-block",
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: ".05em",
  background: "transparent",
  color: "var(--ink)",
  border: "1px solid var(--ink)",
  padding: "10px 20px",
};

const KIND_LABEL: Record<string, string> = {
  "btc-address": "BITCOIN ADDRESS",
  "evm-address": "ETHEREUM-STYLE ADDRESS",
  domain: "WEBSITE",
};

const SOURCE_LABEL: Record<string, string> = {
  scamsniffer: "SCAMSNIFFER SCAM LIST",
  metamask: "METAMASK ETH-PHISHING-DETECT",
  "btcscam-registry": "BTCSCAM DATABASE",
};

function PanelLabel({
  children,
  danger,
}: {
  children: ReactNode;
  danger?: boolean;
}) {
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

/** The queried value, echoed back. Domains are ALWAYS defanged and never
 *  rendered as a link — the reader must not click through to a scam. */
function QueryEcho({ kind, normalized }: { kind: string; normalized: string }) {
  return (
    <p
      style={{
        ...mono,
        fontSize: 14,
        fontWeight: 600,
        margin: "8px 0 0",
        wordBreak: "break-all",
      }}
    >
      <span style={{ color: "var(--meta)" }}>{KIND_LABEL[kind] ?? "YOU PASTED"} · </span>
      {kind === "domain" ? defangDomain(normalized) : normalized}
    </p>
  );
}

function IncidentLinks({ incidents }: { incidents: IncidentMatch[] }) {
  if (incidents.length === 0) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <PanelLabel danger>IN OUR DATABASE — READ THE CASE FILE</PanelLabel>
      {incidents.map((m) => (
        <div
          key={m.slug}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "baseline",
            flexWrap: "wrap",
            padding: "10px 0",
            borderBottom: "1px solid var(--danger)",
          }}
        >
          <span
            style={{
              ...mono,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".05em",
              padding: "2px 8px",
              border: "1px solid var(--danger)",
              background: m.severity === "S1" ? "var(--danger)" : "transparent",
              color: m.severity === "S1" ? "#fff" : "var(--danger)",
            }}
          >
            {m.severity}
          </span>
          <Link
            href={`/scam/${m.slug}`}
            style={{ fontWeight: 700, fontSize: 16, color: "var(--danger-ink)" }}
          >
            {m.title}
          </Link>
          {m.lastUpdated && (
            <span style={{ ...mono, fontSize: 11, color: "var(--danger-ink)" }}>
              UPDATED {m.lastUpdated}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function HitRows({ hits }: { hits: BlacklistHit[] }) {
  if (hits.length === 0) return null;
  return (
    <div style={{ marginTop: 16 }}>
      {hits.map((h, idx) => (
        <div
          key={`${h.source}-${h.value}-${idx}`}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "baseline",
            flexWrap: "wrap",
            padding: "8px 0",
            borderTop: idx === 0 ? "1px solid var(--danger)" : "none",
            borderBottom: "1px solid var(--danger)",
          }}
        >
          <span
            style={{
              ...mono,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".05em",
              background: "var(--danger)",
              color: "#fff",
              padding: "2px 8px",
            }}
          >
            {SOURCE_LABEL[h.source] ?? h.source.toUpperCase()}
          </span>
          <span style={{ ...mono, fontSize: 12, color: "var(--danger-ink)" }}>
            {h.listedAt
              ? `ON THIS LIST SINCE ${h.listedAt.slice(0, 10)}`
              : "DATE IT WAS LISTED NOT RECORDED"}
          </span>
        </div>
      ))}
    </div>
  );
}

function CreditLine() {
  return (
    <p
      style={{
        fontSize: 13,
        lineHeight: 1.5,
        color: "var(--meta)",
        marginTop: 16,
        marginBottom: 0,
      }}
    >
      We search our copy of the ScamSniffer scam database (GPL-3.0 — one
      lookup at a time, never handed back out) and MetaMask&apos;s
      eth-phishing-detect list of fake websites, plus the BTCSCAM database.
      Credit where it is due: without those two open lists, this page could
      not exist.
    </p>
  );
}

function ChainabuseAndReport({
  chainabuseUrl,
}: {
  chainabuseUrl: string;
}) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
      <a
        href={chainabuseUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={linkButtonStyle}
      >
        GET A SECOND OPINION ON CHAINABUSE →
      </a>
      <Link href="/report" style={linkButtonStyle}>
        SEEN A SCAM? REPORT IT →
      </Link>
    </div>
  );
}

function FlaggedPanel({
  result,
}: {
  result: Extract<CheckResult, { mode: "live" }>;
}) {
  return (
    <div
      role="alert"
      style={{
        background: "var(--danger-bg)",
        border: "1px solid var(--danger)",
        color: "var(--danger-ink)",
        padding: "24px 28px",
        marginTop: 24,
      }}
    >
      <PanelLabel danger>⚠ FLAGGED · ON A KNOWN-SCAM LIST</PanelLabel>
      <h3 style={{ ...display, fontSize: 24, margin: "8px 0", color: "var(--danger-ink)" }}>
        Flagged. Do not send any money.
      </h3>
      <QueryEcho kind={result.kind} normalized={result.normalized} />
      <HitRows hits={result.hits} />
      <IncidentLinks incidents={result.incidents} />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16, marginBottom: 0 }}>
        Being on a list means the source named above wrote down what someone
        saw. It is not a court ruling. It is, however, exactly the kind of
        warning you should treat as a stop sign: do not send money, do not
        type in your seed phrase, do not install anything from it.
      </p>
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 12, marginBottom: 0, fontWeight: 700 }}>
        We sell nothing on this page, on purpose — anyone who promises to get
        your money back is running the second half of the scam. No real
        service messages victims out of the blue, or charges a fee to
        &quot;trace&quot; stolen money.
      </p>
      <ChainabuseAndReport chainabuseUrl={result.chainabuseUrl} />
      <p style={{ ...mono, fontSize: 11, color: "var(--danger-ink)", marginTop: 16, marginBottom: 0 }}>
        CHECKED {result.checkedAt.slice(0, 16).replace("T", " ")} UTC
      </p>
      <CreditLine />
    </div>
  );
}

function NotFoundPanel({
  result,
}: {
  result: Extract<CheckResult, { mode: "live" }>;
}) {
  return (
    <div
      role="status"
      style={{
        background: "var(--panel)",
        border: "1px solid var(--rule)",
        padding: "24px 28px",
        marginTop: 24,
      }}
    >
      <PanelLabel>NOT FOUND · ON THE LISTS WE CHECKED</PanelLabel>
      <h3 style={{ ...display, fontSize: 24, margin: "8px 0" }}>
        Not found. That does not mean it is safe.
      </h3>
      <QueryEcho kind={result.kind} normalized={result.normalized} />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16 }}>
        We searched our copy of the ScamSniffer scam list
        {result.kind === "domain" ? ", the MetaMask eth-phishing-detect list of fake websites," : ""}{" "}
        and the published BTCSCAM database. This{" "}
        {result.kind === "domain" ? "website" : "address"} is on none of them
        — and that is all it means. We cannot tell you it is safe to send
        money to, and we never will. New scams appear faster than any list
        can write them down.
      </p>
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 12, marginBottom: 0 }}>
        Know the gap: our copy of the free ScamSniffer list runs about 7 days
        behind their live version, so a brand-new scam may not be on it yet.
        Get a second opinion on Chainabuse below — and if something about
        this {result.kind === "domain" ? "website" : "address"} already feels
        wrong, trust that over any lookup.
      </p>
      <ChainabuseAndReport chainabuseUrl={result.chainabuseUrl} />
      <p style={{ ...mono, fontSize: 11, color: "var(--meta)", marginTop: 16, marginBottom: 0 }}>
        CHECKED {result.checkedAt.slice(0, 16).replace("T", " ")} UTC
      </p>
      <CreditLine />
    </div>
  );
}

function OfflinePanel({
  result,
}: {
  result: Extract<CheckResult, { mode: "offline" }>;
}) {
  const flagged = result.incidents.length > 0;
  return (
    <div
      role={flagged ? "alert" : "status"}
      style={{
        background: flagged ? "var(--danger-bg)" : "var(--warm)",
        border: `1px solid ${flagged ? "var(--danger)" : "var(--rule)"}`,
        color: flagged ? "var(--danger-ink)" : "var(--ink)",
        padding: "24px 28px",
        marginTop: 24,
      }}
    >
      <PanelLabel danger={flagged}>
        {flagged
          ? "⚠ FOUND IN THE BTCSCAM DATABASE"
          : result.reason === "unconfigured"
            ? "OUTSIDE SCAM LISTS · NOT CONNECTED YET"
            : "OUTSIDE SCAM LISTS · COULD NOT REACH THEM"}
      </PanelLabel>
      <h3
        style={{
          ...display,
          fontSize: 24,
          margin: "8px 0",
          ...(flagged ? { color: "var(--danger-ink)" } : {}),
        }}
      >
        {flagged
          ? "Named in a published case file. Do not send any money."
          : "The scam-list lookup did not run."}
      </h3>
      <QueryEcho kind={result.kind} normalized={result.normalized} />
      {flagged && <IncidentLinks incidents={result.incidents} />}
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16 }}>
        {result.reason === "unconfigured"
          ? "Our copies of the outside scam lists are not hooked up to this site yet, so the ScamSniffer and MetaMask lists were not searched at all. No lookup ran against them, and we will not pretend it did."
          : "Our copies of the outside scam lists could not be reached just now, so the ScamSniffer and MetaMask lists were not searched for this check. Try again in a minute."}{" "}
        {result.bundledCount > 0 ? (
          <>
            Here is what did run: a search of the {result.bundledCount}{" "}
            published case files that ship with this site
            {flagged
              ? " — and it found a match, shown above."
              : ` — this ${
                  result.kind === "domain" ? "website" : "address"
                } does not appear in any of them. That is the whole of what we can honestly say here.`}
          </>
        ) : (
          "The case files that ship with this site could not be searched either, so treat this check as not having run at all."
        )}
      </p>
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 12, marginBottom: 0 }}>
        Chainabuse keeps its own set of scam reports from the public, and it
        works whether or not ours does — use it below.
      </p>
      <ChainabuseAndReport chainabuseUrl={result.chainabuseUrl} />
      <CreditLine />
    </div>
  );
}

export function CheckForm({ initialValue = "" }: { initialValue?: string }) {
  const [result, formAction, pending] = useActionState(runCheck, null);

  // Weekly Answered Checks (PRD §4 north star): a check that returns a concrete
  // verdict is the countable unit of "someone got safer." One event per verdict,
  // labelled by mode + outcome + query kind — no query text, no PII.
  useEffect(() => {
    if (!result?.ok) return;
    track("check_completed", {
      mode: result.mode,
      verdict: result.mode === "live" ? result.verdict : "offline",
      kind: result.kind ?? "unknown",
    });
  }, [result]);

  return (
    <div>
      <form action={formAction}>
        <style>{`
          .cf-field:focus {
            outline: 2px solid var(--orange);
            outline-offset: 1px;
          }
          .cf-field::placeholder {
            color: var(--meta);
            opacity: 0.7;
          }
          @media (max-width: 560px) {
            .cf-row { flex-direction: column; }
            .cf-row button { width: 100%; }
          }
        `}</style>
        <label style={labelStyle} htmlFor="cf-query">
          WALLET ADDRESS OR WEBSITE — ONE AT A TIME
        </label>
        <div className="cf-row" style={{ display: "flex", gap: 12 }}>
          <input
            id="cf-query"
            name="query"
            type="text"
            className="cf-field"
            required
            maxLength={300}
            defaultValue={initialValue}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="bc1q…  ·  1A1zP1…  ·  0x1234…  ·  example.com"
            style={{ ...field, ...mono, fontSize: 14 }}
          />
          <button
            type="submit"
            disabled={pending}
            style={{ ...buttonStyle, opacity: pending ? 0.6 : 1 }}
          >
            {pending ? "CHECKING…" : "RUN THE CHECK"}
          </button>
        </div>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.5,
            color: "var(--meta)",
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          Bitcoin addresses (1…, 3…, bc1…), Ethereum-style addresses (0x…),
          or a website like example.com. We work out which one you pasted.
          We do not keep a record of what you look up.
        </p>
      </form>

      {result && !result.ok && (
        <div
          role="alert"
          style={{
            background: "var(--danger-bg)",
            border: "1px solid var(--danger)",
            color: "var(--danger-ink)",
            padding: "14px 18px",
            marginTop: 24,
          }}
        >
          <PanelLabel danger>NOT CHECKED — FIX WHAT YOU PASTED</PanelLabel>
          <p style={{ fontSize: 16, lineHeight: 1.55, margin: "8px 0 0" }}>
            {result.error}
          </p>
        </div>
      )}

      {result?.ok && result.mode === "offline" && (
        <OfflinePanel result={result} />
      )}
      {result?.ok && result.mode === "live" && result.verdict === "flagged" && (
        <FlaggedPanel result={result} />
      )}
      {result?.ok &&
        result.mode === "live" &&
        result.verdict === "not-found" && <NotFoundPanel result={result} />}
    </div>
  );
}
