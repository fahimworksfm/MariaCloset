"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/closets", label: "Closets" },
  { href: "/membership", label: "Membership" },
  { href: "/refer", label: "Refer" },
];

/** The right side of the nav: inline links from tablet up, a "Menu" panel on phones. */
export default function NavMenu() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  // Close the phone panel after navigating, and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function askStylist() {
    setOpen(false);
    window.dispatchEvent(new Event("open-stylist"));
  }

  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <>
      {/* tablet and up */}
      <div className="hidden items-center gap-7 text-sm text-cream sm:flex">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={current(l.href)}
            className="py-3 transition hover:text-brass aria-[current=page]:text-brass"
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* phones */}
      <div className="flex items-center gap-5 text-sm text-cream sm:hidden">
        <Link href="/browse" className="py-3 transition hover:text-brass">
          Browse
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="nav-panel"
          className="-mr-2 min-h-[44px] px-2 transition hover:text-brass"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <div
          id="nav-panel"
          className="absolute inset-x-0 top-full border-y border-line bg-night px-5 py-2 text-base text-cream sm:hidden"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={current(l.href)}
              className="block border-b border-line py-3.5 aria-[current=page]:text-brass"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/join" className="block border-b border-line py-3.5">
            Open a closet
          </Link>
          <button type="button" onClick={askStylist} className="block w-full py-3.5 text-left text-brass">
            Ask the stylist
          </button>
        </div>
      )}
    </>
  );
}
