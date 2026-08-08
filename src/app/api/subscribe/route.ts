import { Resend } from "resend";

/**
 * THE RUG REPORT — subscribe endpoint. Provider-agnostic by decision
 * (2026-08-08 provider research): EmailOctopus is the primary vendor
 * (free to 2,500 contacts / 10,000 emails per month, and double opt-in
 * applies to API-added contacts), with Resend as the drop-in fallback
 * while EmailOctopus account review clears, and an honest 503 when
 * neither is configured — we NEVER fake success.
 *
 * Provider selection at request time:
 *   1. EMAILOCTOPUS_API_KEY + EMAILOCTOPUS_LIST_ID  → EmailOctopus
 *   2. RESEND_API_KEY                               → Resend segments
 *   3. neither                                      → 503 + mailto fallback
 */

const AUDIENCE_NAME = "Rug Report";
const MAX_EMAIL_LENGTH = 254;
const EMAIL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

const VENDOR_FAIL = {
  ok: false,
  reason: "vendor-error",
  message:
    "The mail provider rejected the signup. Try again in a minute, or email subscribe@btcscam.com.",
};

// ── EmailOctopus (primary) ─────────────────────────────────────────────────

async function subscribeViaEmailOctopus(
  apiKey: string,
  listId: string,
  email: string,
): Promise<Response> {
  // API v2: PUT upserts a contact into the list. status "pending" triggers
  // the double-opt-in confirmation email when DOI is enabled on the list.
  const res = await fetch(
    `https://api.emailoctopus.com/lists/${encodeURIComponent(listId)}/contacts`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "BTCSCAM/1.0 (contact@btcscam.com)",
      },
      body: JSON.stringify({ email_address: email, status: "pending" }),
    },
  );

  if (res.ok) return json({ ok: true, doubleOptIn: true });

  const body = await res.text();
  // 409 / already-exists means the reader is already on the list — a true
  // "you are subscribed", not a failure.
  if (res.status === 409 || /exists/i.test(body)) {
    return json({ ok: true, already: true });
  }
  console.error("[subscribe] emailoctopus failed:", res.status, body.slice(0, 300));
  return json(VENDOR_FAIL, 502);
}

// ── Resend (fallback) ──────────────────────────────────────────────────────

async function resolveSegmentId(resend: Resend): Promise<string> {
  const configured = process.env.RESEND_AUDIENCE_ID;
  if (configured) return configured;

  const listed = await resend.segments.list();
  if (listed.error) {
    throw new Error(`segments.list failed: ${listed.error.message}`);
  }
  // Only the segment actually named after the newsletter may capture
  // signups — never whatever segment the account happens to list first.
  const match = listed.data.data.find((s) => s.name === AUDIENCE_NAME);
  if (match) return match.id;

  const created = await resend.segments.create({ name: AUDIENCE_NAME });
  if (created.error) {
    throw new Error(`segments.create failed: ${created.error.message}`);
  }
  return created.data.id;
}

async function subscribeViaResend(
  apiKey: string,
  email: string,
): Promise<Response> {
  const resend = new Resend(apiKey);
  const segmentId = await resolveSegmentId(resend);
  const created = await resend.contacts.create({
    email,
    unsubscribed: false,
    segments: [{ id: segmentId }],
  });

  if (created.error) {
    if (/already exist/i.test(created.error.message)) {
      return json({ ok: true, already: true });
    }
    console.error("[subscribe] contacts.create failed:", created.error);
    return json(VENDOR_FAIL, 502);
  }
  return json({ ok: true });
}

// ── Handler ────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json(
      {
        ok: false,
        reason: "invalid-body",
        message: 'Send a JSON body: { "email": "you@example.com" }.',
      },
      400,
    );
  }

  const candidate =
    typeof raw === "object" &&
    raw !== null &&
    "email" in raw &&
    typeof (raw as { email: unknown }).email === "string"
      ? (raw as { email: string }).email.trim().toLowerCase()
      : "";

  if (
    !candidate ||
    candidate.length > MAX_EMAIL_LENGTH ||
    !EMAIL_RE.test(candidate)
  ) {
    return json(
      {
        ok: false,
        reason: "invalid-email",
        message: "That does not look like a valid email address.",
      },
      400,
    );
  }

  const octopusKey = process.env.EMAILOCTOPUS_API_KEY;
  const octopusList = process.env.EMAILOCTOPUS_LIST_ID;
  const resendKey = process.env.RESEND_API_KEY;

  try {
    if (octopusKey && octopusList) {
      return await subscribeViaEmailOctopus(octopusKey, octopusList, candidate);
    }
    if (resendKey) {
      return await subscribeViaResend(resendKey, candidate);
    }
  } catch (err) {
    console.error("[subscribe] unexpected failure:", err);
    return json(
      {
        ok: false,
        reason: "vendor-error",
        message:
          "The mail provider could not be reached. Try again in a minute, or email subscribe@btcscam.com.",
      },
      502,
    );
  }

  return json(
    {
      ok: false,
      reason: "not-configured",
      message:
        "Signups are not connected to the mail provider yet. Email subscribe@btcscam.com and a human will add you.",
    },
    503,
  );
}