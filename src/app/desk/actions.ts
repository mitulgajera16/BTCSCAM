"use server";

import { headers } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { getServiceClient, hasSupabase } from "@/components/desk/db";
import { getModActor, verifyEditorAuth } from "@/components/desk/auth";
import {
  CATEGORY_ENUM,
  nField,
  slugify,
  type DeskActionResult,
} from "@/components/desk/types";

// ── The Desk server actions (Monday Sweep + Watchmen tools) ────────────────
// Editorial law enforced here, not in the UI:
//   · everything published from a draft is trustState "reported" — forced
//   · no source, no publish — approve refuses drafts without a source URL
//   · nothing auto-publishes; every write below is a human clicking a button
//   · votes and chips are signals TO editors — they never verify anything
//   · the ladder only climbs — recompute never demotes; watchman/mod manual
// Server actions are directly POST-reachable, so every action re-verifies
// authorization itself: either the editor's Basic auth from the request
// headers, or a signed-in session whose profiles row says role = 'mod'
// (checked via the SERVICE client — client input is never trusted).

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

// ── authorization gate ─────────────────────────────────────────────────────

type DeskActor =
  | { kind: "editor" }
  | { kind: "mod"; id: string; handle: string | null };

/**
 * Every desk action starts here: Basic auth (ADMIN_KEY) OR a mod-role
 * session — either is enough, so the desk works before accounts exist and
 * keeps working after. Fails closed when neither holds. The mod-session
 * check is the shared getModActor in src/components/desk/auth.ts (also
 * used by the desk page).
 */
async function requireDesk(): Promise<{ actor: DeskActor } | { error: string }> {
  const h = await headers();
  if (verifyEditorAuth(h.get("authorization"))) {
    if (!hasSupabase()) {
      return { error: "Database not connected — nothing can be read or written." };
    }
    return { actor: { kind: "editor" } };
  }
  const mod = await getModActor();
  if (mod) return { actor: { kind: "mod", ...mod } };
  return {
    error:
      "Not authorized. The desk requires editor credentials or a signed-in mod.",
  };
}

/**
 * Internal audit trail (desk_log, migration 0003). Best-effort by design:
 * the log must never block or fail the action it records. Public
 * accountability stays with the corrections record; this is for the desk.
 */
async function deskLog(
  actor: DeskActor,
  action: string,
  subject: string,
  detail: Record<string, unknown> = {},
): Promise<void> {
  try {
    const sb = getServiceClient();
    await sb.from("desk_log").insert({
      actor: actor.kind === "mod" ? actor.id : null,
      action,
      subject,
      detail: {
        ...detail,
        by: actor.kind === "mod" ? (actor.handle ?? actor.id) : "editor:basic-auth",
      },
    });
  } catch {
    // best-effort — swallow everything, including "table does not exist yet"
  }
}

// ── small validators ───────────────────────────────────────────────────────

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

// ── the ladder (contribution standing) ─────────────────────────────────────
// reader → reporter (1 accepted report) → corroborator (3 accepted reports
// OR 5 accepted evidence chips on others' reports) → watchman (10 accepted
// contributions + mod approval — MANUAL) → mod (appointed — MANUAL).
// Automatic promotion stops at corroborator; nothing here ever demotes.

const ROLE_RANK: Record<string, number> = {
  reader: 0,
  reporter: 1,
  corroborator: 2,
  watchman: 3,
  mod: 4,
};

/**
 * Display-only names for the stored role values. The stored values never
 * change — this map exists so desk messages read in the same words the rest
 * of the site prints.
 */
const ROLE_DISPLAY: Record<string, string> = {
  reader: "reader",
  reporter: "reporter",
  corroborator: "witness",
  watchman: "watchman",
  mod: "mod",
};

function roleName(role: string): string {
  return ROLE_DISPLAY[role] ?? role;
}

function autoRole(
  acceptedReports: number,
  acceptedChipsOnOthers: number,
): "reader" | "reporter" | "corroborator" {
  if (acceptedReports >= 3 || acceptedChipsOnOthers >= 5) return "corroborator";
  if (acceptedReports >= 1) return "reporter";
  return "reader";
}

