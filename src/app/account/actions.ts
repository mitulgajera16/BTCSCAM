"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServiceClient, hasServiceRole, hasSupabase } from "@/lib/db";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchProfile, getSessionUser } from "@/components/account/auth";
import { canEditHandle, validateHandle } from "@/components/account/handle";
import type { AccountActionResult } from "@/components/account/types";

// ── My Desk server actions ─────────────────────────────────────────────────
// Server actions are directly POST-reachable endpoints. Every action below
// re-verifies the session server-side (auth.getUser(), which validates the
// JWT) before touching data, and writes only to the verified user's own row
// via the service client — nothing here trusts a client-supplied identity.

/** Verified session or an honest refusal. */
async function requireUser(): Promise<{ uid: string } | { error: string }> {
  if (!hasSupabase()) {
    return {
      error:
        "Accounts are not open yet — the database is not connected. Nothing was saved.",
    };
  }
  const user = await getSessionUser();
  if (!user) {
    return {
      error:
        "You are not signed in — your session is missing or has expired. Sign in again at /account/sign-in.",
    };
  }
  // Every write below goes through the service client. Without the service
  // key it would throw — fail closed with words instead, the same honest
  // state /account renders ("Signed in — your records are not").
  if (!hasServiceRole()) {
    return {
      error:
        "You are signed in, but the server connection behind your records is not set up — nothing can be saved right now. Nothing was lost; try again when the connection is back.",
    };
  }
  return { uid: user.id };
}

// ── signOut ────────────────────────────────────────────────────────────────
// The one exit. Needed for its own sake, and because a Supabase session
// cookie makes /desk skip the Basic-auth challenge (src/proxy.ts) — the desk
// page then 404s any non-mod session, so without this action an editor
// signed in as a reader would be locked out of Basic auth until they cleared
// cookies by hand. Requires only the anon env: it must work even when the
// service key is absent, and even when the auth server is unreachable.
export async function signOut(): Promise<void> {
  if (hasSupabase()) {
    try {
      const supabase = await getSupabaseServerClient();
      // Revokes the refresh token and clears the auth cookies via setAll.
      await supabase.auth.signOut();
    } catch {
      // Auth server unreachable — the cookie sweep below still signs this
      // browser out locally.
    }
    // Belt and braces: drop any surviving Supabase auth cookies (including
    // chunked ones, sb-…-auth-token.0/.1) so the sign-out always lands.
    const cookieStore = await cookies();
    for (const { name } of cookieStore.getAll()) {
      if (name.startsWith("sb-") && name.includes("-auth-token")) {
        cookieStore.delete(name);
      }
    }
  }
  redirect("/");
}

// ── dismissOnboarding ──────────────────────────────────────────────────────
// Marks the WELCOME TO THE DESK panel read. One-way: there is no un-read.
export async function dismissOnboarding(
  _prev: AccountActionResult | null,
  _formData: FormData,
): Promise<AccountActionResult> {
  const auth = await requireUser();
  if ("error" in auth) return { ok: false, error: auth.error };

  const sb = getServiceClient();
  const { error } = await sb
    .from("profiles")
    .update({ onboarded: true })
    .eq("id", auth.uid);
  if (error) {
    return { ok: false, error: `Could not save: ${error.message}` };
  }
  revalidatePath("/account");
  return { ok: true, message: "Rules read. The desk is yours." };
}

// ── updateHandle ───────────────────────────────────────────────────────────
// A handle changes ONCE. Enforced server-side by shape: the update runs only
// while the stored handle is unset or still matches the auto-issued pattern
// (name-x0000). Client state is irrelevant — the stored row decides.
export async function updateHandle(
  _prev: AccountActionResult | null,
  formData: FormData,
): Promise<AccountActionResult> {
  const auth = await requireUser();
  if ("error" in auth) return { ok: false, error: auth.error };

  const handle = String(formData.get("handle") ?? "")
    .trim()
    .toLowerCase();
  const invalid = validateHandle(handle);
  if (invalid) return { ok: false, error: invalid };

  const profile = await fetchProfile(auth.uid);
  if (!profile) {
    return {
      ok: false,
      error:
        "Your profile has not been created yet — reload /account once and try again.",
    };
  }
  if (!canEditHandle(profile.handle)) {
    return {
      ok: false,
      error: `Your handle is already set to "${profile.handle}". Handles change once, and that change has been made.`,
    };
  }
  if (handle === profile.handle) {
    return { ok: false, error: "That is already your handle." };
  }

  const sb = getServiceClient();
  const { error } = await sb
    .from("profiles")
    .update({ handle })
    .eq("id", auth.uid);
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: `"${handle}" is taken — pick another.` };
    }
    return { ok: false, error: `Could not save: ${error.message}` };
  }
  revalidatePath("/account");
  return {
    ok: true,
    message: `You are ${handle}. That is the name on your work — it does not change again.`,
  };
}

// ── toggleCredit ───────────────────────────────────────────────────────────
// Named credit on dossiers you corroborate: on or off, changeable anytime.
// Off never erases the ledger — the work still counts toward the ladder.
export async function toggleCredit(
  _prev: AccountActionResult | null,
  formData: FormData,
): Promise<AccountActionResult> {
  const auth = await requireUser();
  if ("error" in auth) return { ok: false, error: auth.error };

  const next = String(formData.get("show") ?? "") === "on";

  const sb = getServiceClient();
  const { error } = await sb
    .from("profiles")
    .update({ show_credit: next })
    .eq("id", auth.uid);
  if (error) {
    return { ok: false, error: `Could not save: ${error.message}` };
  }
  revalidatePath("/account");
  return {
    ok: true,
    message: next
      ? "Named credit ON — work we accept from you may carry your handle on case files."
      : "Named credit OFF — you contribute with no name attached. The work still counts on the ladder.",
  };
}
