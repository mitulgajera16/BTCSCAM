import "server-only";

import { createHash } from "node:crypto";

/**
 * Per-instance, in-memory, fixed-window rate limiter.
 *
 * Honest about its limits: state lives in one serverless instance, so this
 * breaks scripted bulk abuse from a single client (the R2 threat model —
 * flooding the report queue, enumerating the mirrored blacklists), not a
 * distributed flood. When a shared store (e.g. Upstash via the Vercel
 * marketplace) is provisioned, swap the Map for it behind the same function.
 *
 * Keys are salted SHA-256 hashes — raw IPs are never held in memory.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED = 5_000;

// Per-process salt: hashes cannot be precomputed against a known IP list.
const SALT = createHash("sha256")
  .update(`${process.pid}:${Date.now()}:${Math.random()}`)
  .digest("hex");

function hashKey(scope: string, key: string): string {
  return createHash("sha256")
    .update(`${SALT}:${scope}:${key}`)
    .digest("base64url")
    .slice(0, 24);
}

function prune(now: number, windowMs: number): void {
  for (const [k, b] of buckets) {
    if (now - b.windowStart >= windowMs) buckets.delete(k);
  }
  // Still full after dropping expired windows: evict oldest insertions so
  // memory stays bounded even under a deliberate key-spray.
  if (buckets.size >= MAX_TRACKED) {
    const overflow = buckets.size - Math.floor(MAX_TRACKED * 0.9);
    let dropped = 0;
    for (const k of buckets.keys()) {
      if (dropped >= overflow) break;
      buckets.delete(k);
      dropped += 1;
    }
  }
}

/**
 * Take one token for (scope, key). Returns true when the call is within
 * `limit` calls per `windowMs`, false when throttled. Never throws.
 */
export function takeToken(
  scope: string,
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const k = hashKey(scope, key);
  const bucket = buckets.get(k);
  if (!bucket || now - bucket.windowStart >= windowMs) {
    if (buckets.size >= MAX_TRACKED) prune(now, windowMs);
    buckets.delete(k);
    buckets.set(k, { count: 1, windowStart: now });
    return true;
  }
  if (bucket.count >= limit) {
    return false;
  }
  bucket.count += 1;
  return true;
}

/**
 * Client key from request headers: first x-forwarded-for hop (set by the
 * platform on Vercel), else x-real-ip, else a shared "unknown" bucket —
 * callers without any address share one generous window rather than
 * bypassing the limit.
 */
export function clientKeyFrom(h: {
  get(name: string): string | null;
}): string {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = h.get("x-real-ip")?.trim();
  return real || "unknown";
}