/**
 * Accepted evidence chips this user added to OTHER people's reports (chips
 * on your own report prove diligence, not corroboration). Returns 0 when
 * the accepted column is missing (migration 0004 not applied) — the ladder
 * then simply cannot count chips yet.
 */
async function countAcceptedChipsOnOthers(userId: string): Promise<number> {
  const sb = getServiceClient();
  const { data: chips, error } = await sb
    .from("evidence_chips")
    .select("report_id")
    .eq("added_by", userId)
    .eq("accepted", true);
  if (error || !chips || chips.length === 0) return 0;
  const ids = [...new Set(chips.map((c) => Number(c.report_id)))];
  const { data: owned, error: ownErr } = await sb
    .from("reports")
    .select("id")
    .in("id", ids)
    .eq("user_id", userId);
  if (ownErr) return 0;
  const ownedSet = new Set((owned ?? []).map((r) => Number(r.id)));
  return chips.filter((c) => !ownedSet.has(Number(c.report_id))).length;
}

/**
 * Recount one contributor's standing from the actual tables (self-healing —
 * no drift-prone increments), update profiles.accepted_reports, and promote
 * when a threshold is met. Never demotes. Returns a plain-language note for
 * the action result; failures are reported, not thrown.
 */
async function refreshStanding(
  actor: DeskActor,
  userId: string,
  reason: string,
): Promise<string> {
  const sb = getServiceClient();
  const { data: profile, error: profErr } = await sb
    .from("profiles")
    .select("id, handle, role, accepted_reports")
    .eq("id", userId)
    .maybeSingle();
  if (profErr) return `Standing update failed: ${profErr.message}.`;
  if (!profile) {
    return "Contributor has no profile row yet — credit applies on the next RECOMPUTE LADDER after their profile exists.";
  }

  const { count, error: cntErr } = await sb
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "accepted");
  if (cntErr) return `Standing update failed: ${cntErr.message}.`;
  const acceptedReports = count ?? 0;

  if (acceptedReports !== Number(profile.accepted_reports)) {
    const { error: updErr } = await sb
      .from("profiles")
      .update({ accepted_reports: acceptedReports })
      .eq("id", userId);
    if (updErr) return `Standing update failed: ${updErr.message}.`;
  }

  const chipsOnOthers = await countAcceptedChipsOnOthers(userId);
  const current = typeof profile.role === "string" ? profile.role : "reader";
  const target = autoRole(acceptedReports, chipsOnOthers);
  const name =
    (typeof profile.handle === "string" && profile.handle) ||
    `${userId.slice(0, 8)}…`;

  let note = `Credited ${name}: ${acceptedReports} accepted report${
    acceptedReports === 1 ? "" : "s"
  }, ${chipsOnOthers} accepted chip${chipsOnOthers === 1 ? "" : "s"} on others' reports.`;

  if ((ROLE_RANK[target] ?? 0) > (ROLE_RANK[current] ?? 0)) {
    const { error: roleErr } = await sb
      .from("profiles")
      .update({ role: target })
      .eq("id", userId);
    if (roleErr) {
      note += ` Promotion to ${roleName(target)} failed: ${roleErr.message}.`;
    } else {
      note += ` Promoted ${roleName(current)} → ${roleName(target)}.`;
      await deskLog(actor, "promote", `profile:${userId}`, {
        from: current,
        to: target,
        reason,
      });
    }
  }
  return note;
}

// ── approveDraft ───────────────────────────────────────────────────────────
// formData: draftId, title, slug, summary, severity, categories,
// firstObserved. Publishes the draft as a new incident with trustState
// FORCED to "reported", then revalidates the incidents cache.
export async function approveDraft(
  _prev: DeskActionResult | null,
  formData: FormData,
): Promise<DeskActionResult> {
  const gate = await requireDesk();
  if ("error" in gate) return { ok: false, error: gate.error };

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

  await deskLog(gate.actor, "draft-approve", `draft:${draftId}`, { slug });

  revalidateTag("incidents", "max");
  revalidatePath("/", "page");

  return {
    ok: true,
    message: markErr
      ? `Published as /scam/${slug} (REPORTED · NOT CHECKED YET), but the draft row could not be marked approved: ${markErr.message}`
      : `Published as /scam/${slug} — proof level REPORTED · NOT CHECKED YET.`,
  };
}

