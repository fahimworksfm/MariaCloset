// Server-only: gathers and trims the data the Insights dashboard needs.
import { getItems } from "@/lib/store";
import { getRequests } from "@/lib/requests";
import { getWaitlist } from "@/lib/waitlist";
import { getSaves } from "@/lib/saves";
import type { Item } from "@/lib/types";

/**
 * With no `scope` (admin) every request counts, including ones for pieces that
 * have since been removed. With a scope (an owner) only their pieces count.
 * Only the fields the dashboard uses reach the browser — no renter details.
 */
export async function loadInsights(scope?: (item: Item) => boolean) {
  const [items, requests, waitlist, saves] = await Promise.all([
    getItems(),
    getRequests(),
    getWaitlist(),
    getSaves(),
  ]);
  const pieces = scope ? items.filter(scope) : items;
  const ids = new Set(pieces.map((i) => i.id));
  const keep = (itemId: string) => !scope || ids.has(itemId);

  return {
    pieces: pieces.map((i) => ({ id: i.id, name: i.name, image: i.image })),
    requests: requests
      .filter((r) => keep(r.itemId))
      .map((r) => ({
        id: r.id,
        itemId: r.itemId,
        status: r.status,
        total: r.total,
        createdAt: r.createdAt,
        to: r.to,
      })),
    waitlist: waitlist.filter((w) => keep(w.itemId)).map((w) => ({ itemId: w.itemId, createdAt: w.createdAt })),
    saves: Object.fromEntries(Object.entries(saves).filter(([id]) => keep(id))),
    now: new Date().toISOString(),
  };
}
