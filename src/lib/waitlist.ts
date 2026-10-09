import { sql, iso } from "@/lib/db";
import type { WaitlistEntry } from "@/lib/types";

type Row = { id: string; item_id: string; item_name: string; contact: string; created_at: Date };

export async function getWaitlist(): Promise<WaitlistEntry[]> {
  const rows = await sql<Row[]>`select * from waitlist order by created_at desc`;
  return rows.map((r) => ({
    id: r.id,
    itemId: r.item_id,
    itemName: r.item_name,
    contact: r.contact,
    createdAt: iso(r.created_at),
  }));
}

export async function addWaitlist(entry: WaitlistEntry): Promise<{ stored: boolean }> {
  try {
    await sql`
      insert into waitlist (id, item_id, item_name, contact, created_at)
      values (${entry.id}, ${entry.itemId}, ${entry.itemName}, ${entry.contact}, ${entry.createdAt})`;
    return { stored: true };
  } catch (err) {
    console.error("[waitlist] could not persist:", err);
    return { stored: false };
  }
}
