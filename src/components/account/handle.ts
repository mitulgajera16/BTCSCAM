/**
 * Handle rules — shared by the settings form (client) and the server actions
 * that actually enforce them. No Node imports: client components consume this.
 *
 * The auth callback issues every new profile a default handle shaped
 * `{email prefix}-x{4 hex}` (e.g. "mitul-x3f2a"). A handle stays editable
 * ONLY while it is unset or still matches that issued shape — one change,
 * then it is fixed. Custom handles that would collide with the issued shape
 * are rejected, so the one-change rule stays enforceable by pattern alone.
 */

export const HANDLE_MIN = 3;
export const HANDLE_MAX = 24;

/** Shape of an auto-issued default handle: bare prefix + "-x" + 4 hex chars. */
export const DEFAULT_HANDLE_RE = /^[a-z0-9]{1,12}-x[0-9a-f]{4}$/;

/** True while the handle may still be chosen (unset, or still the issued default). */
export function canEditHandle(handle: string | null | undefined): boolean {
  return !handle || DEFAULT_HANDLE_RE.test(handle);
}

/** Default handle for a fresh profile: email prefix, sanitized, + random hex tail. */
export function generateDefaultHandle(email: string | null | undefined): string {
  const prefix =
    (email ?? "")
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 12) || "reader";
  let suffix = "";
  for (let i = 0; i < 4; i += 1) {
    suffix += "0123456789abcdef"[Math.floor(Math.random() * 16)];
  }
  return `${prefix}-x${suffix}`;
}

// Impersonation guard. Substring hits are blocked outright; short words that
// occur inside ordinary handles ("mod" in "modest") are blocked only as a
// whole hyphen-delimited segment.
const RESERVED_SUBSTRINGS = [
  "admin",
  "btcscam",
  "moderator",
  "editor",
  "official",
  "staff",
  "support",
  "watchman",
];
const RESERVED_SEGMENTS = ["mod"];

/** Returns a human-readable problem, or null when the handle is acceptable. */
export function validateHandle(handle: string): string | null {
  if (handle.length < HANDLE_MIN || handle.length > HANDLE_MAX) {
    return `Handles are ${HANDLE_MIN}–${HANDLE_MAX} characters.`;
  }
  if (!/^[a-z0-9-]+$/.test(handle)) {
    return "Lowercase letters, digits, and hyphens only.";
  }
  if (handle.startsWith("-") || handle.endsWith("-") || handle.includes("--")) {
    return "No leading, trailing, or doubled hyphens.";
  }
  const hit = RESERVED_SUBSTRINGS.find((w) => handle.includes(w));
  if (hit) {
    return `"${hit}" is reserved — pick a handle that cannot be mistaken for staff.`;
  }
  if (handle.split("-").some((seg) => RESERVED_SEGMENTS.includes(seg))) {
    return `"mod" is reserved — pick a handle that cannot be mistaken for staff.`;
  }
  if (DEFAULT_HANDLE_RE.test(handle)) {
    return "That matches the shape of an auto-issued handle (name-x0000). Pick one that reads as chosen.";
  }
  return null;
}
