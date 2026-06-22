"use client";

import type { Item } from "@/lib/types";
import { recent, useStoreList } from "@/lib/clientStore";
import ItemCard from "./ItemCard";

export default function RecentlyViewed({ items }: { items: Item[] }) {
  const ids = useStoreList(recent);
  const byId = new Map(items.map((i) => [i.id, i]));
  const list = ids.map((id) => byId.get(id)).filter(Boolean) as Item[];
  if (list.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl text-gold">Recently viewed</h2>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {list.slice(0, 6).map((i) => (
          <ItemCard key={i.id} item={i} compact />
        ))}
      </div>
    </section>
  );
}
