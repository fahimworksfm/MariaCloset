import Link from "next/link";
import { siteConfig } from "@/data/config";
import { getCategories } from "@/lib/store";
import CategoryMenu from "./CategoryMenu";
import NavMenu from "./NavMenu";

/**
 * `overlay` lays the bar transparently over a full-bleed hero (the homepage);
 * everywhere else it is sticky with a blurred near-black ground.
 */
export default async function Navbar({ overlay = false }: { overlay?: boolean }) {
  const categories = await getCategories();
  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-40"
          : "sticky top-0 z-40 border-b border-line bg-night/85 backdrop-blur-md"
      }
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 px-5 py-3 sm:px-8">
        <div className="flex min-w-0 items-center gap-5">
          <Link href="/" className="truncate font-display text-[1.4rem] text-zari">
            {siteConfig.name}
          </Link>
          <CategoryMenu categories={categories} />
        </div>
        <NavMenu />
      </nav>
    </header>
  );
}
