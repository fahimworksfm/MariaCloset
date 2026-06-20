import Link from "next/link";
import { siteConfig } from "@/data/config";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-cocoa/10 bg-cream/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-serif text-xl tracking-tight text-ink">
            {siteConfig.name}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-gold transition group-hover:scale-125" />
        </Link>
        <div className="flex items-center gap-6 text-sm text-cocoa">
          <Link href="/#rail" className="transition hover:text-ink">
            The rail
          </Link>
          <Link href="/#how" className="hidden transition hover:text-ink sm:inline">
            How it works
          </Link>
        </div>
      </nav>
    </header>
  );
}
