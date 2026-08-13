import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { hasServiceRole, hasSupabase } from "@/lib/db";
import { signOut } from "@/app/account/actions";
import {
  ensureProfile,
  fetchOwnChips,
  fetchOwnReports,
  getSessionUser,
  type OwnChip,
  type OwnReport,
} from "@/components/account/auth";
import { canEditHandle } from "@/components/account/handle";
import LadderTable from "@/components/account/LadderTable";
import OnboardingPanel from "@/components/account/OnboardingPanel";
import SettingsPanel from "@/components/account/SettingsPanel";
import {
  buttonQuiet,
  capsLabel,
  defang,
  display,
  mono,
  sectionRule,
} from "@/components/account/ui";

// The one exit for a Supabase session. Editors take note: a session cookie
// makes /desk skip the Basic-auth challenge, and the desk 404s non-mod
// sessions — signing out here restores the editor Basic-auth path.
function SignOutForm() {
  return (
    <form action={signOut} style={{ marginTop: 16 }}>
      <button type="submit" style={buttonQuiet}>
        SIGN OUT
      </button>
    </form>
  );
}

export const metadata: Metadata = {
  title: "My Desk",
  description:
    "Your own record on BTCSCAM: reports you filed, evidence you attached, and your place on the watchmen's ladder. Accounts are for credit — reporting without a name stays open to everyone.",
};

// ── chips ──────────────────────────────────────────────────────────────────

const REPORT_STATUS: Record<
  OwnReport["status"],
  { label: string; style: CSSProperties }
> = {
  new: {
    label: "RECEIVED",
    style: { border: "1px solid var(--rule)", color: "var(--meta)" },
  },
  triaged: {
    label: "BEING REVIEWED",
    style: { border: "1px solid var(--ink)", color: "var(--ink)" },
  },
  accepted: {
    label: "ACCEPTED",
    style: {
      border: "1px solid var(--ink)",
      background: "var(--ink)",
      color: "var(--paper)",
    },
  },
  rejected: {
    label: "REJECTED",
    style: { border: "1px solid var(--danger)", color: "var(--danger)" },
  },
};

const CHIP_STATUS: Record<
  OwnChip["status"],
  { label: string; style: CSSProperties }
> = {
  pending: {
    label: "AWAITING REVIEW",
    style: { border: "1px solid var(--rule)", color: "var(--meta)" },
  },
  accepted: {
    label: "ACCEPTED",
    style: {
      border: "1px solid var(--ink)",
      background: "var(--ink)",
      color: "var(--paper)",
    },
  },
  rejected: {
    label: "REJECTED",
    style: { border: "1px solid var(--danger)", color: "var(--danger)" },
  },
};

function StatusChip({
  label,
  style,
}: {
  label: string;
  style: CSSProperties;
}) {
  return (
    <span
      style={{
        ...mono,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".05em",
        padding: "2px 8px",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {label}
    </span>
  );
}

function Crumb({ tail }: { tail: string }) {
  return (
    <nav style={{ ...mono, fontSize: 12, padding: "16px 0" }}>
      <Link href="/">← FRONT PAGE</Link>
      <span style={{ color: "var(--meta)" }}> / {tail}</span>
    </nav>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px 64px" }}>
      {children}
    </main>
  );
}

// ── state 1: Supabase not provisioned — honest, nothing faked ──────────────

function AccountsOpenSoon() {
  return (
    <Shell>
      <Crumb tail="MY DESK" />
      <section
        style={{
          border: "2px solid var(--ink)",
          background: "var(--panel)",
          padding: "24px 28px",
        }}
      >
        <p style={{ ...capsLabel, color: "var(--meta)", margin: 0 }}>
          MY DESK · NOT YET LIVE
        </p>
        <h1
          style={{
            ...display,
            fontSize: "clamp(24px, 5vw, 40px)",
            lineHeight: 1.2,
            margin: "8px 0 0",
          }}
        >
          Accounts open soon.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, margin: "16px 0 0" }}>
          ACCOUNTS OPEN SOON — your desk switches on when our database goes
          live. There is no sign-in yet, and we will not pretend there is.
        </p>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.55,
            color: "var(--meta)",
            margin: "12px 0 0",
          }}
        >
          Reporting does not wait for accounts: you can file without a name
          right now at{" "}
          <Link href="/report" style={{ fontWeight: 700 }}>
            /report
          </Link>{" "}
          — they enter the same queue and a person reads every one.
        </p>
      </section>

      <h2 style={sectionRule}>THE LADDER — WHAT AN ACCOUNT WILL EARN</h2>
      <LadderTable />
    </Shell>
  );
}

// ── state 2: signed out — invitation, no gate ──────────────────────────────

