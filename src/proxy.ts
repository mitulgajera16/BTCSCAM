import { NextResponse, type NextRequest } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { createServerClient } from "@supabase/ssr";

/**
 * Two independent jobs, split by path:
 *
 * 1. The Desk guard. HTTP Basic auth for /desk and everything under it:
 *    username "editor", password = ADMIN_KEY env. It works with or without
 *    Supabase. R3 addition: requests carrying a Supabase session cookie
 *    pass through instead — the desk page itself re-verifies the session
 *    and requires role = 'mod' (404 otherwise), so the cookie only skips
 *    the Basic challenge, never grants access.
 *
 * 2. Session refresh (R3). For account-aware routes, the @supabase/ssr
 *    middleware pattern (getAll/setAll) refreshes expired auth tokens and
 *    writes them back to both the forwarded request and the response —
 *    Server Components can read cookies but never write them, so without
 *    this pass sessions would silently die. Runs ONLY when Supabase env
 *    exists; without it every non-desk route passes through untouched.
 *
 * Proxy is deliberately self-contained (no imports from src/) — Next.js
 * advises against relying on shared app modules here. The same Basic-auth
 * check is repeated inside every server action in src/app/desk/actions.ts,
 * and account actions re-verify sessions via src/lib/auth.ts, because
 * actions are directly POST-reachable and must never trust that the proxy
 * ran.
 */

// ── The Desk guard (R2) — unchanged ────────────────────────────────────────

// Constant-time comparison. Hashing first equalizes length so
// timingSafeEqual never throws on length mismatch and leaks nothing.
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function isAuthorized(header: string | null, adminKey: string): boolean {
  if (!header || !header.startsWith("Basic ")) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6).trim(), "base64").toString("utf8");
  } catch {
    return false;
  }
  const sep = decoded.indexOf(":");
  if (sep < 0) return false;
  const user = decoded.slice(0, sep);
  const pass = decoded.slice(sep + 1);
  return safeEqual(user, "editor") && safeEqual(pass, adminKey);
}

function deskGuard(request: NextRequest): NextResponse {
  const adminKey = process.env.ADMIN_KEY;

  // No key configured: fail closed, and say so in plain language instead of
  // presenting a login prompt that can never succeed.
  if (!adminKey) {
    return new NextResponse(
      "The Desk is not available: ADMIN_KEY is not set in this environment.",
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  if (isAuthorized(request.headers.get("authorization"), adminKey)) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="BTCSCAM Desk", charset="UTF-8"',
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

// ── Session refresh (R3) ───────────────────────────────────────────────────

async function refreshSession(request: NextRequest): Promise<NextResponse> {
  // Env variants mirror src/lib/db.ts (not imported — see header comment).
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase not provisioned: zero behavior change — pass straight through.
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Per @supabase/ssr middleware guidance: write refreshed cookies to
        // the forwarded request (so this render sees them), rebuild the
        // response from it, then write them to the response (so the browser
        // keeps them) along with the no-store cache headers the library
        // mandates for responses that set auth cookies.
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [headerName, headerValue] of Object.entries(headers)) {
          response.headers.set(headerName, headerValue);
        }
      },
    },
  });

  // Touch the session early so any token refresh happens here, where cookies
  // CAN be written. The result is deliberately unused: authorization lives in
  // pages and actions (src/lib/auth.ts), never in the proxy.
  await supabase.auth.getUser();

  return response;
}

// ── Entry ──────────────────────────────────────────────────────────────────

/**
 * True when Supabase is configured AND the request carries a Supabase auth
 * cookie. Cookie presence proves nothing about identity — it only decides
 * whether a /desk request may pass through to the page, which re-verifies
 * the session against the auth server and requires role = 'mod' from
 * profiles (via the service client), 404ing otherwise. Without Supabase
 * env this is always false and the R2 Basic-auth gate is unchanged.
 */
function hasSupabaseSessionCookie(request: NextRequest): boolean {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  return request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/desk" || pathname.startsWith("/desk/")) {
    // Editor Basic auth (R2) short-circuits first — works with or without
    // Supabase.
    const adminKey = process.env.ADMIN_KEY;
    if (
      adminKey &&
      isAuthorized(request.headers.get("authorization"), adminKey)
    ) {
      return NextResponse.next();
    }
    // Signed-in path (R3): a session cookie earns pass-through, never
    // access — the desk page's own mod gate decides. Refresh the session
    // en route so mod sessions do not silently expire at the desk.
    // KNOWN TRADE-OFF: while a session cookie is present, /desk never
    // issues the Basic challenge, and the desk page 404s non-mod sessions
    // — an editor signed in as a reader must SIGN OUT at /account (the
    // signOut action clears the sb-* cookies) to get the challenge back.
    if (hasSupabaseSessionCookie(request)) {
      return refreshSession(request);
    }
    // Anonymous (or bad Basic credentials): challenge / fail closed.
    return deskGuard(request);
  }
  return refreshSession(request);
}

// :path* matches zero or more segments, so "/desk/:path*" covers /desk
// itself as well as /desk/anything. The R3 entries are the account-aware
// surfaces: My Desk + sign-in, the auth callback, the report flow (signed-in
// path), and the open-reports queue. Every other route passes untouched —
// add a matcher entry when a new route starts reading the session.
export const config = {
  matcher: [
    "/desk/:path*",
    "/account/:path*",
    "/auth/:path*",
    "/report/:path*",
    "/reports/:path*",
  ],
};
