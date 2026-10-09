import { sql } from "@/lib/db";

/**
 * Anonymous per-piece wishlist counts ({ itemId: saves }). Hearts live in each
 * visitor's browser, so this is the only server-side signal of what people
 * want. No identifiers are stored — just a running count.
 */
type Saves = Record<string, number>;

export async function getSaves(): Promise<Saves> {
  const rows = await sql<{ item_id: string; count: number }[]>`select item_id, count from saves`;
  return Object.fromEntries(rows.map((r) => [r.item_id, r.count]));
}

/** Add +1 / -1 to a piece's count, never below zero (atomic in the database). */
export async function bumpSave(itemId: string, delta: 1 | -1): Promise<boolean> {
  try {
    await sql`select bump_save(${itemId}, ${delta})`;
    return true;
  } catch (err) {
    console.error("[saves] could not persist:", err);
    return false;
  }
}