function SignedOut() {
  return (
    <Shell>
      <Crumb tail="MY DESK" />
      <p style={{ ...capsLabel, color: "var(--meta)", margin: 0 }}>
        MY DESK · ACCOUNTS FOR CREDIT, NOT ACCESS
      </p>
      <h1
        style={{
          ...display,
          fontSize: "clamp(24px, 5vw, 40px)",
          lineHeight: 1.2,
          margin: "8px 0 0",
        }}
      >
        A record with your name on it.
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.55, marginTop: 20, maxWidth: "65ch" }}>
        You never need an account to report a scam — reporting without a name
        stays open, permanently. An account gets you a record of your own:
        your reports tracked under one handle, your evidence credited when we
        accept it, and a place on the watchmen&rsquo;s ladder.
      </p>

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
          marginTop: 24,
        }}
      >
        <Link
          href="/account/sign-in"
          style={{
            ...mono,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: ".05em",
            padding: "10px 20px",
            border: "1px solid var(--ink)",
            background: "var(--ink)",
            color: "var(--paper)",
          }}
        >
          SIGN IN WITH EMAIL →
        </Link>
        <span style={{ ...mono, fontSize: 12, color: "var(--meta)" }}>
          We email you a link. No passwords to make, none to steal.
        </span>
      </div>

      <h2 style={sectionRule}>THE LADDER — STATUS IS EARNED, NEVER SOLD</h2>
      <LadderTable />

      <p
        style={{
          ...mono,
          fontSize: 12,
          color: "var(--meta)",
          lineHeight: 1.6,
          marginTop: 24,
        }}
      >
        PREFER TO STAY ANONYMOUS? File at{" "}
        <Link href="/report" style={{ fontWeight: 600, color: "var(--link)" }}>
          /report
        </Link>{" "}
        — same queue, same person reading it, no name attached.
      </p>
    </Shell>
  );
}

// ── state 3: signed in — the desk ──────────────────────────────────────────

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function reportEntity(r: OwnReport): string {
  if (r.vendor) return truncate(r.vendor, 40);
  if (r.domain) return truncate(defang(r.domain), 40);
  if (r.address) return truncate(r.address, 40);
  return "—";
}

