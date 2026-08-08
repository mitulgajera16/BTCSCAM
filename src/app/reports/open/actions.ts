"use server";

import { revalidatePath } from "next/cache";
import { getServiceClient } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { ActionResult } from "@/components/ui";

// ── The Open Ledger: verify-vote actions ───────────────────────────────────
// Editorial law enforced here, not in the UI:
//   · votes are signals TO editors — nothing in this file touches an
//     incident's trust state, a report's status, or anything an editor owns
//   · CORROBORATE requires evidence a human can check; DISPUTE requires words
//   · one stance per watcher per report — unique(report_id, user_id)
// Server actions are directly POST-reachable, so the session AND the ladder
// role are re-verified on every call via requireRole, which reads the role
// from public.profiles with the SERVICE client — never from client input —
// and fails closed when Supabase or the service key is absent.

const MAX_EVIDENCE_URL = 500;
const MIN_NOTE = 20;
const MAX_NOTE = 2000;

function isHttpUrl(u: string): boolean {
  try {
    const p = new URL(u);
    return p.protocol === "http:" || p.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * formData: reportId, stance ∈ {corroborate, dispute},
 * evidenceUrl (required for corroborate), note (required for dispute).
 */
export async function castVote(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  // Re-verify session + role server-side on every call. Fails closed without
  // Supabase env or service credentials, so getServiceClient() below is safe.
  const gate = await requireRole("corroborator");
  if (!gate.ok) return { ok: false, error: gate.error };

  const reportId = Number(formData.get("reportId"));
  if (!Number.isInteger(reportId) || reportId <= 0) {
    return { ok: false, error: "Bad report id." };
  }

  const stance = String(formData.get("stance") ?? "").trim();
  if (stance !== "corroborate" && stance !== "dispute") {
    return { ok: false, error: "Stance must be corroborate or dispute." };
  }

  let evidenceUrl: string | null = null;
  let note: string | null = null;
  if (stance === "corroborate") {
    evidenceUrl = String(formData.get("evidenceUrl") ?? "").trim();
    if (!evidenceUrl) {
      return {
        ok: false,
        error:
          "CORROBORATE requires evidence — a URL an editor can check. No link, no stance.",
      };
    }
    if (evidenceUrl.length > MAX_EVIDENCE_URL) {
      return {
        ok: false,
        error: `Evidence URL too long (max ${MAX_EVIDENCE_URL} characters).`,
      };
    }
    if (!isHttpUrl(evidenceUrl)) {
      return { ok: false, error: "Evidence must be a valid http(s) URL." };
    }
  } else {
    note = String(formData.get("note") ?? "").trim();
    if (note.length < MIN_NOTE) {
      return {
        ok: false,
        error: `DISPUTE requires a note of at least ${MIN_NOTE} characters — say what does not hold up.`,
      };
    }
    if (note.length > MAX_NOTE) {
      return {
        ok: false,
        error: `Dispute note too long (max ${MAX_NOTE} characters).`,
      };
    }
  }

  const sb = getServiceClient();

  // Stances attach only to undecided reports; once the editors rule, the
  // ledger entry closes.
  const { data: report, error: repErr } = await sb
    .from("reports")
    .select("id, status, user_id")
    .eq("id", reportId)
    .maybeSingle();
  if (repErr) {
    return { ok: false, error: `Could not read report: ${repErr.message}` };
  }
  if (!report) return { ok: false, error: "Report not found." };
  if (!["new", "triaged"].includes(String(report.status))) {
    return {
      ok: false,
      error:
        "This report has been decided — stances close once the editors rule.",
    };
  }
  // No stance on your own report: corroboration only counts when it is
  // independent, and a self-dispute is a signal the desk cannot read.
  // Enforced here AND in the verify_votes insert policy (migration 0002),
  // so the browser-key path is closed too.
  if (report.user_id != null && String(report.user_id) === gate.user.id) {
    return {
      ok: false,
      error:
        "You cannot corroborate or dispute your own report — stances must be independent. Your report speaks for itself; the editors read it as filed.",
    };
  }

  const { error: insErr } = await sb.from("verify_votes").insert({
    report_id: reportId,
    user_id: gate.user.id,
    stance,
    evidence_url: evidenceUrl,
    note,
  });
  if (insErr) {
    // 23505 = unique_violation on unique(report_id, user_id).
    if (insErr.code === "23505") {
      return {
        ok: false,
        error:
          "You already weighed in on this report — one stance per watcher, and it stands.",
      };
    }
    return { ok: false, error: `Stance not recorded: ${insErr.message}` };
  }

  revalidatePath("/reports/open", "page");

  return {
    ok: true,
    message:
      stance === "corroborate"
        ? `Corroboration filed on report #${reportId}. It is a signal to the editors — verification stays editorial.`
        : `Dispute filed on report #${reportId}. It is a signal to the editors — verification stays editorial.`,
  };
}
