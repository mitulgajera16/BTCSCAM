import { NextResponse, type NextRequest } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * The Desk guard (R2). HTTP Basic auth for /desk and everything under it:
 * username "editor", password = ADMIN_KEY env. R3 replaces this with
 * Supabase sessions + role checks.
 *
 * Proxy is deliberately self-contained (no imports from src/) — Next.js
 * advises against relying on shared modules here. The same credential
 * check is repeated inside every server action in src/app/desk/actions.ts,
 * because actions are directly POST-reachable.
 */

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

export function proxy(request: NextRequest) {
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

// :path* matches zero or more segments, so this covers /desk itself as well
// as /desk/anything. Every other route passes untouched.
export const config = {
  matcher: "/desk/:path*",
};
