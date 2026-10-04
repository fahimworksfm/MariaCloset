import Link from "next/link";
import { siteConfig } from "@/data/config";
import { LotusMark } from "./Ornament";
import CategoryMenu from "./CategoryMenu";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream/10 bg-night/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-4 sm:gap-5">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-cream/25">
              <LotusMark className="h-4 w-4 text-cream" />
            </span>
            <span className="font-display text-2xl tracking-tight text-zari sm:text-[1.7rem]">
              {siteConfig.name}
            </span>
          </Link>
          <span className="hidden h-5 w-px bg-gold/20 sm:block" />
          <CategoryMenu />
        </div>
        <div className="flex items-center gap-5 text-sm font-medium text-cream/80 sm:gap-6">
          <Link href="/browse" className="transition hover:text-gold">
            Browse
          </Link>
          <Link href="/closets" className="hidden transition hover:text-gold sm:inline">
            Closets
          </Link>
          <Link href="/#rail" className="hidden transition hover:text-gold sm:inline">
            The rail
          </Link>
          <Link href="/#how" className="hidden transition hover:text-gold sm:inline">
            How it works
          </Link>
        </div>
      </nav>
    </header>
  );
}
