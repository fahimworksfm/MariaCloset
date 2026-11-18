"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/** The Shop menu. `categories` are the ones that currently have pieces. */
export default function CategoryMenu({ categories }: { categories: string[] }) {
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
    <div ref={ref} className="relative hidden sm:block">
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
          <Link
            href="/browse"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-cream transition hover:bg-cream/5 hover:text-brass"
          >
            All pieces
          </Link>
          {categories.length > 0 && <div className="my-2 h-px bg-line" />}
          {categories.map(link)}
        </div>
      )}
    </div>
  );
}
