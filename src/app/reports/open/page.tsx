import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { getServiceClient, hasServiceRole, hasSupabase } from "@/lib/db";
import { defang } from "@/components/desk/types";
import {
  getProfile,
  getSession,
  roleAtLeast,
  ROLE_LABEL,
  type Role,
} from "@/lib/auth";
import StanceButtons from "@/components/votes/StanceButtons";
import VoteTally from "@/components/votes/VoteTally";
import { LADDER_TIERS } from "@/components/account/types";

// ── THE OPEN LEDGER ────────────────────────────────────────────────────────
// Public read of every reader report still awaiting the desk (status new or
// triaged). Reporter contacts are NEVER printed — contact_email is not even
// selected from the database. Corroborator+ file stances; everyone else
// reads. Votes are signals to the editors; nothing here auto-verifies.

const mono: CSSProperties = { fontFamily: "var(--font-plex-mono), monospace" };
const display: CSSProperties = {
  fontFamily: "var(--font-fraunces), serif",
  fontWeight: 600,
};
const capsLabel: CSSProperties = {
  ...mono,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: ".05em",
};

export const metadata: Metadata = {
  title: "The Open Ledger — Reports Awaiting Triage",
  description:
    "Every reader report still awaiting the BTCSCAM desk, printed in the open. Corroborators file stances with evidence; editors decide. Nothing here auto-verifies.",
  alternates: { canonical: "/reports/open" },
};

const OPEN_LIMIT = 200;

type OpenReport = {
  id: number;
  description: string;
  category: string | null;
  vendor: string | null;
  domain: string | null;
  address: string | null;
  observedOn: string | null;
  evidenceUrls: string[];
  status: "new" | "triaged";
  createdAt: string;
};

type Tally = { corroborate: number; dispute: number };

/** What the ledger needs to know about the signed-in visitor. */
type LedgerViewer = { id: string; name: string; role: Role };

function SectionRule({ label }: { label: string }) {
  return (
    <h2
      style={{
        ...mono,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: ".05em",
        borderBottom: "2px solid var(--ink)",
        paddingBottom: 8,
        marginTop: 40,
      }}
    >
      {label}
    </h2>
  );
}

function StatusChip({ status }: { status: "new" | "triaged" }) {
  return (
    <span
      style={{
        ...capsLabel,
        padding: "2px 8px",
        border: "1px solid var(--ink)",
        background: status === "triaged" ? "var(--ink)" : "transparent",
        color: status === "triaged" ? "var(--paper)" : "var(--ink)",
      }}
    >
      {status === "triaged" ? "TRIAGED" : "NEW"}
    </span>
  );
}

function MetaLine({ k, v }: { k: string; v: string }) {
  if (!v) return null;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
      <span style={{ ...capsLabel, color: "var(--meta)", minWidth: 110 }}>
        {k}
      </span>
      <span style={{ ...mono, fontSize: 12, wordBreak: "break-all" }}>{v}</span>
    </div>
  );
}

