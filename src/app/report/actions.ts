"use server";

import { SCAM_CATEGORIES } from "@/components/report/categories";

// ── R1 intake: manual triage. Every report enters as REPORTED and is never
// auto-verified. If Supabase env vars are present we store the report; if not,
// we hand the reporter a prefilled GitHub issue so the intake queue stays
// public and nothing is silently lost.

export type ReportValues = {
  description: string;
  scamType: string;
  vendor: string;
  domain: string;
  address: string;
  observed: string;
  evidence: string;
  contact: string;
};

export type ReportResult =
  | { ok: true; mode: "stored" }
  | {
      ok: true;
      mode: "github";
      // url is null when even a trimmed prefill would exceed GitHub's
      // request-URI limit — the UI then shows issueBody for copy-paste.
      url: string | null;
      // True when the prefilled link had to shorten the description; the
      // full text lives in issueBody so nothing is lost.
      trimmed: boolean;
      issueTitle: string;
      issueBody: string;
      values: ReportValues;
    }
  | { ok: false; error: string; values: ReportValues };

const GITHUB_NEW_ISSUE =
  "https://github.com/mitulgajera16/BTCSCAM/issues/new";
const MAX_DESCRIPTION = 5000;
const MAX_EVIDENCE_URLS = 20;
const MAX_EVIDENCE_URL_LENGTH = 500;
const MAX_ENTITY_FIELD = 200; // vendor / domain / address
const MAX_CONTACT = 254; // RFC 5321 upper bound for an address
// GitHub 414s around ~8KB of request URI; stay well under it.
const MAX_ISSUE_URL_LENGTH = 6000;

// Defang so the tracker never renders a clickable scam domain: example[.]com
function defang(domain: string): string {
  return domain.replace(/\./g, "[.]");
}

type IssueFields = {
  description: string;
  scamType: string;
  vendor: string;
  domain: string;
  address: string;
  observed: string;
  evidenceUrls: string[];
  hasContact: boolean;
};

function buildIssueTitle(v: IssueFields): string {
  const entity =
    v.vendor || (v.domain ? defang(v.domain) : "") || v.address || "unnamed entity";
  return `[REPORT] ${v.scamType}: ${entity}`.slice(0, 120);
}

function buildIssueBody(v: IssueFields): string {
  return [
    "## What happened",
    "",
    v.description,
    "",
    "## Details",
    "",
    `- Scam type: ${v.scamType}`,
    `- Vendor / product: ${v.vendor || "not given"}`,
    `- Domain (defanged): ${v.domain ? defang(v.domain) : "not given"}`,
    `- Address: ${v.address ? `\`${v.address}\`` : "not given"}`,
    `- First observed: ${v.observed || "not given"}`,
    "",
    "## Evidence",
    "",
    // Backticks on purpose: evidence may point at live scam infrastructure,
    // and the public tracker must not render it as a clickable link.
    ...(v.evidenceUrls.length > 0
      ? v.evidenceUrls.map((u) => `- \`${u}\``)
      : ["- None provided."]),
    "",
    "## Contact",
    "",
    v.hasContact
      ? "Provided, but withheld from this public draft. Reporter: watch this issue for follow-up."
      : "Not provided.",
    "",
    "---",
    "",
    "Intake trust state: REPORTED - UNVERIFIED. Reports are never auto-verified.",
    "Evidence URLs are wrapped in backticks on purpose - do not visit raw scam links.",
    "Filed via btcscam.com/report.",
  ].join("\n");
}

function issueUrl(title: string, body: string): string {
  const params = new URLSearchParams({ title, body, labels: "report" });
  return `${GITHUB_NEW_ISSUE}?${params.toString()}`;
}

const TRIM_NOTE =
  "[Description trimmed to fit this prefill link. The full text was shown to the reporter for pasting as a comment after filing.]";

/**
 * A fully valid submission can still overflow GitHub's ~8KB request-URI
 * limit once URL-encoded (GitHub answers 414 and the report dead-ends).
 * Strategy: try the full prefill; if oversized, progressively trim the
 * description with an honest note; if even that cannot fit, return no URL
 * and let the UI fall back to copy-paste of the composed markdown.
 */
function buildIssue(v: IssueFields): {
  url: string | null;
  trimmed: boolean;
  title: string;
  body: string;
} {
  const title = buildIssueTitle(v);
  const fullBody = buildIssueBody(v);
  let url = issueUrl(title, fullBody);
  if (url.length <= MAX_ISSUE_URL_LENGTH) {
    return { url, trimmed: false, title, body: fullBody };
  }

  let keep = v.description.length;
  while (keep > 200) {
    keep = Math.floor(keep / 2);
    const trimmedBody = buildIssueBody({
      ...v,
      description: `${v.description.slice(0, keep)}\n\n${TRIM_NOTE}`,
    });
    url = issueUrl(title, trimmedBody);
    if (url.length <= MAX_ISSUE_URL_LENGTH) {
      return { url, trimmed: true, title, body: fullBody };
    }
  }

  // Even a heavily trimmed prefill will not fit (e.g. many long evidence
  // URLs). No link — the UI shows the markdown for manual filing instead.
  return { url: null, trimmed: false, title, body: fullBody };
}

