import { Resend } from "resend";

/**
 * THE RUG REPORT — subscribe endpoint.
 *
 * Vendor: Resend (via Vercel marketplace). In resend v6 "audiences" were
 * renamed to "segments" (`resend.audiences` is a deprecated alias for
 * `resend.segments`), so RESEND_AUDIENCE_ID is used as a segment id.
 *
 * If RESEND_API_KEY is absent we return an honest 503 — Vercel's filesystem
 * is read-only at runtime, so there is no queue file to append to, and we
 * NEVER fake success. The UI falls back to a mailto link.
 */

const AUDIENCE_NAME = "Rug Report";
const MAX_EMAIL_LENGTH = 254;
const EMAIL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
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

  const resend = new Resend(apiKey);

  try {
    const segmentId = await resolveSegmentId(resend);
    const created = await resend.contacts.create({
      email: candidate,
      unsubscribed: false,
      segments: [{ id: segmentId }],
    });

    if (created.error) {
      // A duplicate signup means the reader is already on the list — that is
      // a true "you are subscribed", not a failure.
      if (/already exist/i.test(created.error.message)) {
        return json({ ok: true, already: true });
      }
      console.error("[subscribe] contacts.create failed:", created.error);
      return json(
        {
          ok: false,
          reason: "vendor-error",
          message:
            "The mail provider rejected the signup. Try again in a minute, or email subscribe@btcscam.com.",
        },
        502,
      );
    }

    return json({ ok: true });
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
}
