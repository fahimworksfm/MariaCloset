import { siteConfig } from "@/data/config";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-cocoa/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-10 text-sm text-cocoa sm:flex-row">
        <p className="font-serif text-base text-ink">{siteConfig.name}</p>
        <p>{siteConfig.tagline}</p>
        <p className="text-cocoa/70">
          Rent responsibly · Handle with love
        </p>
      </div>
    </footer>
  );
}