export async function submitReport(
  _prev: ReportResult | null,
  formData: FormData,
): Promise<ReportResult> {
  // A Server Action is a public POST endpoint — treat every field as untrusted
  // and validate here regardless of what the client enforced.
  const values: ReportValues = {
    description: String(formData.get("description") ?? "").trim(),
    scamType: String(formData.get("scamType") ?? "").trim(),
    vendor: String(formData.get("vendor") ?? "").trim(),
    domain: String(formData.get("domain") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    observed: String(formData.get("observed") ?? "").trim(),
    evidence: String(formData.get("evidence") ?? "").trim(),
    contact: String(formData.get("contact") ?? "").trim(),
  };

  const problems: string[] = [];

  if (values.description.length < 30) {
    problems.push(
      "Describe what happened in at least 30 characters. Dates, amounts, and how they reached you all help.",
    );
  }
  if (values.description.length > MAX_DESCRIPTION) {
    problems.push(
      `Keep the description under ${MAX_DESCRIPTION} characters — put the long material in evidence links instead.`,
    );
  }
  if (!(SCAM_CATEGORIES as readonly string[]).includes(values.scamType)) {
    problems.push("Pick a scam type from the list.");
  }
  if (!values.vendor && !values.domain && !values.address) {
    problems.push(
      "Name at least one thing we can chase: a vendor or product, a domain, or an address.",
    );
  }
  for (const [label, value] of [
    ["vendor / product", values.vendor],
    ["domain", values.domain],
    ["address", values.address],
  ] as const) {
    if (value.length > MAX_ENTITY_FIELD) {
      problems.push(
        `Keep the ${label} under ${MAX_ENTITY_FIELD} characters — long material belongs in the description or evidence links.`,
      );
    }
  }

  const evidenceUrls = values.evidence
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const badUrls = evidenceUrls.filter((u) => {
    try {
      const parsed = new URL(u);
      return parsed.protocol !== "http:" && parsed.protocol !== "https:";
    } catch {
      return true;
    }
  });
  if (evidenceUrls.some((u) => u.length > MAX_EVIDENCE_URL_LENGTH)) {
    problems.push(
      `Each evidence URL must be under ${MAX_EVIDENCE_URL_LENGTH} characters — use an archive.org capture or a shorter canonical link.`,
    );
  }
  if (badUrls.length > 0) {
    problems.push(
      `Evidence must be full URLs (starting https://), one per line. Not valid: ${badUrls.join(", ")}`,
    );
  }
  if (evidenceUrls.length > MAX_EVIDENCE_URLS) {
    problems.push(
      `Keep evidence to ${MAX_EVIDENCE_URLS} links or fewer — lead with the strongest.`,
    );
  }

  if (values.observed) {
    const isDate =
      /^\d{4}-\d{2}-\d{2}$/.test(values.observed) &&
      !Number.isNaN(Date.parse(values.observed));
    if (!isDate) {
      problems.push("The observed date must be a real date (YYYY-MM-DD).");
    } else {
      // Compare against tomorrow's UTC date: a reporter east of UTC entering
      // today's local date must not be rejected. Day precision is enough.
      const tomorrowUTC = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      if (values.observed > tomorrowUTC) {
        problems.push("The observed date is in the future — check it.");
      }
    }
  }

  if (values.contact.length > MAX_CONTACT) {
    problems.push(
      `The contact email must be under ${MAX_CONTACT} characters.`,
    );
  } else if (
    values.contact &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact)
  ) {
    problems.push(
      "The contact email does not look like an email address. It is optional — leave it blank if you prefer.",
    );
  }

  if (problems.length > 0) {
    return { ok: false, error: problems.join("\n"), values };
  }

  // Sink 1: Supabase REST, when configured. Service-role key stays on the
  // server; this file never reaches the client bundle.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    try {
      const res = await fetch(
        `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/reports`,
        {
          method: "POST",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            description: values.description,
            scam_type: values.scamType,
            vendor: values.vendor || null,
            domain: values.domain || null,
            address: values.address || null,
            observed: values.observed || null,
            evidence_urls: evidenceUrls,
            contact_email: values.contact || null,
            trust_state: "reported",
          }),
        },
      );
      if (res.ok) {
        return { ok: true, mode: "stored" };
      }
      // Storage refused the write — fall through to the public GitHub queue
      // so the report is never silently lost.
    } catch {
      // Network failure — same fallback, same reason.
    }
  }

  // Sink 2: prefilled GitHub issue. The reporter files it in one click and
  // the intake queue stays publicly inspectable. values ride along so the
  // form stays recoverable until the report is actually filed on GitHub.
  const issue = buildIssue({
    description: values.description,
    scamType: values.scamType,
    vendor: values.vendor,
    domain: values.domain,
    address: values.address,
    observed: values.observed,
    evidenceUrls,
    hasContact: Boolean(values.contact),
  });
  return {
    ok: true,
    mode: "github",
    url: issue.url,
    trimmed: issue.trimmed,
    issueTitle: issue.title,
    issueBody: issue.body,
    values,
  };
}
