import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Editor credential check for the desk's server actions.
 *
 * proxy.ts already guards GET/POST to /desk/*, but server actions are
 * plain POST endpoints and must never trust that the proxy ran — every
 * action re-verifies the Authorization header itself. Logic mirrors
 * proxy.ts (kept separate on purpose: Next.js advises proxy code not to
 * rely on shared app modules).
 */

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function verifyEditorAuth(header: string | null): boolean {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return false; // fail closed when unconfigured
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
