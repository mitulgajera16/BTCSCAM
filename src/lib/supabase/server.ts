import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Request-scoped Supabase client carrying the visitor's auth session from
 * cookies. Create one per request — never cache or share across requests
 * (unlike the anon/service clients in src/lib/db.ts, this one holds a
 * specific person's tokens).
 *
 * Env resolution mirrors src/lib/db.ts: the Vercel marketplace integration
 * uses unprefixed names, local setups often the NEXT_PUBLIC_ ones. Guard
 * every call site with hasSupabase() from @/lib/db and degrade honestly.
 *
 * Cookie contract per @supabase/ssr 0.12 (dist/module/types.d.ts): getAll +
 * setAll. Next 16: cookies() is ASYNC — always awaited here.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured (missing SUPABASE_URL / SUPABASE_ANON_KEY). Guard calls with hasSupabase().",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components may not write cookies. Safe to swallow: the
          // session-refresh pass in src/proxy.ts writes refreshed tokens to
          // the response for every account-aware route.
        }
      },
    },
  });
}
