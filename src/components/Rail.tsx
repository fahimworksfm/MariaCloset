import Link from "next/link";
import type { Item } from "@/lib/types";
import { money } from "@/data/config";

/** The homepage rail: a sideways-scrolling row of the newest pieces. */
export default function Rail({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <p className="px-5 text-mute sm:px-8">
        The rail is empty. Add your first piece from the{" "}
        <Link href="/admin" className="text-cream underline">
          admin
        </Link>
        .
      </p>
    );
  }
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Newest pieces, scroll sideways"
      className="flex snap-x scroll-px-5 gap-5 overflow-x-auto px-5 pb-6 sm:scroll-px-8 sm:px-8"
    >
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/items/${item.id}`}
          className="group w-[72vw] max-w-[300px] flex-none snap-start"
        >
          <div className="aspect-[5/7] overflow-hidden bg-aubergine">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <p className="mt-3 flex items-baseline justify-between gap-3 text-[15px]">
            <span className="truncate text-cream transition group-hover:text-brass">{item.name}</span>
            <span className="flex-none text-mute">{money(item.pricePerDay)}</span>
          </p>
        </Link>
      ))}
    </div>
  );
}
