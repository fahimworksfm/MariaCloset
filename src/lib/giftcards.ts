import { sql, iso, num, opt } from "@/lib/db";
import type { GiftCard } from "@/lib/types";

type Row = {
  id: string;
  code: string;
  amount: string;
  from_name: string;
  to_name: string;
  message: string | null;
  created_at: Date;
};

export async function getGiftCards(): Promise<GiftCard[]> {
  const rows = await sql<Row[]>`select * from gift_cards order by created_at`;
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    amount: num(r.amount),
    from: r.from_name,
    to: r.to_name,
    message: opt(r.message),
    createdAt: iso(r.created_at),
  }));
}

export async function addGiftCard(card: GiftCard): Promise<{ stored: boolean }> {
  try {
    await sql`
      insert into gift_cards (id, code, amount, from_name, to_name, message, created_at)
      values (${card.id}, ${card.code}, ${card.amount}, ${card.from}, ${card.to}, ${card.message ?? null},
              ${card.createdAt})`;
    return { stored: true };
  } catch (err) {
    console.error("[giftcards] could not persist:", err);
    return { stored: false };
  }
}
