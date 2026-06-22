import type { Item } from "@/lib/types";
import { money, siteConfig } from "@/data/config";
import ItemCard from "./ItemCard";

/** Cross-sell: pairs an item with complementary pieces (accessories first, then
 *  same-occasion) and shows a 10%-off "rent the look" bundle price. */
export default function CompleteTheLook({ item, all }: { item: Item; all: Item[] }) {
  const others = all.filter((i) => i.id !== item.id);
  const accessories = others.filter((i) => i.category === "Accessories");
  const sameOccasion = others.filter(
    (i) =>
      i.category !== "Accessories" &&
      (item.occasions ?? []).some((o) => (i.occasions ?? []).includes(o)),
  );
  const seen = new Set<string>();
  const picks = [...accessories, ...sameOccasion]
    .filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)))
    .slice(0, 3);

  if (picks.length === 0) return null;

  const full = picks.reduce((s, i) => s + i.pricePerDay, item.pricePerDay);
  const bundle = Math.round(full * 0.9);

  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-3xl text-gold">Complete the look</h2>
        <p className="text-sm text-cream/70">
          Rent the look:{" "}
          <span className="text-cream/50 line-through">{money(full)}</span>{" "}
          <span className="font-semibold text-gold">{money(bundle)}</span>/day
          <span className="ml-1 rounded-full bg-emerald/20 px-2 py-0.5 text-xs text-emerald">
            save 10%
          </span>
        </p>
      </div>
      <p className="mt-1 text-sm text-cream/55">
        Add these when you request — {siteConfig.ownerName} will apply the bundle price.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ItemCard item={item} compact />
        {picks.map((i) => (
          <ItemCard key={i.id} item={i} compact />
        ))}
      </div>
    </section>
  );
}
