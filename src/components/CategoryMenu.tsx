"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const CLOTHES = ["Saree", "Lehenga", "Anarkali", "Suit", "Gown", "Kurti"];
const OTHER = ["Jewellery", "Bags", "Accessories"];

export default function CategoryMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const link = (c: string) => (
    <Link
      key={c}
      href={`/browse?category=${encodeURIComponent(c)}`}
      onClick={() => setOpen(false)}
      className="block rounded-lg px-3 py-1.5 text-sm text-cream/80 transition hover:bg-gold/10 hover:text-gold"
    >
      {c}
    </Link>
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-medium text-cream/80 transition hover:text-gold"
        aria-expanded={open}
      >
        Shop
        <span className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="panel absolute left-0 top-full z-50 mt-3 w-56 p-3">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/60">
            Clothes
          </p>
          {CLOTHES.map(link)}
          <div className="my-2 h-px bg-gold/15" />
          {OTHER.map(link)}
        </div>
      )}
    </div>
  );
}
