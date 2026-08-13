"use server";

import { headers } from "next/headers";
import { SCAM_CATEGORIES } from "@/components/report/categories";
import { clientKeyFrom, takeToken } from "@/lib/rate-limit";
import { getServiceClient, hasServiceRole, hasSupabase } from "@/lib/db";
import { getSession } from "@/lib/auth";

// ── R1 intake: manual triage. Every report enters as REPORTED and is never
// auto-verified. If Supabase env vars are present we store the report; if not,
// we hand the reporter a prefilled GitHub issue so the intake queue stays
// public and nothing is silently lost.
//
// R3 adds typed evidence chips (url / txid / screenshot / quote) and, when a
// session exists, credit: the report row carries user_id. Anonymous reporting
// is unchanged — accounts are for credit, not a gate.

export type ReportValues = {
  description: string;
  scamType: string;
  vendor: string;
  domain: string;
  address: string;
  observed: string;
  evidence: string;
  contact: string;
  // Serialized evidence chips (JSON array of {kind, value}) from the chips
  // widget's hidden field. Kept in values so a redraft never loses them.
  chips: string;
};

export type ReportResult =
  | {
      ok: true;
      mode: "stored";
      // Honest chip accounting for the confirmation panel: how many chips
      // rode along, and whether they actually reached the database.
      chipCount: number;
      chipsAttached: boolean;
    }
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

// ── Evidence chips (R3) ─────────────────────────────────────────────────────
// Kinds mirror supabase/migrations/0002_r3.sql (evidence_chips.kind check).
const CHIP_KINDS = ["url", "txid", "screenshot", "quote"] as const;
type ChipKind = (typeof CHIP_KINDS)[number];
type EvidenceChipInput = { kind: ChipKind; value: string };
const MAX_CHIPS = 12;
const MAX_QUOTE_CHARS = 280;
const CHIP_ISSUE_LABEL: Record<ChipKind, string> = {
  url: "URL",
  txid: "TXID",
  screenshot: "SCREENSHOT",
  quote: "QUOTE",
};

/**
 * Server-side chip validation. The client widget enforces the same rules, but
 * a Server Action is a public POST endpoint — everything is re-checked here.
 * Malformed payloads become validation problems, never crashes.
 */
function parseChipsField(serialized: string): {
  chips: EvidenceChipInput[];
  problems: string[];
} {
  if (!serialized) return { chips: [], problems: [] };

  let raw: unknown;
  try {
    raw = JSON.parse(serialized);
  } catch {
    return {
      chips: [],
      problems: [
        "Your evidence chips came through broken — remove them and add them again, or put the links in the evidence box instead.",
      ],
    };
  }
  if (!Array.isArray(raw)) {
    return {
      chips: [],
      problems: [
        "Your evidence chips came through broken — remove them and add them again, or put the links in the evidence box instead.",
      ],
    };
  }

  const problems: string[] = [];
  if (raw.length > MAX_CHIPS) {
    problems.push(
      `Keep evidence chips to ${MAX_CHIPS} or fewer — lead with the strongest.`,
    );
  }

  const chips: EvidenceChipInput[] = [];
  const seen = new Set<string>();
  for (const item of raw.slice(0, MAX_CHIPS)) {
    if (!item || typeof item !== "object") {
      problems.push(
        "One evidence chip came through broken — remove it and add it again.",
      );
      continue;
    }
    const rec = item as Record<string, unknown>;
    const kind = rec.kind;
    const value = typeof rec.value === "string" ? rec.value.trim() : "";
    if (
      typeof kind !== "string" ||
      !(CHIP_KINDS as readonly string[]).includes(kind)
    ) {
      problems.push(
        "One evidence chip is of a type we do not know — chips are URL, TXID, SCREENSHOT-URL, or QUOTE.",
      );
      continue;
    }
    const k = kind as ChipKind;

    if (!value) {
      problems.push(`An empty ${CHIP_ISSUE_LABEL[k]} chip was removed — chips need a value.`);
      continue;
    }
    if (k === "url" || k === "screenshot") {
      let ok = value.length <= MAX_EVIDENCE_URL_LENGTH;
      if (ok) {
        try {
          ok = new URL(value).protocol === "https:";
        } catch {
          ok = false;
        }
      }
      if (!ok) {
        problems.push(
          `${CHIP_ISSUE_LABEL[k]} chips must be full links starting https:// and under ${MAX_EVIDENCE_URL_LENGTH} characters. This one does not work: ${value.slice(0, 80)}`,
        );
        continue;
      }
    } else if (k === "txid") {
      if (!/^(0x)?[0-9a-fA-F]{64}$/.test(value)) {
        problems.push(
          "TXID chips must be exactly 64 hex characters (0x prefix allowed).",
        );
        continue;
      }
    } else if (
      k === "quote" &&
      value.replace(/\s+/g, " ").length > MAX_QUOTE_CHARS
    ) {
      problems.push(
        `QUOTE chips must be ${MAX_QUOTE_CHARS} characters or fewer — the exact words, not the whole thread.`,
      );
      continue;
    }

    // Quotes are collapsed to single-line so they stay one markdown list item
    // in the GitHub fallback and one honest row in the database.
    const clean = k === "quote" ? value.replace(/\s+/g, " ").trim() : value;
    const dedupeKey = `${k}:${clean}`;
    if (seen.has(dedupeKey)) continue; // silent dedupe — harmless
    seen.add(dedupeKey);
    chips.push({ kind: k, value: clean });
  }

  return { chips, problems };
}

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
  chips: EvidenceChipInput[];
  hasContact: boolean;
};

