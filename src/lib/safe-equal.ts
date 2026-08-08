import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Constant-time string comparison for secrets. Hashing first equalizes
 * length, so timingSafeEqual never throws on a length mismatch and the
 * comparison leaks nothing. Same pattern as the desk's Basic-auth check
 * (src/components/desk/auth.ts and src/proxy.ts — both deliberately keep
 * their own copies: proxy code must not depend on app modules, and the
 * auth module documents its independence from the proxy).
 */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}
