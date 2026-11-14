import Link from "next/link";
import { siteConfig } from "@/data/config";
import CategoryMenu from "./CategoryMenu";

/**
 * `overlay` lays the bar transparently over a full-bleed hero (the homepage);
 * everywhere else it is sticky with a blurred near-black ground.
 */
export default function Navbar({ overlay = false }: { overlay?: boolean }) {
  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-40"
          : "sticky top-0 z-40 border-b border-line bg-night/85 backdrop-blur-md"
      }
    >
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3 sm:px-8">
        <div className="flex items-center gap-5">
          <Link href="/" className="font-display text-[1.4rem] text-zari">
            {siteConfig.name}
          </Link>
          <CategoryMenu />
        </div>
        <div className="flex items-center gap-6 text-sm text-cream sm:gap-7">
          <Link href="/browse" className="py-3 transition hover:text-brass">
            Browse
          </Link>
          <Link href="/closets" className="py-3 transition hover:text-brass">
            Closets
          </Link>
          <Link href="/membership" className="hidden py-3 transition hover:text-brass sm:inline">
            Membership
          </Link>
          <Link href="/refer" className="hidden py-3 transition hover:text-brass sm:inline">
            Refer
          </Link>
        </div>
      </nav>
    </header>
  );
}
