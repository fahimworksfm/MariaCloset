"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Item } from "@/lib/types";
import { money } from "@/data/config";

const CarouselCanvas = dynamic(() => import("./CarouselCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="skeleton-shimmer h-[64%] w-[36%] max-w-[260px] rounded-2xl border border-gold/20" />
    </div>
  ),
});

export default function Showcase({ items }: { items: Item[] }) {
  const [index, setIndex] = useState(0);
  const n = items.length;

  if (n === 0) {
    return (
      <section id="rail" className="mx-auto max-w-2xl px-5 py-20 text-center">
        <p className="font-display text-3xl text-gold">The rail is empty</p>
        <p className="mt-2 text-cream/70">
          Add your first piece from the{" "}
          <Link href="/admin" className="text-marigold underline">
            admin
          </Link>
          .
        </p>
      </section>
    );
  }

  const active = items[Math.min(index, n - 1)];
  const go = (dir: number) => setIndex((i) => (i + dir + n) % n);

  return (
    <section id="rail" className="relative">
      <div className="relative h-[62vh] min-h-[460px] w-full">
        {/* accent glow behind the rail */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div
            className="h-[55%] w-[60%] rounded-full opacity-40 blur-[90px] transition-all duration-700"
            style={{ backgroundColor: active.accent }}
          />
        </div>

        <CarouselCanvas items={items} index={index} onIndexChange={setIndex} />

        <button
          aria-label="Previous piece"
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-gold/40 bg-night/60 text-xl text-gold backdrop-blur transition hover:bg-night/90 hover:text-marigold sm:left-8"
        >
          ‹
        </button>
        <button
          aria-label="Next piece"
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-gold/40 bg-night/60 text-xl text-gold backdrop-blur transition hover:bg-night/90 hover:text-marigold sm:right-8"
        >
          ›
        </button>

      </div>

      {/* active piece */}
      <div className="mx-auto -mt-2 max-w-2xl px-5 text-center">
        <p key={`${active.id}-cat`} className="eyebrow animate-fade-up">
          {active.category}
          {active.brand ? ` · ${active.brand}` : ""}
        </p>
        <h2
          key={`${active.id}-name`}
          className="mt-2 font-display text-4xl text-gold-shimmer animate-fade-up sm:text-5xl"
        >
          {active.name}
        </h2>
        <p key={`${active.id}-price`} className="mt-3 text-cream/80 animate-fade-up">
          <span className="text-lg font-semibold text-gold">{money(active.pricePerDay)}</span> / day
          <span className="mx-2 text-gold/40">✦</span>
          Size {active.size}
        </p>

        <div className="mt-6 flex items-center justify-center">
          <Link href={`/items/${active.id}`} className="btn-primary">
            View &amp; rent
          </Link>
        </div>

        <div className="mt-7 flex items-center justify-center gap-2">
          {items.map((it, i) => (
            <button
              key={it.id}
              aria-label={`Show ${it.name}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index
                  ? "w-7 bg-gradient-to-r from-rani to-marigold"
                  : "w-2 bg-gold/30 hover:bg-gold/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
