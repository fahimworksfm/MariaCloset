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

  return (
    <div>
      {/* AI search */}
      <form onSubmit={aiSearch} className="mx-auto mb-7 flex max-w-2xl gap-2">
        <input
          className="field"
          value={ask}
          onChange={(e) => setAsk(e.target.value)}
          placeholder="Describe it — e.g. “something red for a wedding under $50”"
        />
        <button type="submit" className="btn-primary whitespace-nowrap" disabled={aiBusy}>
          {aiBusy ? "…" : "✦ Ask"}
        </button>
      </form>

      {/* occasion chips */}
      <div className="mb-5 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setOccasion(null)}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            !occasion ? "bg-gradient-to-r from-rani to-marigold text-white" : "chip hover:bg-gold/15"
          }`}
        >
          All occasions
        </button>
        {occasions.map((o) => (
          <button
            key={o}
            onClick={() => setOccasion(occasion === o ? null : o)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              occasion === o ? "bg-gradient-to-r from-rani to-marigold text-white" : "chip hover:bg-gold/15"
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      {/* filter bar */}
      <div className="panel mb-8 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="eyebrow mb-1 block">Search</span>
          <input
            className="field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="saree, red, silk…"
          />
        </label>
        <label className="block">
          <span className="eyebrow mb-1 block">Category</span>
          <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-night">
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="eyebrow mb-1 block">Up to {`$${price}`}/day</span>
          <input
            type="range"
            min={10}
            max={maxPrice}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-3 w-full accent-rani"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="eyebrow mb-1 block">From</span>
            <input type="date" min={minDate} className="field" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="block">
            <span className="eyebrow mb-1 block">To</span>
            <input type="date" min={from || minDate} className="field" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-cream/70">
          {results.length} {results.length === 1 ? "piece" : "pieces"}
          {from && " available"}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSavedOnly((s) => !s)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              savedOnly ? "bg-rani text-white" : "chip hover:bg-gold/15"
            }`}
          >
            ♥ Saved
          </button>
          {activeFilters && (
            <button onClick={clearAll} className="text-sm text-gold/70 underline hover:text-gold">
              Clear
            </button>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <p className="py-16 text-center text-cream/60">
          Nothing matches those filters
          {savedOnly && " — heart a few pieces to save them"}.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
