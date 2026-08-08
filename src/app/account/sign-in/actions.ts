"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasSupabase } from "@/lib/db";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { clientKeyFrom, takeToken } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";

// ── Magic-link sign-in (the only door) ─────────────────────────────────────
// No passwords, no OAuth: signInWithOtp sends a one-time email link that
// lands on /auth/callback. The form posts here without any client JS; state
// travels back as ?sent=1 / ?error=<code> query params, which the page maps
// to copy — so the flow works with JavaScript disabled.
//
// Server actions are directly POST-reachable: everything is re-validated
// here (email shape, rate limits, Supabase presence) regardless of what the
// page rendered.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Where the magic link should land. Production uses the canonical SITE_URL
 * (never the Host header — a spoofed Host must not steer sign-in links);
 * dev uses the actual localhost origin so the link works locally. Supabase
 * additionally enforces its own redirect-URL allow-list server-side.
 */
function callbackOrigin(h: Headers): string {
  if (process.env.NODE_ENV === "development") {
    const host = h.get("host");
    if (host) return `http://${host}`;
  }
  return SITE_URL;
}

export async function requestMagicLink(formData: FormData): Promise<void> {
  if (!hasSupabase()) redirect("/account/sign-in?error=not-configured");

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    redirect("/account/sign-in?error=invalid-email");
  }

  const h = await headers();
  // Per-client and per-address windows: breaks scripted mail-bombing from
  // one client without punishing a shared office IP too hard.
  if (
    !takeToken("sign-in:ip", clientKeyFrom(h), 6, 10 * 60_000) ||
    !takeToken("sign-in:email", email, 3, 10 * 60_000)
  ) {
    redirect("/account/sign-in?error=rate-limited");
  }

  let failed = false;
  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${callbackOrigin(h)}/auth/callback`,
      },
    });
    failed = Boolean(error);
  } catch {
    failed = true;
  }
  // redirect() throws internally — kept outside the try so it is never
  // swallowed by the catch above.
  redirect(failed ? "/account/sign-in?error=send-failed" : "/account/sign-in?sent=1");
}
