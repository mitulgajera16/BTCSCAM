"use client";

import type { CSSProperties, ReactNode } from "react";
import { useActionState } from "react";
import { submitReport } from "@/app/report/actions";
import { SCAM_CATEGORIES, CATEGORY_LABEL } from "./categories";
import { EvidenceChips } from "./EvidenceChips";

const mono = { fontFamily: "var(--font-plex-mono), monospace" };
const display = { fontFamily: "var(--font-fraunces), serif", fontWeight: 600 };

/* Plain new-issue page, for the copy-paste fallback when the prefilled
   link would exceed GitHub's request-URI limit. */
const GITHUB_NEW_ISSUE = "https://github.com/mitulgajera16/BTCSCAM/issues/new";

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

const labelStyle: CSSProperties = {
  ...mono,
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: ".05em",
  marginBottom: 6,
};

const hintStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.5,
  color: "var(--meta)",
  marginTop: 6,
  marginBottom: 0,
};

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label style={labelStyle} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p style={hintStyle}>{hint}</p>}
    </div>
  );
}

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

export function ReportForm() {
  const [state, formAction, pending] = useActionState(submitReport, null);

  // Filed and stored server-side — the only case where the form may go away.
  if (state?.ok && state.mode === "stored") {
    return (
      <div
        role="status"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--rule)",
          padding: "24px 28px",
        }}
      >
        <PanelLabel>REPORT RECEIVED · IN THE QUEUE</PanelLabel>
        <h3 style={{ ...display, fontSize: 24, margin: "8px 0" }}>
          Filed. A person reads it Monday.
        </h3>
        <p style={{ fontSize: 16, lineHeight: 1.55 }}>
          Your report is in the queue as REPORTED · NOT CHECKED YET. A person
          reads and reviews every report in the Monday Sweep — our weekly pass
          through the queue. If it backs up something already in the scam
          database, we update that case file and your report becomes part of
          the public record. We never publish your contact details.
        </p>
        {state.chipCount > 0 && (
          <p style={{ fontSize: 16, lineHeight: 1.55 }}>
            {state.chipsAttached
              ? `Your ${state.chipCount} evidence chip${
                  state.chipCount === 1 ? " is" : "s are"
                } attached to the report and read in the same pass.`
              : "The report itself is filed, but its evidence chips hit a database error and did not attach. If you left an email address, we will write and ask for them; otherwise file a second report with just the chips and say it goes with this one."}
          </p>
        )}
        <a href="/" style={{ ...mono, fontSize: 12, fontWeight: 600, color: "var(--link)" }}>
          ← BACK TO THE FRONT PAGE
        </a>
      </div>
    );
  }

  // In "github" mode the report is NOT yet filed — filing happens on GitHub.
  // The drafted form stays mounted below so nothing typed is ever lost.
  const github = state?.ok && state.mode === "github" ? state : null;
  const values = state && !state.ok ? state.values : (github?.values ?? null);
  const issueMarkdown = github
    ? `Title: ${github.issueTitle}\n\n${github.issueBody}`
    : null;

  return (
    <div>
      {github && (
        <div
          role="status"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--rule)",
            padding: "24px 28px",
            marginBottom: 32,
          }}
        >
          <PanelLabel>
            {github.url
              ? "ONE MORE CLICK · PUBLIC FILING"
              : "ONE MORE STEP · PUBLIC FILING"}
          </PanelLabel>
          <h3 style={{ ...display, fontSize: 24, margin: "8px 0" }}>
            {github.url
              ? "Your report is drafted. File it in the open."
              : "Your report is drafted. Copy it, then file it in the open."}
          </h3>
          <p style={{ fontSize: 16, lineHeight: 1.55 }}>
            Reports come in through a public GitHub tracker — on purpose. A
            queue anyone can look at cannot quietly bury a report, and someone
            outside this site stamps the time on every filing.{" "}
            {github.url
              ? "The button below opens a filled-in issue with everything you wrote. Check it, then press Submit on GitHub."
              : "Your report is too long to travel in a link, so nothing was dropped: copy the draft below, open a new issue, and paste it in."}
          </p>
          {github.url ? (
            <a
              href={github.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...mono,
                display: "inline-block",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: ".05em",
                background: "var(--orange)",
                color: "var(--ink)",
                border: "1px solid var(--ink)",
                padding: "12px 28px",
                marginTop: 8,
              }}
            >
              FILE YOUR REPORT →
            </a>
          ) : (
            <a
              href={GITHUB_NEW_ISSUE}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...mono,
                display: "inline-block",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: ".05em",
                background: "var(--orange)",
                color: "var(--ink)",
                border: "1px solid var(--ink)",
                padding: "12px 28px",
                marginTop: 8,
              }}
            >
              OPEN A BLANK ISSUE →
            </a>
          )}
          {github.trimmed && github.url && (
            <p style={{ ...hintStyle, marginTop: 12 }}>
              Your description was too long to travel in the link, so the
              draft on GitHub carries a shortened version with a note saying
              so. After you press Submit there, paste the full draft below as
              a comment — the whole text is kept here.
            </p>
          )}
          {(github.trimmed || !github.url) && issueMarkdown && (
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle} htmlFor="rf-issue-markdown">
                YOUR FULL DRAFT — COPY FROM HERE
              </label>
              <textarea
                id="rf-issue-markdown"
                readOnly
                rows={10}
                value={issueMarkdown}
                onFocus={(e) => e.currentTarget.select()}
                style={{ ...field, ...mono, fontSize: 13, resize: "vertical" }}
              />
            </div>
          )}
          <p style={{ ...hintStyle, marginTop: 12 }}>
            You will need a GitHub account. The issue is public: your email
            address, if you gave one, has already been left out of the draft —
            and do not paste anything else you want kept private. Websites and
            evidence links are broken on purpose so nobody clicks them by
            accident.
          </p>
        </div>
      )}

      {github && (
        <p
          style={{
            ...mono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".05em",
            color: "var(--meta)",
            margin: "0 0 16px",
          }}
        >
          YOUR DRAFT — KEPT BELOW UNTIL YOU FILE. EDIT AND RESUBMIT TO REDRAFT.
        </p>
      )}

      <form action={formAction} key={github ? "github-draft" : "editing"}>
        <style>{`
          .rf-field:focus {
            outline: 2px solid var(--orange);
            outline-offset: 1px;
          }
          .rf-field::placeholder {
            color: var(--meta);
            opacity: 0.7;
          }
        `}</style>

        {state && !state.ok && (
          <div
            role="alert"
            style={{
              background: "var(--danger-bg)",
              border: "1px solid var(--danger)",
              color: "var(--danger-ink)",
              padding: "14px 18px",
              marginBottom: 24,
            }}
          >
            <PanelLabel danger>NOT FILED YET — FIX AND RESUBMIT</PanelLabel>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.55,
                whiteSpace: "pre-line",
                margin: "8px 0 0",
              }}
            >
              {state.error}
            </p>
          </div>
        )}

        <Field
          label="WHAT HAPPENED"
          htmlFor="rf-description"
          hint="Plain words beat perfect words. Dates, amounts, and how they reached you all help. At least 30 characters."
        >
          <textarea
            id="rf-description"
            name="description"
            className="rf-field"
            rows={6}
            required
            minLength={30}
            defaultValue={values?.description ?? ""}
            placeholder="On August 2nd I got an email claiming my hardware wallet needed a firmware update…"
            style={{ ...field, resize: "vertical" }}
          />
        </Field>

        <Field
          label="SCAM TYPE"
          htmlFor="rf-scam-type"
          hint="Pick the closest match. We can move it if it belongs somewhere else."
        >
          <select
            id="rf-scam-type"
            name="scamType"
            className="rf-field"
            required
            defaultValue={values?.scamType ?? ""}
            style={field}
          >
            <option value="" disabled>
              Choose the closest match
            </option>
            {SCAM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </Field>

        <div style={{ marginBottom: 0 }}>
          <p style={{ ...labelStyle, marginBottom: 8 }}>
            WHO OR WHAT — AT LEAST ONE
          </p>
          <p style={{ ...hintStyle, marginTop: 0, marginBottom: 12 }}>
            Give us something we can chase: the company or product involved,
            the website, or the wallet address the money went to.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div>
              <label style={labelStyle} htmlFor="rf-vendor">
                COMPANY OR PRODUCT
              </label>
              <input
                id="rf-vendor"
                name="vendor"
                type="text"
                className="rf-field"
                maxLength={200}
                defaultValue={values?.vendor ?? ""}
                placeholder="Acme Wallet Pro"
                style={field}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="rf-domain">
                WEBSITE
              </label>
              <input
                id="rf-domain"
                name="domain"
                type="text"
                className="rf-field"
                maxLength={200}
                defaultValue={values?.domain ?? ""}
                placeholder="example.com or example[.]com"
                style={field}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="rf-address">
                BITCOIN WALLET ADDRESS
              </label>
              <input
                id="rf-address"
                name="address"
                type="text"
                className="rf-field"
                maxLength={200}
                defaultValue={values?.address ?? ""}
                placeholder="bc1q…"
                style={{ ...field, ...mono, fontSize: 14 }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <Field
            label="WHEN DID YOU FIRST SEE IT"
            htmlFor="rf-observed"
            hint="Your best guess is fine."
          >
            <input
              id="rf-observed"
              name="observed"
              type="date"
              className="rf-field"
              defaultValue={values?.observed ?? ""}
              style={{ ...field, ...mono, fontSize: 14 }}
            />
          </Field>

          <Field
            label="YOUR EMAIL — OPTIONAL"
            htmlFor="rf-contact"
            hint="Only used if we have questions about your report. Never published, never sold."
          >
            <input
              id="rf-contact"
              name="contact"
              type="email"
              className="rf-field"
              maxLength={254}
              defaultValue={values?.contact ?? ""}
              placeholder="you@example.com"
              style={field}
            />
          </Field>
        </div>

        <Field
          label="EVIDENCE — ONE LINK PER LINE"
          htmlFor="rf-evidence"
          hint="Screenshots uploaded to an image site, archive.org copies of a page, block explorer links, the scam page itself. Full links starting with https://."
        >
          <textarea
            id="rf-evidence"
            name="evidence"
            className="rf-field"
            rows={4}
            defaultValue={values?.evidence ?? ""}
            placeholder={"https://web.archive.org/web/…\nhttps://mempool.space/address/…"}
            style={{ ...field, ...mono, fontSize: 14, resize: "vertical" }}
          />
        </Field>

        <div style={{ marginBottom: 24 }}>
          <p style={{ ...labelStyle, marginBottom: 8 }}>
            EVIDENCE CHIPS — OPTIONAL
          </p>
          <p style={{ ...hintStyle, marginTop: 0, marginBottom: 12 }}>
            Pin your strongest pieces here so we check them first: a link, a
            transaction id, a screenshot link, or an exact quote. Add them one
            at a time.
          </p>
          <EvidenceChips name="chips" defaultValue={values?.chips ?? ""} />
        </div>

        <button
          type="submit"
          disabled={pending}
          style={{
            ...mono,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: ".05em",
            background: github ? "transparent" : "var(--orange)",
            color: "var(--ink)",
            border: "1px solid var(--ink)",
            padding: "12px 32px",
            opacity: pending ? 0.6 : 1,
          }}
        >
          {pending
            ? "FILING…"
            : github
              ? "REDRAFT WITH MY EDITS"
              : "FILE THE REPORT"}
        </button>
        <p style={{ ...hintStyle, marginTop: 12 }}>
          Filing is free. Your report enters the queue as REPORTED · NOT
          CHECKED YET and a person reads it in the weekly sweep.
        </p>
      </form>
    </div>
  );
}
