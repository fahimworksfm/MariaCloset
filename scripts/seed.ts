// One-time seed + import into Supabase. `npm run db:seed`
//
// 1. If BLOB_READ_WRITE_TOKEN is set (it is after `vercel env pull` while the old
//    Blob store is still connected), imports the live site's data/*.json from
//    Vercel Blob and copies every uploaded image/video into the Supabase "media"
//    bucket, rewriting the URLs.
// 2. Otherwise (or for anything Blob doesn't have) seeds pieces and the lookbook
//    from src/data/items.ts and src/data/lookbook.ts.
//
// Runs once: it records a "seed" marker in schema_migrations and skips on later
// runs (so deleted pieces never come back). `npm run db:seed -- --force` re-runs
// it; even then existing rows are left alone (insert … on conflict do nothing).
import { randomUUID } from "crypto";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import { items as seedItems } from "../src/data/items";
import { lookbook as seedLookbook, type LookEntry } from "../src/data/lookbook";
import type { CreditEntry, GiftCard, Item, Owner, Referral, RentRequest, Review, WaitlistEntry } from "../src/lib/types";
import { directUrl, sslFor } from "./db-env.mjs";

const url: string = directUrl();
const sql = postgres(url, { ssl: sslFor(url), max: 1, onnotice: () => {} });

/* ------------------------------------------------------------ Vercel Blob */

const blobToken =
  process.env.BLOB_READ_WRITE_TOKEN ||
  Object.entries(process.env).find(([k]) => k.endsWith("_READ_WRITE_TOKEN"))?.[1];

async function blobJson<T>(name: string): Promise<T | null> {
  if (!blobToken) return null;
  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: `data/${name}`, limit: 5, token: blobToken });
  const hit = blobs.find((b) => b.pathname === `data/${name}`);
  if (!hit) return null;
  const res = await fetch(hit.url, { cache: "no-store" });
  return res.ok ? ((await res.json()) as T) : null;
}

/* ------------------------------------------------------------- media copy */

const sbUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const bucket = sbUrl && sbKey ? createClient(sbUrl, sbKey, { auth: { persistSession: false } }).storage.from("media") : null;
const copied = new Map<string, string>();