/** The binding editorial copy — printed once, directly above the tallies. */
function EditorialNotice() {
  return (
    <div
      style={{
        border: "1px solid var(--ink)",
        background: "var(--warm)",
        padding: "12px 16px",
        marginTop: 20,
      }}
    >
      <p
        style={{
          ...mono,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        Votes are signals to the editors. Nothing here auto-verifies — the
        trust ladder is editorial.
      </p>
    </div>
  );
}

// One ladder, one source: LADDER_TIERS in src/components/account/types.ts
// feeds this box, the account LadderTable, and the desk LadderPanel alike —
// the copy cannot drift between them.
function LadderBox() {
  return (
    <div style={{ border: "1px solid var(--rule)", padding: "16px 20px", marginTop: 16 }}>
      <p style={{ ...capsLabel, margin: 0 }}>THE WATCH LADDER</p>
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {LADDER_TIERS.map((tier) => (
          <div key={tier.role} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
            <span style={{ ...capsLabel, minWidth: 130 }}>{tier.title}</span>
            <span style={{ fontSize: 14, lineHeight: 1.55 }}>
              {tier.earned}{" "}
              <span style={{ color: "var(--meta)" }}>{tier.grants}</span>
            </span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--meta)", margin: "12px 0 0" }}>
        Promotion is editorial — counters suggest, editors confirm. Status and
        credit only; no points, no tokens. Anonymous reporting stays open to
        everyone: accounts are for credit, not a gate.
      </p>
    </div>
  );
}

function DisabledStances({ signedIn }: { signedIn: boolean }) {
  const dead: CSSProperties = {
    ...mono,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: ".05em",
    padding: "8px 16px",
    border: "1px solid var(--rule)",
    borderRadius: 0,
    background: "transparent",
    color: "var(--meta)",
    cursor: "not-allowed",
  };
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <button type="button" disabled style={dead}>
        CORROBORATE
      </button>
      <button type="button" disabled style={dead}>
        DISPUTE
      </button>
      <span style={{ ...mono, fontSize: 12, color: "var(--meta)" }}>
        {signedIn
          ? "Opens at CORROBORATOR — 3 accepted reports, or 5 accepted evidence chips."
          : "Sign in required — stances open at CORROBORATOR."}
      </span>
    </div>
  );
}

function StateBox({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid var(--ink)",
        background: "var(--panel)",
        padding: "20px 24px",
        marginTop: 24,
      }}
    >
      <p style={{ ...capsLabel, margin: 0 }}>{label}</p>
      <div style={{ fontSize: 16, lineHeight: 1.6, marginTop: 10 }}>{children}</div>
    </div>
  );
}

export default async function OpenLedgerPage() {
  const connected = hasSupabase() && hasServiceRole();

  let viewer: LedgerViewer | null = null;
  let reports: OpenReport[] = [];
  let readError: string | null = null;
  let talliesOk = true;
  const tallies = new Map<number, Tally>();
  const mine = new Map<number, "corroborate" | "dispute">();

  if (connected) {
    // getSession() verifies the token with the auth server; the ladder role
    // comes from public.profiles (service client) via getProfile. Missing
    // profile degrades to "reader" — the powerless default.
    const user = await getSession();
    if (user) {
      const profile = await getProfile();
      viewer = {
        id: user.id,
        name: profile?.handle ?? user.email ?? "ACCOUNT",
        role: profile?.role ?? "reader",
      };
    }

    const sb = getServiceClient();
    // contact_email is deliberately absent from this select — the open
    // ledger always redacts reporter contacts.
    const { data, error } = await sb
      .from("reports")
      .select(
        "id, description, category, vendor, domain, address, observed_on, evidence_urls, status, created_at",
      )
      .in("status", ["new", "triaged"])
      .order("created_at", { ascending: false })
      .limit(OPEN_LIMIT);

    if (error) {
      readError = error.message;
    } else {
      reports = (data ?? []).map((r) => ({
        id: Number(r.id),
        description: String(r.description ?? ""),
        category: typeof r.category === "string" ? r.category : null,
        vendor: typeof r.vendor === "string" ? r.vendor : null,
        domain: typeof r.domain === "string" ? r.domain : null,
        address: typeof r.address === "string" ? r.address : null,
        observedOn: typeof r.observed_on === "string" ? r.observed_on : null,
        evidenceUrls: Array.isArray(r.evidence_urls)
          ? r.evidence_urls.filter((u): u is string => typeof u === "string")
          : [],
        status: r.status === "triaged" ? "triaged" : "new",
        createdAt: String(r.created_at ?? ""),
      }));

      if (reports.length > 0) {
        const { data: votes, error: voteErr } = await sb
          .from("verify_votes")
          .select("report_id, user_id, stance")
          .in(
            "report_id",
            reports.map((r) => r.id),
          );
        if (voteErr) {
          // Honest numbers: never print zeros we cannot stand behind.
          talliesOk = false;
        } else {
          for (const v of votes ?? []) {
            const id = Number(v.report_id);
            const t = tallies.get(id) ?? { corroborate: 0, dispute: 0 };
            if (v.stance === "corroborate") t.corroborate += 1;
            else if (v.stance === "dispute") t.dispute += 1;
            tallies.set(id, t);
            if (
              viewer &&
              v.user_id === viewer.id &&
              (v.stance === "corroborate" || v.stance === "dispute")
            ) {
              mine.set(id, v.stance);
            }
          }
        }
      }
    }
  }

  const canVote = viewer !== null && roleAtLeast(viewer.role, "corroborator");

  return (
    <main style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 64px" }}>
      <nav style={{ ...mono, fontSize: 12, padding: "16px 0" }}>
        <Link href="/">← FRONT PAGE</Link>
        <span style={{ color: "var(--meta)" }}> / THE OPEN LEDGER</span>
      </nav>

      <p style={{ ...capsLabel, color: "var(--meta)", margin: 0 }}>
        COMMUNITY DESK · STATUS NEW + TRIAGED · CONTACTS NEVER PRINTED
      </p>
      <h1
        style={{
          ...display,
          fontSize: "clamp(24px, 5vw, 40px)",
          lineHeight: 1.2,
          margin: "8px 0 0",
        }}
      >
        The Open Ledger
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.6, margin: "12px 0 0" }}>
        Every reader report the desk has not yet decided, printed in the open.
        Descriptions, entities, and dates are public; reporter contact details
        are never printed. Corroborators and above may file one stance per
        report — CORROBORATE with a checkable evidence URL, or DISPUTE with a
        note.
      </p>

      <EditorialNotice />

      {!connected ? (
        <>
          <StateBox label="NOT CONNECTED">
            <p style={{ margin: 0 }}>
              ACCOUNTS OPEN SOON — the desk ledger connects when our database
              goes live.
            </p>
            <p style={{ margin: "10px 0 0" }}>
              No mock rows, no placeholder counts: when this page is live,
              every number on it will be real. Reporting already works without
              an account — <Link href="/report">file a report</Link> and it
              enters the intake queue for the weekly sweep.
            </p>
          </StateBox>
          <LadderBox />
        </>
      ) : (
        <>
          {viewer ? (
            <div
              style={{
                border: "1px solid var(--rule)",
                padding: "12px 16px",
                marginTop: 12,
                display: "flex",
                gap: 12,
                alignItems: "baseline",
                flexWrap: "wrap",
              }}
            >
              <span style={{ ...capsLabel }}>
                SIGNED IN — {viewer.name} · {ROLE_LABEL[viewer.role]}
              </span>
              {!canVote && (
                <span style={{ ...mono, fontSize: 12, color: "var(--meta)" }}>
                  Stances open at CORROBORATOR — see the ladder below.
                </span>
              )}
            </div>
          ) : (
            <div
              style={{
                border: "1px solid var(--rule)",
                padding: "12px 16px",
                marginTop: 12,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              <span style={{ ...capsLabel, marginRight: 12 }}>READ-ONLY</span>
              You are not signed in.{" "}
              <Link href="/account/sign-in">Sign in</Link> to weigh in once you
              reach CORROBORATOR. Reporting needs no account —{" "}
              <Link href="/report">file a report</Link> anytime; accounts are
              for credit, not a gate.
            </div>
          )}

          <LadderBox />

          {readError ? (
            <StateBox label="LEDGER UNAVAILABLE">
              <p style={{ margin: 0 }}>
                The ledger could not be read: {readError}
              </p>
            </StateBox>
          ) : (
            <>
              <SectionRule
                label={`OPEN REPORTS (${reports.length}${reports.length === OPEN_LIMIT ? ` — NEWEST ${OPEN_LIMIT}` : ""})`}
              />
              {reports.length === 0 ? (
                <div
                  style={{
                    border: "1px solid var(--rule)",
                    padding: "20px 24px",
                    marginTop: 16,
                  }}
                >
                  <p style={{ ...capsLabel, margin: 0 }}>QUEUE CLEAR</p>
                  <p style={{ fontSize: 16, lineHeight: 1.6, margin: "10px 0 0" }}>
                    No open reports — everything filed has been triaged or
                    decided. See something?{" "}
                    <Link href="/report">File a report</Link>; no account
                    needed.
                  </p>
                </div>
              ) : (
                reports.map((r) => {
                  const t = tallies.get(r.id) ?? { corroborate: 0, dispute: 0 };
                  return (
                    <article
                      key={r.id}
                      style={{
                        border: "1px solid var(--rule)",
                        padding: "16px 20px",
                        marginTop: 12,
                        background: "var(--paper)",
                      }}
                    >
                      <div
                        style={{
                          ...mono,
                          fontSize: 12,
                          color: "var(--meta)",
                          display: "flex",
                          gap: 16,
                          alignItems: "baseline",
                          flexWrap: "wrap",
                          marginBottom: 8,
                        }}
                      >
                        <span>REPORT #{r.id}</span>
                        <StatusChip status={r.status} />
                        <span>FILED {r.createdAt.slice(0, 10)}</span>
                        {r.category && <span>{r.category.toUpperCase()}</span>}
                        {r.observedOn && <span>OBSERVED {r.observedOn}</span>}
                      </div>

                      <p
                        style={{
                          fontSize: 16,
                          lineHeight: 1.55,
                          margin: 0,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {r.description}
                      </p>

                      <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
                        <MetaLine k="VENDOR" v={r.vendor ?? ""} />
                        <MetaLine
                          k="DOMAIN"
                          v={r.domain ? defang(r.domain) : ""}
                        />
                        <MetaLine k="ADDRESS" v={r.address ?? ""} />
                        <MetaLine
                          k="CONTACT"
                          v="Redacted — the ledger never prints reporter contacts."
                        />
                        {r.evidenceUrls.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "baseline",
                            }}
                          >
                            <span
                              style={{
                                ...capsLabel,
                                color: "var(--meta)",
                                minWidth: 110,
                              }}
                            >
                              EVIDENCE
                            </span>
                            <div style={{ display: "grid", gap: 2 }}>
                              {r.evidenceUrls.map((u, idx) => (
                                // Plain text, never <a> — may point at live
                                // scam infrastructure.
                                <span
                                  key={idx}
                                  style={{
                                    ...mono,
                                    fontSize: 12,
                                    wordBreak: "break-all",
                                  }}
                                >
                                  {u}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          borderTop: "1px solid var(--rule)",
                          marginTop: 14,
                          paddingTop: 12,
                          display: "grid",
                          gap: 10,
                        }}
                      >
                        {talliesOk ? (
                          <VoteTally
                            corroborate={t.corroborate}
                            dispute={t.dispute}
                          />
                        ) : (
                          <span
                            style={{ ...mono, fontSize: 12, color: "var(--meta)" }}
                          >
                            TALLIES UNAVAILABLE — the vote read failed; no
                            counts printed rather than wrong ones.
                          </span>
                        )}
                        {canVote ? (
                          <StanceButtons
                            reportId={r.id}
                            stance={mine.get(r.id) ?? null}
                          />
                        ) : (
                          <DisabledStances signedIn={viewer !== null} />
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