// ── rejectDraft ────────────────────────────────────────────────────────────
// formData: draftId, note.
export async function rejectDraft(
  _prev: DeskActionResult | null,
  formData: FormData,
): Promise<DeskActionResult> {
  const gate = await requireDesk();
  if ("error" in gate) return { ok: false, error: gate.error };

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
  await deskLog(gate.actor, "draft-reject", `draft:${draftId}`, { note });
  return { ok: true, message: `Draft #${draftId} rejected.` };
}

// ── mergeDraft ─────────────────────────────────────────────────────────────
// formData: draftId, incidentId. Appends the draft's source + a timeline
// entry to an existing incident's jsonb doc, marks the draft merged,
// revalidates. Revision history is written by the 0001 trigger.
export async function mergeDraft(
  _prev: DeskActionResult | null,
  formData: FormData,
): Promise<DeskActionResult> {
  const gate = await requireDesk();
  if ("error" in gate) return { ok: false, error: gate.error };

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
    event: `Item that backs this up, taken in from ${publisher}: ${draft.title ?? "untitled"}`,
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

  await deskLog(gate.actor, "draft-merge", `draft:${draftId}`, {
    incidentId,
    sourcesAdded: added,
  });

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
// formData: reportId, status ∈ {triaged, accepted, rejected}. A bare ACCEPT
// here credits the reporter but creates nothing — use acceptReportToDraft /
// attachReportToIncident when the report should become or join a dossier.
export async function triageReport(
  _prev: DeskActionResult | null,
  formData: FormData,
): Promise<DeskActionResult> {
  const gate = await requireDesk();
  if ("error" in gate) return { ok: false, error: gate.error };

  const reportId = Number(formData.get("reportId"));
  const status = String(formData.get("status") ?? "").trim();
  if (!Number.isInteger(reportId)) return { ok: false, error: "Bad report id." };
  if (!["triaged", "accepted", "rejected"].includes(status)) {
    return { ok: false, error: "Status must be reviewed, accepted, or rejected." };
  }

  const sb = getServiceClient();
  // Only undecided reports can move: a stale desk tab or double-click must
  // not silently flip an accepted/rejected report back to another state.
  const { data: updated, error } = await sb
    .from("reports")
    .update({ status })
    .eq("id", reportId)
    .in("status", ["new", "triaged"])
    .select("id, user_id");
  if (error) return { ok: false, error: `Review failed: ${error.message}` };
  if (!updated || updated.length === 0) {
    return {
      ok: false,
      error:
        "Report not found, or already decided — accepted/rejected reports keep their decision.",
    };
  }

  await deskLog(gate.actor, "report-triage", `report:${reportId}`, { status });

  let credit = "";
  if (status === "accepted" && updated[0].user_id) {
    credit = ` ${await refreshStanding(
      gate.actor,
      String(updated[0].user_id),
      `report #${reportId} accepted`,
    )}`;
  }
  // The stored status value is unchanged; only its printed name is plainer.
  const statusName = status === "triaged" ? "reviewed" : status;
  return { ok: true, message: `Report #${reportId} marked ${statusName}.${credit}` };
}

// ── addCorrection ──────────────────────────────────────────────────────────
// formData: incidentId, date, note. Corrections are public and permanent:
// a row in the corrections table AND an entry in the incident doc's
// corrections[] array, then cache revalidation.
export async function addCorrection(
  _prev: DeskActionResult | null,
  formData: FormData,
): Promise<DeskActionResult> {
  const gate = await requireDesk();
  if ("error" in gate) return { ok: false, error: gate.error };

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

  await deskLog(gate.actor, "correction", `incident:${incidentId}`, { date });

  revalidateTag("incidents", "max");
  revalidatePath("/", "page");
  if (typeof incident.slug === "string" && incident.slug) {
    revalidatePath(`/scam/${incident.slug}`, "page");
  }
  return { ok: true, message: `Correction dated ${date} filed on ${incidentId}.` };
}

