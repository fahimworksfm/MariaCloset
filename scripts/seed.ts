// One-time seed for a fresh database. `npm run db:seed`
//
// Seeds pieces and the lookbook from src/data/items.ts and src/data/lookbook.ts.
// Runs once: it records a "seed" marker in schema_migrations and skips on later
// runs (so deleted pieces never come back). `npm run db:seed -- --force` re-runs
// it; even then existing rows are left alone (insert … on conflict do nothing).
import postgres from "postgres";
import { items } from "../src/data/items";
import { lookbook } from "../src/data/lookbook";
import { directUrl, sslFor } from "./db-env.mjs";

const url: string = directUrl();
const sql = postgres(url, { ssl: sslFor(url), max: 1, onnotice: () => {} });

async function main() {
  const [marker] = await sql`select 1 from schema_migrations where name = 'seed'`;
  if (marker && !process.argv.includes("--force")) {
    console.log("Already seeded — skipping (use --force to re-run).");
    return;
  }

  let pieces = 0;
  for (const [i, it] of items.entries()) {
    pieces += (
      await sql`
        insert into items (id, name, category, brand, size, color, occasions, price_per_day, retail_value,
                           description, details, image, video, frames, fit, closet, accent, unavailable, sort_order)
        values (${it.id}, ${it.name}, ${it.category ?? ""}, ${it.brand ?? null}, ${it.size ?? ""}, ${it.color ?? ""},
                ${it.occasions ?? null}, ${it.pricePerDay ?? 0}, ${it.retailValue ?? null}, ${it.description ?? ""},
                ${it.details ?? null}, ${it.image}, ${it.video ?? null}, ${it.frames ?? null},
                ${it.fit ? sql.json(it.fit) : null}, ${it.closet || null}, ${it.accent},
                ${sql.json(it.unavailable ?? [])}, ${it.closet ? 1000 + i : i})
        on conflict (id) do nothing`
    ).count;
  }

  const ids = new Set((await sql<{ id: string }[]>`select id from items`).map((r) => r.id));
  let tiles = 0;
  for (const [i, e] of lookbook.entries()) {
    tiles += (
      await sql`
        insert into lookbook (id, kicker, title, caption, accent, image, video, item_id, closet, sort_order)
        values (${e.id}, ${e.kicker ?? ""}, ${e.title ?? ""}, ${e.caption ?? ""}, ${e.accent}, ${e.image || null},
                ${e.video || null}, ${e.itemId && ids.has(e.itemId) ? e.itemId : null}, ${e.closet || null}, ${i})
        on conflict (id) do nothing`
    ).count;
  }

  await sql`insert into schema_migrations (name) values ('seed') on conflict do nothing`;
  console.log(`Seeded ${pieces} piece(s) and ${tiles} lookbook tile(s).`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
