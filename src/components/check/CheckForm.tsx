"use client";

import type { CSSProperties, ReactNode } from "react";
import { useActionState } from "react";
import Link from "next/link";
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
  domain: "DOMAIN",
};

const SOURCE_LABEL: Record<string, string> = {
  scamsniffer: "SCAMSNIFFER BLACKLIST",
  metamask: "METAMASK ETH-PHISHING-DETECT",
  "btcscam-registry": "BTCSCAM REGISTRY",
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
      <span style={{ color: "var(--meta)" }}>{KIND_LABEL[kind] ?? "QUERY"} · </span>
      {kind === "domain" ? defangDomain(normalized) : normalized}
    </p>
  );
}

function IncidentLinks({ incidents }: { incidents: IncidentMatch[] }) {
  if (incidents.length === 0) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <PanelLabel danger>IN THE REGISTRY — READ THE DOSSIER</PanelLabel>
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
              ? `IN OUR MIRROR SINCE ${h.listedAt.slice(0, 10)}`
              : "LISTING DATE NOT RECORDED"}
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
      Blocklist lookups run against our mirror of the ScamSniffer scam-database
      (GPL-3.0 — served as individual lookups only, never re-exported) and
      MetaMask&apos;s eth-phishing-detect domain list, plus the BTCSCAM
      registry. Credit where due: without those two open datasets this desk
      could not exist.
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
        CROSS-CHECK ON CHAINABUSE →
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
      <PanelLabel danger>⚠ FLAGGED · ON A LIST WE MIRROR</PanelLabel>
      <h3 style={{ ...display, fontSize: 24, margin: "8px 0", color: "var(--danger-ink)" }}>
        Flagged. Do not send funds.
      </h3>
      <QueryEcho kind={result.kind} normalized={result.normalized} />
      <HitRows hits={result.hits} />
      <IncidentLinks incidents={result.incidents} />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16, marginBottom: 0 }}>
        A listing is an allegation recorded by the named source, not a court
        finding. It is, however, exactly the kind of allegation you should
        treat as a stop sign: do not send funds, do not enter a seed phrase,
        do not install anything from it.
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
      <PanelLabel>NOT FOUND · ON THE LISTS WE MIRROR</PanelLabel>
      <h3 style={{ ...display, fontSize: 24, margin: "8px 0" }}>
        Not found. That is not a clearance.
      </h3>
      <QueryEcho kind={result.kind} normalized={result.normalized} />
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16 }}>
        We checked our mirror of the ScamSniffer blacklist
        {result.kind === "domain" ? ", the MetaMask eth-phishing-detect domain list," : ""}{" "}
        and the published BTCSCAM registry. This{" "}
        {result.kind === "domain" ? "domain" : "address"} is on none of them —
        and that is all it means. We cannot certify that anything is safe to
        send funds to, and we never will. Scams are minted faster than any
        list can record them.
      </p>
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 12, marginBottom: 0 }}>
        Know the gap: the free ScamSniffer feed we mirror runs about 7 days
        behind their live data, so a brand-new scam may not be listed here
        yet. Cross-check on Chainabuse below — and if something about this{" "}
        {result.kind === "domain" ? "domain" : "address"} already smells
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
          ? "⚠ FOUND IN THE BTCSCAM REGISTRY"
          : result.reason === "unconfigured"
            ? "LIVE DATABASE · NOT CONNECTED YET"
            : "LIVE DATABASE · UNREACHABLE"}
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
          ? "Named in a published dossier. Do not send funds."
          : "The blocklist lookup did not run."}
      </h3>
      <QueryEcho kind={result.kind} normalized={result.normalized} />
      {flagged && <IncidentLinks incidents={result.incidents} />}
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 16 }}>
        {result.reason === "unconfigured"
          ? "The live blacklist database is not connected to this deployment yet, so the ScamSniffer and MetaMask blocklists were not consulted — no lookup against them ran, and we will not pretend otherwise."
          : "The live blacklist database could not be reached just now, so the ScamSniffer and MetaMask blocklists were not consulted for this check. Try again in a minute."}{" "}
        {result.bundledCount > 0 ? (
          <>
            What DID run: a scan of the {result.bundledCount} published
            dossiers bundled with this site
            {flagged
              ? " — and it matched, above."
              : ` — this ${
                  result.kind === "domain" ? "domain" : "address"
                } does not appear in them. That is the whole of what we can honestly say here.`}
          </>
        ) : (
          "The bundled registry could not be scanned either, so treat this check as not run at all."
        )}
      </p>
      <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 12, marginBottom: 0 }}>
        Chainabuse runs its own community-report lookup and works regardless
        of our database — use it below.
      </p>
      <ChainabuseAndReport chainabuseUrl={result.chainabuseUrl} />
      <CreditLine />
    </div>
  );
}

export function CheckForm() {
  const [result, formAction, pending] = useActionState(runCheck, null);

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
          ADDRESS OR DOMAIN — ONE AT A TIME
        </label>
        <div className="cf-row" style={{ display: "flex", gap: 12 }}>
          <input
            id="cf-query"
            name="query"
            type="text"
            className="cf-field"
            required
            maxLength={300}
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
          or a website domain. The type is detected automatically. Lookups are
          not logged against you.
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
          <PanelLabel danger>NOT CHECKED — FIX THE QUERY</PanelLabel>
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
