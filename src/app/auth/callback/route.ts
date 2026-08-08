import { NextResponse, type NextRequest } from "next/server";
import { hasServiceRole, hasSupabase } from "@/lib/db";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/components/account/auth";

// ── Magic-link landing ─────────────────────────────────────────────────────
// The email link points at Supabase's /auth/v1/verify, which redirects here
// with ?code=… (PKCE). We exchange the code for a session (cookies written
// by the @supabase/ssr client via next/headers cookies()), make sure a
// profiles row exists, and hand the visitor to /account. Every failure path
// lands back on the sign-in page with an error CODE — no reflected text.

/** Same-site relative paths only — never an open redirect. */
function safeNext(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("\\")) {
    return raw;
  }
  return "/account";
}

// First sign-in bookkeeping lives in ensureProfile() (imported from
// @/components/account/auth): it creates the profiles row if missing, with a
// default handle from generateDefaultHandle() — the ONE implementation of
// the issued-handle shape ({email prefix}-x{4 hex}). The edit-once handle
// rule is enforced by that shape (DEFAULT_HANDLE_RE), so the callback must
// never mint handles of its own. Role starts at 'reader' via the column
// default; the ladder is climbed by accepted contributions, never at signup.
// Row creation is service_role-only under RLS (0002), so it is skipped when
// the service key is absent — the account page copes honestly (and calls the
// same idempotent ensureProfile itself on first render).

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const toSignIn = (code: string) =>
    NextResponse.redirect(new URL(`/account/sign-in?error=${code}`, url.origin));

  if (!hasSupabase()) return toSignIn("not-configured");

  const code = url.searchParams.get("code");
  if (!code) {
    // Supabase reports link problems as ?error=…&error_description=… — an
    // expired or reused link is the common case.
    const authFailed = url.searchParams.has("error") || url.searchParams.has("error_description");
    return toSignIn(authFailed ? "link-expired" : "missing-code");
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return toSignIn("link-expired");

  if (hasServiceRole()) await ensureProfile(data.user);

  return NextResponse.redirect(
    new URL(safeNext(url.searchParams.get("next")), url.origin),
  );
}
