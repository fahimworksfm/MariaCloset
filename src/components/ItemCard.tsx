"use client";

import Link from "next/link";
import type { Item } from "@/lib/types";
import { money } from "@/data/config";
import { wishlist, useStoreList } from "@/lib/clientStore";

export default function ItemCard({ item, compact = false }: { item: Item; compact?: boolean }) {
  const saved = useStoreList(wishlist);
  const isSaved = saved.includes(item.id);

  return (
    <Link
      href={`/items/${item.id}`}
      className="group panel relative block overflow-hidden p-3 transition duration-300 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-glow"
    >
      <button
        aria-label={isSaved ? "Remove from saved" : "Save"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          wishlist.toggle(item.id);
        }}
        className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-gold/30 bg-night/60 text-lg backdrop-blur transition hover:scale-110"
      >
        <span className={isSaved ? "text-rani" : "text-gold/70"}>{isSaved ? "♥" : "♡"}</span>
      </button>

      <div
        className="grid w-full place-items-center overflow-hidden rounded-xl"
        style={{
          aspectRatio: compact ? "1 / 1" : "4 / 5",
          background: `radial-gradient(70% 60% at 50% 40%, ${item.accent}33, #1a0826 75%)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="px-1 pb-1 pt-3">
        <p className="eyebrow truncate">
          {item.category}
          {item.brand ? ` · ${item.brand}` : ""}
        </p>
        <h3 className="mt-1 truncate font-display text-xl text-cream">{item.name}</h3>
        <p className="mt-1 text-sm text-cream/70">
          <span className="font-semibold text-gold">{money(item.pricePerDay)}</span> / day
        </p>
        {!compact && item.occasions && item.occasions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.occasions.slice(0, 3).map((o) => (
              <span key={o} className="rounded-full bg-gold/10 px-2 py-0.5 text-[11px] text-gold/80">
                {o}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
