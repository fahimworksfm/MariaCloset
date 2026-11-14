"use client";

import { useMemo, useState } from "react";
import type { Item } from "@/lib/types";
import { parseISO, rangeOverlapsUnavailable, toISO, today } from "@/lib/dates";
import { wishlist, useStoreList } from "@/lib/clientStore";
import ItemCard from "./ItemCard";

export default function BrowseGrid({
  items,
  initialCategory,
}: {
  items: Item[];
  initialCategory?: string;
}) {
  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    if (initialCategory) set.add(initialCategory);
    return ["All", ...Array.from(set)];
  }, [items, initialCategory]);
  const occasions = useMemo(
    () => Array.from(new Set(items.flatMap((i) => i.occasions ?? []))).sort(),
    [items],
  );
  const maxPrice = useMemo(
    () => Math.max(10, ...items.map((i) => i.pricePerDay)),
    [items],
  );

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(
    initialCategory && initialCategory !== "All" ? initialCategory : "All",
  );
  const [occasion, setOccasion] = useState<string | null>(null);
  const [price, setPrice] = useState(maxPrice);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [ask, setAsk] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  const saved = useStoreList(wishlist);
  const minDate = toISO(today());

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (category !== "All" && i.category !== category) return false;
      if (occasion && !(i.occasions ?? []).includes(occasion)) return false;
      if (i.pricePerDay > price) return false;
      if (savedOnly && !saved.includes(i.id)) return false;
      if (q && !`${i.name} ${i.category} ${i.brand ?? ""} ${i.color}`.toLowerCase().includes(q))
        return false;
      if (from) {
        const a = parseISO(from);
        const b = parseISO(to || from);
        if (rangeOverlapsUnavailable(a, b, i.unavailable)) return false;
      }
      return true;
    });
  }, [items, query, category, occasion, price, from, to, savedOnly, saved]);

  const activeFilters = category !== "All" || occasion || savedOnly || from || query || price < maxPrice;

  function clearAll() {
    setQuery("");
    setCategory("All");
    setOccasion(null);
    setPrice(maxPrice);
    setFrom("");
    setTo("");
    setSavedOnly(false);
  }

  async function aiSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!ask.trim()) return;
    setAiBusy(true);
    const r = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: ask, categories: categories.filter((c) => c !== "All"), occasions }),
    });
    const d = await r.json().catch(() => ({}));
    setAiBusy(false);
    const f = (d.filters ?? {}) as {
      category?: string;
      occasion?: string;
      priceMax?: number;
      q?: string;
    };
    setCategory(f.category || "All");
    setOccasion(f.occasion || null);
    if (typeof f.priceMax === "number") setPrice(Math.min(maxPrice, Math.max(10, f.priceMax)));
    setQuery(f.q ? String(f.q) : "");
  }

  const tab = (active: boolean) =>
    `min-h-[44px] border-b text-[15px] transition ${
      active ? "border-brass font-medium text-brass" : "border-transparent text-cream hover:text-brass"
    }`;
  const label = "mb-1.5 block text-xs text-mute";

  return (
    <div>
      {/* Ask the stylist (AI search) */}
      <form onSubmit={aiSearch} className="mb-10 flex max-w-xl items-end gap-4">
        <label className="min-w-0 flex-1">
          <span className="block text-xs font-medium uppercase tracking-[0.2em] text-mute">Ask the stylist</span>
          <input
            className="mt-1 min-h-[48px] w-full border-b border-cream bg-transparent text-base text-zari outline-none placeholder:text-mute/70 focus:border-brass"
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            placeholder="Something red for a wedding under $50"
          />
        </label>
        <button type="submit" className="btn-ghost" disabled={aiBusy}>
          {aiBusy ? "…" : "Ask"}
        </button>
      </form>

      {/* category + occasion tabs */}
      <div className="flex flex-wrap gap-x-7 gap-y-1">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} aria-pressed={category === c} className={tab(category === c)}>
            {c === "All" ? "All pieces" : c}
          </button>
        ))}
      </div>
      {occasions.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-x-7 gap-y-1">
          {occasions.map((o) => (
            <button
              key={o}
              onClick={() => setOccasion(occasion === o ? null : o)}
              aria-pressed={occasion === o}
              className={tab(occasion === o)}
            >
              {o}
            </button>
          ))}
        </div>
      )}

      {/* filter bar */}
      <div className="mt-6 grid gap-5 border-y border-line py-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className={label}>Search</span>
          <input
            className="field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="saree, red, silk…"
          />
        </label>
        <label className="block">
          <span className={label}>Up to {`$${price}`} a day</span>
          <input
            type="range"
            min={10}
            max={maxPrice}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-3 w-full accent-brass"
          />
        </label>
        <label className="block">
          <span className={label}>Free from</span>
          <input type="date" min={minDate} className="field" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="block">
          <span className={label}>To</span>
          <input type="date" min={from || minDate} className="field" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>

      <div className="mb-8 mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-mute">
          {results.length} {results.length === 1 ? "piece" : "pieces"}
          {from && " available"}
        </p>
        <div className="flex items-center gap-6">
          <button onClick={() => setSavedOnly((s) => !s)} aria-pressed={savedOnly} className={tab(savedOnly)}>
            ♥ Saved
          </button>
          {activeFilters && (
            <button onClick={clearAll} className="min-h-[44px] text-sm text-mute underline hover:text-cream">
              Clear
            </button>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <p className="py-16 text-center text-mute">
          Nothing matches those filters
          {savedOnly && ". Heart a few pieces to save them"}.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
