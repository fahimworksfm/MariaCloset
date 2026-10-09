// Server-only module: reads/writes the catalog. Never import from a client component.
import { sql, num, opt, sameKey } from "@/lib/db";
import type { DateRange, Item } from "@/lib/types";

type Row = {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  size: string;
  color: string;
  occasions: string[] | null;
  price_per_day: string;
  retail_value: string | null;
  description: string;
  details: string[] | null;
  image: string;
  video: string | null;
  frames: string[] | null;
  fit: Item["fit"] | null;
  closet: string | null;
  accent: string;
  unavailable: DateRange[];
  sort_order: number;
};

const fromRow = (r: Row): Item => ({
  id: r.id,
  name: r.name,
  category: r.category,
  brand: opt(r.brand),
  size: r.size,
  color: r.color,
  occasions: opt(r.occasions),
  pricePerDay: num(r.price_per_day),
  retailValue: r.retail_value === null ? undefined : num(r.retail_value),
  description: r.description,
  details: opt(r.details),
  image: r.image,
  video: opt(r.video),
  frames: opt(r.frames),
  fit: opt(r.fit),
  closet: opt(r.closet),
  accent: r.accent,
  unavailable: r.unavailable ?? [],
});

const toRow = (i: Item, sortOrder: number) => ({
  id: i.id,
  name: i.name,
  category: i.category ?? "",
  brand: i.brand ?? null,
  size: i.size ?? "",
  color: i.color ?? "",
  occasions: i.occasions ?? null,
  price_per_day: i.pricePerDay ?? 0,
  retail_value: i.retailValue ?? null,
  description: i.description ?? "",
  details: i.details ?? null,
  image: i.image,
  video: i.video ?? null,
  frames: i.frames ?? null,
  fit: i.fit ?? null,
  closet: i.closet || null,
  accent: i.accent,
  unavailable: i.unavailable ?? [],
  sort_order: sortOrder,
});

const COLUMNS = Object.keys(toRow({ id: "", name: "", image: "", accent: "" } as Item, 0)) as (keyof ReturnType<
  typeof toRow
>)[];

/** The catalog, in the admin's chosen order. */
export async function getItems(): Promise<Item[]> {
  const rows = await sql<Row[]>`select * from items order by sort_order, created_at`;
  return rows.map(fromRow);
}

export async function getItemById(id: string): Promise<Item | undefined> {
  const [row] = await sql<Row[]>`select * from items where id = ${id}`;
  return row ? fromRow(row) : undefined;
}

/**
 * Make the stored catalog match `items` (list order = display order). Only rows
 * that actually changed are written, and pieces missing from the list are
 * deleted — so concurrent edits to other pieces aren't clobbered.
 */
export async function saveItems(items: Item[]): Promise<{ stored: boolean }> {
  return syncItems(items, null);
}

/** Same as saveItems, but scoped to one owner's closet (others are untouched). */
export async function saveClosetItems(closet: string, items: Item[]): Promise<{ stored: boolean }> {
  return syncItems(
    items.map((i) => ({ ...i, closet })),
    closet,
  );
}

async function syncItems(items: Item[], closet: string | null): Promise<{ stored: boolean }> {
  try {
    await sql.begin(async (tx) => {
      const existing = closet
        ? await tx<Row[]>`select * from items where closet = ${closet}`
        : await tx<Row[]>`select * from items`;
      const before = new Map(existing.map((r) => [r.id, sameKey(toRow(fromRow(r), r.sort_order))]));
      // Owners' pieces sort after Maria's existing ones, keeping their own order.
      const base = closet ? 1000 : 0;
      const changed = items
        .map((it, i) => toRow(it, base + i))
        .filter((row) => before.get(row.id) !== sameKey(row));

      const keep = items.map((i) => i.id);
      if (closet) await tx`delete from items where closet = ${closet} and id <> all(${keep})`;
      else await tx`delete from items where id <> all(${keep})`;

      for (const r of changed) {
        const row = { ...r, fit: r.fit === null ? null : tx.json(r.fit), unavailable: tx.json(r.unavailable) };
        await tx`
          insert into items ${tx(row as never, COLUMNS)}
          on conflict (id) do update set ${tx(row as never, COLUMNS.filter((c) => c !== "id"))}, updated_at = now()
          ${closet ? tx`where items.closet = ${closet}` : tx``}`;
      }
    });
    return { stored: true };
  } catch (err) {
    console.error("[store] could not persist items:", err);
    return { stored: false };
  }
}

/** Block a date range on one piece (no-op if it's already there). */
export async function addUnavailable(id: string, range: DateRange): Promise<void> {
  await sql`
    update items set unavailable = unavailable || ${sql.json([range])}, updated_at = now()
    where id = ${id} and not unavailable @> ${sql.json([range])}`;
}
