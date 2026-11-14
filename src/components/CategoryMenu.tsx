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
      className="block px-3 py-2 text-sm text-cream transition hover:bg-cream/5 hover:text-brass"
    >
      {c}
    </Link>
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 py-3 text-sm text-cream transition hover:text-brass"
        aria-expanded={open}
      >
        Shop
        <span className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 border border-line bg-aubergine p-3">
          <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-mute">
            Clothes
          </p>
          {CLOTHES.map(link)}
          <div className="my-2 h-px bg-line" />
          {OTHER.map(link)}
        </div>
      )}
    </div>
  );
}