// ── acceptReportToDraft ────────────────────────────────────────────────────
// formData: reportId. Accepts a reader report by turning it into a
// draft_incidents row (source 'report', incident-shaped normalized doc,
// trustState forced to "reported"). The draft still goes through the human
// APPROVE step — accepting a report publishes nothing. Marks the report
// accepted and credits the reporter's standing.
export async function acceptReportToDraft(
  _prev: DeskActionResult | null,
  formData: FormData,
): Promise<DeskActionResult> {
  const gate = await requireDesk();
  if ("error" in gate) return { ok: false, error: gate.error };

  const reportId = Number(formData.get("reportId"));
  if (!Number.isInteger(reportId)) return { ok: false, error: "Bad report id." };

  const sb = getServiceClient();
  const { data: report, error: repErr } = await sb
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .maybeSingle();
  if (repErr) return { ok: false, error: `Could not read report: ${repErr.message}` };
  if (!report) return { ok: false, error: "Report not found." };
  if (!["new", "triaged"].includes(String(report.status))) {
    return { ok: false, error: `Report already decided (status: ${report.status}).` };
  }

  const description = typeof report.description === "string" ? report.description : "";
  const category =
    typeof report.category === "string" &&
    (CATEGORY_ENUM as readonly string[]).includes(report.category)
      ? report.category
      : null;
  const vendor = typeof report.vendor === "string" && report.vendor ? report.vendor : null;
  const domain = typeof report.domain === "string" && report.domain ? report.domain : null;
  const address = typeof report.address === "string" && report.address ? report.address : null;
  const createdDate = String(report.created_at ?? "").slice(0, 10) || todayUTC();
  const observed =
    typeof report.observed_on === "string" && isIsoDate(report.observed_on)
      ? report.observed_on
      : createdDate;
  const evidence: string[] = Array.isArray(report.evidence_urls)
    ? (report.evidence_urls as unknown[]).filter(isHttpUrl)
    : [];

  const title = `Reader report: ${category ?? "unclassified"}${vendor ? ` — ${vendor}` : ""}`;

  const entities: Record<string, unknown> = {};
  if (vendor) entities.vendor = vendor;
  if (domain) entities.domains = [domain];
  if (address) entities.addresses = [address];

  // Incident-shaped normalized doc. trustState is forced to "reported" —
  // a reader report can never enter the pipeline above the bottom rung.
  // If the report carried no usable evidence URL, sources stays empty and
  // approveDraft will refuse to publish it (no source, no publish).
  const normalized: Record<string, unknown> = {
    title,
    summary: description,
    trustState: "reported",
    categories: category ? [category] : [],
    firstObserved: observed,
    ...(Object.keys(entities).length > 0 ? { entities } : {}),
    sources: evidence.map((u) => ({
      url: u,
      publisher: "Reader report",
      type: "community",
      date: createdDate,
    })),
    timeline: [{ date: observed, event: "Reported to BTCSCAM by a reader." }],
    tags: ["reader-report"],
  };

  // The unique dedupe_key doubles as the concurrency guard: a second accept
  // of the same report fails the insert instead of creating a twin draft.
  const { data: inserted, error: insErr } = await sb
    .from("draft_incidents")
    .insert({
      source: "report",
      source_url: evidence[0] ?? null,
      dedupe_key: `report:${reportId}`,
      title,
      raw: report,
      normalized,
    })
    .select("id")
    .single();
  if (insErr) {
    if (insErr.code === "23505") {
      return {
        ok: false,
        error: `Report #${reportId} already has a draft in the queue — it was accepted before.`,
      };
    }
    return { ok: false, error: `Draft create failed: ${insErr.message}` };
  }

  const { error: markErr } = await sb
    .from("reports")
    .update({ status: "accepted" })
    .eq("id", reportId)
    .in("status", ["new", "triaged"]);

  let credit =
    "Filed anonymously — accounts are for credit, not a gate, so there is no reporter standing to update.";
  if (report.user_id) {
    credit = await refreshStanding(
      gate.actor,
      String(report.user_id),
      `report #${reportId} accepted → draft`,
    );
  }

  await deskLog(gate.actor, "report-accept-draft", `report:${reportId}`, {
    draftId: inserted?.id ?? null,
    evidenceUrls: evidence.length,
  });

  return {
    ok: true,
    message:
      `Report #${reportId} accepted → draft #${inserted?.id} in the queue. It publishes only ` +
      `through APPROVE, as REPORTED · NOT CHECKED YET${evidence.length === 0 ? " — and it has no evidence URL yet, so APPROVE will refuse until a source exists" : ""}. ${credit}` +
      (markErr ? ` (Report row could not be marked accepted: ${markErr.message}.)` : ""),
  };
}