// Chips in the public tracker: URLs and txids ride in backticks so nothing
// scam-adjacent renders as a clickable link; quotes ride in plain quotes.
function chipIssueLine(chip: EvidenceChipInput): string {
  return chip.kind === "quote"
    ? `- QUOTE: "${chip.value}"`
    : `- ${CHIP_ISSUE_LABEL[chip.kind]}: \`${chip.value}\``;
}

function buildIssueTitle(v: IssueFields): string {
  const entity =
    v.vendor || (v.domain ? defang(v.domain) : "") || v.address || "no name given";
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
    `- Company / product: ${v.vendor || "not given"}`,
    `- Website (link broken on purpose): ${v.domain ? defang(v.domain) : "not given"}`,
    `- Wallet address: ${v.address ? `\`${v.address}\`` : "not given"}`,
    `- First seen: ${v.observed || "not given"}`,
    "",
    "## Evidence",
    "",
    // Backticks on purpose: evidence may point at live scam infrastructure,
    // and the public tracker must not render it as a clickable link.
    ...(v.evidenceUrls.length > 0
      ? v.evidenceUrls.map((u) => `- \`${u}\``)
      : ["- None provided."]),
    ...(v.chips.length > 0
      ? ["", "## Evidence chips", "", ...v.chips.map(chipIssueLine)]
      : []),
    "",
    "## Contact",
    "",
    v.hasContact
      ? "Given, but kept out of this public draft. Reporter: watch this issue for a reply."
      : "Not given.",
    "",
    "---",
    "",
    "Proof level when filed: REPORTED - NOT CHECKED YET. Reports are never marked verified on their own.",
    "Evidence links and chip values are wrapped in backticks on purpose - do not open raw scam links.",
    "Filed via btcscam.com/report.",
  ].join("\n");
}

function issueUrl(title: string, body: string): string {
  const params = new URLSearchParams({ title, body, labels: "report" });
  return `${GITHUB_NEW_ISSUE}?${params.toString()}`;
}

