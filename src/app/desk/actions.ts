"use server";

import { headers } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { getServiceClient, hasSupabase } from "@/components/desk/db";
import { verifyEditorAuth } from "@/components/desk/auth";
import {
  CATEGORY_ENUM,
  nField,
  slugify,
  type DeskActionResult,
} from "@/components/desk/types";

// ── The Desk server actions (Monday Sweep) ─────────────────────────────────
// Editorial law enforced here, not in the UI:
//   · everything published from a draft is trustState "reported" — forced
//   · no source, no publish — approve refuses drafts without a source URL
//   · nothing auto-publishes; every write below is a human clicking a button
// Server actions are directly POST-reachable, so every action re-verifies
// the editor's Basic auth from the request headers before touching data.

const PUBLISHER: Record<string, string> = {
  llama: "DeFiLlama",
  ic3: "FBI IC3",
  sec: "U.S. Securities and Exchange Commission",
  cftc: "U.S. Commodity Futures Trading Commission",
  ftc: "U.S. Federal Trade Commission",
  optech: "Bitcoin Optech",
  report: "Reader report",
};

const SOURCE_TYPE: Record<string, string> = {
  llama: "research",
  ic3: "regulator",
  sec: "regulator",
  cftc: "regulator",
  ftc: "regulator",
  optech: "research",
  report: "community",
};

async function requireEditor(): Promise<string | null> {
  const h = await headers();
  if (!verifyEditorAuth(h.get("authorization"))) {
    return "Not authorized. The desk requires editor credentials.";
  }
  if (!hasSupabase()) {
    return "Database not connected — nothing can be read or written.";
  }
  return null;
}

function isHttpUrl(u: unknown): u is string {
  if (typeof u !== "string") return false;
  try {
    const p = new URL(u);
    return p.protocol === "http:" || p.protocol === "https:";
  } catch {
    return false;
  }
}

function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

type SourceEntry = { url: string; publisher: string; date?: string; type: string };

/**
 * Collect usable source entries for a draft: valid entries from the
 * normalized doc first, falling back to the feed item's own URL. Returns []
 * when the draft genuinely has no source — approve refuses that case.
 */
function collectSources(
  source: string,
  sourceUrl: unknown,
  normalized: Record<string, unknown> | null,
): SourceEntry[] {
  const out: SourceEntry[] = [];
  const raw = normalized?.sources;
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      if (!isHttpUrl(rec.url)) continue;
      out.push({
        url: rec.url,
        publisher:
          typeof rec.publisher === "string" && rec.publisher
            ? rec.publisher
            : (PUBLISHER[source] ?? source),
        ...(typeof rec.date === "string" && rec.date ? { date: rec.date } : {}),
        type:
          typeof rec.type === "string" && rec.type
            ? rec.type
            : (SOURCE_TYPE[source] ?? "news"),
      });
    }
  }
  if (out.length === 0 && isHttpUrl(sourceUrl)) {
    out.push({
      url: sourceUrl,
      publisher: PUBLISHER[source] ?? source,
      type: SOURCE_TYPE[source] ?? "news",
    });
  }
  return out;
}

