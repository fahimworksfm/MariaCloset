// Server-only module: reads/writes the homepage lookbook. Never import from a client component.
import { sql, opt, sameKey } from "@/lib/db";
import type { LookEntry } from "@/data/lookbook";
import { siteConfig } from "@/data/config";

/** A tile's effective owner — empty closet means Maria's (the homepage edit). */
export const closetOf = (e: LookEntry) => e.closet || siteConfig.ownerName;

type Row = {
  id: string;
  kicker: string;
  title: string;
  caption: string;
  accent: string;
  image: string | null;
  video: string | null;
  item_id: string | null;
  closet: string | null;
  sort_order: number;
};

const fromRow = (r: Row): LookEntry => ({
  id: r.id,
  kicker: r.kicker,
  title: r.title,
  caption: r.caption,
  accent: r.accent,
  image: opt(r.image),
  video: opt(r.video),
  itemId: opt(r.item_id),
  closet: opt(r.closet),
});

/** Every closet's "The Edit" tiles, in display order. */
export async function getLookbook(): Promise<LookEntry[]> {
  return (await sql<Row[]>`select * from lookbook order by sort_order, created_at`).map(fromRow);
}

/** Tiles belonging to one closet (Maria's name for the homepage edit). */
export async function getLookbookFor(closet: string): Promise<LookEntry[]> {
  const rows =
    closet === siteConfig.ownerName
      ? await sql<Row[]>`select * from lookbook where closet is null order by sort_order, created_at`
      : await sql<Row[]>`select * from lookbook where closet = ${closet} order by sort_order, created_at`;
  return rows.map(fromRow);
}

/**
 * Replace one closet's tiles while preserving everyone else's. Maria's tiles
 * are stored with no `closet` (the canonical homepage edit); owners' tiles
 * carry their closet name. Only changed tiles are written.
 */
export async function saveLookbookFor(closet: string, mine: LookEntry[]): Promise<{ stored: boolean }> {
  const scope = closet === siteConfig.ownerName ? null : closet;
  try {
    await sql.begin(async (tx) => {
      const existing = await (scope === null
        ? tx<Row[]>`select * from lookbook where closet is null`
        : tx<Row[]>`select * from lookbook where closet = ${scope}`);
      const before = new Map(existing.map((r) => [r.id, sameKey(rowOf(fromRow(r), scope, r.sort_order))]));
      const keep = mine.map((e) => e.id);
      if (scope === null) await tx`delete from lookbook where closet is null and id <> all(${keep})`;
      else await tx`delete from lookbook where closet = ${scope} and id <> all(${keep})`;

      // A tile may still point at a piece that has since been deleted — drop the link.
      const pieces = new Set((await tx<{ id: string }[]>`select id from items`).map((r) => r.id));
      for (let i = 0; i < mine.length; i++) {
        const e = mine[i];
        const row = rowOf({ ...e, itemId: e.itemId && pieces.has(e.itemId) ? e.itemId : undefined }, scope, i);
        if (before.get(row.id) === sameKey(row)) continue;
        await tx`
          insert into lookbook ${tx(row as never)}
          on conflict (id) do update set
            kicker = excluded.kicker, title = excluded.title, caption = excluded.caption,
            accent = excluded.accent, image = excluded.image, video = excluded.video,
            item_id = excluded.item_id, sort_order = excluded.sort_order
          where lookbook.closet is not distinct from excluded.closet`;
      }
    });
    return { stored: true };
  } catch (err) {
    console.error("[lookbookStore] could not persist:", err);
    return { stored: false };
  }
}

const rowOf = (e: LookEntry, closet: string | null, sortOrder: number) => ({
  id: e.id,
  kicker: e.kicker ?? "",
  title: e.title ?? "",
  caption: e.caption ?? "",
  accent: e.accent,
  image: e.image || null,
  video: e.video || null,
  item_id: e.itemId || null,
  closet,
  sort_order: sortOrder,
});