// ── attachReportToIncident ─────────────────────────────────────────────────
// formData: reportId, incidentId. Appends the report to an existing
// incident: its evidence URLs as community sources (deduped) and a dated
// timeline entry. Mirrors mergeDraft; the 0001 trigger owns revision
// history — no manual revision insert. Trust state does NOT change: an
// attached report is a signal on the record, not verification.
export async function attachReportToIncident(
  _prev: DeskActionResult | null,
  formData: FormData,
): Promise<DeskActionResult> {
  const gate = await requireDesk();
  if ("error" in gate) return { ok: false, error: gate.error };

  const reportId = Number(formData.get("reportId"));
  const incidentId = String(formData.get("incidentId") ?? "").trim();
  if (!Number.isInteger(reportId)) return { ok: false, error: "Bad report id." };
  if (!incidentId) return { ok: false, error: "Pick an incident to attach to." };

  const sb = getServiceClient();
  const { data: report, error: repErr } = await sb
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .maybeSingle();
  if (repErr) return { ok: false, error: `Could not read report: ${repErr.message}` };
  if (!report) return { ok: false, error: "Report not found." };
  if (!["new", "triaged"].includes(String(report.status))) {
    return { ok: false, error: `Report already decided (status: ${report.status}).` };
  }

  const { data: incident, error: incErr } = await sb
    .from("incidents")
    .select("id, slug, data")
    .eq("id", incidentId)
    .maybeSingle();
  if (incErr) return { ok: false, error: `Could not read incident: ${incErr.message}` };
  if (!incident) return { ok: false, error: `Incident "${incidentId}" not found.` };

  const description = typeof report.description === "string" ? report.description : "";
  const createdDate = String(report.created_at ?? "").slice(0, 10) || todayUTC();
  const evidence: string[] = Array.isArray(report.evidence_urls)
    ? (report.evidence_urls as unknown[]).filter(isHttpUrl)
    : [];

  const prevData =
    incident.data && typeof incident.data === "object"
      ? (incident.data as Record<string, unknown>)
      : {};
  const doc: Record<string, unknown> = { ...prevData };

  // Evidence URLs become community sources, deduped by URL.
  const existingSources = Array.isArray(doc.sources) ? [...doc.sources] : [];
  const knownUrls = new Set(
    existingSources
      .map((s) => (s && typeof s === "object" ? (s as Record<string, unknown>).url : null))
      .filter((u): u is string => typeof u === "string"),
  );
  let added = 0;
  for (const url of evidence) {
    if (knownUrls.has(url)) continue;
    existingSources.push({
      url,
      publisher: "Reader report",
      type: "community",
      date: createdDate,
    });
    knownUrls.add(url);
    added += 1;
  }
  doc.sources = existingSources;

  // Dated timeline entry quoting the report — plain, sourced, honest.
  const excerpt = description.replace(/\s+/g, " ").trim().slice(0, 140);
  const timeline = Array.isArray(doc.timeline) ? [...doc.timeline] : [];
  timeline.push({
    date: todayUTC(),
    event: `Reader report #${reportId} attached: ${excerpt}${
      description.replace(/\s+/g, " ").trim().length > 140 ? "…" : ""
    }`,
    ...(evidence[0] ? { source: evidence[0] } : {}),
  });
  doc.timeline = timeline;

  const nowIso = new Date().toISOString();
  doc.lastUpdated = nowIso;

  // Single update — the 0001 BEFORE UPDATE trigger snapshots the previous
  // doc into incident_revisions; a manual insert would duplicate history.
  const { error: updErr } = await sb
    .from("incidents")
    .update({ data: doc, last_updated: nowIso })
    .eq("id", incidentId);
  if (updErr) return { ok: false, error: `Attach failed: ${updErr.message}` };

  // Accept the report and link it to the incident (undecided reports only).
  const { data: marked, error: markErr } = await sb
    .from("reports")
    .update({ status: "accepted", incident_id: incidentId })
    .eq("id", reportId)
    .in("status", ["new", "triaged"])
    .select("id");

  let credit =
    "Filed anonymously — accounts are for credit, not a gate, so there is no reporter standing to update.";
  if (report.user_id) {
    credit = await refreshStanding(
      gate.actor,
      String(report.user_id),
      `report #${reportId} attached to ${incidentId}`,
    );
  }

  await deskLog(gate.actor, "report-attach", `report:${reportId}`, {
    incidentId,
    sourcesAdded: added,
  });

  revalidateTag("incidents", "max");
  revalidatePath("/", "page");
  if (typeof incident.slug === "string" && incident.slug) {
    revalidatePath(`/scam/${incident.slug}`, "page");
  }

  const sourceNote =
    added > 0
      ? `${added} community source${added === 1 ? "" : "s"} appended`
      : "no new source URLs — timeline entry added";
  return {
    ok: true,
    message:
      `Report #${reportId} attached to ${incidentId} (${sourceNote}). Proof level unchanged — ` +
      `an attached report is a signal to editors, not verification. ${credit}` +
      (markErr || !marked || marked.length === 0
        ? ` (Report row could not be marked accepted${markErr ? `: ${markErr.message}` : ""}.)`
        : ""),
  };
}

