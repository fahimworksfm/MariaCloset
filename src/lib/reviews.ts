import { sql, iso } from "@/lib/db";
import type { Review } from "@/lib/types";

type Row = { id: string; item_id: string; name: string; rating: number; text: string; approved: boolean; created_at: Date };

const fromRow = (r: Row): Review => ({
  id: r.id,
  itemId: r.item_id,
  name: r.name,
  rating: r.rating,
  text: r.text,
  approved: r.approved,
  createdAt: iso(r.created_at),
});

export async function getReviews(): Promise<Review[]> {
  return (await sql<Row[]>`select * from reviews order by created_at desc`).map(fromRow);
}

export async function approvedForItem(itemId: string): Promise<Review[]> {
  return (
    await sql<Row[]>`select * from reviews where item_id = ${itemId} and approved order by created_at desc`
  ).map(fromRow);
}

export async function addReview(review: Review): Promise<{ stored: boolean }> {
  try {
    await sql`
      insert into reviews (id, item_id, name, rating, text, approved, created_at)
      values (${review.id}, ${review.itemId}, ${review.name}, ${review.rating}, ${review.text},
              ${review.approved}, ${review.createdAt})`;
    return { stored: true };
  } catch (err) {
    console.error("[reviews] could not persist:", err);
    return { stored: false };
  }
}

export async function setApproved(id: string, approved: boolean): Promise<Review | null> {
  const [row] = await sql<Row[]>`update reviews set approved = ${approved} where id = ${id} returning *`;
  return row ? fromRow(row) : null;
}

export async function removeReview(id: string): Promise<boolean> {
  const res = await sql`delete from reviews where id = ${id}`;
  return res.count > 0;
}
