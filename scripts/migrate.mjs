// Applies supabase/migrations/*.sql in order, once each. `npm run db:migrate`
import { readdirSync, readFileSync } from "fs";
import postgres from "postgres";
import { directUrl, sslFor } from "./db-env.mjs";

const url = directUrl();
const sql = postgres(url, { ssl: sslFor(url), max: 1, onnotice: () => {} });
const dir = "supabase/migrations";

try {
  await sql`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
  await sql`alter table schema_migrations enable row level security`;
  const done = new Set((await sql`select name from schema_migrations`).map((r) => r.name));
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  let applied = 0;
  for (const f of files) {
    if (done.has(f)) continue;
    await sql.begin(async (tx) => {
      await tx.unsafe(readFileSync(`${dir}/${f}`, "utf8"));
      await tx`insert into schema_migrations (name) values (${f})`;
    });
    console.log(`applied ${f}`);
    applied++;
  }
  console.log(applied ? `${applied} migration(s) applied.` : "Up to date.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