// ── acceptChip / rejectChip ────────────────────────────────────────────────
// formData: chipId. Chip decisions are pending → decided, once — the desk
// never silently flips a decision. Accepting credits the contributor's
// standing (5 accepted chips on others' reports → corroborator); rejecting
// credits nothing and demotes no one.
export async function acceptChip(
  _prev: DeskActionResult | null,
  formData: FormData,
): Promise<DeskActionResult> {
  const gate = await requireDesk();
  if ("error" in gate) return { ok: false, error: gate.error };

  const chipId = Number(formData.get("chipId"));
  if (!Number.isInteger(chipId)) return { ok: false, error: "Bad chip id." };

  const sb = getServiceClient();
  const { data: updated, error } = await sb
    .from("evidence_chips")
    .update({ accepted: true })
    .eq("id", chipId)
    .is("accepted", null)
    .select("id, added_by, report_id");
  if (error) {
    return {
      ok: false,
      error: `Chip accept failed: ${error.message} — is migration 0004 applied?`,
    };
  }
  if (!updated || updated.length === 0) {
    return { ok: false, error: "Chip not found or already decided." };
  }

  let credit = "Chip has no signed-in contributor — no standing to update.";
  if (updated[0].added_by) {
    credit = await refreshStanding(
      gate.actor,
      String(updated[0].added_by),
      `chip #${chipId} accepted`,
    );
  }

  await deskLog(gate.actor, "chip-accept", `chip:${chipId}`, {
    reportId: updated[0].report_id,
  });

  return {
    ok: true,
    message: `Chip #${chipId} accepted — evidence for editors, verifies nothing by itself. ${credit}`,
  };
}

export async function rejectChip(
  _prev: DeskActionResult | null,
  formData: FormData,
): Promise<DeskActionResult> {
  const gate = await requireDesk();
  if ("error" in gate) return { ok: false, error: gate.error };

  const chipId = Number(formData.get("chipId"));
  if (!Number.isInteger(chipId)) return { ok: false, error: "Bad chip id." };

  const sb = getServiceClient();
  const { data: updated, error } = await sb
    .from("evidence_chips")
    .update({ accepted: false })
    .eq("id", chipId)
    .is("accepted", null)
    .select("id, report_id");
  if (error) {
    return {
      ok: false,
      error: `Chip reject failed: ${error.message} — is migration 0004 applied?`,
    };
  }
  if (!updated || updated.length === 0) {
    return { ok: false, error: "Chip not found or already decided." };
  }

  await deskLog(gate.actor, "chip-reject", `chip:${chipId}`, {
    reportId: updated[0].report_id,
  });

  return {
    ok: true,
    message: `Chip #${chipId} rejected. Rejection affects no one's standing — the ladder never demotes.`,
  };
}