// ── approveDraft ───────────────────────────────────────────────────────────
// formData: draftId, title, slug, summary, severity, categories,
// firstObserved. Publishes the draft as a new incident with trustState
// FORCED to "reported", then revalidates the incidents cache.
export async function approveDraft(
  _prev: DeskActionResult | null,
  formData: FormData,
): Promise<DeskActionResult> {
  const denied = await requireEditor();
  if (denied) return { ok: false, error: denied };

  const draftId = Number(formData.get("draftId"));
  if (!Number.isInteger(draftId)) return { ok: false, error: "Bad draft id." };

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const severity = String(formData.get("severity") ?? "").trim();
  const firstObserved = String(formData.get("firstObserved") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();

  const problems: string[] = [];
  if (title.length < 8) problems.push("Title must be at least 8 characters.");
  if (summary.length < 30) {
    problems.push(
      "Summary must be at least 30 characters — write what a reader needs to know.",
    );
  }
  if (!["S1", "S2", "S3", "S4"].includes(severity)) {
    problems.push("Pick a severity (S1–S4).");
  }
  if (!isIsoDate(firstObserved)) {
    problems.push("First observed must be a real date (YYYY-MM-DD).");
  } else if (firstObserved > todayUTC()) {
    problems.push("First observed is in the future — check it.");
  }

  const categories = String(formData.get("categories") ?? "")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
  const badCategories = categories.filter(
    (c) => !(CATEGORY_ENUM as readonly string[]).includes(c),
  );
  if (categories.length === 0) {
    problems.push("Give at least one category.");
  } else if (badCategories.length > 0) {
    problems.push(
      `Unknown categories: ${badCategories.join(", ")}. Allowed: ${CATEGORY_ENUM.join(", ")}.`,
    );
  }

  if (!slug) slug = slugify(title);
  if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(slug)) {
    problems.push("Slug must be lowercase letters, digits, and hyphens (3–80 chars).");
  }
  if (problems.length > 0) return { ok: false, error: problems.join(" ") };

  const sb = getServiceClient();
  const { data: draft, error: draftErr } = await sb
    .from("draft_incidents")
    .select("id, source, source_url, title, status, normalized")
    .eq("id", draftId)
    .maybeSingle();
  if (draftErr) return { ok: false, error: `Could not read draft: ${draftErr.message}` };
  if (!draft) return { ok: false, error: "Draft not found." };
  if (draft.status !== "draft") {
    return { ok: false, error: `Draft already reviewed (status: ${draft.status}).` };
  }

  const normalized =
    draft.normalized && typeof draft.normalized === "object"
      ? (draft.normalized as Record<string, unknown>)
      : null;

  // Editorial law: no source, no publish.
  const sources = collectSources(draft.source, draft.source_url, normalized);
  if (sources.length === 0) {
    return {
      ok: false,
      error: "This draft has no source URL. No source, no publish — reject it or fix the ingest.",
    };
  }

  // Refuse silent overwrites: same slug means the story already exists.
  const { data: existing, error: existErr } = await sb
    .from("incidents")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existErr) return { ok: false, error: `Slug check failed: ${existErr.message}` };
  if (existing) {
    return {
      ok: false,
      error: `An incident with slug "${slug}" already exists — use MERGE instead, or change the slug.`,
    };
  }

  const nowIso = new Date().toISOString();
  const rawActions = normalized?.actions;
  const actions =
    Array.isArray(rawActions) && rawActions.some((a) => typeof a === "string" && a.trim())
      ? rawActions.filter((a): a is string => typeof a === "string" && Boolean(a.trim()))
      : ["No reader action issued yet. Follow the primary source for updates."];

  // Full incident document (jsonb source of truth). trustState is forced —
  // nothing an ingest feed or an editor types can publish above "reported".
  const doc: Record<string, unknown> = {
    id: slug,
    slug,
    title,
    summary,
    trustState: "reported",
    severity,
    categories,
    firstObserved,
    published: nowIso,
    lastUpdated: nowIso,
    actions,
    sources,
  };
  if (normalized) {
    for (const key of [
      "ongoing",
      "entities",
      "impact",
      "timeline",
      "affected",
      "notAffected",
      "claims",
      "relatedGuides",
      "relatedIncidents",
      "tags",
    ]) {
      const value = nField(normalized, key, key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`));
      if (value !== undefined) doc[key] = value;
    }
  }

  const { error: insertErr } = await sb.from("incidents").insert({
    id: slug,
    slug,
    title,
    summary,
    trust_state: "reported",
    severity,
    categories,
    first_observed: firstObserved,
    published: nowIso,
    last_updated: nowIso,
    ongoing: doc.ongoing === true,
    data: doc,
  });
  if (insertErr) return { ok: false, error: `Publish failed: ${insertErr.message}` };

  const { error: markErr } = await sb
    .from("draft_incidents")
    .update({ status: "approved", reviewed_at: nowIso, review_note: `Published as ${slug}` })
    .eq("id", draftId);

  revalidateTag("incidents", "max");
  revalidatePath("/", "page");

  return {
    ok: true,
    message: markErr
      ? `Published as /scam/${slug} (REPORTED · UNVERIFIED), but the draft row could not be marked approved: ${markErr.message}`
      : `Published as /scam/${slug} — trust state REPORTED · UNVERIFIED.`,
  };
}

// ── rejectDraft ────────────────────────────────────────────────────────────
// formData: draftId, note.
export async function rejectDraft(
  _prev: DeskActionResult | null,
  formData: FormData,
): Promise<DeskActionResult> {
  const denied = await requireEditor();
  if (denied) return { ok: false, error: denied };

  const draftId = Number(formData.get("draftId"));
  if (!Number.isInteger(draftId)) return { ok: false, error: "Bad draft id." };
  const note = String(formData.get("note") ?? "").trim();
  if (note.length < 3) {
    return { ok: false, error: "Give a rejection note — future you will want the reason." };
  }

  const sb = getServiceClient();
  const { data: updated, error } = await sb
    .from("draft_incidents")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      review_note: note,
    })
    .eq("id", draftId)
    .eq("status", "draft")
    .select("id");
  if (error) return { ok: false, error: `Reject failed: ${error.message}` };
  if (!updated || updated.length === 0) {
    return { ok: false, error: "Draft not found or already reviewed." };
  }
  return { ok: true, message: `Draft #${draftId} rejected.` };
}

// ── mergeDraft ─────────────────────────────────────────────────────────────
// formData: draftId, incidentId. Appends the draft's source + a timeline
// entry to an existing incident's jsonb doc, writes a revision row, marks
// the draft merged, revalidates.
export async function mergeDraft(
  _prev: DeskActionResult | null,
  formData: FormData,
): Promise<DeskActionResult> {
  const denied = await requireEditor();
  if (denied) return { ok: false, error: denied };

  const draftId = Number(formData.get("draftId"));
  const incidentId = String(formData.get("incidentId") ?? "").trim();
  if (!Number.isInteger(draftId)) return { ok: false, error: "Bad draft id." };
  if (!incidentId) return { ok: false, error: "Pick an incident to merge into." };

  const sb = getServiceClient();
  const { data: draft, error: draftErr } = await sb
    .from("draft_incidents")
    .select("id, source, source_url, title, status, normalized")
    .eq("id", draftId)
    .maybeSingle();
  if (draftErr) return { ok: false, error: `Could not read draft: ${draftErr.message}` };
  if (!draft) return { ok: false, error: "Draft not found." };
  if (draft.status !== "draft") {
    return { ok: false, error: `Draft already reviewed (status: ${draft.status}).` };
  }

  const normalized =
    draft.normalized && typeof draft.normalized === "object"
      ? (draft.normalized as Record<string, unknown>)
      : null;
  const sources = collectSources(draft.source, draft.source_url, normalized);
  if (sources.length === 0) {
    return { ok: false, error: "This draft has no source URL — nothing citable to merge." };
  }

  const { data: incident, error: incErr } = await sb
    .from("incidents")
    .select("id, slug, data")
    .eq("id", incidentId)
    .maybeSingle();
  if (incErr) return { ok: false, error: `Could not read incident: ${incErr.message}` };
  if (!incident) return { ok: false, error: `Incident "${incidentId}" not found.` };

  const prevData =
    incident.data && typeof incident.data === "object"
      ? (incident.data as Record<string, unknown>)
      : {};
  const doc: Record<string, unknown> = { ...prevData };

  // Append new sources, deduped by URL.
  const existingSources = Array.isArray(doc.sources) ? [...doc.sources] : [];
  const knownUrls = new Set(
    existingSources
      .map((s) => (s && typeof s === "object" ? (s as Record<string, unknown>).url : null))
      .filter((u): u is string => typeof u === "string"),
  );
  let added = 0;
  for (const s of sources) {
    if (knownUrls.has(s.url)) continue;
    existingSources.push({ ...s, date: s.date ?? todayUTC() });
    knownUrls.add(s.url);
    added += 1;
  }
  doc.sources = existingSources;

  // Timeline entry recording the merge — dated, attributed, honest.
  const publisher = PUBLISHER[draft.source] ?? draft.source;
  const timeline = Array.isArray(doc.timeline) ? [...doc.timeline] : [];
  timeline.push({
    date: todayUTC(),
    event: `Corroborating item ingested from ${publisher}: ${draft.title ?? "untitled"}`,
    source: sources[0].url,
  });
  doc.timeline = timeline;

  const nowIso = new Date().toISOString();
  doc.lastUpdated = nowIso;

  // History is written by the 0001 migration's BEFORE UPDATE trigger, which
  // snapshots old.data whenever data changes — no manual revision insert here
  // (a second write would duplicate the row and race the (incident_id, rev)
  // unique index).
  const { error: updErr } = await sb
    .from("incidents")
    .update({ data: doc, last_updated: nowIso })
    .eq("id", incidentId);
  if (updErr) return { ok: false, error: `Merge failed: ${updErr.message}` };

  const { error: markErr } = await sb
    .from("draft_incidents")
    .update({
      status: "merged",
      reviewed_at: nowIso,
      review_note: `Merged into ${incidentId}`,
    })
    .eq("id", draftId);

  revalidateTag("incidents", "max");
  revalidatePath("/", "page");
  if (typeof incident.slug === "string" && incident.slug) {
    revalidatePath(`/scam/${incident.slug}`, "page");
  }

  const sourceNote =
    added > 0
      ? `${added} new source${added === 1 ? "" : "s"} appended`
      : "source already cited — timeline entry added";
  return {
    ok: true,
    message:
      `Merged draft #${draftId} into ${incidentId} (${sourceNote}).` +
      (markErr ? ` Draft row could not be marked merged: ${markErr.message}.` : ""),
  };
}

// ── triageReport ───────────────────────────────────────────────────────────
// formData: reportId, status ∈ {triaged, accepted, rejected}.
export async function triageReport(
  _prev: DeskActionResult | null,
  formData: FormData,
): Promise<DeskActionResult> {
  const denied = await requireEditor();
  if (denied) return { ok: false, error: denied };

  const reportId = Number(formData.get("reportId"));
  const status = String(formData.get("status") ?? "").trim();
  if (!Number.isInteger(reportId)) return { ok: false, error: "Bad report id." };
  if (!["triaged", "accepted", "rejected"].includes(status)) {
    return { ok: false, error: "Status must be triaged, accepted, or rejected." };
  }

  const sb = getServiceClient();
  // Only undecided reports can move: a stale desk tab or double-click must
  // not silently flip an accepted/rejected report back to another state.
  const { data: updated, error } = await sb
    .from("reports")
    .update({ status })
    .eq("id", reportId)
    .in("status", ["new", "triaged"])
    .select("id");
  if (error) return { ok: false, error: `Triage failed: ${error.message}` };
  if (!updated || updated.length === 0) {
    return {
      ok: false,
      error:
        "Report not found, or already decided — accepted/rejected reports keep their decision.",
    };
  }
  return { ok: true, message: `Report #${reportId} marked ${status}.` };
}

// ── addCorrection ──────────────────────────────────────────────────────────
// formData: incidentId, date, note. Corrections are public and permanent:
// a row in the corrections table AND an entry in the incident doc's
// corrections[] array, then cache revalidation.
export async function addCorrection(
  _prev: DeskActionResult | null,
  formData: FormData,
): Promise<DeskActionResult> {
  const denied = await requireEditor();
  if (denied) return { ok: false, error: denied };

  const incidentId = String(formData.get("incidentId") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!incidentId) return { ok: false, error: "Pick an incident." };
  if (!isIsoDate(date)) return { ok: false, error: "Date must be YYYY-MM-DD." };
  if (date > todayUTC()) return { ok: false, error: "Correction date is in the future." };
  if (note.length < 10) {
    return { ok: false, error: "Write the correction in full — at least 10 characters." };
  }

  const sb = getServiceClient();
  const { data: incident, error: incErr } = await sb
    .from("incidents")
    .select("id, slug, data")
    .eq("id", incidentId)
    .maybeSingle();
  if (incErr) return { ok: false, error: `Could not read incident: ${incErr.message}` };
  if (!incident) return { ok: false, error: `Incident "${incidentId}" not found.` };

  const { error: corrErr } = await sb.from("corrections").insert({
    incident_id: incidentId,
    corrected_on: date,
    note,
  });
  if (corrErr) return { ok: false, error: `Correction insert failed: ${corrErr.message}` };

  const doc: Record<string, unknown> =
    incident.data && typeof incident.data === "object"
      ? { ...(incident.data as Record<string, unknown>) }
      : {};
  const corrections = Array.isArray(doc.corrections) ? [...doc.corrections] : [];
  corrections.push({ date, note });
  doc.corrections = corrections;
  const nowIso = new Date().toISOString();
  doc.lastUpdated = nowIso;

  const { error: updErr } = await sb
    .from("incidents")
    .update({ data: doc, last_updated: nowIso })
    .eq("id", incidentId);
  if (updErr) {
    return {
      ok: false,
      error: `Correction row saved, but the incident doc update failed: ${updErr.message}`,
    };
  }

  revalidateTag("incidents", "max");
  revalidatePath("/", "page");
  if (typeof incident.slug === "string" && incident.slug) {
    revalidatePath(`/scam/${incident.slug}`, "page");
  }
  return { ok: true, message: `Correction dated ${date} filed on ${incidentId}.` };
}