const TRIM_NOTE =
  "[Shortened so it would fit in the link. The reporter was shown the full text and can paste it as a comment after filing.]";

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
    chips: String(formData.get("chips") ?? "").trim(),
  };

  const problems: string[] = [];

  if (values.description.length < 30) {
    problems.push(
      "Describe what happened in at least 30 characters. Dates, amounts, and how they reached you all help.",
    );
  }
  if (values.description.length > MAX_DESCRIPTION) {
    problems.push(
      `Keep the description under ${MAX_DESCRIPTION} characters — put the long details in evidence links instead.`,
    );
  }
  if (!(SCAM_CATEGORIES as readonly string[]).includes(values.scamType)) {
    problems.push("Pick a scam type from the list.");
  }
  if (!values.vendor && !values.domain && !values.address) {
    problems.push(
      "Name at least one thing we can chase: a company or product, a website, or a wallet address.",
    );
  }
  for (const [label, value] of [
    ["company / product", values.vendor],
    ["website", values.domain],
    ["wallet address", values.address],
  ] as const) {
    if (value.length > MAX_ENTITY_FIELD) {
      problems.push(
        `Keep the ${label} under ${MAX_ENTITY_FIELD} characters — long details belong in the description or evidence links.`,
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
      `Each evidence link must be under ${MAX_EVIDENCE_URL_LENGTH} characters — use an archive.org copy or a shorter link.`,
    );
  }
  if (badUrls.length > 0) {
    problems.push(
      `Evidence must be full links (starting https://), one per line. These do not work: ${badUrls.join(", ")}`,
    );
  }
  if (evidenceUrls.length > MAX_EVIDENCE_URLS) {
    problems.push(
      `Keep evidence to ${MAX_EVIDENCE_URLS} links or fewer — lead with the strongest.`,
    );
  }

  // Typed evidence chips — validated server-side regardless of the widget.
  const { chips, problems: chipProblems } = parseChipsField(values.chips);
  problems.push(...chipProblems);

  if (values.observed) {
    const isDate =
      /^\d{4}-\d{2}-\d{2}$/.test(values.observed) &&
      !Number.isNaN(Date.parse(values.observed));
    if (!isDate) {
      problems.push(
        "The date you first saw it must be a real date (YYYY-MM-DD).",
      );
    } else {
      // Compare against tomorrow's UTC date: a reporter east of UTC entering
      // today's local date must not be rejected. Day precision is enough.
      const tomorrowUTC = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      if (values.observed > tomorrowUTC) {
        problems.push(
          "The date you first saw it is in the future — check it.",
        );
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

  // Per-IP throttle (R2-PLAN: reports are a public INSERT — rate-limit in
  // the action). The service-role write bypasses RLS, so without this one
  // scripted client could flood the desk queue at wire speed. Throttled
  // submissions skip the database sink and fall through to the public
  // GitHub queue: an abuser gains nothing, a fast-typing human loses
  // nothing — the report is still filed, just not silently into the desk.
  const requestHeaders = await headers();
  const withinLimit = takeToken(
    "report",
    clientKeyFrom(requestHeaders),
    5,
    10 * 60_000, // 5 reports per 10 minutes per client
  );

  // Sink 1: Supabase, when configured. Service-role client stays on the
  // server; this file never reaches the client bundle.
  if (withinLimit && hasServiceRole()) {
    // Signed-in reporters get credit: resolve the session (if any) BEFORE the
    // insert so the report row carries user_id. A missing or failing auth
    // layer must never block the report — accounts are for credit, not a
    // gate, so any session trouble simply files the report anonymously.
    let userId: string | null = null;
    if (hasSupabase()) {
      try {
        // getSession() resolves the signed-in auth user, or null.
        const user = await getSession();
        userId = user?.id ?? null;
      } catch {
        userId = null;
      }
    }

    try {
      const sb = getServiceClient();
      // Column names follow supabase/migrations/0001_init.sql (reports).
      // Triage status 'new' carries the R1 rule that every report enters
      // untrusted; trust state proper only exists once an editor promotes
      // the report into an incident.
      const { data: inserted, error: insertErr } = await sb
        .from("reports")
        .insert({
          description: values.description,
          category: values.scamType,
          vendor: values.vendor || null,
          domain: values.domain || null,
          address: values.address || null,
          observed_on: values.observed || null,
          evidence_urls: evidenceUrls,
          contact_email: values.contact || null,
          status: "new",
          user_id: userId,
        })
        .select("id")
        .single();

      if (!insertErr && inserted) {
        // Chips land in evidence_chips (0002_r3), linked to the report.
        // added_by mirrors the reporter: uuid when signed in, null when
        // anonymous — both are first-class.
        let chipsAttached = true;
        if (chips.length > 0) {
          const { error: chipErr } = await sb.from("evidence_chips").insert(
            chips.map((c) => ({
              report_id: inserted.id,
              kind: c.kind,
              value: c.value,
              added_by: userId,
            })),
          );
          if (chipErr) {
            // The report itself is filed — do not re-file it via GitHub.
            // Tell the reporter plainly that the chips did not make it.
            chipsAttached = false;
            console.error(
              `report ${inserted.id}: evidence chips failed to store: ${chipErr.message}`,
            );
          }
        }
        return {
          ok: true,
          mode: "stored",
          chipCount: chips.length,
          chipsAttached,
        };
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
    chips,
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
