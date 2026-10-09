import { sql, iso, num, opt } from "@/lib/db";
import type { RentRequest } from "@/lib/types";

type Row = {
  id: string;
  item_id: string | null;
  item_name: string;
  renter_name: string;
  contact: string;
  from_date: string;
  to_date: string;
  days: number;
  total: string;
  message: string | null;
  method: string | null;
  referral_code: string | null;
  referred_by: string | null;
  adjustments: RentRequest["adjustments"] | null;
  status: RentRequest["status"];
  created_at: Date;
};

const fromRow = (r: Row): RentRequest => ({
  id: r.id,
  itemId: r.item_id ?? "",
  itemName: r.item_name,
  renterName: r.renter_name,
  contact: r.contact,
  from: r.from_date,
  to: r.to_date,
  days: r.days,
  total: num(r.total),
  message: opt(r.message),
  method: opt(r.method),
  referralCode: opt(r.referral_code),
  referredBy: opt(r.referred_by),
  adjustments: opt(r.adjustments),
  status: r.status,
  createdAt: iso(r.created_at),
});

/** Newest first. */
export async function getRequests(): Promise<RentRequest[]> {
  return (await sql<Row[]>`select * from requests order by created_at desc`).map(fromRow);
}

export async function saveRequest(req: RentRequest): Promise<{ stored: boolean }> {
  try {
    await sql`
      insert into requests (id, item_id, item_name, renter_name, contact, from_date, to_date, days, total,
                            message, method, referral_code, referred_by, adjustments, status, created_at)
      values (${req.id}, (select id from items where id = ${req.itemId}), ${req.itemName}, ${req.renterName},
              ${req.contact}, ${req.from}, ${req.to}, ${req.days}, ${req.total}, ${req.message ?? null},
              ${req.method ?? null}, ${req.referralCode ?? null}, ${req.referredBy ?? null},
              ${req.adjustments ? sql.json(req.adjustments) : null}, ${req.status}, ${req.createdAt})`;
    return { stored: true };
  } catch (err) {
    console.error("[requests] could not persist:", err);
    return { stored: false };
  }
}

/** Merge fields into a stored request (only status and adjustments change after creation). */
export async function patchRequest(id: string, patch: Partial<RentRequest>): Promise<RentRequest | null> {
  const [row] = await sql<Row[]>`
    update requests set
      status = coalesce(${patch.status ?? null}, status),
      adjustments = ${patch.adjustments !== undefined ? sql`${sql.json(patch.adjustments)}::jsonb` : sql`adjustments`}
    where id = ${id}
    returning *`;
  return row ? fromRow(row) : null;
}

export async function updateRequestStatus(id: string, status: RentRequest["status"]): Promise<RentRequest | null> {
  const [row] = await sql<Row[]>`update requests set status = ${status} where id = ${id} returning *`;
  return row ? fromRow(row) : null;
}