/** Copy a Vercel Blob file into Supabase Storage; other URLs pass through. */
async function moveMedia(src: string | undefined, folder: string): Promise<string | undefined> {
  if (!src || !/\.blob\.vercel-storage\.com\//.test(src) || !bucket) return src;
  if (copied.has(src)) return copied.get(src);
  const res = await fetch(src);
  if (!res.ok) {
    console.warn(`  ! couldn't download ${src} (${res.status}) — keeping the old URL`);
    return src;
  }
  const type = res.headers.get("content-type") || "application/octet-stream";
  const ext = new URL(src).pathname.split(".").pop() || "bin";
  const path = `${folder}/${randomUUID()}.${ext}`;
  const { error } = await bucket.upload(path, Buffer.from(await res.arrayBuffer()), { contentType: type });
  if (error) {
    console.warn(`  ! couldn't upload ${src}: ${error.message} — keeping the old URL`);
    return src;
  }
  const out = bucket.getPublicUrl(path).data.publicUrl;
  copied.set(src, out);
  return out;
}

/* ------------------------------------------------------------------- run */

async function main() {
  const [marker] = await sql`select 1 from schema_migrations where name = 'seed'`;
  if (marker && !process.argv.includes("--force")) {
    console.log("Already seeded — skipping (use --force to re-run).");
    return;
  }
  console.log(blobToken ? "Importing from Vercel Blob…" : "No Blob token — seeding from src/data only.");
  if (blobToken && !bucket) console.warn("  ! SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing — media won't be copied.");

  const items = (await blobJson<Item[]>("items.json")) ?? seedItems;
  const looks = (await blobJson<LookEntry[]>("lookbook.json")) ?? seedLookbook;
  const requests = (await blobJson<RentRequest[]>("requests.json")) ?? [];
  const owners = (await blobJson<Owner[]>("owners.json")) ?? [];
  const reviews = (await blobJson<Review[]>("reviews.json")) ?? [];
  const waitlist = (await blobJson<WaitlistEntry[]>("waitlist.json")) ?? [];
  const gifts = (await blobJson<GiftCard[]>("giftcards.json")) ?? [];
  const referrals = (await blobJson<Referral[]>("referrals.json")) ?? [];
  const credits = (await blobJson<CreditEntry[]>("credits.json")) ?? [];
  const saves = (await blobJson<Record<string, number>>("saves.json")) ?? {};

  const count = async (q: Promise<{ count: number }>) => (await q).count;
  const done: Record<string, number> = {};

  // Pieces (list order → sort_order).
  done.items = 0;
  for (const [i, it] of items.entries()) {
    const image = (await moveMedia(it.image, "items")) ?? it.image;
    const video = await moveMedia(it.video, "items");
    const frames = it.frames ? await Promise.all(it.frames.map((f) => moveMedia(f, "items").then((u) => u ?? f))) : null;
    done.items += await count(sql`
      insert into items (id, name, category, brand, size, color, occasions, price_per_day, retail_value,
                         description, details, image, video, frames, fit, closet, accent, unavailable, sort_order)
      values (${it.id}, ${it.name}, ${it.category ?? ""}, ${it.brand ?? null}, ${it.size ?? ""}, ${it.color ?? ""},
              ${it.occasions ?? null}, ${it.pricePerDay ?? 0}, ${it.retailValue ?? null}, ${it.description ?? ""},
              ${it.details ?? null}, ${image}, ${video ?? null}, ${frames}, ${it.fit ? sql.json(it.fit) : null},
              ${it.closet || null}, ${it.accent}, ${sql.json(it.unavailable ?? [])}, ${it.closet ? 1000 + i : i})
      on conflict (id) do nothing`);
  }
  const ids = new Set((await sql<{ id: string }[]>`select id from items`).map((r) => r.id));
  const ref = (id: string | undefined) => (id && ids.has(id) ? id : null);

  done.lookbook = 0;
  for (const [i, e] of looks.entries()) {
    done.lookbook += await count(sql`
      insert into lookbook (id, kicker, title, caption, accent, image, video, item_id, closet, sort_order)
      values (${e.id}, ${e.kicker ?? ""}, ${e.title ?? ""}, ${e.caption ?? ""}, ${e.accent},
              ${(await moveMedia(e.image, "lookbook")) || null}, ${(await moveMedia(e.video, "lookbook")) || null},
              ${ref(e.itemId)}, ${e.closet || null}, ${i})
      on conflict (id) do nothing`);
  }

  done.requests = 0;
  for (const r of requests) {
    done.requests += await count(sql`
      insert into requests (id, item_id, item_name, renter_name, contact, from_date, to_date, days, total, message,
                            method, referral_code, referred_by, adjustments, status, created_at)
      values (${r.id}, ${ref(r.itemId)}, ${r.itemName}, ${r.renterName}, ${r.contact}, ${r.from}, ${r.to}, ${r.days},
              ${r.total}, ${r.message ?? null}, ${r.method ?? null}, ${r.referralCode ?? null}, ${r.referredBy ?? null},
              ${r.adjustments ? sql.json(r.adjustments) : null}, ${r.status}, ${r.createdAt})
      on conflict (id) do nothing`);
  }
  const reqIds = new Set(requests.map((r) => r.id));

  done.owners = 0;
  for (const o of owners) {
    done.owners += await count(sql`
      insert into owners (id, closet, name, email, password_hash, bio, status, created_at)
      values (${o.id}, ${o.closet}, ${o.name}, ${o.email}, ${o.passwordHash}, ${o.bio ?? null}, ${o.status}, ${o.createdAt})
      on conflict do nothing`);
  }

  done.reviews = 0;
  for (const r of reviews.filter((r) => ids.has(r.itemId))) {
    done.reviews += await count(sql`
      insert into reviews (id, item_id, name, rating, text, approved, created_at)
      values (${r.id}, ${r.itemId}, ${r.name}, ${r.rating}, ${r.text}, ${r.approved}, ${r.createdAt})
      on conflict (id) do nothing`);
  }

  done.waitlist = 0;
  for (const w of waitlist.filter((w) => ids.has(w.itemId))) {
    done.waitlist += await count(sql`
      insert into waitlist (id, item_id, item_name, contact, created_at)
      values (${w.id}, ${w.itemId}, ${w.itemName}, ${w.contact}, ${w.createdAt})
      on conflict (id) do nothing`);
  }

  done.gift_cards = 0;
  for (const g of gifts) {
    done.gift_cards += await count(sql`
      insert into gift_cards (id, code, amount, from_name, to_name, message, created_at)
      values (${g.id}, ${g.code}, ${g.amount}, ${g.from}, ${g.to}, ${g.message ?? null}, ${g.createdAt})
      on conflict do nothing`);
  }

  done.referrals = 0;
  for (const r of referrals) {
    done.referrals += await count(sql`
      insert into referrals (code, name, contact, created_at) values (${r.code}, ${r.name}, ${r.contact}, ${r.createdAt})
      on conflict do nothing`);
  }

  done.credits = 0;
  for (const c of credits) {
    done.credits += await count(sql`
      insert into credits (id, contact, amount, reason, request_id, created_at)
      values (${c.id}, ${c.contact}, ${c.amount}, ${c.reason},
              ${c.requestId && reqIds.has(c.requestId) ? c.requestId : null}, ${c.createdAt})
      on conflict (id) do nothing`);
  }

  done.saves = 0;
  for (const [itemId, n] of Object.entries(saves)) {
    if (!ids.has(itemId)) continue;
    done.saves += await count(sql`
      insert into saves (item_id, count) values (${itemId}, ${Math.max(0, Math.round(n))}) on conflict do nothing`);
  }

  await sql`insert into schema_migrations (name) values ('seed') on conflict do nothing`;
  console.log("Inserted:", Object.entries(done).map(([k, v]) => `${k} ${v}`).join(", "));
  if (copied.size) console.log(`Copied ${copied.size} media file(s) from Vercel Blob to Supabase Storage.`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
