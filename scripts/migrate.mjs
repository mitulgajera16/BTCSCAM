// Applies supabase/migrations/*.sql in filename order over the direct
// (non-pooled) connection. Idempotent-safe: the migrations themselves use
// create-if-not-exists / drop-policy-if-exists patterns.
// Run: node --env-file=.env.local scripts/migrate.mjs
import { readdirSync, readFileSync } from "node:fs";
import postgres from "postgres";

const url = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL;
if (!url) {
  console.error("No POSTGRES_URL_NON_POOLING / POSTGRES_URL in env");
  process.exit(1);
}
const sql = postgres(url, { max: 1, prepare: false });
const files = readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql")).sort();
try {
  for (const f of files) {
    const body = readFileSync(`supabase/migrations/${f}`, "utf8");
    process.stdout.write(`applying ${f} ... `);
    await sql.unsafe(body);
    console.log("ok");
  }
} catch (e) {
  console.error("\nFAILED:", e.message);
  process.exit(1);
} finally {
  await sql.end();
}
console.log("all migrations applied");
