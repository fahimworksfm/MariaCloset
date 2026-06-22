import { siteConfig } from "@/data/config";
import { PaisleyDivider } from "./Ornament";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-gold/15">
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-10">
        <PaisleyDivider className="mx-auto mb-7 h-7 w-40 text-gold/70" />
        <div className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-cream/70">
          <a href="/browse" className="transition hover:text-gold">Browse</a>
          <a href="/closets" className="transition hover:text-gold">Closets</a>
          <a href="/membership" className="transition hover:text-gold">Membership &amp; gifts</a>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-cream/70 sm:flex-row">
          <p className="font-display text-lg text-gold">{siteConfig.name}</p>
          <p className="text-base text-rani">{siteConfig.tagline}</p>
          <p className="text-cream/50">
            Rent responsibly · Handle with love ·{" "}
            <a href="/admin" className="transition hover:text-gold">
              Manage
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
