"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { items } from "@/data/items";
import { money } from "@/data/config";

const CarouselCanvas = dynamic(() => import("./CarouselCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-cocoa/20 border-t-emerald" />
    </div>
  ),
});

export default function Showcase() {
  const [index, setIndex] = useState(0);
  const active = items[index];
  const n = items.length;

  const go = (dir: number) => setIndex((i) => (i + dir + n) % n);

  return (
    <section id="rail" className="relative">
      <div className="relative h-[58vh] min-h-[420px] w-full sm:h-[64vh]">
        <CarouselCanvas items={items} index={index} onIndexChange={setIndex} />

        {/* Arrows */}
        <button
          aria-label="Previous piece"
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-cocoa/15 bg-cream/80 text-ink shadow-card backdrop-blur transition hover:bg-cream sm:left-8"
        >
          ‹
        </button>
        <button
          aria-label="Next piece"
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-cocoa/15 bg-cream/80 text-ink shadow-card backdrop-blur transition hover:bg-cream sm:right-8"
        >
          ›
        </button>

        <p className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 text-center text-xs text-cocoa/70">
          drag to spin the rail
        </p>
      </div>

      {/* Active piece details */}
      <div className="mx-auto -mt-2 max-w-2xl px-5 text-center">
        <p key={`${active.id}-cat`} className="eyebrow animate-fade-up">
          {active.category}
          {active.brand ? ` · ${active.brand}` : ""}
        </p>
        <h2
          key={`${active.id}-name`}
          className="mt-2 font-serif text-3xl text-ink animate-fade-up sm:text-4xl"
        >
          {active.name}
        </h2>
        <p key={`${active.id}-price`} className="mt-3 text-cocoa animate-fade-up">
          <span className="font-medium text-ink">{money(active.pricePerDay)}</span> / day
          <span className="mx-2 text-cocoa/40">·</span>
          Size {active.size}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href={`/items/${active.id}`} className="btn-primary">
            View &amp; rent
          </Link>
        </div>

        {/* Dots */}
        <div className="mt-7 flex items-center justify-center gap-2">
          {items.map((it, i) => (
            <button
              key={it.id}
              aria-label={`Show ${it.name}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-emerald" : "w-2 bg-cocoa/25 hover:bg-cocoa/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