// ── recomputeLadder ────────────────────────────────────────────────────────
// No formData fields. Resyncs every profile's accepted_reports counter from
// the reports table and applies threshold promotions (reader → reporter →
// corroborator). Watchman and mod are manual; nothing is ever demoted.
export async function recomputeLadder(
  _prev: DeskActionResult | null,
  _formData: FormData,
): Promise<DeskActionResult> {
  const gate = await requireDesk();
  if ("error" in gate) return { ok: false, error: gate.error };

  const sb = getServiceClient();
  const { data: profiles, error: profErr } = await sb
    .from("profiles")
    .select("id, handle, role, accepted_reports")
    .limit(2000);
  if (profErr) {
    return {
      ok: false,
      error: `Could not read profiles: ${profErr.message} — is migration 0002 applied?`,
    };
  }
  if (!profiles || profiles.length === 0) {
    return {
      ok: true,
      message:
        "No profiles yet — nothing to recompute. The ladder starts when accounts open.",
    };
  }

  // Accepted reports per user, counted from the actual table.
  const { data: acceptedRows, error: repErr } = await sb
    .from("reports")
    .select("user_id")
    .eq("status", "accepted")
    .not("user_id", "is", null)
    .limit(10000);
  if (repErr) {
    return { ok: false, error: `Could not count accepted reports: ${repErr.message}` };
  }
  const reportCount = new Map<string, number>();
  for (const r of acceptedRows ?? []) {
    const u = String(r.user_id);
    reportCount.set(u, (reportCount.get(u) ?? 0) + 1);
  }

  // Accepted chips per contributor, on OTHER people's reports only.
  // Tolerates a missing accepted column (migration 0004 not yet applied).
  const chipCount = new Map<string, number>();
  let chipNote = "";
  const { data: chips, error: chipErr } = await sb
    .from("evidence_chips")
    .select("added_by, report_id")
    .eq("accepted", true)
    .not("added_by", "is", null)
    .limit(10000);
  if (chipErr) {
    chipNote = ` Chip counts unavailable (${chipErr.message} — apply migration 0004); report counts still recomputed.`;
  } else if (chips && chips.length > 0) {
    const ids = [...new Set(chips.map((c) => Number(c.report_id)))];
    const { data: owners } = await sb
      .from("reports")
      .select("id, user_id")
      .in("id", ids);
    const ownerOf = new Map(
      (owners ?? []).map((o) => [Number(o.id), o.user_id ? String(o.user_id) : null]),
    );
    for (const c of chips) {
      const u = String(c.added_by);
      if (ownerOf.get(Number(c.report_id)) === u) continue; // own report: no credit
      chipCount.set(u, (chipCount.get(u) ?? 0) + 1);
    }
  }

  let promoted = 0;
  let resynced = 0;
  const promotions: string[] = [];
  for (const p of profiles) {
    const id = String(p.id);
    const current = typeof p.role === "string" ? p.role : "reader";
    const reports = reportCount.get(id) ?? 0;

    if (reports !== Number(p.accepted_reports)) {
      const { error: e } = await sb
        .from("profiles")
        .update({ accepted_reports: reports })
        .eq("id", id);
      if (!e) resynced += 1;
    }

    const target = autoRole(reports, chipCount.get(id) ?? 0);
    if ((ROLE_RANK[target] ?? 0) > (ROLE_RANK[current] ?? 0)) {
      const { error: e } = await sb.from("profiles").update({ role: target }).eq("id", id);
      if (!e) {
        promoted += 1;
        const name =
          (typeof p.handle === "string" && p.handle) || `${id.slice(0, 8)}…`;
        promotions.push(`${name}: ${roleName(current)} → ${roleName(target)}`);
        await deskLog(gate.actor, "promote", `profile:${id}`, {
          from: current,
          to: target,
          reason: "ladder recompute",
        });
      }
    }
  }

  await deskLog(gate.actor, "ladder-recompute", "profiles", {
    profiles: profiles.length,
    promoted,
    resynced,
  });

  return {
    ok: true,
    message:
      `Ladder recomputed over ${profiles.length} profile${profiles.length === 1 ? "" : "s"}: ` +
      `${promoted} promoted${promotions.length > 0 ? ` (${promotions.join("; ")})` : ""}, ` +
      `${resynced} counter${resynced === 1 ? "" : "s"} resynced. Never demotes; ` +
      `watchman and mod stay manual.${chipNote}`,
  };
}