export default async function AccountPage() {
  if (!hasSupabase()) return <AccountsOpenSoon />;

  const user = await getSessionUser();
  if (!user) return <SignedOut />;

  // Signed in but the service key is absent: the ledger cannot be read.
  // Say so — never render invented state.
  if (!hasServiceRole()) {
    return (
      <Shell>
        <Crumb tail="MY DESK" />
        <p style={{ ...capsLabel, color: "var(--meta)", margin: 0 }}>
          MY DESK · PARTIALLY CONNECTED
        </p>
        <h1
          style={{
            ...display,
            fontSize: "clamp(24px, 5vw, 40px)",
            lineHeight: 1.2,
            margin: "8px 0 0",
          }}
        >
          Signed in — your records are not.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, marginTop: 20, maxWidth: "65ch" }}>
          You are signed in ({user.email ?? "email on file"}), but the server
          connection behind your records is not fully set up, so your reports
          and settings cannot be read right now. Nothing is lost — your
          records appear when the connection does.
        </p>
        <SignOutForm />
        <h2 style={sectionRule}>THE LADDER</h2>
        <LadderTable />
      </Shell>
    );
  }

  const profile = await ensureProfile(user);
  const [reportsRead, chipsRead] = await Promise.all([
    fetchOwnReports(user.id),
    fetchOwnChips(user.id),
  ]);
  const reports = reportsRead.rows;
  const chips = chipsRead.rows;
  const tierTitle = profile.role.toUpperCase();

  return (
    <Shell>
      <Crumb tail="MY DESK" />
      <p style={{ ...capsLabel, color: "var(--meta)", margin: 0 }}>
        MY DESK · YOUR RECORD ON THIS SITE
      </p>
      <h1
        style={{
          ...display,
          fontSize: "clamp(24px, 5vw, 40px)",
          lineHeight: 1.2,
          margin: "8px 0 0",
        }}
      >
        {profile.handle ?? "Your desk"}
      </h1>
      <p style={{ ...mono, fontSize: 12, color: "var(--meta)", marginTop: 10 }}>
        SIGNED IN AS {user.email?.toUpperCase() ?? "(EMAIL ON FILE)"} · RANK{" "}
        {tierTitle} · {profile.acceptedReports} ACCEPTED{" "}
        {profile.acceptedReports === 1 ? "REPORT" : "REPORTS"}
      </p>
      <SignOutForm />

      {/* (a) first-run welcome — until profiles.onboarded */}
      {!profile.onboarded && <OnboardingPanel />}

      {/* (b) your reports */}
      <h2 style={sectionRule}>YOUR REPORTS</h2>
      {reportsRead.error ? (
        <p style={{ ...mono, fontSize: 12, color: "var(--danger)", marginTop: 16 }}>
          YOUR RECORDS COULD NOT BE READ: {reportsRead.error} — that is an
          error, not an empty list. Nothing is lost; reload once it works.
        </p>
      ) : reports.length === 0 ? (
        <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--meta)", marginTop: 16, maxWidth: "65ch" }}>
          Nothing here yet. File at{" "}
          <Link href="/report" style={{ fontWeight: 700 }}>
            /report
          </Link>{" "}
          — while you are signed in, a report lands here and you can watch its
          status. Reports you filed anonymously before signing up stay
          anonymous: we cannot connect what we never collected.
        </p>
      ) : (
        <div style={{ overflowX: "auto", marginTop: 16 }}>
          <table
            style={{
              width: "100%",
              minWidth: 560,
              borderCollapse: "collapse",
              fontSize: 16,
            }}
          >
            <thead>
              <tr>
                {["FILED", "TYPE", "NAMED", "STATUS", ""].map((h, idx) => (
                  <th
                    key={idx}
                    scope="col"
                    style={{
                      ...capsLabel,
                      color: "var(--meta)",
                      textAlign: "left",
                      padding: "8px 12px 8px 0",
                      borderBottom: "2px solid var(--ink)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const chip = REPORT_STATUS[r.status];
                return (
                  <tr key={r.id}>
                    <td
                      style={{
                        ...mono,
                        fontSize: 12,
                        color: "var(--meta)",
                        padding: "12px 16px 12px 0",
                        borderBottom: "1px solid var(--rule)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.createdAt.slice(0, 10)}
                    </td>
                    <td
                      style={{
                        ...mono,
                        fontSize: 12,
                        padding: "12px 16px 12px 0",
                        borderBottom: "1px solid var(--rule)",
                      }}
                    >
                      {(r.category ?? "UNSORTED").toUpperCase()}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px 12px 0",
                        borderBottom: "1px solid var(--rule)",
                        fontWeight: 700,
                        wordBreak: "break-word",
                      }}
                    >
                      {reportEntity(r)}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px 12px 0",
                        borderBottom: "1px solid var(--rule)",
                      }}
                    >
                      <StatusChip label={chip.label} style={chip.style} />
                    </td>
                    <td
                      style={{
                        padding: "12px 0",
                        borderBottom: "1px solid var(--rule)",
                        textAlign: "right",
                      }}
                    >
                      {r.incidentId && (
                        <Link
                          href={`/scam/${r.incidentId}`}
                          style={{
                            ...mono,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--link)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          IN THE DATABASE →
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ ...mono, fontSize: 12, color: "var(--meta)", lineHeight: 1.6, marginTop: 12 }}>
        ACCEPTED means an editor found something to act on — it never means
        the report has been verified. Proof levels on case files are always
        set by a person.
      </p>

      {/* (c) your evidence */}
      <h2 style={sectionRule}>YOUR EVIDENCE</h2>
      {chipsRead.error ? (
        <p style={{ ...mono, fontSize: 12, color: "var(--danger)", marginTop: 16 }}>
          YOUR RECORDS COULD NOT BE READ: {chipsRead.error} — that is an
          error, not an empty list. Nothing is lost; reload once it works.
        </p>
      ) : chips.length === 0 ? (
        <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--meta)", marginTop: 16, maxWidth: "65ch" }}>
          No evidence chips yet. A chip is one piece of evidence — a link, a
          transaction id, a screenshot link, a quote — filed along with a
          report at /report. Accepted chips count toward the ladder.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {chips.map((c) => {
            const chip = CHIP_STATUS[c.status];
            return (
              <div
                key={c.id}
                style={{
                  border: "1px solid var(--rule)",
                  padding: "12px 16px",
                  display: "flex",
                  gap: 12,
                  alignItems: "baseline",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    ...mono,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".05em",
                    border: "1px solid var(--ink)",
                    padding: "2px 8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.kind.toUpperCase()}
                </span>
                {/* Plain text, never a link — evidence may point at live scam infrastructure. */}
                <span
                  style={{
                    ...mono,
                    fontSize: 12,
                    wordBreak: "break-all",
                    flex: "1 1 240px",
                  }}
                >
                  {truncate(c.value, 120)}
                </span>
                <span style={{ ...mono, fontSize: 12, color: "var(--meta)", whiteSpace: "nowrap" }}>
                  REPORT #{c.reportId}
                </span>
                <StatusChip label={chip.label} style={chip.style} />
              </div>
            );
          })}
        </div>
      )}

      {/* (d) the ladder */}
      <h2 style={sectionRule}>THE LADDER — STATUS IS EARNED, NEVER SOLD</h2>
      <LadderTable currentRole={profile.role} />

      {/* (e) settings */}
      <h2 style={sectionRule}>SETTINGS</h2>
      <SettingsPanel
        handle={profile.handle}
        canEdit={canEditHandle(profile.handle)}
        showCredit={profile.showCredit}
      />
    </Shell>
  );
}
